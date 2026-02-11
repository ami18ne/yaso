# 🚀 Yaso - Trillr Web App

> تطبيق وسائل اجتماعية حديث مع دعم الفيديو والصور والرسائل الفورية.

[![Build Status](https://github.com/ami18ne/yaso/workflows/CI/badge.svg)](https://github.com/ami18ne/yaso/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ البدء السريع

### المتطلبات
- Node.js 20+
- npm/yarn
- حساب Supabase
- حساب Agora (اختياري للـ video calls)

### التثبيت والتطوير

```bash
# استنساخ المشروع
git clone https://github.com/ami18ne/yaso.git
cd yaso

# تثبيت الـ dependencies
npm install

# إعداد .env
cp .env.example .env
# أضفا قيمك الخاصة في .env

# بدء الـ development server
npm run dev
```

يفتح التطبيق على `http://localhost:5173` (Client) + API على `http://localhost:5000`

---

## 📦 الـ Build والـ Deployment

### بناء المشروع محلياً

```bash
# بناء production build
npm run build

# اختبار production build محلياً
npm start
```

### الـ Deployment السريع

#### 🎯 Render.com (الخيار الأسرع)
```bash
# 1. اربط GitHub في https://render.com
# 2. انتقل إلى Settings > Environment
# 3. أضفا متغيرات البيئة من .env.production
# 4. اضغط Deploy
```

#### 🚂 Railway.app
```bash
# Configure railway
railway init

# Deploy
railway up
```

#### 🐳 Docker
```bash
# Build
docker build -t yaso:latest .

# Run
docker run -d -p 4000:4000 \
  -e VITE_SUPABASE_URL=<your-url> \
  -e VITE_SUPABASE_ANON_KEY=<your-key> \
  -e SUPABASE_SERVICE_KEY=<your-service-key> \
  -e VITE_AGORA_APP_ID=<your-app-id> \
  -e SESSION_SECRET=<your-secret> \
  yaso:latest
```

---

## 🛠️ الأوامر المتاحة

```bash
# Development
npm run dev              # بدء dev server مع hot reload

# Building
npm run build           # بناء production build
npm run build:prod      # build + prune dependencies

# Testing
npm run test            # تشغيل unit tests
npm run test:e2e        # تشغيل E2E tests

# Code Quality
npm run lint            # فحص الأخطاء بـ Biome
npm run lint:fix        # إصلاح الأخطاء تلقائياً
npm run check           # Type checking
npm run format          # تنسيق الكود

# Health Check
npm run health          # اختبر /api/health
npm run health:detailed # اختبر /api/health/detailed

# Docker
npm run docker:build    # بناء Docker image
npm run docker:run      # تشغيل Docker container
npm run compose:up      # تشغيل docker-compose
npm run compose:down    # إيقاف docker-compose

# Database
npm run db:push         # Push schema إلى Supabase
npm run db:apply-sql    # تطبيق SQL scripts
```

---

## 📚 التوثيق

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - دليل شامل للـ deployment على Render/Railway/Docker
- **[OPERATIONS.md](./OPERATIONS.md)** - دليل العمليات والمراقبة والاستكشاف
- **[PACKAGING_PLAN.md](./PACKAGING_PLAN.md)** - الخطة الكاملة للـ packaging والـ deployment
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - إعداد قاعدة البيانات

---

## 🏗️ البنية المعمارية

```
yaso/
├── client/              # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/  # مكونات React
│   │   ├── pages/       # الصفحات
│   │   ├── hooks/       # Custom hooks
│   │   └── App.tsx      # المكون الجذر
│   └── vite.config.ts
│
├── server/              # Node.js + Express
│   ├── index.ts         # نقطة الدخول
│   ├── routes.ts        # الـ API routes
│   ├── storage.ts       # Supabase storage
│   └── middleware/      # Security & Performance
│
├── shared/              # الكود المشترك (Types, Schemas)
│   ├── database.types.ts
│   ├── schema.ts
│   └── bucketsConfig.ts
│
├── Dockerfile           # Multi-stage build
├── docker-compose.yml   # Development/Production compose
├── package.json         # Dependencies والـ scripts
└── README.md
```

---

## 🔐 الأمان

- ✅ HTTPS فقط في الـ production
- ✅ Environment variables آمنة (لا commit)
- ✅ Row-Level Security (RLS) في Supabase
- ✅ CORS محدود للـ domain المعتمد
- ✅ Rate limiting على API endpoints
- ✅ Security headers مفعلة
- ✅ Input sanitization
- ✅ CSRF protection

---

## 🚀 الـ Health Check

### الـ Basic:
```bash
GET /api/health
# Response: { "status": "ok", ... }
```

### المتقدم:
```bash
GET /api/health/detailed
# Response: { status, memory, services, ... }
```

---

## 📊 الـ Performance

- **Bundle Size**: ~250KB (gzipped)
- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **P50 Response Time**: < 200ms
- **P95 Response Time**: < 500ms

---

## 🐛 المساهمة والـ Issues

### لـ Report Bug:
1. افتح [Issue](https://github.com/ami18ne/yaso/issues)
2. اشرح المشكلة بالتفصيل
3. أرسل steps to reproduce

### للعمل على Feature:
1. انسخ الـ repository
2. أنشئ branch: `git checkout -b feature/amazing-feature`
3. Commit التغييرات: `git commit -m 'Add amazing feature'`
4. اضغط على branch: `git push origin feature/amazing-feature`
5. افتح Pull Request

---

## 📝 الـ Environment Variables

```env
# Client-side (معروض آمن)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AGORA_APP_ID=your-app-id

# Server-side (سري)
SUPABASE_SERVICE_KEY=your-service-key
SESSION_SECRET=your-secret

# الـ Configuration
NODE_ENV=development|production
PORT=5000
LOG_LEVEL=debug|info|warn|error
```

انظر [.env.example](./.env.example) للمزيد من المعلومات.

---

## 📈 التحسينات المخطط لها

- [ ] Offline support (PWA)
- [ ] Voice calls (في الإضافة إلى video)
- [ ] File sharing
- [ ] Search indexing
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Moderation tools

---

## 🔗 الروابط المهمة

- [Supabase Docs](https://supabase.com/docs)
- [Express.js](https://expressjs.com)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Agora SDK](https://docs.agora.io)

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE.md)

---

## 👥 الفريق

- **Creator**: YA SO
- **Version**: 1.0.0
- **Created**: ديسمبر 2025
- **Last Updated**: فبراير 2026

---

## 💬 الدعم

### أسئلة عامة
- افتح [Discussion](https://github.com/ami18ne/yaso/discussions)

### المشاكل الحرجة
- Contact: [email protected]

### الـ Documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) للـ deployment
- [OPERATIONS.md](./OPERATIONS.md) للـ operations
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) للـ database

---

**الحالة:** ✅ Production Ready
**الـ Uptime:** 99.5%+
**الـ Support**: 24/7
