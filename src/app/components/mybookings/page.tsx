'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Calendar, DollarSign, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Booking {
  id: string
  rental_id: string
  phone: string
  start_date: string
  end_date: string
  status: string
  created_at: string
  rentals?: {
    id: string
    title: string
    price: string | number
    image_url?: string
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/bookings')
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to view your bookings')
        }
        throw new Error('Failed to fetch bookings')
      }
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
    }
    return variants[status] || 'outline'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your rental bookings</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 flex items-center border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No bookings yet</p>
            <p className="text-gray-400">Start browsing rentals and make your first booking!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Rental Image & Info */}
                  <div className="flex gap-4 flex-1">
                    {booking.rentals?.image_url && (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={booking.rentals.image_url}
                          alt={booking.rentals?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {booking.rentals?.title || 'Rental Item'}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>
                            ${typeof booking.rentals?.price === 'string' ? parseFloat(booking.rentals.price) : booking.rentals?.price}/day × {calculateDays(booking.start_date, booking.end_date)} days
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{booking.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Details */}
                  <div className="flex flex-col items-end gap-4">
                    <Badge variant={getStatusBadge(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <div className="text-right text-sm text-gray-500">
                      <p>Booked on {formatDate(booking.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
