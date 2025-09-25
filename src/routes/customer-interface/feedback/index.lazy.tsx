import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ShoppingCart, Bell, Search, Filter, Eye, Edit, Heart, MessageSquare, Star, X, Menu } from 'lucide-react'

export const Route = createLazyFileRoute('/customer-interface/feedback/')({
  component: RouteComponent,
})

interface FeedbackItem {
  id: string
  orderId: string
  itemName: string
  status: 'Completed'
  date: string
  time: string
  feedback: string
}

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

function RouteComponent() {
  const [cartCount] = useState(2)
  const [notificationCount] = useState(3)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'We are now preparing your food (#6). Thank you for trusting Angieren\'s Lutong Bahay.',
      time: '20 sec ago',
      icon: 'heart',
      read: false
    },
    {
      id: '2',
      type: 'feedback',
      title: 'View your recent feedback about our delivery.',
      time: '10 min ago',
      icon: 'message',
      read: false
    },
    {
      id: '3',
      type: 'feedback',
      title: 'View your recent feedback about our staff.',
      time: '10 min ago',
      icon: 'message',
      read: false
    },
    {
      id: '4',
      type: 'feedback',
      title: 'View your recent feedback about our food.',
      time: '10 min ago',
      icon: 'message',
      read: false
    },
    {
      id: '5',
      type: 'feedback',
      title: 'View your recent feedback about our rider.',
      time: '10 min ago',
      icon: 'message',
      read: false
    }
  ])

  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: false },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'FEEDBACK', route: '/customer-interface/feedback', active: true },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
  ]

  const [feedbackItems] = useState<FeedbackItem[]>([
    {
      id: '1',
      orderId: '#05',
      itemName: 'Package 1...',
      status: 'Completed',
      date: 'May 15, 2025',
      time: '12:42:21',
      feedback: 'Delivery and Staff'
    },
    {
      id: '2',
      orderId: '#08',
      itemName: 'Package 1...',
      status: 'Completed',
      date: 'May 15, 2025',
      time: '12:42:21',
      feedback: 'Food and Delivery'
    }
  ])

  const filteredFeedbacks = feedbackItems.filter(item => {
    const matchesSearch = item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const getNotificationIcon = (iconType: string) => {
    switch (iconType) {
      case 'heart':
        return <Heart className="h-5 w-5" fill="currentColor" />
      case 'message':
        return <MessageSquare className="h-5 w-5" />
      case 'star':
        return <Star className="h-5 w-5" fill="currentColor" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const logoStyle: React.CSSProperties = {
    width: '140px', // equivalent to w-35 (35 * 4px = 140px)
    height: '140px', // equivalent to h-35 (35 * 4px = 140px)
    backgroundImage: "url('/angierens-logo.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'absolute' as const,
    top: '8px', // equivalent to top-2
    left: '16px'
  };

  const customStyles = `
    body {
      min-width: 320px;
    }
    
    @media (max-width: 410px) {
      .dynamic-logo {
        width: calc(max(80px, 140px - (410px - 100vw))) !important;
        height: calc(max(80px, 140px - (410px - 100vw))) !important;
      }
    }
    
    @media (min-width: 411px) and (max-width: 1023px) {
      .dynamic-logo {
        width: 120px !important;
        height: 120px !important;
      }
    }
    
    @media (min-width: 1024px) {
      .dynamic-logo {
        width: 140px !important;
        height: 140px !important;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

      {/* Customer Header */}
      <header className="w-auto mx-2 sm:mx-4 md:mx-10 my-3 border-b-8 border-amber-800">
        <div className="flex items-center justify-between p-2 sm:p-4 mb-5 relative">
          {/* Logo */}
          <div
            className="flex-shrink-0 bg-cover bg-center dynamic-logo"
            style={logoStyle}
          />

          {/* Main Content Container */}
          <div className="flex items-center justify-end w-full pl-[150px] sm:pl-[160px] lg:pl-[180px] gap-2 sm:gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex xl:gap-10 bg-[#964B00] py-2 px-6 xl:px-10 rounded-lg">
              {navigationItems.map(item => (
                <Link
                  key={item.name}
                  to={item.route}
                  className={`px-3 xl:px-4 py-2 rounded-xl text-base xl:text-lg font-semibold transition-colors whitespace-nowrap ${item.active
                    ? 'bg-yellow-400 text-[#964B00]'
                    : 'text-yellow-400 hover:bg-[#7a3d00]'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Hamburger Menu Button - Show on tablet and mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#964B00] hover:bg-amber-100 rounded-lg bg-yellow-400"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Right Side Controls */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 bg-[#964B00] py-2 px-2 sm:px-4 md:px-6 rounded-lg">
              {/* Cart Icon */}
              <Link
                to="/customer-interface/cart"
                className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
                >
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>

                    <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                            }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                              {getNotificationIcon(notification.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                                {notification.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 sm:p-4 border-t border-gray-200">
                      <button
                        onClick={markAllAsRead}
                        className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Bell className="h-4 w-4" />
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                <span className="hidden sm:inline">LOG OUT</span>
                <span className="sm:hidden">OUT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile/Tablet Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-[#964B00] transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
          <span className="text-yellow-400 text-xl font-bold">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-yellow-400 p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {navigationItems.map(item => (
            <Link
              key={item.name}
              to={item.route}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-xl text-lg font-semibold transition-colors ${item.active
                ? 'bg-yellow-400 text-[#964B00]'
                : 'text-yellow-400 hover:bg-[#7a3d00]'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay to close notification dropdown when clicking outside */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}

      {/* Main */}
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">My Feedback</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">This is where you can write your feedback</p>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <input
              type="text"
              placeholder="Search order by ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-white flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filter
          </button>
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="h-[600px] flex flex-col">
              {/* Table Header */}
              <div className="bg-[#B8860B] text-white flex-shrink-0">
                <div className="grid grid-cols-7 gap-4 p-4 font-semibold text-center text-sm">
                  <div>ORDER ID</div>
                  <div>ITEM NAME</div>
                  <div>STATUS</div>
                  <div>DATE</div>
                  <div>TIME</div>
                  <div>FEEDBACK</div>
                  <div>ACTION BUTTON</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                {filteredFeedbacks.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-lg">
                    No feedback found
                  </div>
                ) : (
                  filteredFeedbacks.map((item, index) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-7 gap-4 p-4 text-center items-center text-sm ${index % 2 === 0 ? 'bg-orange-50' : 'bg-white'}`}
                    >
                      <div className="font-medium text-gray-800">{item.orderId}</div>
                      <div className="text-gray-700 truncate">{item.itemName}</div>
                      <div className="text-gray-700">{item.status}</div>
                      <div className="text-gray-700">{item.date}</div>
                      <div className="text-gray-700">{item.time}</div>
                      <div className="text-gray-700 truncate">{item.feedback}</div>
                      <div className="flex gap-2 justify-center">
                        <Link
                          to="/customer-interface/feedback/$feedbackId"
                          params={{ feedbackId: item.id }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors text-xs"
                        >
                          <Eye className="h-3 w-3" />
                          VIEW
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden">
            <div className="max-h-[600px] overflow-y-auto p-4 space-y-3">
              {filteredFeedbacks.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-base">
                  No feedback found
                </div>
              ) : (
                filteredFeedbacks.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${index % 2 === 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}
                  >
                    {/* Mobile Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="font-semibold text-gray-800 text-base mb-1 sm:mb-0">
                        Order #{item.orderId}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/customer-interface/feedback/$feedbackId"
                          params={{ feedbackId: item.id }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded font-medium flex items-center gap-1 transition-colors text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          VIEW
                        </Link>
                        <Link
                          to="/customer-interface/feedback/$feedbackId"
                          params={{ feedbackId: item.id }}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded font-medium flex items-center gap-1 transition-colors text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          EDIT
                        </Link>
                      </div>
                    </div>

                    {/* Mobile Card Content */}
                    <div className="space-y-2 text-sm">
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <div className="sm:flex-1">
                          <span className="font-medium text-gray-600">Item:</span>
                          <span className="ml-2 text-gray-700">{item.itemName}</span>
                        </div>
                        <div className="sm:flex-1">
                          <span className="font-medium text-gray-600">Status:</span>
                          <span className="ml-2 text-gray-700">{item.status}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <div className="sm:flex-1">
                          <span className="font-medium text-gray-600">Date:</span>
                          <span className="ml-2 text-gray-700">{item.date}</span>
                        </div>
                        <div className="sm:flex-1">
                          <span className="font-medium text-gray-600">Time:</span>
                          <span className="ml-2 text-gray-700">{item.time}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600">Feedback:</span>
                        <div className="mt-1 text-gray-700 bg-gray-50 p-2 rounded text-sm">
                          {item.feedback}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">Filter Feedback</h2>

            <div className="mb-4">
              <label className="block font-medium mb-1">Select category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">All categories</option>
                <option value="food">Food Quality</option>
                <option value="delivery">Delivery</option>
                <option value="staff">Staff Service</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-1">Select date:</label>
              <input
                type="date"
                value={selectedDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-2 rounded border border-gray-300"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}