import { LogOut, Home, User, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserData {
  id: string
  email: string
  role: string
}

interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  user: UserData | null
}

export default function ClientNavbar({ activeTab, setActiveTab, user }: NavbarProps) {
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

  const menuItems = [
    {
      id: 'rent',
      label: 'Browse Rentals',
      icon: <Home className="w-4 h-4 mr-2 " />,
    },
    {
      id: 'mybookings',
      label: 'My Bookings',
      icon: <CalendarDays className="w-4 h-4 mr-2" />,
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4 mr-2" />,
    },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-11xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-gray-900 mr-8">RentalHub</h2>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(item.id)}
                  className="flex items-center text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* User & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700">
                  {(user?.email?.[0] || 'U').toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.email || 'User'}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden flex px-4 pb-3 space-x-2 overflow-x-auto">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(item.id)}
            className="flex-shrink-0"
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  )
}
