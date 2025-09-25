import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Edit, Save, Menu, Bell, Clock, X,
  Calendar,
  Settings,
  User,
  DollarSign,
  Package,
  Truck,
  LogOut,
  Star
} from 'lucide-react'

export const Route = createLazyFileRoute('/staff/my-info')({
  component: RouteComponent,
})

function RouteComponent() {
  // Only editable fields are in state
  const [editableData, setEditableData] = useState({
    phoneNumber: '+63 912 212 1209',
    email: 'jennyfrenzzy@gmail.com',
    newPassword: '',
    retypePassword: ''
  })

  // Track which fields are currently being edited
  const [editingFields, setEditingFields] = useState({
    phoneNumber: false,
    email: false,
    password: false
  })

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [pendingEdit, setPendingEdit] = useState('')

  // Store original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    phoneNumber: '+63 912 212 1209',
    email: 'jennyfrenzzy@gmail.com'
  })

  // Static user data (non-editable)
  const staticData = {
    firstName: 'Jenny',
    middleName: '',
    lastName: 'Frenzzy'
  }

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startEditing = (field: string) => {
    // Show password verification modal for sensitive fields
    if (field === 'phoneNumber' || field === 'email' || field === 'password') {
      setPendingEdit(field)
      setShowPasswordModal(true)
    } else {
      setEditingFields(prev => ({
        ...prev,
        [field]: true
      }))
    }
  }

  const cancelEditing = (field: string) => {
    setEditingFields(prev => ({
      ...prev,
      [field]: false
    }))

    // Restore original values
    if (field === 'phoneNumber' || field === 'email') {
      setEditableData(prev => ({
        ...prev,
        [field]: originalValues[field as keyof typeof originalValues]
      }))
    } else if (field === 'password') {
      setEditableData(prev => ({
        ...prev,
        newPassword: '',
        retypePassword: ''
      }))
    }
  }

  const verifyPassword = () => {
    // Simulate password verification (replace with actual API call)
    if (currentPassword.trim() === '') {
      alert('Please enter your current password!')
      return
    }

    // Mock password verification - in reality, verify against backend
    if (currentPassword !== 'password123') {
      alert('Incorrect password!')
      return
    }

    // Password verified, proceed based on the field being edited
    if (pendingEdit === 'phoneNumber') {
      // For phone number, show OTP modal
      setShowPasswordModal(false)
      setShowOtpModal(true)
    } else {
      // For email or password change, directly allow editing
      setShowPasswordModal(false)
      setEditingFields(prev => ({
        ...prev,
        [pendingEdit]: true
      }))
    }

    setCurrentPassword('')
  }

  const verifyOtp = () => {
    if (otpCode.trim() === '') {
      alert('Please enter the OTP code!')
      return
    }

    // Mock OTP verification - in reality, verify against backend
    if (otpCode !== '123456') {
      alert('Invalid OTP code!')
      return
    }

    // OTP verified, allow phone number editing
    setShowOtpModal(false)
    setEditingFields(prev => ({
      ...prev,
      phoneNumber: true
    }))
    setOtpCode('')
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setPendingEdit('')
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setOtpCode('')
    setPendingEdit('')
  }

  const saveField = (field: string) => {
    if (field === 'phoneNumber' || field === 'email') {
      // Basic validation
      if (field === 'email' && !editableData.email.includes('@')) {
        alert('Please enter a valid email address!')
        return
      }

      if (field === 'phoneNumber' && editableData.phoneNumber.trim().length === 0) {
        alert('Please enter a phone number!')
        return
      }

      // Update original value
      setOriginalValues(prev => ({
        ...prev,
        [field]: editableData[field as keyof typeof editableData]
      }))

      setEditingFields(prev => ({
        ...prev,
        [field]: false
      }))

      alert(`${field === 'phoneNumber' ? 'Phone number' : 'Email address'} updated successfully!`)
    }
  }

  const handleChangePassword = () => {
    if (editableData.newPassword !== editableData.retypePassword) {
      alert('Passwords do not match!')
      return
    }
    if (editableData.newPassword.length === 0) {
      alert('Please enter a new password!')
      return
    }
    if (editableData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!')
      return
    }

    // Handle password change logic here
    console.log('Password changed successfully')
    setEditableData(prev => ({
      ...prev,
      newPassword: '',
      retypePassword: ''
    }))
    setEditingFields(prev => ({
      ...prev,
      password: false
    }))
    alert('Password changed successfully!')
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Sample notifications
  const notifications = [
    {
      id: 1,
      title: 'New delivery order #14 assigned to Penny Lise',
      time: '2 minutes ago',
      icon: 'truck',
    },
    {
      id: 2,
      title: 'Order #06 delivery completed successfully',
      time: '15 minutes ago',
      icon: 'check',
    },
    {
      id: 3,
      title: 'Rider Marky Nayz is running late for order #08',
      time: '30 minutes ago',
      icon: 'clock',
    },
  ]

  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationCount = notifications.length

  const getNotificationIcon = (icon: string) => {
    switch (icon) {
      case 'truck':
        return <Truck className="h-5 w-5" />
      case 'check':
        return <div className="text-green-600">✓</div>
      case 'clock':
        return <Clock className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const markAllAsRead = () => {
    setIsNotificationOpen(false)
  }

  const navigationItems = [
    {
      name: 'Orders',
      route: '/staff',
      icon: <Package className="h-5 w-5" />,
      active: location.pathname === '/staff'
    },
    {
      name: 'Deliveries',
      route: '/staff/deliveries',
      icon: <Truck className="h-5 w-5" />,
      active: location.pathname === '/staff/deliveries'
    },
    {
      name: 'Schedule',
      route: '/staff/schedule',
      icon: <Calendar className="h-5 w-5" />,
      active: location.pathname === '/staff/schedule'
    },
    {
      name: 'Menu',
      route: '/staff/menu',
      icon: <Settings className="h-5 w-5" />,
      active: location.pathname === '/staff/menu'
    },
    {
      name: 'Reviews',
      route: '/staff/reviews',
      icon: <Star className="h-5 w-5" />,
      active: location.pathname === '/staff/reviews'
    },
    {
      name: 'Account',
      route: '/staff/my-info',
      icon: <User className="h-5 w-5" />,
      active: location.pathname === '/staff/my-info'
    },
    {
      name: 'Refund',
      route: '/staff/refund',
      icon: <DollarSign className="h-5 w-5" />,
      active: location.pathname === '/staff/refund'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Your Password</h2>
            <p className="text-gray-600 mb-4">
              Please enter your current password to continue editing this sensitive information.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your current password"
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closePasswordModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyPassword}
                className="px-4 py-2 bg-[#964B00] text-yellow-400 rounded-md hover:bg-[#7a3d00] transition-colors"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter OTP Code</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification code to your current phone number. Please enter it below to continue.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">OTP Code</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
              />
            </div>
            <div className="text-center mb-4">
              <button className="text-[#964B00] text-sm hover:underline">
                Resend OTP
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeOtpModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                className="px-4 py-2 bg-[#964B00] text-yellow-400 rounded-md hover:bg-[#7a3d00] transition-colors"
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - following the uploaded image design */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-yellow-400 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="bg-amber-800 text-white px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <img src="/api/placeholder/40/40" alt="Logo" className="w-8 h-8 rounded-full" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Angieren's</h2>
                <p className="text-lg font-bold">Lutong Bahay</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-amber-700 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b-2 border-amber-600">
          <h3 className="font-bold text-lg text-amber-900">Jenny Frenzzy</h3>
          <p className="text-sm text-amber-800">+63 912 212 1209</p>
          <p className="text-sm text-amber-800">jennyfrenzzy@gmail.com</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.route}
              className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors w-full
                      ${item.active
                  ? 'bg-amber-700 text-white shadow-lg'
                  : 'text-amber-900 hover:bg-amber-300'
                }
                    `}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-6">
          <button className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-amber-800 text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-white hover:bg-amber-700 rounded-lg"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-xl lg:text-3xl font-bold">MY INFO</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-6">
              <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Date: {getCurrentDate()}</span>
              <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Time: {getCurrentTime()}</span>
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                  >
                    <Bell className="h-6 w-6" />
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification, index) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                                {getNotificationIcon(notification.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 leading-relaxed">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-gray-200">
                        <button
                          onClick={markAllAsRead}
                          className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <Bell className="h-4 w-4" />
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
            <div className="space-y-6">
              {/* First Name - Read Only */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700 w-48 text-right">First Name:</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={staticData.firstName}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Middle Name - Read Only */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700 w-48 text-right">Middle Name:</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={staticData.middleName}
                    placeholder=""
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Last Name - Read Only */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700 w-48 text-right">Last Name:</label>
                <div className="flex-1">
                  <input
                    type="text"
                    value={staticData.lastName}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>

              {/* Phone Number - Editable */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700 w-48 text-right">Phone Number:</label>
                <div className="flex-1 flex items-center gap-2">
                  {editingFields.phoneNumber ? (
                    <>
                      <input
                        type="text"
                        value={editableData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => saveField('phoneNumber')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => cancelEditing('phoneNumber')}
                        className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={editableData.phoneNumber}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        disabled
                      />
                      <button
                        onClick={() => startEditing('phoneNumber')}
                        className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email Address - Editable */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700 w-48 text-right">Email Address:</label>
                <div className="flex-1 flex items-center gap-2">
                  {editingFields.email ? (
                    <>
                      <input
                        type="email"
                        value={editableData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => saveField('email')}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => cancelEditing('email')}
                        className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={editableData.email}
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        disabled
                      />
                      <button
                        onClick={() => startEditing('email')}
                        className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Password - Editable */}
              <div className="flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700 w-48 text-right">Password:</label>
                <div className="flex-1 flex items-center gap-2">
                  {editingFields.password ? (
                    <div className="flex-1 space-y-3">
                      <input
                        type="password"
                        value={editableData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="New password"
                      />
                      <input
                        type="password"
                        value={editableData.retypePassword}
                        onChange={(e) => handleInputChange('retypePassword', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Retype password"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleChangePassword}
                          className="px-4 py-2 bg-[#964B00] hover:bg-[#7a3d00] text-yellow-400 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save Password
                        </button>
                        <button
                          onClick={() => cancelEditing('password')}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <input
                        type="password"
                        value="************"
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        disabled
                      />
                      <button
                        onClick={() => startEditing('password')}
                        className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}