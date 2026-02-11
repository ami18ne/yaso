# دليل النشر (Deployment Guide)

> آخر تحديث: فبراير 2026

## 📋 متطلبات الـ Deployment

- Node.js 20+
- Docker و Docker Compose (اختياري)
- متغيرات البيئة المجهزة
- حساب Supabase نشط
- حساب Agora (للـ video calls)

---

## 🛠️ متغيرات البيئة المطلوبة

### الـ Client-side (آمن - يمكن معروض)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_AGORA_APP_ID=your-agora-app-id
```

### الـ Server-side (سري - لا تعرضه)
```env
SUPABASE_SERVICE_KEY=your-service-role-key
SESSION_SECRET=generate-random-32-char-string
```

### البيئة
```env
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
```

---

## 🚀 الخيارات الرئيسية للنشر

### خيار 1️⃣: Render.com (موصى به - الأسرع)

#### الخطوات:
1. انتقل إلى [render.com](https://render.com)
2. اربط حسابك بـ GitHub
3. اختر هذا الـ Repository
4. اختر "Web Service"
5. أضف متغيرات البيئة:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `VITE_AGORA_APP_ID`
   - `SESSION_SECRET`
6. اضغط Deploy
7. خلال 5-10 دقائق سيكون التطبيق live

#### الـ Build Command:
```bash
npm install && npm run build
```

#### الـ Start Command:
```bash
npm start
```

#### Health Check:
- Path: `/api/health`
- Interval: 30s
- Timeout: 10s

### خيار 2️⃣: Railway.app

#### الخطوات:
1. انتقل إلى [railway.app](https://railway.app)
2. اربط GitHub
3. اختر الـ Repository
4. ستقرأ `railway.json` تلقائياً
5. أضف Environment Variables من Dashboard
6. Deploy!

#### الأوامر:
- **Build**: `npm run build`
- **Start**: `npm start`

---

## 🐳 خيار 3️⃣: Docker (الإعداد المحلي)

### Build الـ Docker Image:
```bash
docker build -t yaso-app:latest .
```

### Run الـ Container:
```bash
docker run -d \
  -p 4000:4000 \
  -e VITE_SUPABASE_URL=<your-url> \
  -e VITE_SUPABASE_ANON_KEY=<your-key> \
  -e SUPABASE_SERVICE_KEY=<your-service-key> \
  -e VITE_AGORA_APP_ID=<your-app-id> \
  -e SESSION_SECRET=<your-secret> \
  yaso-app:latest
```

### استخدام Docker Compose:
```bash
cp .env.example .env.production
# Edit .env.production with your values

docker-compose up -d
```

#### التحقق من الـ Health:
```bash
curl http://localhost:4000/api/health
```

---

## 🔧 اختبار الـ Deployment محلياً

### 1. في الـ Development:
```bash
npm run dev
```

### 2. بناء Production Build:
```bash
npm run build
```

### 3. تشغيل Production Build محلياً:
```bash
NODE_ENV=production npm start
```

### 4. مع Docker:
```bash
docker-compose up
# أو
docker-compose -f docker-compose.yml up
```

---

## ✅ اختبار الـ Deployment

بعد النشر اختبر الـ endpoints التالية:

### Health Checks:
```bash
# بسيط
curl https://your-app.com/api/health

# مفصل
curl https://your-app.com/api/health/detailed
```

### الـ Response يجب أن يكون:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🔐 Security Checklist

قبل الـ Production:
- [x] HTTPS مفعل
- [x] Environment variables آمنة (لا تُحفظ في Git)
- [x] Service key في الـ server فقط (لا في client)
- [x] CORS مضبوط للـ domain الصحيح
- [x] Rate limiting مفعل
- [x] Security headers مضبوطة
- [x] Database RLS مفعل في Supabase

---

## 📊 المراقبة والـ Logging

### في Render/Railway Dashboard:
- عرض logs في الـ web UI
- تنبيهات للـ errors التلقائية
- Metrics للـ CPU و Memory و Bandwidth

### الـ Health Check Monitoring:
```bash
# مراقبة بسيطة
watch -n 5 'curl -s https://your-app.com/api/health | jq .'
```

---

## 🔄 الـ Rollback (في حالة مشكلة)

### في Render:
1. انتقل إلى Deployments
2. اختر الـ deployment السابق
3. اضغط "Redeploy"

### في Railway:
1. في Deployments tab
2. اختر committed الـ working version
3. Deploy

---

## 🐛 استكشاف الأخطاء

### المشكلة: Build fail
```
السبب: عادة متغيرات بيئة ناقصة
الحل:
- تحقق من جميع متغيرات البيئة في Dashboard
- شغل build محلياً: npm run build
```

### المشكلة: App crashes بعد Deploy
```
السبب: خطأ في code أو متغيرات بيئة خاطئة
الحل:
- شاهد logs: الـ platform dashboard
- تحقق من .env values
- اختبر محلياً قبل push
```

### المشكلة: Database connection failed
```
السبب: Supabase URL أو keys خاطئة
الحل:
- انسخ الأصلية من Supabase dashboard
- أعد إدخالها في platform dashboard
- اختبر: curl /api/health/detailed
```

---

## 📈 Performance Optimization

### Bundle Size:
```bash
npm run build -- --analyze
```

### قبل Production:
- تحقق أن build size معقول
- اختبر load time عبر الـ network بطيء
- اختبر مع 100+ concurrent users

---

## 🚀 Advanced: CI/CD Pipeline

لقد أضفنا GitHub Actions workflows:

### `.github/workflows/build-and-deploy.yml`:
- ✅ Lint + Type check
- ✅ Unit tests
- ✅ Build
- ✅ E2E tests
- ✅ Auto-deploy إلى Render/Railway (اختياري)

#### لتفعيل الـ auto-deploy:
أضف secrets إلى GitHub repo:
- `RENDER_SERVICE_ID`
- `RENDER_API_KEY`
- `RAILWAY_API_TOKEN`
- `RAILWAY_PROJECT_ID`

---

## 📞 الدعم الـ Quick Tips

### أوامر مفيدة:

```bash
# بناء محلي كامل
npm run build

# اختبار production
NODE_ENV=production npm start

# بناء Docker
docker build -t yaso:latest .

# تشغيل Docker
docker run -p 4000:4000 yaso:latest

# مشاهدة logs
tail -f dev.log

# Health check
curl http://localhost:4000/api/health
```

---

## 📝 Notes

- **أول deployment قد يستغرق:** 5-15 دقيقة
- **التحديثات التالية:** 1-3 دقائق (caching)
- **قد تحتاج Database migrations:** قبل أول deployment
- **SSL certificate:** آلي من Render/Railway (Let's Encrypt مجاني)

---

## 🔗 الروابط المفيدة

- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Docker Docs](https://docs.docker.com)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js](https://expressjs.com)

---

**آخر تحديث:** فبراير 2026
**الإصدار:** 1.0.0
**الحالة:** ✅ جاهز للـ production
