# Unified Security Layer - Frontend

Modern, cutting-edge UI for the Unified Security Layer protocol built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Modern Design** - Sleek dark theme with gradient accents
- 📊 **Real-time Dashboards** - Live metrics and charts
- 💼 **Web3 Integration** - RainbowKit wallet connection
- 📱 **Responsive** - Mobile-first design
- ⚡ **Performance** - Optimized with Next.js 14
- 🎯 **Type Safety** - Full TypeScript support
- 🔒 **Error Handling** - Comprehensive validation and error states

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem + RainbowKit
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
- `NEXT_PUBLIC_RPC_URL` - Your RPC endpoint
- Contract addresses (optional for development)

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── fee-market/   # Fee market page
│   │   ├── validators/   # Validator pages
│   │   ├── accs/         # ACCS monitoring
│   │   └── governance/   # Governance page
│   ├── components/       # React components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── fee-market/   # Fee market components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI primitives
│   ├── config/           # Configuration files
│   └── lib/              # Utilities
├── public/               # Static assets
└── package.json
```

## Pages

- **Dashboard** (`/`) - Overview with stats and charts
- **Fee Market** (`/fee-market`) - Bid and offer interface
- **Validators** (`/validators`) - Validator management
- **ACCS Monitor** (`/accs`) - Cross-chain slashing monitoring
- **Governance** (`/governance`) - Protocol governance

## Components

### Dashboard
- `StatsOverview` - Key metrics cards
- `QuickActions` - Quick action buttons
- `Dashboard` - Main dashboard with charts

### Fee Market
- `FeeMarketView` - Market overview
- `CreateBidForm` - Create security bid
- `CreateOfferForm` - Create validator offer

### Layout
- `Header` - Navigation header
- `Footer` - Site footer

## Web3 Integration

The app uses Wagmi for Web3 interactions:

```typescript
import { useAccount, useWriteContract } from 'wagmi'

function MyComponent() {
  const { address, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  
  // Use Web3 hooks
}
```

## Styling

Uses Tailwind CSS with custom theme:

- Dark theme by default
- Primary color: Blue (`primary-*`)
- Custom utilities: `card`, `btn-primary`, `badge-*`
- Responsive breakpoints: `md:`, `lg:`

## Error Handling

All forms use Zod validation:

```typescript
const schema = z.object({
  amount: z.number().min(1),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

## Performance

- Server-side rendering (SSR)
- Static generation where possible
- React Query for data fetching
- Image optimization
- Code splitting

## Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Other Platforms

```bash
npm run build
npm start
```

## License

MIT