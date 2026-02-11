# ⚡ دليل البدء السريع (Quick Start)

> نشر Yaso في أقل من 10 دقائق

---

## 🚀 الطريقة الأسرع: Render.com

### الخطوات:

**1. أعد .env.production**
```bash
# قيم تحتاجها:
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
VITE_AGORA_APP_ID=
SESSION_SECRET=
```

**2. commit و push إلى GitHub**
```bash
git add .
git commit -m "chore: ready for deployment"
git push
```

**3. في Render Dashboard**
```
1. New → Web Service
2. Select: yaso repository
3. Configuration:
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Instance Type: Standard
   - Region: Choose closest to your users
4. Environment Variables:
   - Add all from .env.production
5. Create Web Service
```

**4. Wait 5-10 minutes**
- Render builds
- Tests run
- Deploy!

**5. اختبر**
```bash
curl https://your-app.onrender.com/api/health
# Response: { status: "ok" }
```

---

## 🚂 الطريقة الثانية: Railway

**1. Prep**
```bash
# Same as above
```

**2. في Railway Dashboard**
```
1. New Project
2. Deploy from GitHub
3. Select: yaso repository
4. Configure:
   - Service: Web Service
   - Build Command: npm run build
   - Start Command: npm start
5. Add variables from .env.production
6. Deploy
```

---

## 🐳 محلي مع Docker

**1. Build**
```bash
docker build -t yaso:latest .
```

**2. Run**
```bash
docker run -d -p 4000:4000 \
  --env-file .env.production \
  yaso:latest
```

**3. Check**
```bash
curl http://localhost:4000/api/health
```

---

## ✅ Checklist Pre-Launch

Before pushing to production:

- [ ] `.env.production` filled correctly
- [ ] Supabase URL & keys valid
- [ ] Agora app ID set (if using video)
- [ ] SESSION_SECRET is strong (min 32 chars)
- [ ] `.env.production` is in `.gitignore` ✓
- [ ] `npm run build` works locally
- [ ] Health check at `/api/health` responds
- [ ] No secrets in git history
- [ ] CORS domain configured correctly

---

## 🆘 Common Issues

### Issue: Build fails
```bash
# Fix: Check Node version
node -v  # Should be >= 20

# Re-run build
npm run build
```

### Issue: Supabase connection fails
```bash
# Fix: Wrong URL or key
# Get correct values from:
# Supabase Dashboard → Project Settings → API
```

### Issue: 502 Bad Gateway
```bash
# Fix: App crashed
# Check logs in Render/Railway dashboard
# Most likely: missing env var
```

---

## 📞 Getting Help

- [Deployment Guide](./DEPLOYMENT.md) - Detailed
- [Operations Guide](./OPERATIONS.md) - Monitoring & troubleshooting
- [GitHub Issues](https://github.com/ami18ne/yaso/issues) - Report bugs

---

## 🎉 Done!

Your app is now live! 🚀

Next steps:
1. Monitor health: `/api/health`
2. Set up domain (CNAME)
3. Enable SSL (automatic)
4. Configure email/notifications
5. Set up backups (automatic in Supabase)

---

**Time to deploy:** ~10-15 minutes
**Cost:** Free (Render free tier or Railway free hours)
**Support:** Check DEPLOYMENT.md for detailed steps
