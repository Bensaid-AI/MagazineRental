'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RentalCard from './components/rentalcard'

interface Rental {
  id: string
  title: string
  description: string
  price: string | number
  published_by: string
  image_url: string
}

export default function ManageRentalPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter();

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/managerentals')
      if (response.ok) {
        const data = await response.json()
        setRentals(data.rentals || [])
      } else {
        setError('Failed to fetch rentals')
      }
    } catch (error) {
      setError('Error fetching rentals')
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    router.push(`./edit?id=${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/managerentals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the rental from the list
        setRentals(rentals.filter(rental => rental.id !== id))
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete rental')
      }
    } catch (error) {
      setError('Error deleting rental')
      console.error('Error deleting rental:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 p-8">
      {/* Header with Brown Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">RM</span>
          </div>
          <h1 className="text-4xl font-bold text-amber-900">Manage Rentals</h1>
        </div>
        <p className="text-amber-700 text-lg">Monitor and manage all rental listings</p>
      </div>

      {/* Add Rental Button */}
      <div className="mb-8">
        <button  onClick={() => router.push("./managerent/add")} className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
          + Add New Rental
        </button>
      </div>


      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg shadow-sm">
          <p className="text-red-800 font-medium flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-green-500 animate-spin"></div>
            </div>
            <p className="text-green-700 font-medium mt-4">Loading rentals...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && rentals.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-green-300">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500 text-lg font-medium">No rentals found yet</p>
          <p className="text-gray-400 mt-2">Click "Add New Rental" to get started</p>
        </div>
      )}

      {/* Rental Cards Grid */}
      {!loading && rentals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((rental) => (
            <RentalCard 
              key={rental.id} 
              rental={rental}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {!loading && rentals.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-lg border-2 border-green-100 p-6">
          <div className="flex justify-between items-center">
            <p className="text-green-700 font-medium text-lg">
              ✓ Showing <span className="font-bold text-amber-900">{rentals.length}</span> active rentals
            </p>
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
              📊 Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
