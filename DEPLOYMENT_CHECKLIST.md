# 🚀 E-Food Deployment Checklist

## Pre-Deployment (Complete These NOW)

### 1. GitHub Repository Setup
- [ ] Push project to GitHub repository
  ```bash
  git init
  git add .
  git commit -m "Ready for production deployment"
  git remote add origin https://github.com/YOUR_USERNAME/food_project.git
  git push -u origin main
  ```
- [ ] Verify all files are pushed (including `dist/` should be in `.gitignore`)
- [ ] Copy your GitHub repository URL

### 2. Prepare Configuration Files
- [ ] ✅ `vercel.json` - Created ✓
- [ ] ✅ `render.yaml` - Created ✓
- [ ] ✅ `.env.example` - Created ✓
- [ ] ✅ `vite.config.ts` - Updated ✓
- [ ] ✅ `server.js` - Updated with CORS ✓
- [ ] ✅ Build tested locally - SUCCESS ✓

---

## Step 1: Deploy Backend to Render (5 minutes)

### 1.1 Create Render Account
1. Go to https://render.com
2. Click "Sign up with GitHub"
3. Authorize Render to access your GitHub account

### 1.2 Create Backend Service
1. Click "New +" → "Web Service"
2. Select your `food_project` repository
3. Fill in details:
   - **Name:** `food-recommendation-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Region:** `Oregon` (or nearest to you)
   - **Plan:** `Free`

### 1.3 Add Environment Variables
1. Scroll to "Environment Variables"
2. Add:
   - **Key:** `NODE_ENV`, **Value:** `production`
   - **Key:** `PORT`, **Value:** `5000`
   - **Key:** `CORS_ORIGIN`, **Value:** `https://your-vercel-domain.vercel.app` (add this after Vercel deploy)

### 1.4 Deploy
1. Click "Create Web Service"
2. Render will build and deploy automatically (takes 2-3 minutes)
3. **SAVE YOUR BACKEND URL:** `https://food-recommendation-backend.onrender.com`
   - Find it at: Dashboard → Service name → Copy the URL

### ℹ️ Free Tier Info
- Backend will spin down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (normal!)
- Upgrade to paid for always-on ($7/month)

---

## Step 2: Deploy Frontend to Vercel (5 minutes)

### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

### 2.2 Import Project
1. Click "Add New" → "Project"
2. Select your `food_project` repository
3. Click "Import"

### 2.3 Configure Build
**Framework Preset:** Vite (should auto-detect)

**Build & Output Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2.4 Add Environment Variables
1. Click "Environment Variables"
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://food-recommendation-backend.onrender.com/api`
3. Click "Add"

### 2.5 Deploy
1. Click "Deploy"
2. Wait for build to complete (1-2 minutes)
3. **SAVE YOUR FRONTEND URL:** `https://you-chosen-name.vercel.app`
   - From Vercel dashboard, under Deployments

---

## Step 3: Update Backend CORS (2 minutes)

### 3.1 Update Render Environment
1. Go to Render Dashboard
2. Select `food-recommendation-backend` service
3. Go to Settings → Environment Variables
4. Add/Update:
   - **Key:** `CORS_ORIGIN`
   - **Value:** `https://your-vercel-domain.vercel.app`
5. Click "Deploy" or "Manual Deploy"

---

## Step 4: Verification Testing (5 minutes)

### 4.1 Check Frontend Load
```
✅ Visit: https://your-vercel-domain.vercel.app
   Should see the E-Food homepage
```

### 4.2 Check Backend Health
```bash
curl https://food-recommendation-backend.onrender.com/api/db/contact
# Should return: [] or array of contacts
```

### 4.3 Test Contact Form (End-to-End)
1. Open frontend URL
2. Navigate to "Contact Us" page
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Testing deployment
   - Message: This is a deployment test
4. Click "Submit"
5. ✅ Should see success message

### 4.4 Verify in Admin
1. Open frontend URL
2. Go to `/admin` (Admin Dashboard)
3. Login with: `admin@gmail.com` / any password
4. ✅ Should see "Test User" in Contact Submissions

### 4.5 Test Other Features
- [ ] Community page - Create a post
- [ ] Like/comment on posts
- [ ] Go to Feedback page - Submit feedback
- [ ] Food search - Find and save foods
- [ ] User profile - Update settings

---

## Post-Deployment

### Monitor Application
- **Frontend Logs:** https://vercel.com/dashboard → Select project → Deployments
- **Backend Logs:** https://dashboard.render.com → Select service → Logs

### Redeploy When Needed
**Frontend (Automatic):**
- Push to GitHub → Vercel auto-deploys

**Backend (Automatic):**
- Push to GitHub → Render auto-deploys

**Manual Redeploy:**
- Vercel: Dashboard → Deployments → 3-dots → Redeploy
- Render: Dashboard → Manual Deploy

### Production Notes
1. **Data Persistence:** Currently uses server memory (lost on restart)
   - Upgrade to PostgreSQL or MongoDB for production
2. **Background Refresh:** Admin dashboard auto-refreshes every 3 seconds
3. **API Rate Limits:** None currently (add if issues arise)
4. **SSL/HTTPS:** ✅ Automatic on both Vercel and Render

---

## Troubleshooting

### ❌ "Cannot connect to backend"
- [ ] Check backend URL is correct in Vercel env vars
- [ ] Test backend directly: `curl https://backend-url/api/db/contact`
- [ ] Verify CORS_ORIGIN set in Render env vars
- [ ] Wait 30 seconds if backend was sleeping

### ❌ "Contact form not appearing in admin"
- [ ] Check admin dashboard auto-refresh is working
- [ ] Check browser console (F12) for errors
- [ ] Verify VITE_API_URL points to correct backend
- [ ] Try submitting form again

### ❌ "Feedback page shows white screen"
- [ ] Check browser console (F12)
- [ ] Verify `/api/db/feedback` endpoint responds
- [ ] Check Render logs for errors

### ❌ "Build fails in Vercel"
- [ ] Check build logs in Vercel dashboard
- [ ] Verify `package.json` has all dependencies
- [ ] Run local build: `npm run build` to test

---

## Final Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured on both platforms
- [ ] Contact form works end-to-end
- [ ] Admin dashboard displays contacts
- [ ] Community features working (post, like, comment)
- [ ] Feedback page loading and submitting
- [ ] All other features tested

---

## URLs to Remember

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | https://your-vercel-domain.vercel.app |
| **Backend API (Render)** | https://food-recommendation-backend.onrender.com/api |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Render Dashboard** | https://dashboard.render.com |
| **GitHub Repository** | https://github.com/YOUR_USERNAME/food_project |

---

## 🎉 Deployment Complete!

Your E-Food recommendation system is now **LIVE and accessible globally**. 

Congratulations on launching to production! 🚀
