'use client'
import { useState, useEffect } from 'react'

interface Profile {
  id: string
  email: string
  role: string
  created_at: string
}

export default function ManageUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    try {
      const response = await fetch('/api/profiles')
      const data = await response.json()
      
      if (response.ok) {
        setProfiles(data.profiles || [])
      } else {
        setError(data.error || 'Failed to fetch profiles')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-50 p-8">
      {/* Header with Brown Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">RM</span>
          </div>
          <h1 className="text-4xl font-bold text-amber-900">Manage Users</h1>
        </div>
        <p className="text-amber-700 text-lg">Efficiently manage all user profiles and access</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg shadow-sm">
          <p className="text-red-800 font-medium flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-green-500 animate-spin"></div>
            </div>
            <p className="text-green-700 font-medium mt-4">Loading profiles...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && profiles.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border-2 border-dashed border-green-300">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 text-lg font-medium">No profiles found yet</p>
          <p className="text-gray-400 mt-2">User profiles will appear here once they register</p>
        </div>
      )}

      {/* Table */}
      {!loading && profiles.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">
          {/* Table Header Stats */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 px-8 py-6 flex justify-between items-center">
            <div>
              <p className="text-amber-100 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold text-white mt-1">{profiles.length}</p>
            </div>
            <div className="text-right">
              <p className="text-amber-100 text-sm font-medium">Last Updated</p>
              <p className="text-white font-medium mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-green-200 bg-green-50">
                  <th className="px-8 py-4 text-left">
                    <span className="text-amber-900 font-bold text-sm uppercase tracking-wide">User ID</span>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <span className="text-amber-900 font-bold text-sm uppercase tracking-wide">Email</span>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <span className="text-amber-900 font-bold text-sm uppercase tracking-wide">Role</span>
                  </th>
                  <th className="px-8 py-4 text-left">
                    <span className="text-amber-900 font-bold text-sm uppercase tracking-wide">Joined Date</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile, index) => (
                  <tr 
                    key={profile.id}
                    className={`border-b border-green-100 transition-colors ${
                      index % 2 === 0 ? 'bg-white hover:bg-green-50' : 'bg-green-25 hover:bg-green-50'
                    }`}
                  >
                    <td className="px-8 py-4">
                      <code className="bg-gray-100 text-amber-900 px-3 py-1 rounded font-mono text-sm">
                        {profile.id.substring(0, 12)}...
                      </code>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-gray-800 font-medium">{profile.email}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-bold shadow-sm">
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-gray-600 font-medium">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="bg-green-50 border-t-2 border-green-200 px-8 py-6">
            <div className="flex justify-between items-center">
              <p className="text-green-700 font-medium">
                ✓ Showing <span className="font-bold text-amber-900">{profiles.length}</span> registered users
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
