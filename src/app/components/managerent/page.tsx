'use client'
import { useState, useEffect } from 'react'
import { RentalsTable } from './components/rentalsTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2, X } from 'lucide-react'

interface Rental {
  id: string
  title: string
  description: string
  price: string | number
  published_by: string
  image_url: string
  state?: string
}

export default function ManageRentalPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [togglingRentalId, setTogglingRentalId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (!toastMessage) return

    const timer = setTimeout(() => {
      setToastMessage('')
    }, 2500)

    return () => clearTimeout(timer)
  }, [toastMessage])

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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/managerentals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
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

  const handleFormSuccess = () => {
    setShowAddForm(false)
    fetchRentals()
  }

  const handleToggleState = async (id: string, nextState: 'not_rented' | 'not_available') => {
    try {
      setError('')
      setTogglingRentalId(id)

      const response = await fetch(`/api/managerentals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: nextState }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rental state')
      }

      setRentals((prev) =>
        prev.map((rental) =>
          rental.id === id ? { ...rental, state: data.rental?.state ?? nextState } : rental
        )
      )
      setToastType('success')
      setToastMessage(nextState === 'not_rented' ? 'Marked as Not Rented' : 'Marked as Rented')
    } catch (err: any) {
      setError(err.message || 'Error updating rental state')
      setToastType('error')
      setToastMessage(err.message || 'Error updating rental state')
    } finally {
      setTogglingRentalId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Rentals</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all rental listings</p>
      </div>

      {/* Add Rental Button */}
      <div className="mb-8">
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Rental
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading rentals...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && rentals.length === 0 && !error && (
        <Card>
          <CardContent className="text-center py-16">
            <p className="text-gray-500 text-lg font-medium">No rentals found yet</p>
            <p className="text-gray-400 mt-2">Click "Add New Rental" to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Rentals Table */}
      {!loading && rentals.length > 0 && (
        <RentalsTable 
          rentals={rentals}
          onEdit={() => {}}
          onDelete={handleDelete}
          onToggleState={handleToggleState}
          togglingRentalId={togglingRentalId}
          onFormSubmit={handleFormSuccess}
          showAddForm={showAddForm}
          onAddFormClose={() => setShowAddForm(false)}
        />
      )}

      {/* Footer Stats */}
      {!loading && rentals.length > 0 && (
        <Card className="mt-8">
          <CardContent className="flex justify-between items-center py-6">
            <p className="text-gray-700 font-medium text-lg">
              ✓ Showing <span className="font-bold text-gray-900">{rentals.length}</span> active rentals
            </p>
          </CardContent>
        </Card>
      )}

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm">
          <Card className={toastType === 'success' ? 'border-emerald-200' : 'border-red-200'}>
            <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
              <p className={toastType === 'success' ? 'text-emerald-700 text-sm font-medium' : 'text-red-700 text-sm font-medium'}>
                {toastMessage}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setToastMessage('')}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
