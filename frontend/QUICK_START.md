# Quick Start Guide

## Installation

```bash
cd frontend
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Get WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
3. Add your contract addresses (optional for development)

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm test` - Run tests

## Features

✅ Modern Next.js 14 with App Router
✅ TypeScript for type safety
✅ Tailwind CSS for styling
✅ Web3 integration (Wagmi + RainbowKit)
✅ Real-time charts (Recharts)
✅ Form validation (React Hook Form + Zod)
✅ Responsive design
✅ Error handling
✅ Performance optimized

## Pages

- `/` - Dashboard
- `/fee-market` - Dynamic Fee Market
- `/validators` - Validator management
- `/accs` - ACCS monitoring
- `/governance` - Governance interface

## Troubleshooting

### Wallet Connection Issues
- Make sure WalletConnect Project ID is set
- Check browser console for errors
- Try different wallet providers

### Build Errors
- Run `npm run type-check` to see TypeScript errors
- Check that all dependencies are installed
- Clear `.next` folder and rebuild

### Performance Issues
- Check network tab for slow requests
- Use Lighthouse to measure performance
- See OPTIMIZATION.md for tips