'use client'

import { MapPin, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface RentalCardProps {
  rental: {
    id: string
    title: string
    description: string
    price: string | number
    image_url?: string
    state?: string
    profiles?: {
      fullname: string
      email: string
    }
  }
  onRentClick: () => void
  isDisabled?: boolean
}

export default function RentalCard({
  rental,
  onRentClick,
  isDisabled,
}: RentalCardProps) {
  const isReserved = rental.state === 'reserved'
  const price = typeof rental.price === 'string' ? parseFloat(rental.price) : rental.price

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {rental.image_url && (
        <div className="w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={rental.image_url}
            alt={rental.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}

      <CardContent className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {rental.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {rental.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          <span className="text-gray-500 text-sm">/day</span>
        </div>

        {/* Owner Info */}
        {rental.profiles && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Owner:</span> {rental.profiles.fullname}
            </p>
          </div>
        )}

        {/* Status */}
        {isReserved && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-center mb-3">
            <p className="text-xs font-semibold text-yellow-800">Reserved</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={onRentClick}
          disabled={isReserved || isDisabled}
          className="w-full"
        >
          {isReserved ? 'Already Reserved' : 'Rent Now'}
        </Button>
      </CardFooter>
    </Card>
  )
}
