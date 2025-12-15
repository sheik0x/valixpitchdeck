'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'
import { Shield } from 'lucide-react'

const registerSchema = z.object({
  totalStake: z.number().min(1000, 'Minimum stake is 1000 AVAX'),
  availableStake: z.number().min(1, 'Available stake must be greater than 0'),
  minLeaseDuration: z.number().min(1, 'Minimum duration is 1 day'),
  maxLeaseDuration: z.number().min(1, 'Maximum duration must be greater than minimum'),
  subnetTypes: z.array(z.string()).min(1, 'Select at least one subnet type'),
}).refine((data) => data.availableStake <= data.totalStake, {
  message: 'Available stake cannot exceed total stake',
  path: ['availableStake'],
}).refine((data) => data.maxLeaseDuration >= data.minLeaseDuration, {
  message: 'Max duration must be >= min duration',
  path: ['maxLeaseDuration'],
})

type RegisterFormData = z.infer<typeof registerSchema>

const subnetTypes = [
  { id: 'avalanche', label: 'Avalanche' },
  { id: 'cosmos', label: 'Cosmos' },
  { id: 'generic', label: 'Generic' },
]

export default function RegisterValidatorPage() {
  const { address, isConnected } = useAccount()
  const [isPending, setIsPending] = useState(false)
  const [selectedSubnetTypes, setSelectedSubnetTypes] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      subnetTypes: [],
    },
  })

  const toggleSubnetType = (type: string) => {
    setSelectedSubnetTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    setIsPending(true)
    try {
      // In production, call the actual contract
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Validator registered successfully!')
    } catch (error) {
      toast.error('Failed to register validator')
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary-400" />
          Register Validator
        </h1>
        <p className="text-gray-400">
          Register as a validator to participate in the Security Leasing Protocol
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Total Stake (AVAX)</label>
            <input
              type="number"
              step="0.01"
              {...register('totalStake', { valueAsNumber: true })}
              className="input w-full"
              placeholder="10000"
            />
            {errors.totalStake && (
              <p className="text-red-400 text-sm mt-1">{errors.totalStake.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Minimum: 1,000 AVAX</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Available Stake (AVAX)</label>
            <input
              type="number"
              step="0.01"
              {...register('availableStake', { valueAsNumber: true })}
              className="input w-full"
              placeholder="5000"
            />
            {errors.availableStake && (
              <p className="text-red-400 text-sm mt-1">{errors.availableStake.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Available: {watch('totalStake') ? (watch('totalStake') - (watch('availableStake') || 0)).toFixed(2) : '0'} AVAX will be reserved
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Min Lease Duration (days)</label>
              <input
                type="number"
                {...register('minLeaseDuration', { valueAsNumber: true })}
                className="input w-full"
                placeholder="1"
              />
              {errors.minLeaseDuration && (
                <p className="text-red-400 text-sm mt-1">{errors.minLeaseDuration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Lease Duration (days)</label>
              <input
                type="number"
                {...register('maxLeaseDuration', { valueAsNumber: true })}
                className="input w-full"
                placeholder="365"
              />
              {errors.maxLeaseDuration && (
                <p className="text-red-400 text-sm mt-1">{errors.maxLeaseDuration.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Supported Subnet Types</label>
            <div className="space-y-2">
              {subnetTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubnetTypes.includes(type.id)}
                    onChange={() => toggleSubnetType(type.id)}
                    className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-600 rounded focus:ring-primary-500"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
            {errors.subnetTypes && (
              <p className="text-red-400 text-sm mt-1">{errors.subnetTypes.message}</p>
            )}
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note:</strong> You'll need to approve the contract to lock your stake. 
              Make sure you have enough AVAX in your wallet.
            </p>
          </div>

          <button
            type="submit"
            disabled={!isConnected || isPending || selectedSubnetTypes.length === 0}
            className="btn-primary w-full"
          >
            {isPending ? 'Registering...' : 'Register Validator'}
          </button>
        </form>
      </div>
    </div>
  )
}