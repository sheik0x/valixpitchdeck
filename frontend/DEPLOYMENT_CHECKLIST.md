# Deployment Checklist - Fix 404 Errors

## ✅ Pre-Deployment Verification

### 1. Check All Required Files Exist

Run this to verify:
```bash
cd frontend
npm run build
```

All routes should show:
- ○ (Static) or ƒ (Dynamic) - NOT 404

### 2. Required Files Checklist

**Pages (must exist):**
- [x] `src/app/page.tsx` - Homepage
- [x] `src/app/fee-market/page.tsx` - Fee Market
- [x] `src/app/validators/page.tsx` - Validators
- [x] `src/app/validators/register/page.tsx` - Register
- [x] `src/app/validators/[address]/page.tsx` - Validator Details
- [x] `src/app/accs/page.tsx` - ACCS Monitor
- [x] `src/app/governance/page.tsx` - Governance
- [x] `src/app/docs/page.tsx` - Docs Hub
- [x] `src/app/docs/getting-started/page.tsx`
- [x] `src/app/docs/architecture/page.tsx`
- [x] `src/app/docs/features/page.tsx`
- [x] `src/app/docs/security/page.tsx`
- [x] `src/app/docs/api/page.tsx`
- [x] `src/app/docs/deployment/page.tsx`
- [x] `src/app/not-found.tsx` - 404 Page
- [x] `src/app/error.tsx` - Error Page
- [x] `src/app/loading.tsx` - Loading State

**Route Handlers:**
- [x] `src/app/api/route.ts` - API redirect
- [x] `src/app/security/route.ts` - Security redirect

**Configuration:**
- [x] `next.config.js` - Next.js config
- [x] `vercel.json` - Vercel config
- [x] `netlify.toml` - Netlify config
- [x] `package.json` - Dependencies
- [x] `tsconfig.json` - TypeScript config

## 🔧 Vercel Deployment Fix

### Critical Settings

1. **Root Directory**: MUST be `frontend`
   - Vercel Dashboard → Settings → General
   - Set to: `frontend`

2. **Build Settings**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next`

3. **Environment Variables**:
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-id
   NEXT_PUBLIC_RPC_URL=https://api.avax.network/ext/bc/C/rpc
   ```

## 🔧 Netlify Deployment Fix

### Critical Settings

1. **Base Directory**: `frontend`
   - Netlify Dashboard → Site Settings → Build & Deploy
   - Base directory: `frontend`

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Install command: `npm install --legacy-peer-deps`

3. **Plugin**: Install `@netlify/plugin-nextjs`
   - Already configured in `netlify.toml`

## 🚀 Quick Deploy Commands

### Vercel
```bash
cd unified-security-layer/frontend
vercel --prod
```

### Netlify
```bash
cd unified-security-layer/frontend
netlify deploy --prod
```

## ✅ Post-Deployment Verification

Test these URLs (replace with your domain):
- `https://your-site.vercel.app/` ✅
- `https://your-site.vercel.app/fee-market` ✅
- `https://your-site.vercel.app/validators` ✅
- `https://your-site.vercel.app/docs` ✅
- `https://your-site.vercel.app/api` → Should redirect ✅
- `https://your-site.vercel.app/security` → Should redirect ✅

## 🐛 If Still Getting 404

1. **Check Build Logs**: Look for route/page errors
2. **Verify Root Directory**: Must be `frontend`
3. **Clear Cache**: Clear build cache and redeploy
4. **Check File Structure**: All files in `src/app/`
5. **Test Locally**: `npm run build && npm start` - test all routes

## 📝 Files to Verify in GitHub

Make sure these are in the repo:
- All `src/app/**/page.tsx` files
- `next.config.js`
- `vercel.json`
- `netlify.toml`
- `package.json`
- All components in `src/components/`



