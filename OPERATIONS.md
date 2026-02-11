# دليل العمليات (Operations Guide)

> لـ DevOps و System Administrators

## 📊 المراقبة (Monitoring)

### Health Endpoints

#### الـ Basic Check:
```bash
curl https://api.yaso.app/api/health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

#### المراقبة المتقدمة:
```bash
curl https://api.yaso.app/api/health/detailed
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "memory": {
    "rss": 52428800,
    "heapTotal": 10485760,
    "heapUsed": 5242880,
    "external": 1048576
  },
  "services": {
    "supabase": "configured",
    "agora": "configured"
  }
}
```

### الـ Monitoring Setup

#### خيار 1: Sentry (للـ Error Tracking)
```bash
# في server/index.ts أضف:
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### خيار 2: DataDog
```bash
npm install dd-trace
```

#### خيار 3: New Relic
```bash
npm install newrelic
```

---

## 📈 الـ Performance Metrics

### الأهداف المستهدفة:

| المتر | المستهدف | التنبيه |
|------|---------|-------|
| P50 Response Time | < 200ms | > 500ms |
| P95 Response Time | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Uptime | > 99.5% | < 99% |
| Memory Usage | < 200MB | > 400MB |
| CPU Usage | < 50% | > 80% |

---

## 🔄 الـ Scaling و Load Balancing

### متقدم: أفقي Scaling
```yaml
# في Render: أضف replicas
numReplicas: 3

# في Railway: استخدم load balancer
regions:
  - us-east
  - eu-west
```

### الـ Session State
- ✅ Stateless (الحالية) - جيد للـ scaling
- لا نحتاج Redis أو sticky sessions الآن

---

## 🔐 الأمان (Security)

### Daily Checks:
```bash
# تحقق من logs للـ suspicious activity
tail -f /var/log/app.log | grep -i "error\|auth\|security"

# مسح الـ secrets
grep -r "SUPABASE_SERVICE_KEY\|SESSION_SECRET" /app/dist/ &&
echo "⚠️ SECRETS FOUND IN BUILD!" ||
echo "✅ No secrets exposed"
```

### الـ Rate Limiting (مفعل):
```
- 100 requests per 15 minutes per IP
- 1000 requests per hour per IP
```

### CORS (مضبوط):
```javascript
// يقبل فقط requests من:
- https://yaso.app
- https://www.yaso.app
```

---

## 🗄️ Database Maintenance

### Backups

#### Supabase (مدمج):
- ✅ Daily backups (14 days)
- ✅ Point-in-time recovery
- ✅ Automated في database settings

#### Manual Backup:
```bash
# Dump database
pg_dump postgresql://user:pass@db.supabase.co/postgres > backup.sql

# Restore
psql postgresql://user:pass@db.supabase.co/postgres < backup.sql
```

### Database Maintenance:
```bash
# في Supabase SQL editor
-- Run monthly
VACUUM ANALYZE;
REINDEX TABLE posts;
REINDEX TABLE users;
REINDEX TABLE comments;
```

---

## 🆘 استكشاف الأخطاء (Troubleshooting)

### المشكلة: High Memory Usage

**الأعراض:**
```
Memory: 400MB+ (alert at > 400MB)
```

**الفحص:**
```bash
curl https://api.yaso.app/api/health/detailed | jq '.memory'
```

**الحلول:**
1. **Restart app** (يحرر الـ memory):
   ```bash
   # في Render/Railway: تريجر redeploy
   ```

2. **Check for memory leaks**:
   ```bash
   # ابحث في logs عن:
   # "memory leak", "connection pool", "event listeners"
   ```

3. **Scale up** إذا استمرت المشكلة:
   ```yaml
   # أضف أكثر resources في المنصة
   ```

---

### المشكلة: High Response Times

**الأعراض:**
```
P95 > 1000ms
```

**المسببات الشائعة:**
1. **Database query slow**
   ```sql
   -- في Supabase, شاهد:
   SELECT * FROM pg_stat_statements 
   WHERE mean_time > 1000
   ORDER BY total_time DESC;
   ```

2. **Too many concurrent users**
   - عد الـ active connections
   - قد تحتاج scale up

3. **API dependency slow** (Agora, Supabase)
   - تحقق من service status pages

**الحل:**
```bash
# 1. Restart
# 2. Check database performance
# 3. Scale up resources
# 4. Optimize slow queries
```

---

### المشكلة: Database Connection Failed

**الأعراض:**
```
Error: connect ECONNREFUSED
```

**الفحص:**
```bash
# اختبر الـ connection string
psql "$SUPABASE_CONNECTION_STRING"

# اختبر من app
curl https://api.yaso.app/api/health/detailed | jq '.services.supabase'
```

**الحلول:**
1. تحقق من Supabase status
2. تحقق من IP whitelist
3. أعد متغيرات البيئة
4. اتصل بـ Supabase support

---

### المشكلة: 502 Bad Gateway

**الأعراض:**
```
HTTP 502
```

**المسببات:**
- App crashed
- Deploying
- High load

**الحل:**
```bash
# 1. شاهد logs
# 2. اختبر health endpoint
curl https://api.yaso.app/api/health
# 3. إذا down: restart app
# 4. اتصل بـ Platform support إذا استمرت
```

---

## 📋 الصيانة الدورية

### يومي:
```bash
# تحقق من health status
watch -n 60 'curl -s https://api.yaso.app/api/health | jq .status'

# مراجعة أي error logs
tail -n 100 /var/log/app.log | grep -i error
```

### أسبوعي:
```bash
# تحقق من resource usage
# CPU, Memory, Bandwidth في Dashboard

# التحقق من Database growth
# في Supabase: انظر Database > Storage
```

### شهري:
```bash
# تشغيل VACUUM على Database
# تحديث الـ dependencies: npm audit

# نسخ احتياطية يدوية
pg_dump ... > backup-$(date +%Y%m%d).sql
```

---

## 🚀 الـ Deployment Process

### Blue-Green Deployment (Best Practice):

1. **Deploy to staging**:
   ```bash
   git push staging-branch
   # Platform builds & tests
   ```

2. **اختبر جيداً**:
   ```bash
   curl https://staging.yaso.app/api/health
   # اختبر الـ features الرئيسية
   ```

3. **Deploy to production**:
   ```bash
   git push main
   # Platform deploys
   ```

4. **في حالة مشكلة**:
   ```bash
   # Fast rollback (< 1 minute):
   git revert <commit-hash>
   git push main
   ```

---

## 📞 الـ Incident Response

### إذا حصل خطأ في Production:

**الخطوات:**
1. **Assess** - ما المشكلة؟
   ```bash
   curl https://api.yaso.app/api/health
   # شاهد logs, metrics
   ```

2. **Communicate** - أخبر الفريق
   ```
   #incidents in Slack
   "Production issue: High error rate (5%)"
   ```

3. **Mitigate** - قلل الضرر
   ```bash
   # enable read-only mode if DB issue
   # scale up if high load
   # restart if app unresponsive
   ```

4. **Root cause** - اعثر على السبب
   ```bash
   grep -A 10 "error message" /var/log/app.log
   ```

5. **Fix** - أصلح
   ```bash
   git commit -m "fix: incident xyz"
   git push
   # Redeploy
   ```

6. **Review** - تعلم
   ```
   Post-mortem meeting
   - What happened
   - Why it happened
   - How to prevent it
   ```

---

## 🔧 الـ Advanced Tasks

### تغيير المشاهد:
```bash
# في Render/Railway, غير region من dashboard
# إعادة النشر تلقائياً في المنطقة الجديدة
```

### إضافة Custom Domain:
```bash
# في Dashboard:
# settings > custom domain
# أضف: api.yaso.app
# جرجر DNS record إلى الدقائق المعطاة
```

### SSL Certificate:
```bash
# Automatic من Platform (Let's Encrypt)
# يتجدد تلقائياً كل 90 يوم
# لا تفعل شيء يدويّ
```

---

## 📞 الدعم والمراسلات

### Platform Support يتواصل معك:
- Render: support@render.com
- Railway: السؤال في Discord
- Supabase: dashboard chat

### SLA (Service Level Agreement):
- **Uptime Target**: 99.5%
- **Response Time**: < 200ms P50
- **Support**: Email / Chat

---

**آخر تحديث:** فبراير 2026
**الإصدار:** 1.0.0
**الحالة:** ✅ Production Ready
