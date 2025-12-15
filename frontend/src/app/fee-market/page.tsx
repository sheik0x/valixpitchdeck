'use client'

import { useState } from 'react'
import { FeeMarketView } from '@/components/fee-market/FeeMarketView'
import { CreateBidForm } from '@/components/fee-market/CreateBidForm'
import { CreateOfferForm } from '@/components/fee-market/CreateOfferForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

export default function FeeMarketPage() {
  const [activeTab, setActiveTab] = useState('market')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dynamic Fee Market</h1>
        <p className="text-gray-400">
          Bid for security leasing or offer your stake to subnets
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="bid">Create Bid</TabsTrigger>
          <TabsTrigger value="offer">Create Offer</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <FeeMarketView />
        </TabsContent>

        <TabsContent value="bid">
          <CreateBidForm />
        </TabsContent>

        <TabsContent value="offer">
          <CreateOfferForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}