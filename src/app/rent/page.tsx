'use client'
import { useState } from 'react'
import Sidebar from '../dashboard/Sidebar'

export default function RentPage() {
  const [activeTab, setActiveTab] = useState('rent')

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rent Management</h1>
            <p className="text-gray-600 mt-2">Manage your rental listings</p>
          </div>
          {/* Add your rent content here */}
        </div>
      </main>
    </div>
  )
}
