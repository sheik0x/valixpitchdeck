# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Contract addresses configured
- [ ] Build passes without errors
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Tests pass (if applicable)

## Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard

## Other Platforms

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Environment Variables

Required for production:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_FEE_MARKET_ADDRESS=0x...
NEXT_PUBLIC_ACCS_ADDRESS=0x...
NEXT_PUBLIC_HVM_ADDRESS=0x...
```

## Custom Domain

1. Add domain in Vercel dashboard
2. Update DNS records
3. SSL certificate auto-provisioned

## Monitoring

- Set up error tracking (Sentry, etc.)
- Monitor performance (Vercel Analytics)
- Track user analytics