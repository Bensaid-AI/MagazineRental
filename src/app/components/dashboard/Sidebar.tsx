'use client'

import { LogOut, Home, ShoppingBag, User, Users, CheckCircle, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        window.location.href = '/auth/login'
      } else {
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/auth/login'
    }
  }

  const getAllMenuItems = () => [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: ['client', 'admin', 'manager'],
    },
    {
      id: 'rent',
      label: 'Rent',
      icon: <ShoppingBag className="w-5 h-5" />,
      roles: ['client'],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
      roles: ['client'],
    },
    {
      id: 'users',
      label: 'Manage Users',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: <CheckCircle className="w-5 h-5" />,
      roles: ['admin'],
    },
    {
      id: 'rental',
      label: 'Manage Rental',
      icon: <FileText className="w-5 h-5" />,
      roles: ['manager'],
    },
  ]

  const menuItems = getAllMenuItems().filter(
    item => !user?.role || item.roles.includes(user.role.toLowerCase())
  )

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        {/* Logo */}
        <h2 className="text-2xl font-bold text-gray-900">RentalHub</h2>
        <p className="text-gray-500 text-sm">Control Panel</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeTab === item.id
                ? 'bg-gray-100 text-gray-900 font-medium border-l-4 border-gray-900'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-gray-700">
              {loading ? '...' : (user?.email?.[0] || 'U').toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {loading ? 'Loading...' : user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {loading ? 'Please wait' : user?.role || 'user'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-gray-700 border-gray-200 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
