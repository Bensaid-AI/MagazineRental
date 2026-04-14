'use client'
import { useState } from 'react'
import Sidebar from '../dashboard/Sidebar'

export default function ManageRentalPage() {
  const [activeTab, setActiveTab] = useState('rental')

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
            <p className="text-gray-600 mt-2">Manage all rental operations</p>
          </div>
          {/* Add your rental management content here */}
        </div>
      </main>
    </div>
  )
}
