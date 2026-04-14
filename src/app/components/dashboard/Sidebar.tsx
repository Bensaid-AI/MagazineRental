'use client'

interface User {
  id: string
  email: string
  role: string
}

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: User | null
  loading: boolean
}

export default function Sidebar({ activeTab, setActiveTab, user, loading }: SidebarProps) {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        // Clear browser session and redirect to login
        window.location.href = '/auth/login'
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect on error
      window.location.href = '/auth/login'
    }
  }

  const getAllMenuItems = () => [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m2-2l6-6m0 0l6 6m-6-6v13m-6 0H3m18 0h-2" />
        </svg>
      ),
      roles: ['client', 'admin', 'manager'],
    },
    {
      id: 'rent',
      label: 'Rent',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      roles: ['client'],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      roles: ['client'],
    },
    {
      id: 'users',
      label: 'Manage Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h-2v-2a7 7 0 00-14 0v2H6v-2z" />
        </svg>
      ),
      roles: ['admin'],
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      roles: ['admin'],
    },
    {
      id: 'rental',
      label: 'Manage Rental',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      roles: ['manager'],
    },
  ]

  const menuItems = getAllMenuItems().filter(
    item => !user?.role || item.roles.includes(user.role.toLowerCase())
  )

  return (
    <aside className="w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">RentalHub</h2>
          <p className="text-gray-400 text-sm"> Panel</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 w-64 border-t border-gray-700 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">
              {loading ? '...' : (user?.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {loading ? 'Loading...' : user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {loading ? 'Please wait' : user?.role || 'user'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
