# Fixing 404 Errors on Vercel

## Common Causes

### 1. Root Directory Not Set
**Problem**: Vercel is looking in the wrong directory.

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → General
2. Set **Root Directory** to: `frontend`
3. Save and redeploy

### 2. Build Command Issue
**Problem**: Build command not finding files.

**Solution**:
- Build Command: `cd frontend && npm run build`
- OR set Root Directory to `frontend` and use: `npm run build`

### 3. Next.js Routing
**Problem**: Next.js App Router not configured correctly.

**Solution**: 
- ✅ Already fixed in `next.config.js`
- ✅ All pages are in `src/app/`
- ✅ Route handlers are in place

## Quick Fix Steps

### Step 1: Update Vercel Settings

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Update:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Output Directory**: `.next` (leave default)

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger redeploy

### Step 3: Verify

After redeploy, test:
- `https://your-project.vercel.app/` ✅
- `https://your-project.vercel.app/fee-market` ✅
- `https://your-project.vercel.app/validators` ✅
- `https://your-project.vercel.app/docs` ✅

## If Still Getting 404

### Check Build Logs

1. Go to deployment
2. Click on build
3. Check for errors
4. Look for "Route" or "Page" errors

### Verify File Structure

Your `frontend/` directory should have:
```
frontend/
├── src/
│   └── app/
│       ├── page.tsx          # Homepage
│       ├── fee-market/
│       │   └── page.tsx
│       ├── validators/
│       │   ├── page.tsx
│       │   └── [address]/
│       │       └── page.tsx
│       └── docs/
│           └── page.tsx
├── next.config.js
├── vercel.json
└── package.json
```

### Test Locally First

```bash
cd frontend
npm run build
npm start
```

Visit `http://localhost:3000` and test all routes.

## Alternative: Deploy from Frontend Directory

If root directory setting doesn't work:

1. **Create new Vercel project** from `frontend/` directory directly
2. Or use Vercel CLI from `frontend/`:

```bash
cd unified-security-layer/frontend
vercel
```

This will automatically detect it's a Next.js app in the current directory.



