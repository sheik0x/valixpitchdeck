# Vercel Deployment Guide

## Quick Deploy

### Option 1: Vercel CLI (Recommended)

```bash
cd frontend
npm i -g vercel
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (or Yes if updating)
- Project name: **unified-security-layer** (or your choice)
- Directory: **./frontend** (or just `.` if already in frontend)
- Override settings? **No**

### Option 2: GitHub Integration

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `sheik0x/unifiedsecuritylayer`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
   NEXT_PUBLIC_RPC_URL=https://api.avax.network/ext/bc/C/rpc
   ```

6. Click "Deploy"

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Your WalletConnect project ID

### Optional (for testnet/mainnet)
- `NEXT_PUBLIC_RPC_URL` - RPC endpoint URL
- `NEXT_PUBLIC_REGISTRY_ADDRESS` - Contract address
- `NEXT_PUBLIC_FEE_MARKET_ADDRESS` - Contract address
- `NEXT_PUBLIC_ACCS_ADDRESS` - Contract address
- `NEXT_PUBLIC_HVM_ADDRESS` - Contract address

## Fixing 404 Errors

### Common Issues

1. **Routes not found**
   - Make sure `vercel.json` is in the `frontend` directory
   - Check that all pages exist in `src/app/`

2. **API routes 404**
   - Use route handlers (`route.ts`) not page components for redirects
   - Check `vercel.json` rewrites

3. **Dynamic routes not working**
   - Ensure bracket notation: `[address]` not `{address}`
   - Check Next.js 14 App Router syntax

### Verification

After deployment, test these URLs:
- `/` - Should load dashboard
- `/fee-market` - Should load fee market
- `/validators` - Should load validators
- `/docs` - Should load documentation
- `/api` - Should redirect to `/docs/api`
- `/security` - Should redirect to `/docs/security`

## Troubleshooting

### Build Fails

```bash
# Check build locally first
cd frontend
npm run build
```

### 404 on All Routes

- Check root directory setting in Vercel
- Verify `next.config.js` is correct
- Check `vercel.json` configuration

### Environment Variables Not Working

- Make sure they start with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check variable names match exactly

## Production Checklist

- [ ] Environment variables set
- [ ] Build succeeds locally
- [ ] All routes accessible
- [ ] Wallet connection works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance optimized

## Custom Domain

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-provisioned

## Monitoring

- Vercel Analytics (optional)
- Error tracking (Sentry, etc.)
- Performance monitoring
- Uptime monitoring