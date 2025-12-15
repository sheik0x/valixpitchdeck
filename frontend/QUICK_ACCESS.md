# Quick Access Guide

## 🚀 Access the App

The Unified Security Layer frontend is running at:

**http://localhost:3001**

(If port 3001 is in use, it will automatically use the next available port)

## 📱 What You Can Do

### 1. Dashboard (`/`)
- View real-time statistics
- See lease activity charts
- Access quick actions
- View recent leases

### 2. Fee Market (`/fee-market`)
- Browse active bids and offers
- Create security bids (as subnet)
- Create validator offers
- Search and filter

### 3. Validators (`/validators`)
- View all validators
- Search validators
- Register as validator
- View validator details

### 4. ACCS Monitor (`/accs`)
- Monitor proof-of-malice events
- View slashing statistics
- Track validator violations

### 5. Governance (`/governance`)
- View proposals
- Vote on proposals
- Track voting power

### 6. Documentation (`/docs`)
- Getting started guide
- Architecture docs
- Feature documentation
- Security information
- API reference
- Deployment guides

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Run E2E tests
npm run test:e2e
```

## 🌐 Network Access

To access from other devices on your network:
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access via: `http://YOUR_IP:3001`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### App Not Loading
1. Check terminal for errors
2. Clear browser cache
3. Try incognito mode
4. Check console for errors (F12)

### Wallet Connection Issues
- Make sure WalletConnect Project ID is set in `.env.local`
- Try different wallet providers
- Check browser console for errors