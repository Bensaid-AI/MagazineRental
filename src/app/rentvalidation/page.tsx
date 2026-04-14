'use client'
import { useState } from 'react'
import Sidebar from '../dashboard/Sidebar'
import Validation from './Validation'

export default function ValidationPage() {
  const [activeTab, setActiveTab] = useState('validation')

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Validation />
        </div>
      </main>
    </div>
  )
}
