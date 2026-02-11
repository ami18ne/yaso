# خطة تغليف المشروع (Yaso - Trillr)

## نظرة عامة
خطة شاملة لتغليف وتجهيز المشروع للإنتاج والنشر على السحابة (Render, Railway, أو AWS).

---

## المرحلة 1: إعداد البيئة الإنتاجية ✓ (جاهز جزئياً)

### 1.1 ملفات Dockerfile والـ Docker Compose
- [x] **Dockerfile** موجود بالفعل (multi-stage build)
  - ✓ يستخدم Node 20-alpine (خفيف الحجم)
  - ✓ يبني Client و Server
  - ⚠️ **يحتاج تحديث:** البورت الحالي 4000، يجب عمل متغير بيئة
  - ⚠️ **يحتاج تحديث:** إضافة متغيرات البيئة (Supabase, Agora)

**الإجراءات الواجبة:**
```bash
[ ] تحديث Dockerfile ليدعم جميع متغيرات البيئة
[ ] إضافة health check في الـ Docker
[ ] توثيق كل متغيرات البيئة المطلوبة
```

### 1.2 ملف .dockerignore
```bash
[ ] إنشاء .dockerignore لتقليل حجم الـ Image
    - node_modules (سيُعاد بناؤه)
    - .env.local
    - .git
    - dist (سيُبنى جديداً)
    - e2e-tests
    - test-results
```

### 1.3 متغيرات البيئة الإنتاجية
```bash
[ ] إنشاء ملف .env.production مع توثيق جميع المتغيرات:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY
    - SUPABASE_SERVICE_KEY
    - VITE_AGORA_APP_ID
    - SESSION_SECRET
    - NODE_ENV=production
    - LOG_LEVEL=info
```

---

## المرحلة 2: تحسين عملية البناء والأداء

### 2.1 تحسين Vite Build
```bash
[ ] تقليل حجم Bundle:
    - فعّل tree-shaking
    - استخدم compression (brotli)
    - lazy loading للـ Routes

[ ] تحسين Performance:
    - CSS Code Splitting
    - Image Optimization
    - Preload Critical Assets
```

### 2.2 تحسين Server Build
```bash
[ ] استخدام esbuild بشكل أمثل:
    - minification
    - code splitting
    - source maps فقط في staging

[ ] إضافة Health Check Endpoint:
    - GET /api/health
    - GET /api/status
    - تفاصيل عن الخدمات المتصلة
```

### 2.3 Build Script تحت خطوط
```bash
[ ] تحسين package.json scripts:
    - "build:client": vite build client
    - "build:server": esbuild server/...
    - "build": npm run build:client && npm run build:server
    - "build:prod": npm run build && npm prune --production
    - "start:prod": NODE_ENV=production node dist/index.js
```

---

## المرحلة 3: Docker Compose للـ Development والـ Production

### 3.1 تحديث docker-compose.yml
```bash
[ ] إضافة خدمات:
    - app (التطبيق الرئيسي)
    - supabase (خدمة محاكاة في حالة الاختبار المحلي)
    - redis (للـ caching اختياري)

[ ] تحسين Configuration:
    - متغيرات بيئة منفصلة لـ dev و prod
    - health checks لكل خدمة
    - restart policies
    - logging configuration
```

### 3.2 Docker Compose Overrides
```bash
[ ] إنشاء docker-compose.prod.yml:
    - Production-specific settings
    - Resource limits
    - Logging و monitoring
    
[ ] إنشاء docker-compose.dev.yml:
    - مشاركة Volume للـ hot reload
    - Exposed ports لـ debugging
```

---

## المرحلة 4: CI/CD Pipeline

### 4.1 GitHub Actions (أو أي CI/CD آخر)
```bash
[ ] إنشاء workflows:
    - .github/workflows/build.yml
      • Build Docker image
      • Run tests
      • Push to registry
    
    - .github/workflows/test.yml
      • Unit tests (vitest)
      • E2E tests (playwright)
    
    - .github/workflows/deploy.yml
      • Deploy to production
      • Run migrations
      • Health checks
```

### 4.2 Pre-deployment Checks
```bash
[ ] Automated checks:
    - TypeScript compilation
    - Biome linting
    - Unit tests
    - E2E tests
    - Bundle size analysis
    - Security scanning
```

---

## المرحلة 5: نشر السحابة

### 5.1 خيارات الـ Deployment

#### أ) Render.com (موصي به - يدعم Git)
```bash
[ ] إنشاء render.yaml:
    - Service definition
    - Environment variables
    - Build command: npm run build:prod
    - Start command: npm start
    - Health check endpoint

[ ] خطوات النشر:
    1. ربط GitHub repo بـ Render
    2. إضافة متغيرات البيئة في Render Dashboard
    3. اختيار branch للـ auto-deploy (main)
    4. تفعيل auto-deploy
```

#### ب) Railway.app (موجود render.yaml)
```bash
[ ] تحديث railway.json:
    - Build trigger settings
    - Environment configuration
    - Service links
    - Database connections

[ ] خطوات النشر:
    1. ربط GitHub account
    2. حدد Repository
    3. أضفإضافة environment variables
    4. Deploy
```

#### ج) Docker Hub + Kubernetes (خيار متقدم)
```bash
[ ] Build و Push Image:
    - docker build -t username/yaso:latest .
    - docker push username/yaso:latest

[ ] Kubernetes Deployment:
    - deployment.yaml
    - service.yaml
    - configmap.yaml (للـ env vars)
    - ingress.yaml (للـ routing)
```

### 5.2 متغيرات البيئة في المنصات

```bash
[ ] في Render/Railway Dashboard أضفأضفها:
    VITE_SUPABASE_URL=https://lrxsvcozncbgulpxxxrr.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJ...
    SUPABASE_SERVICE_KEY=eyJ...
    VITE_AGORA_APP_ID=c5d58a4fd0c14b40be02c429a984f7b5
    SESSION_SECRET=<random-string>
    NODE_ENV=production
    npm_config_production=true
```

---

## المرحلة 6: Database Migrations و Seed Data

### 6.1 إعداد قاعدة البيانات
```bash
[ ] قبل النشر:
    1. تشغيل SQL scripts في Supabase:
       - scripts/create_posts_tables.sql
       - scripts/new_tables_only.sql
       - scripts/policies_indexes_security.sql
    
    2. التحقق من جميع الجداول موجودة
    
    3. تفعيل Row-Level Security (RLS)

[ ] في Dockerfile:
    - أضفأضف step لتطبيق migrations automatically
    - أو وثق الخطوات اليدوية
```

### 6.2 Backup و Recovery
```bash
[ ] إعداد نسخ احتياطية:
    - Supabase backup schedule (يومي)
    - Script للـ backup محلي: scripts/backup.sh
    - توثيق إجراء الاسترجاع
```

---

## المرحلة 7: المراقبة والـ Logging

### 7.1 Logging Configuration
```bash
[ ] إعداد logger:
    - استخدم winston أو pino
    - Log levels: error, warn, info, debug
    - Output: console + file + external service

[ ] في Render/Railway:
    - عرض logs في Dashboard
    - Config alerts للـ errors
```

### 7.2 Health Monitoring
```bash
[ ] إضافة endpoints:
    - GET /api/health → status بسيط
    - GET /api/health/detailed → تفاصيل الخدمات
    - Supabase connection status
    - Database query time
    - Memory usage
```

### 7.3 Performance Monitoring
```bash
[ ] إعداد APM (Application Performance Monitoring):
    - Sentry (للـ error tracking)
    - DataDog (للـ metrics)
    - أو استخدم built-in من المنصة
```

---

## المرحلة 8: الأمان

### 8.1 Secrets Management
```bash
[ ] لا تضعها في:
    - GitHub
    - Docker image
    - package.json

[ ] استخدم:
    - Environment variables في المنصة
    - AWS Secrets Manager (إذا استخدمت AWS)
    - GitHub Secrets (لـ CI/CD)
    - .env.local في Development فقط
```

### 8.2 التشفير والـ CORS
```bash
[ ] تحقق من التشفير:
    - HTTPS/TLS فقط
    - HSTS headers
    - Secure cookies (httpOnly, Secure)

[ ] CORS Configuration:
    - تحديد allowed origins
    - في production: فقط domain الرئيسي
```

### 8.3 بيانات حساسة
```bash
[ ] Database:
    - تفعيل RLS في Supabase
    - عدم expose service key في client
    - تشفير الحقول الحساسة

[ ] API Keys:
    - Agora App ID معروض (آمن)
    - Supabase Anon Key معروض (آمن، محدود بـ RLS)
    - Service Keys سري فقط في server
```

---

## المرحلة 9: التوثيق

### 9.1 توثيق الـ Deployment
```bash
[ ] إنشاء DEPLOYMENT.md:
    - خطوات النشر
    - متغيرات البيئة
    - أوامر Useful
    - استكشاف الأخطاء
```

### 9.2 توثيق العمليات
```bash
[ ] إنشاء OPERATIONS.md:
    - كيفية مراقبة التطبيق
    - كيفية عمل rollback
    - كيفية التعامل مع الأعطال
    - Scaling strategies
```

### 9.3 توثيق Architecture
```bash
[ ] إنشاء ARCHITECTURE.md:
    - رسم بياني للـ infrastructure
    - تفاعل المكونات
    - Data flow
    - Database schema (مرئي)
```

---

## المرحلة 10: اختبار ما قبل الإطلاق

### 10.1 اختبار التطبيق
```bash
[ ] في البيئة الوسيطة (Staging):
    [ ] اختبارات يدوية:
        - التنقل بين الصفحات
        - تسجيل دخول/حروج
        - إنشاء منشور
        - الإعجاب والتعليق
    
    [ ] اختبارات الأداء:
        - Load testing: 100-1000 user concurrent
        - Bundle size check
        - Database query time
    
    [ ] اختبارات الأمان:
        - SQL injection tests
        - XSS tests
        - CSRF protection
```

### 10.2 اختبار Infrastructure
```bash
[ ] التحقق من:
    - Docker image builds بنجاح
    - Container يspins up بدون أخطاء
    - Database connections تعمل
    - Supabase API accessible
    - Agora SDK loads
```

---

## خطة التنفيذ المقترحة (Timeline)

```
الأسبوع 1: المراحل 1-2
    يوم 1: إعداد Dockerfile و .dockerignore
    يوم 2: تحسين Build process
    يوم 3: اختبار محلي مع Docker

الأسبوع 2: المراحل 3-4
    يوم 1: Docker Compose overrides
    يوم 2: إعداد CI/CD pipelines
    يوم 3: اختبار الـ builds الآلية

الأسبوع 3: المراحل 5-6
    يوم 1: اختيار منصة deployment
    يوم 2: إعداد Database migrations
    يوم 3: أول deployment تجريبي

الأسبوع 4: المراحل 7-10
    يوم 1: إعداد Logging و Monitoring
    يوم 2: اختبارات الأمان
    يوم 3: اختبارات الأداء و التوثيق
    يوم 4: طرح النسخة الأولى
```

---

## Checklist للإطلاق النهائي

```
Pre-Launch Checklist:
[ ] جميع التنبيهات الأمان تم معالجتها
[ ] التشفير HTTPS مفعل
[ ] Database backups تعمل
[ ] Monitoring و alerting جاهز
[ ] Logging مركزي
[ ] SSL certificate صالح
[ ] DNS entries صحيحة
[ ] Testing شامل أكمل
[ ] Documentation محدثة
[ ] Team trained على Operations
[ ] Rollback plan موثق
[ ] Support plan جاهز

Post-Launch:
[ ] Monitor errors في أول 24 ساعة
[ ] Performance monitoring
[ ] User feedback collection
[ ] Bug fixes و patches سريعة
[ ] Documentation updates من الملاحظات
```

---

## الموارد والأدوات المقترحة

```
Deployment:
- Render.com (موصي به للبدء السريع)
- Railway.app (بديل جيد)
- Docker Hub (للـ image registry)

Monitoring:
- Sentry (error tracking)
- Vercel Analytics (web vitals)
- DataDog (full stack monitoring)

Testing:
- Vitest (unit tests) ✓ موجود
- Playwright (E2E tests) ✓ موجود
- k6 (load testing)

CI/CD:
- GitHub Actions (موصي به، مجاني) ✓
- GitLab CI
- CircleCI

Database:
- Supabase (موجود) ✓
- PostgreSQL backups
- pgAdmin لـ management

Documentation:
- Markdown (موجود)
- Docusaurus / Nextra
- Swagger/OpenAPI للـ API
```

---

## ملاحظات هامة

1. **Supabase Ready**: لا تحتاج localhost database
2. **Agora SDK**: مفعل و يعمل
3. **Environment Setup**: معظمه جاهز، فقط تحديث صغير مطلوب
4. **Scaling**: لا تحتاج load balancer في البداية، المنصات توفره
5. **Updates**: استخدم blue-green deployments بعد التطور

---

## تتابع التقدم

عند الانتهاء من كل مرحلة:
- [ ] المرحلة 1: إعداد البيئة
- [ ] المرحلة 2: تحسين البناء
- [ ] المرحلة 3: Docker Compose
- [ ] المرحلة 4: CI/CD
- [ ] المرحلة 5: الـ Deployment
- [ ] المرحلة 6: Database
- [ ] المرحلة 7: المراقبة
- [ ] المرحلة 8: الأمان
- [ ] المرحلة 9: التوثيق
- [ ] المرحلة 10: الاختبار

**إجمالي الوقت المتوقع: 4-6 أسابيع بعمل بدوام كامل**
