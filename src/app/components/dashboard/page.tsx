'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ClientNavbar from './Navbar'
import ManageUsersPage from '../manageusers/page'
import Validation from '../rentvalidation/Validation'
import RentPage from '../rent/page'
import ProfilePage from '../profile/page'
import ManageRentalPage from '../managerent/page'

interface User {
  id: string
  email: string
  role: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')
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

  const isClient = user?.role?.toLowerCase() === 'client'

  // When loading or immediately after fetch, ensure the active tab is correct
  useEffect(() => {
    if (user?.role?.toLowerCase() === 'client' && activeTab === 'overview') {
      setActiveTab('rent')
    }
  }, [user, activeTab])

  return (
    <div className={isClient ? "min-h-screen bg-gray-50 flex flex-col" : "flex h-screen bg-gray-100"}>
      {/* Navigation */}
      {isClient ? (
        <ClientNavbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      ) : (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} loading={loading} />
      )}

      {/* Main Content */}
      <main className={isClient ? "flex-1 overflow-auto bg-gray-50 max-w-11xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" : "flex-1 overflow-auto"}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome to the platform management dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h-2v-2a7 7 0 00-14 0v2H6v-2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Validation</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">45</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Properties</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">856</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m2-2l6-6m0 0l6 6m-6-6v13m-6 0H3m18 0h-2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rent Tab */}
        {activeTab === 'rent' && <RentPage />}

        {/* Profile Tab */}
        {activeTab === 'profile' && <ProfilePage />}

        {/* Users Tab */}
        {activeTab === 'users' && <ManageUsersPage />}

        {/* Validation Tab */}
        {activeTab === 'validation' && <Validation />}

        {/* Rental Tab */}
        {activeTab === 'rental' && <ManageRentalPage />}
      </main>
    </div>
  )
}