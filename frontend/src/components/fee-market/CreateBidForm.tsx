'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAccount, useWriteContract } from 'wagmi'
import toast from 'react-hot-toast'

const bidSchema = z.object({
  subnetId: z.string().min(1, 'Subnet ID is required'),
  requiredStake: z.number().min(1, 'Stake must be greater than 0'),
  duration: z.number().min(1, 'Duration must be at least 1 day'),
  minUptime: z.number().min(0).max(100),
  maxLatency: z.number().min(0),
  minValidators: z.number().min(1),
  price: z.number().min(0, 'Price must be greater than 0'),
})

type BidFormData = z.infer<typeof bidSchema>

export function CreateBidForm() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const [selectedSubnet, setSelectedSubnet] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
  })

  const onSubmit = async (data: BidFormData) => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    try {
      // In production, call the actual contract
      toast.success('Bid created successfully!')
    } catch (error) {
      toast.error('Failed to create bid')
      console.error(error)
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Create Security Bid</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Subnet</label>
          <select
            {...register('subnetId')}
            className="input w-full"
            value={selectedSubnet}
            onChange={(e) => setSelectedSubnet(e.target.value)}
          >
            <option value="">Select a subnet</option>
            <option value="avalanche-1">Avalanche Subnet A</option>
            <option value="cosmos-1">Cosmos Chain B</option>
          </select>
          {errors.subnetId && (
            <p className="text-red-400 text-sm mt-1">{errors.subnetId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Required Stake (AVAX)</label>
            <input
              type="number"
              step="0.01"
              {...register('requiredStake', { valueAsNumber: true })}
              className="input w-full"
              placeholder="10000"
            />
            {errors.requiredStake && (
              <p className="text-red-400 text-sm mt-1">{errors.requiredStake.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Duration (days)</label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="input w-full"
              placeholder="30"
            />
            {errors.duration && (
              <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">QoS Requirements</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Uptime (%)</label>
              <input
                type="number"
                step="0.1"
                {...register('minUptime', { valueAsNumber: true })}
                className="input w-full"
                placeholder="99.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Latency (ms)</label>
              <input
                type="number"
                {...register('maxLatency', { valueAsNumber: true })}
                className="input w-full"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Min Validators</label>
              <input
                type="number"
                {...register('minValidators', { valueAsNumber: true })}
                className="input w-full"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price per unit per second (AVAX)</label>
          <input
            type="number"
            step="0.001"
            {...register('price', { valueAsNumber: true })}
            className="input w-full"
            placeholder="0.05"
          />
          {errors.price && (
            <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isConnected || isPending}
          className="btn-primary w-full"
        >
          {isPending ? 'Creating...' : 'Create Bid'}
        </button>
      </form>
    </div>
  )
}