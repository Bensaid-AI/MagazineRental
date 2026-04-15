'use client'

interface RentalCardProps {
  rental: {
    id: string
    title: string
    description: string
    price: string | number
    published_by: string
    image_url: string
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function RentalCard({ rental, onEdit, onDelete }: RentalCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all">
      {/* Image Section */}
      <div className="w-full h-48 bg-gradient-to-br from-amber-200 to-green-200 flex items-center justify-center overflow-hidden">
        <img 
          src={rental.image_url || '../../../../public/images/image1.webp'} 
          alt={rental.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{rental.title}</h2>
        <p className="text-amber-100 text-sm mt-1">ID: {rental.id}</p>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <p className="text-gray-700 text-sm mb-4">{rental.description}</p>

        {/* Details Grid */}
        <div className="space-y-3 mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <div>
            <span className="text-amber-900 font-bold text-sm">Price</span>
            <p className="text-green-700 font-bold text-lg">${rental.price}</p>
          </div>
          <div>
            <span className="text-amber-900 font-bold text-sm">publisher</span>
            <p className="text-gray-800 font-medium">{rental.published_by}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => onEdit(rental.id)}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            ✎ Modify
          </button>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this rental?')) {
                onDelete(rental.id)
              }
            }}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  )
}
