'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  rental: {
    id: string
    title: string
    price: string | number
    state?: string
  }
  user: {
    email: string
    user_metadata?: {
      full_name?: string
    }
  } | null
  onBookingSuccess: () => void
}

export default function BookingModal({
  isOpen,
  onClose,
  rental,
  user,
  onBookingSuccess,
}: BookingModalProps) {
  const [phone, setPhone] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!isOpen) return null

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }

    if (!startDate || !endDate) {
      setError('Both dates are required')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      setError('End date must be after start date')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rental_id: rental.id,
          phone,
          start_date: startDate,
          end_date: endDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed')
      }

      setSuccess(true)
      successTimeoutRef.current = setTimeout(() => {
        onBookingSuccess()
        handleClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
    setPhone('')
    setStartDate('')
    setEndDate('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleViewBookings = () => {
    onBookingSuccess()
    handleClose()
  }

  const userName = user?.user_metadata?.full_name || 'User'
  const userEmail = user?.email || ''

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Book Rental</CardTitle>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Booking Successful!
              </h3>
              <p className="text-gray-600">
                Your booking for {rental.title} has been created
              </p>
              <Button onClick={handleViewBookings} className="mt-5 w-full">
                View My Bookings
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rental Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {rental.title}
                </h3>
                <p className="text-lg font-bold text-blue-600">
                  ${typeof rental.price === 'string' ? parseFloat(rental.price) : rental.price}/day
                </p>
              </div>

              {/* User Info (Pre-filled) */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Name:</span> {userName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {userEmail}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={loading}
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </form>
          )}
        </CardContent>

        {!success && (
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || ['reserved', 'not_available', 'not available'].includes((rental.state || '').toLowerCase())}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
