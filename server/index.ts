import 'dotenv/config' // تحميل المتغيرات من .env
import express, { type Request, type Response, type NextFunction } from 'express'
import { compressionMiddleware, responseTime } from './middleware/performance'
import {
  apiLimiter,
  noCache,
  preventParameterPollution,
  sanitizeInput,
  securityErrorHandler,
  securityHeaders,
} from './middleware/security'
import { registerRoutes } from './routes'
import { log, serveStatic, setupVite } from './vite'

const app = express()

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Helper function to parse command line arguments
const getArg = (argName: string): string | undefined => {
  const arg = process.argv.find((arg) => arg.startsWith(`${argName}=`))
  if (arg) {
    return arg.split('=')[1]
  }
  const argIndex = process.argv.indexOf(argName)
  if (argIndex > -1 && process.argv[argIndex + 1]) {
    return process.argv[argIndex + 1]
  }
  return undefined
}

app.set('trust proxy', 1)

app.use(compressionMiddleware)

app.use(responseTime)

if (process.env.NODE_ENV === 'production') {
  app.use(securityHeaders)
}

app.use(preventParameterPollution)

app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(express.urlencoded({ extended: false, limit: '10mb' }))

app.use(sanitizeInput)

app.use('/api', apiLimiter)

app.use((req, res, next) => {
  const start = Date.now()
  const path = req.path
  let capturedJsonResponse: Record<string, any> | undefined = undefined

  const originalResJson = res.json
  res.json = (bodyJson, ...args) => {
    capturedJsonResponse = bodyJson
    return originalResJson.apply(res, [bodyJson, ...args])
  }

  res.on('finish', () => {
    const duration = Date.now() - start
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…'
      }

      log(logLine)
    }
  })

  next()
})

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    version: '1.0.0'
  })
})

app.get('/api/health/detailed', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    services: {
      supabase: process.env.VITE_SUPABASE_URL ? 'configured' : 'not configured',
      agora: process.env.VITE_AGORA_APP_ID ? 'configured' : 'not configured'
    }
  })
})

;(async () => {
  const server = await registerRoutes(app)

  app.use(securityErrorHandler)

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error'

    log(`Error: ${err.message || 'Unknown error'}`)

    res.status(status).json({ message })
  })

  if (app.get('env') === 'development') {
    await setupVite(app, server)
  } else {
    serveStatic(app)
  }

  const portArg = getArg('--port')
  const port = Number.parseInt(portArg || process.env.PORT || '4000', 10)
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`)
  })
})()
