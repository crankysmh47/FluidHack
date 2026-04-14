import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { WagmiProvider } from 'wagmi'
import { mainnet, polygon, base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// 1. Get queryClient
const queryClient = new QueryClient()

// 2. Get projectId from https://cloud.walletconnect.com
const projectId = 'YOUR_PLACEHOLDER_PROJECT_ID' // User requested placeholder

// 3. Create wagmiConfig
const metadata = {
  name: 'Carbon Sentinel',
  description: 'Autonomous Carbon Offsetting',
  url: 'https://carbonsentinel.io', // placeholder
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, polygon, base, baseSepolia] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 4. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
