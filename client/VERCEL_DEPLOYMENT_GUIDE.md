# Vercel Deployment Guide for Job Portal Frontend

## 🚀 DEPLOYMENT STEPS

### 1. **Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Click "New Project"

### 2. **Import Repository**
- Connect your GitHub account
- Select your Job-Portal repository
- Choose the **client** folder as the root directory

### 3. **Configure Project Settings**
```
Framework Preset: Next.js
Root Directory: client
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4. **Environment Variables**
Add these environment variables in Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://job-portal-97q3.onrender.com/api
```

### 5. **Deploy**
- Click "Deploy"
- Wait for deployment to complete

## ✅ WHAT'S READY

- ✅ Frontend builds successfully
- ✅ All dependencies installed
- ✅ API configuration updated
- ✅ Vercel configuration created

## 🔗 YOUR DEPLOYED URLS

After deployment, you'll get:
- **Frontend:** `https://your-project-name.vercel.app`
- **Backend:** `https://job-portal-97q3.onrender.com`

## 🧪 TEST YOUR DEPLOYMENT

1. Visit your Vercel URL
2. Test login/register functionality
3. Check if API calls work
4. Verify all pages load correctly

## 🔧 TROUBLESHOOTING

### If API calls fail:
1. Check environment variables in Vercel dashboard
2. Verify backend is running at Render
3. Check browser console for CORS errors

### If build fails:
1. Check for TypeScript errors
2. Verify all dependencies are installed
3. Check Next.js configuration

## 📋 POST-DEPLOYMENT

1. Update your backend CORS settings if needed
2. Test all major features
3. Set up custom domain (optional)
4. Configure analytics (optional)
