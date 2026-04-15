'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import RentalForm from '../components/rentalform'

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-green-500 animate-spin"></div>
          </div>
          <p className="text-green-700 font-medium mt-4">Loading rental details...</p>
        </div>
      </div>
    )
  }

  if (error || !rental) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 p-8 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 border-2 border-red-200">
          <p className="text-red-800 font-medium text-lg">⚠️ {error || 'Rental not found'}</p>
        </div>
      </div>
    )
  }

  return <RentalForm mode="edit" initialData={rental} />
}
