# Quick Netlify Deployment Checklist

## ✅ Before You Push to GitHub

- [x] Frontend optimized for production
- [x] Build artifacts cleaned (dist/ folder removed)
- [x] Environment variables configured (.env.example created)
- [x] CORS optimized for production
- [x] Production build tested successfully
- [x] All files git-ignored properly

## 📦 Push to GitHub

```bash
git add .
git commit -m "Production-ready for Netlify deployment"
git push origin main
```

## 🚀 Deploy on Netlify

1. Go to [Netlify](https://netlify.com) → "Add new site"
2. Choose "Import an existing project" → GitHub
3. Select your repository
4. Netlify auto-detects settings from `netlify.toml` ✨
5. Click "Deploy site"

## ⚙️ Configure Environment Variables in Netlify

**After deploying your backend:**

1. Go to: Site settings → Environment variables
2. Add variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend.onrender.com/api`
3. Click "Save"
4. Trigger a redeploy (Deploys → Trigger deploy → Deploy site)

## 🔧 Deploy Backend (Choose One)

### Option A: Render (Free tier, recommended)
1. Go to [Render](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. (Optional) Add environment variable:
   - `ALLOWED_ORIGINS` = `https://your-site.netlify.app`
6. Deploy
7. Copy your backend URL and add to Netlify (step above)

### Option B: Railway
Similar to Render with auto-detection

## ✅ Final Check

- [ ] Frontend deployed on Netlify
- [ ] Backend deployed (Render/Railway/etc)
- [ ] `VITE_API_URL` set in Netlify environment variables
- [ ] Visit your Netlify site
- [ ] Test the contact form
- [ ] Check browser console for errors

## 🎉 You're Live!

Your ARC AI Labs website is now live on the internet!

---

**Need Help?** See `DEPLOYMENT.md` for detailed instructions.
