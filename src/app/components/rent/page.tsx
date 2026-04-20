'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Info, User, Mail, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Rental {
  id: string;
  title: string;
  description: string;
  price: string | number;
  published_by: string;
  image_url: string;
  profiles?: {
    fullname: string;
    email: string;
  };
}

export default function RentPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/rents')
      if (!res.ok) throw new Error('Failed to fetch rentals')
      const data = await res.json()
      setRentals(data.rentals || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredRentals = rentals.filter(rental => 
    rental.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rental.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 max-w-11xl mx-auto min-h-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Rentals</h1>
          <p className="text-gray-600 mt-2">Browse and find your perfect rental</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search rentals by title or description..." 
            className="pl-10 bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No rentals found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRentals.map((rental) => (
            <Card key={rental.id} className="overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden group">
                {rental.image_url && rental.image_url !== 'undefined' ? (
                  <img 
                    src={rental.image_url} 
                    alt={rental.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                  ${rental.price}
                </div>
              </div>
              
              
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                  {rental.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 pt-0 flex-grow flex flex-col gap-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {rental.description}
                </p>
                
                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">
                      {rental.profiles?.fullname || 'Unknown Publisher'}
                    </span>
                  </div>
                  {rental.profiles?.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{rental.profiles.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-4 border-t border-gray-50 bg-gray-50/50 flex gap-2">
                <Button variant="outline" className="flex-1 bg-white border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  Details
                </Button>
                <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white transition-colors">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
