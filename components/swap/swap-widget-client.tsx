'use client'

import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WalletStatus } from './wallet-status'
import { useSupportedTokens } from '@/use-cases/swap/get-supported-tokens/use-supported-tokens'
import type { Token } from '@/repositories/swap/swap-schema'
import { IconArrowsExchange } from '@tabler/icons-react'

export function SwapWidgetClient() {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext()
  const tokensQuery = useSupportedTokens()

  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)

  const walletAddress = primaryWallet?.address

  const handleSwapDirection = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setAmount('')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Swap</CardTitle>
        <WalletStatus />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* From token row */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <span className="text-xs text-muted-foreground">From</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="min-w-28 justify-start">
              {fromToken ? fromToken.symbol : 'Select token'}
            </Button>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-right text-2xl font-medium outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Direction toggle */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSwapDirection}
          >
            <IconArrowsExchange className="h-4 w-4 rotate-90" />
          </Button>
        </div>

        {/* To token row */}
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
          <span className="text-xs text-muted-foreground">To</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="min-w-28 justify-start">
              {toToken ? toToken.symbol : 'Select token'}
            </Button>
            <div className="flex-1 text-right text-2xl font-medium text-muted-foreground/50">
              0.0
            </div>
          </div>
        </div>

        {/* Action button */}
        {!walletAddress ? (
          <Button className="w-full" size="lg" onClick={() => setShowAuthFlow(true)}>
            Connect Wallet
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled>
            Select tokens to swap
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
