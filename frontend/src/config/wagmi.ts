import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalanche, avalancheFuji } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Unified Security Layer',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: [avalanche, avalancheFuji],
  ssr: true,
})