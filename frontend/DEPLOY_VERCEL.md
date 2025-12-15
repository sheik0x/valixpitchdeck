# Deploy to Vercel - Step by Step

## Quick Deploy via Vercel CLI

### 1. Install Vercel CLI (if not installed)
```bash
npm i -g vercel
```

### 2. Navigate to Frontend Directory
```bash
cd unified-security-layer/frontend
```

### 3. Login to Vercel
```bash
vercel login
```

### 4. Deploy
```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (or Yes if updating)
- **Project name** → unified-security-layer (or your choice)
- **Directory** → `.` (current directory)
- **Override settings?** → No

### 5. Set Environment Variables

After first deployment, set environment variables:

```bash
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
# Enter your WalletConnect project ID when prompted

vercel env add NEXT_PUBLIC_RPC_URL
# Enter: https://api.avax.network/ext/bc/C/rpc
```

Or set in Vercel Dashboard:
1. Go to your project on vercel.com
2. Settings → Environment Variables
3. Add each variable

### 6. Redeploy
```bash
vercel --prod
```

## Important Configuration

### Root Directory
Make sure Vercel knows the root is `frontend`:
- In Vercel Dashboard → Settings → General
- Set **Root Directory** to: `frontend`

### Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install --legacy-peer-deps`
- **Output Directory**: `.next` (default)

## Fixing 404 Errors

The 404 errors are likely due to:
1. **Root Directory** not set to `frontend`
2. **Build Command** incorrect
3. **Environment Variables** missing

### Solution

1. **Check Root Directory**:
   - Vercel Dashboard → Settings → General
   - Root Directory: `frontend`

2. **Verify Build**:
   ```bash
   cd frontend
   npm run build
   ```
   Should complete without errors

3. **Check vercel.json**:
   - Should be in `frontend/` directory
   - Contains proper rewrites

## After Deployment

Your app will be available at:
- `https://your-project.vercel.app`

Test all routes:
- `/` - Dashboard
- `/fee-market` - Fee Market
- `/validators` - Validators
- `/docs` - Documentation
- `/api` - Should redirect to `/docs/api`
- `/security` - Should redirect to `/docs/security`

## Troubleshooting

### Still Getting 404?

1. **Check Vercel Logs**:
   ```bash
   vercel logs
   ```

2. **Check Build Output**:
   - Vercel Dashboard → Deployments → Click on deployment
   - Check build logs for errors

3. **Verify Files**:
   - Make sure `src/app/` directory structure is correct
   - All page files should be `page.tsx`

4. **Clear Cache**:
   - Vercel Dashboard → Settings → Clear Build Cache
   - Redeploy

## Production Deployment

Once everything works:

```bash
vercel --prod
```

This deploys to production domain.

---

**Need Help?** Check `VERCEL_DEPLOYMENT.md` for more details.