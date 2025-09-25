import { createLazyFileRoute, Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ShoppingCart, Bell, X, Menu, Edit, Heart, MessageSquare, Star } from 'lucide-react'


export const Route = createLazyFileRoute(
  '/customer-interface/feedback/$feedbackId',
)({
  component: RouteComponent,
})

interface FeedbackData {
  orderId: string
  deliveryRating: number
  deliveryFeedback: string
  foodRating: number
  foodFeedback: string
  staffRating: number
  staffFeedback: string
  riderRating: number
  riderFeedback: string
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
  const { feedbackId } = useParams({ from: '/customer-interface/feedback/$feedbackId' })
  const [activeTab, setActiveTab] = useState('delivery')
  const [isEditing, setIsEditing] = useState(false)
  const [sendAnonymously, setSendAnonymously] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
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

  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: false },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'FEEDBACK', route: '/customer-interface/feedback', active: true },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
  ]

  // Sample data - in real app, this would come from API based on feedbackId
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    orderId: feedbackId,
    deliveryRating: 5,
    deliveryFeedback: 'The delivery is very fast, at nakikita ko kung nasaan na yung order ko :) :) 5 star ka sakin!',
    foodRating: 4,
    foodFeedback: 'The food was delicious and well-prepared. Great packaging too!',
    staffRating: 5,
    staffFeedback: 'Very friendly and accommodating staff. Excellent customer service!',
    riderRating: 5,
    riderFeedback: 'Professional rider, arrived on time and handled the order carefully.'
  })

  const tabs = [
    { id: 'delivery', label: 'Delivery Feedback', rating: feedbackData.deliveryRating, feedback: feedbackData.deliveryFeedback },
    { id: 'food', label: 'Food Feedback', rating: feedbackData.foodRating, feedback: feedbackData.foodFeedback },
    { id: 'staff', label: 'Staff Feedback', rating: feedbackData.staffRating, feedback: feedbackData.staffFeedback },
    { id: 'rider', label: 'Rider Feedback', rating: feedbackData.riderRating, feedback: feedbackData.riderFeedback }
  ]

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0]

  const handleStarClick = (rating: number) => {
    if (!isEditing) return

    setFeedbackData(prev => ({
      ...prev,
      [`${activeTab}Rating`]: rating
    }))
  }

  const handleFeedbackChange = (value: string) => {
    if (!isEditing) return

    setFeedbackData(prev => ({
      ...prev,
      [`${activeTab}Feedback`]: value
    }))
  }

  const handleSubmit = () => {
    // Handle feedback submission
    console.log('Submitting feedback:', feedbackData)
    setIsEditing(false)
    // In real app, make API call here
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-8 h-8 cursor-pointer transition-colors ${index < rating
          ? 'text-yellow-400 fill-yellow-400'
          : 'text-gray-300'
          } ${isEditing ? 'hover:text-yellow-300' : ''}`}
        onClick={() => handleStarClick(index + 1)}
      />
    ))
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

      <div className="max-w-4xl mx-auto my-6 sm:my-10 px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link
            to="/customer-interface/feedback"
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
            ORDER ID: {feedbackData.orderId}
          </h1>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-full font-semibold text-white transition-colors text-sm sm:text-base ${activeTab === tab.id
                ? 'bg-[#B8860B]'
                : 'bg-[#8B4513] hover:bg-[#A0522D]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border-2 sm:border-4 border-yellow-300">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              How was your {currentTab.label.split(' ')[0]}?
            </h2>

            {/* Star Rating */}
            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 justify-center sm:justify-start">
              {renderStars(currentTab.rating)}
            </div>

            {/* Feedback Text Area */}
            <div className="mb-6 sm:mb-8">
              <textarea
                value={currentTab.feedback}
                onChange={(e) => handleFeedbackChange(e.target.value)}
                placeholder={`Share your ${activeTab} experience...`}
                disabled={!isEditing}
                className={`w-full h-40 sm:h-48 lg:h-64 p-3 sm:p-4 border-2 border-gray-300 rounded-lg resize-none text-gray-700 text-base sm:text-lg leading-relaxed ${isEditing
                  ? 'bg-white focus:border-yellow-400 focus:outline-none'
                  : 'bg-gray-50 cursor-not-allowed'
                  }`}
              />
            </div>

            {/* Options */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={sendAnonymously}
                  onChange={(e) => setSendAnonymously(e.target.checked)}
                  disabled={!isEditing}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 rounded focus:ring-yellow-400 disabled:opacity-50"
                />
                <label htmlFor="anonymous" className="text-gray-700 font-medium text-sm sm:text-base">
                  Send Anonymously
                </label>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
              >
                <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isEditing}
              className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors ${isEditing
                ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isEditing ? 'Submit Feedback' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="contact" className="py-8 bottom-0 w-full z-10" style={{ backgroundColor: "#F9ECD9" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800">Angieren's Lutong Bahay</h3>
              <p className="text-gray-600 text-sm">
                Authentic Filipino home-cooked meals delivered to your doorstep.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/customer-interface/home" className="text-gray-600 hover:text-gray-800">Home</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Menu</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">About Us</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">FAQ</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Help Center</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Terms & Conditions</Link></li>
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800">Connect With Us</h4>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Email: info@angierens.com</p>
                <p className="text-gray-600">Phone: +63 912 345 6789</p>
                <div className="flex space-x-4 mt-4">
                  <a href="#" className="text-gray-600 hover:text-gray-800">Facebook</a>
                  <a href="#" className="text-gray-600 hover:text-gray-800">Instagram</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-400 mt-8 pt-4 text-center text-sm text-gray-600">
            <p>&copy; 2024 Angieren's Lutong Bahay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}