import compression from 'compression'
import type { NextFunction, Request, Response } from 'express'

export const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
})

export function responseTime(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime()

  const originalSend = res.send
  res.send = function (body: any) {
    const diff = process.hrtime(start)
    const time = diff[0] * 1e3 + diff[1] * 1e-6
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${time.toFixed(2)}ms`)
    }
    return originalSend.call(this, body)
  }

  next()
}

export function etagSupport(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('ETag', 'true')
  next()
}

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function adaptiveRateLimit(baseLimit = 100, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    let record = requestCounts.get(ip)

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs }
      requestCounts.set(ip, record)
    }

    record.count++

    if (record.count > baseLimit) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString())
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    res.setHeader('X-RateLimit-Limit', baseLimit.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, baseLimit - record.count).toString())
    res.setHeader('X-RateLimit-Reset', record.resetTime.toString())

    next()
  }
}

setInterval(() => {
  const now = Date.now()
  const entries = Array.from(requestCounts.entries())
  for (const [ip, record] of entries) {
    if (now > record.resetTime) {
      requestCounts.delete(ip)
    }
  }
}, 60000)
