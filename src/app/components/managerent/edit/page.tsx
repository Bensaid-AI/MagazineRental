'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import RentalForm from '../components/rentalform'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Rental {
  id: string
  title: string
  description: string
  price: string | number
  published_by: string
  image_url: string
}

export default function EditRentalPage() {
  const searchParams = useSearchParams()
  const rentalId = searchParams.get('id')
  const [rental, setRental] = useState<Rental | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!rentalId) {
      setError('No rental ID provided')
      setLoading(false)
      return
    }

    const fetchRental = async () => {
      try {
        const response = await fetch(`/api/managerentals/${rentalId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch rental details')
        }
        const data = await response.json()
        setRental(data.rental)
      } catch (err: any) {
        setError(err.message || 'Error fetching rental')
        console.error('Error fetching rental:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRental()
  }, [rentalId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading rental details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="text-center py-8">
            <p className="text-red-700 font-medium text-lg">⚠️ {error || 'Rental not found'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <RentalForm mode="edit" initialData={rental} />
}
