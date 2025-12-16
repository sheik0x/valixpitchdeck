# 🚀 Deploy to Vercel - Quick Instructions

## Option 1: Using Vercel CLI (Recommended)

### Step 1: Login to Vercel
```powershell
cd unified-security-layer\frontend
vercel login
```

This will:
- Open your browser
- Ask you to authenticate
- Complete the login process

### Step 2: Deploy
```powershell
# Run the deployment script
.\deploy-vercel.ps1

# OR deploy manually
vercel --prod --yes
```

### Step 3: Set Root Directory (CRITICAL!)
After deployment:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → General
4. **Root Directory**: Set to `frontend`
5. Save and redeploy

---

## Option 2: Using Vercel Dashboard (Easier)

### Step 1: Import Project
1. Go to: https://vercel.com/new
2. Click **Import Git Repository**
3. Select: `sheik0x/unifiedsecuritylayer`
4. Click **Import**

### Step 2: Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend` ⚠️ **SET THIS NOW**
- **Build Command**: `npm run build`
- **Install Command**: `npm install --legacy-peer-deps`
- **Output Directory**: `.next`

### Step 3: Add Environment Variables
Click **Environment Variables** and add:
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = your-project-id
NEXT_PUBLIC_RPC_URL = https://api.avax.network/ext/bc/C/rpc
```

### Step 4: Deploy
Click **Deploy**

---

## ✅ After Deployment

Test these URLs:
- `https://your-project.vercel.app/`
- `https://your-project.vercel.app/fee-market`
- `https://your-project.vercel.app/validators`
- `https://your-project.vercel.app/docs`

All routes should work without 404 errors!

---

## 🐛 Troubleshooting

### Still getting 404?
1. **Check Root Directory**: Must be `frontend` (not `.` or empty)
2. **Check Build Logs**: Look for errors in deployment logs
3. **Redeploy**: After changing root directory, trigger a new deployment

### Build fails?
1. Check environment variables are set
2. Verify `package.json` has all dependencies
3. Check build logs for specific errors

---

## 📝 Quick Commands

```powershell
# Login
vercel login

# Deploy
vercel --prod

# Check status
vercel ls

# View logs
vercel logs
```



