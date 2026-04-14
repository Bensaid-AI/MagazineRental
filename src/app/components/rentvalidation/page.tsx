'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../dashboard/Sidebar'
import Validation from './Validation'

interface User {
  id: string
  email: string
  role: string
}

export default function ValidationPage() {
  const [activeTab, setActiveTab] = useState('validation')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} loading={loading} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Validation />
        </div>
      </main>
    </div>
  )
}
