import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalanche, avalancheFuji } from 'wagmi/chains'

// Use a default project ID if not set (for development)
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '00000000000000000000000000000000'

export const config = getDefaultConfig({
  appName: 'Unified Security Layer',
  projectId: projectId,
  chains: [avalanche, avalancheFuji],
  ssr: true,
})