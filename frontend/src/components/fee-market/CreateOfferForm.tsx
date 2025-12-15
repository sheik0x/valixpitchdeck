'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'

const offerSchema = z.object({
  availableStake: z.number().min(1, 'Stake must be greater than 0'),
  minPrice: z.number().min(0, 'Price must be greater than 0'),
  maxDuration: z.number().min(1, 'Duration must be at least 1 day'),
  uptime: z.number().min(0).max(100),
  maxLatency: z.number().min(0),
})

type OfferFormData = z.infer<typeof offerSchema>

export function CreateOfferForm() {
  const { address, isConnected } = useAccount()
  const [isPending, setIsPending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
  })

  const onSubmit = async (data: OfferFormData) => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    setIsPending(true)
    try {
      // In production, call the actual contract
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Offer created successfully!')
    } catch (error) {
      toast.error('Failed to create offer')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Create Validator Offer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Available Stake (AVAX)</label>
          <input
            type="number"
            step="0.01"
            {...register('availableStake', { valueAsNumber: true })}
            className="input w-full"
            placeholder="20000"
          />
          {errors.availableStake && (
            <p className="text-red-400 text-sm mt-1">{errors.availableStake.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min Price (AVAX/sec)</label>
            <input
              type="number"
              step="0.001"
              {...register('minPrice', { valueAsNumber: true })}
              className="input w-full"
              placeholder="0.04"
            />
            {errors.minPrice && (
              <p className="text-red-400 text-sm mt-1">{errors.minPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Duration (days)</label>
            <input
              type="number"
              {...register('maxDuration', { valueAsNumber: true })}
              className="input w-full"
              placeholder="90"
            />
            {errors.maxDuration && (
              <p className="text-red-400 text-sm mt-1">{errors.maxDuration.message}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Supported QoS</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Uptime (%)</label>
              <input
                type="number"
                step="0.1"
                {...register('uptime', { valueAsNumber: true })}
                className="input w-full"
                placeholder="99.8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Latency (ms)</label>
              <input
                type="number"
                {...register('maxLatency', { valueAsNumber: true })}
                className="input w-full"
                placeholder="80"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isConnected || isPending}
          className="btn-primary w-full"
        >
          {isPending ? 'Creating...' : 'Create Offer'}
        </button>
      </form>
    </div>
  )
}