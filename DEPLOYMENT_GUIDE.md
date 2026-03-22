# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Overview
This guide covers deploying the E-Food recommendation system to production using:
- **Vercel** for the React frontend (automatic)
- **Render** for the Express backend (simple, free tier available)

---

## Prerequisites
1. GitHub account (or other Git provider)
2. Vercel account (free at https://vercel.com)
3. Render account (free at https://render.com)
4. Project pushed to GitHub

---

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: E-Food deployment ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/food_project.git
git push -u origin main
```

### 1.2 Create .env files
```bash
# Already created: .env.example
# Copy it for reference:
cat .env.example
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account & Service
1. Go to https://render.com
2. Sign up / Login
3. Click "New +" → Select "Web Service"
4. Connect your GitHub repository

### 2.2 Configure Backend Service
**Name:** `food-recommendation-backend`

**Build Settings:**
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment: Node.js

**Environment Variables:**
- `NODE_ENV`: `production`
- `PORT`: `5000`

### 2.3 Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete (usually 2-3 minutes)
4. **Copy your backend URL**: `https://food-recommendation-backend.onrender.com`

### 2.4 Important: Free Tier Note
- Render free tier services spin down after 15 minutes of inactivity
- They'll take 30 seconds to resume on first request
- For production use, upgrade to paid tier

---

## Step 3: Update Frontend Configuration

### 3.1 Update environment variable
Edit `.env.example` and create `.env.production`:

```env
VITE_API_URL=https://food-recommendation-backend.onrender.com/api
```

### 3.2 Verify Vite config
Check `vite.config.ts` uses the environment variable:

```typescript
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api')
  }
})
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account & Project
1. Go to https://vercel.com
2. Sign up / Login
3. Click "New Project"
4. Import your GitHub repository

### 4.2 Configure Frontend Deployment
**Project Settings:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
Click "Environment Variables" and add:
```
VITE_API_URL = https://food-recommendation-backend.onrender.com/api
```

### 4.3 Deploy
1. Click "Deploy"
2. Wait for build to complete (usually 1-2 minutes)
3. **Your frontend URL**: `https://your-project-name.vercel.app`

---

## Step 5: Configure CORS for Production

### 5.1 Update server.js CORS settings
Edit `server.js` line ~14:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5.2 Add environment variable to Render
In Render dashboard → Backend service → Environment:
```
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

### 5.3 Redeploy
Click "Manual Deploy" in Render dashboard

---

## Step 6: Test the Deployment

### 6.1 Frontend Health Check
```bash
# Visit your Vercel URL
https://your-project-name.vercel.app
```
Should load the frontend successfully.

### 6.2 Backend Health Check
```bash
# Test backend endpoint
curl https://food-recommendation-backend.onrender.com/api/db/contact
```
Should return: `[]` or an array of contacts

### 6.3 End-to-End Test
1. Open frontend at Vercel URL
2. Navigate to Contact page
3. Submit a contact form
4. Verify success message
5. Go to Admin dashboard (`/admin`)
6. Verify contact appears in "Contact Submissions"
7. Try creating a post in Community (`/community`)
8. Verify post appears immediately

---

## Step 7: Troubleshooting

### Issue: Frontend shows 404 on API calls
**Solution:**
- Check `VITE_API_URL` environment variable is set in Vercel
- Verify backend URL is accessible in browser
- Check CORS configuration in `server.js`

### Issue: Backend won't start
**Solution:**
- Check Render logs: Dashboard → Service → Logs
- Ensure all dependencies are in `package.json`
- Verify `server.js` is in root directory

### Issue: Blade server resets frequently
**Solution:**
- This is normal on free tier (spins down after 15 min inactivity)
- First request will take ~30 seconds to resume
- Upgrade to paid plan for always-on

### Issue: Contact submissions not appearing in admin
**Solution:**
- Check that frontend is calling correct API URL
- Verify admin dashboard auto-refresh is fetching from backend
- Check browser console for errors
- Test backend directly: `curl https://backend-url/api/db/contact`

---

## Database & Persistence

### Current Setup (In-Memory)
- Data stored in Node server memory
- **Lost on server restart**
- Good for demo/testing
- Render backend may reset every 15 minutes on free tier

### For Persistent Storage
Consider upgrading to:
1. **Render PostgreSQL** (add database to Render service)
2. **Supabase** (managed PostgreSQL)
3. **MongoDB Atlas** (free tier available)
4. Update database connection in `server.js`

---

## Monitoring & Updates

### View Logs
- **Vercel:** https://vercel.com/dashboard → Project → Deployments → Logs
- **Render:** https://dashboard.render.com → Service → Logs

### Redeploy Code Changes
- **Vercel:** Push to GitHub → Auto-deploys
- **Render:** Same (push to GitHub → auto-deploys)

### Manual Redeploy
- **Vercel Dashboard:** Click "Redeploy"
- **Render Dashboard:** Click "Manual Deploy"

---

## Final Checklist

- [ ] GitHub repository created and pushed
- [ ] Render backend deployed successfully
- [ ] Backend URL copied and saved
- [ ] Vercel environment variable set with backend URL
- [ ] Vercel frontend deployed successfully
- [ ] Frontend and backend can communicate
- [ ] Contact form submission works end-to-end
- [ ] Admin dashboard displays contacts
- [ ] Community features working (like, comment)
- [ ] Feedback page loading and submitting

---

## Support

For issues:
1. Check service logs in Render/Vercel dashboards
2. Test API endpoints directly: `curl https://backend-url/api/...`
3. Check browser console for errors (F12)
4. Verify environment variables are set correctly
5. Ensure GitHub repository is up to date

---

**Deployment Complete! 🚀**

Your application is now live and accessible globally.
