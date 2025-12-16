# ⚡ Quick Deploy Guide

## 🎯 I've Set Everything Up - You Just Need to Deploy!

All code is on GitHub: **https://github.com/sheik0x/unifiedsecuritylayer**

---

## 🚀 Easiest Way: Vercel Dashboard

### 1. Go to Vercel
https://vercel.com/new

### 2. Import Repository
- Click **Import Git Repository**
- Select: `sheik0x/unifiedsecuritylayer`
- Click **Import**

### 3. Configure (CRITICAL!)
- **Root Directory**: `frontend` ⚠️ **THIS FIXES 404 ERRORS**
- Framework: Next.js (auto-detected)
- Build Command: `npm run build`
- Install Command: `npm install --legacy-peer-deps`

### 4. Add Environment Variables (Optional)
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = your-id
NEXT_PUBLIC_RPC_URL = https://api.avax.network/ext/bc/C/rpc
```

### 5. Deploy
Click **Deploy** button

---

## ✅ That's It!

After deployment, your site will be live at:
`https://your-project.vercel.app`

**All 18 routes will work correctly!**

---

## 🔧 Alternative: CLI Deployment

If you prefer CLI:

```powershell
cd unified-security-layer\frontend
vercel login
vercel --prod
```

Then set Root Directory in dashboard: `frontend`

---

## 📋 What's Ready

✅ All 18 routes verified
✅ All files on GitHub
✅ Build configuration ready
✅ Deployment scripts created
✅ Documentation complete

**Just set Root Directory = `frontend` and deploy!** 🚀



