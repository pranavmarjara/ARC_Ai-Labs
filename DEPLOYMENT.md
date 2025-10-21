# Deployment Guide

## Frontend Deployment (Netlify)

Your frontend is now ready to deploy to Netlify via GitHub!

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and select your repository
   - Netlify will auto-detect the settings from `netlify.toml`
   - Click "Deploy site"

3. **Configure Environment Variables**
   - In Netlify dashboard: Site settings → Environment variables
   - Add: `VITE_API_URL` with your backend API URL (see below)
   - Example: `https://your-backend.onrender.com/api`

### Configuration Files Created:
- `netlify.toml` - Build configuration
- `frontend/.env.example` - Environment variable template
- `frontend/.env` - Local development (git-ignored)

---

## Backend Deployment (Render/Railway/Heroku)

Your FastAPI backend needs to be deployed separately. Here are some options:

### Option 1: Render (Recommended - Free Tier Available)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt` (you'll need to create this)
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3

4. Create `backend/requirements.txt`:
   ```txt
   fastapi
   uvicorn[standard]
   pydantic
   email-validator
   python-multipart
   ```

5. Add environment variables if needed

6. After deployment, copy the API URL and add it to Netlify's environment variables

### Option 2: Railway

Similar process to Render, but with automatic Python detection.

### Option 3: Fly.io

Good for persistent database needs.

---

## Environment Variable Setup

### Development (Local)
In `frontend/.env`:
```
VITE_API_URL=/api
```

### Production (Netlify)
In Netlify environment variables:
```
VITE_API_URL=https://your-backend-url.com/api
```

---

## Testing Your Deployment

1. After deploying both frontend and backend
2. Visit your Netlify site URL
3. Test the contact form to ensure backend connection works
4. Check browser console for any errors

---

## Notes

- The frontend build is optimized for production
- SPA routing is configured with redirects
- CORS needs to be enabled on your backend for your Netlify domain
- Update `backend/main.py` to add your Netlify URL to allowed origins
