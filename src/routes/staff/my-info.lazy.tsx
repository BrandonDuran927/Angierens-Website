import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'


export const Route = createLazyFileRoute('/staff/my-info')({
  component: RouteComponent,
})

interface UserData {
  user_uid: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  phone_number: string
}

function RouteComponent() {
  const { user, signOut } = useUser()

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Only editable fields are in state
  const [editableData, setEditableData] = useState({
    phoneNumber: '',
    email: '',
    newPassword: '',
    retypePassword: ''
  })

  // Track which fields are currently being edited
  const [editingFields, setEditingFields] = useState({
    phoneNumber: false,
    password: false
  })

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [pendingEdit, setPendingEdit] = useState('')
  const [sentCode, setSentCode] = useState('')
  const navigate = useNavigate()

  // Store original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    phoneNumber: '',
    email: ''
  })

  // Static user data (non-editable)
  const [staticData, setStaticData] = useState({
    firstName: '',
    middleName: '',
    lastName: ''
  })

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      setLoading(true)

      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Error getting authenticated user:', authError)
        alert('Please log in to view your information')
        navigate({ to: '/login' })
        return
      }

      setCurrentUserId(user.id)

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_uid, first_name, middle_name, last_name, email, phone_number')
        .eq('user_uid', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        alert('Failed to load user information')
        return
      }

      if (userData) {
        // Set static (non-editable) data
        setStaticData({
          firstName: userData.first_name || '',
          middleName: userData.middle_name || '',
          lastName: userData.last_name || ''
        })

        // Set editable data
        setEditableData(prev => ({
          ...prev,
          phoneNumber: userData.phone_number || '',
          email: userData.email || ''
        }))

        // Set original values
        setOriginalValues({
          phoneNumber: userData.phone_number || '',
          email: userData.email || ''
        })
      }
    } catch (error) {
      console.error('Error in fetchCurrentUser:', error)
      alert('An error occurred while loading your information')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startEditing = (field: string) => {
    // Show password verification modal for sensitive fields
    if (field === 'phoneNumber' || field === 'password') {
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
    if (field === 'phoneNumber') {
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

  const verifyPassword = async () => {
    if (currentPassword.trim() === '') {
      alert('Please enter your current password!')
      return
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('Session expired. Please log in again.')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: originalValues.email,
        password: currentPassword
      })

      if (error) {
        alert('Incorrect password!')
        return
      }

      if (pendingEdit === 'phoneNumber') {
        setShowPasswordModal(false)
        setShowOtpModal(true)

        handleSubmit(new Event('submit') as unknown as React.FormEvent)
      } else {
        setShowPasswordModal(false)
        setEditingFields(prev => ({
          ...prev,
          [pendingEdit]: true
        }))
      }

      setCurrentPassword('')
    } catch (error) {
      console.error('Error verifying password:', error)
      alert('An error occurred while verifying your password')
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setCurrentPassword('')
    setPendingEdit('')
  }

  const saveField = async (field: string) => {
    if (!currentUserId) {
      alert('User not authenticated')
      return
    }

    if (field === 'phoneNumber') {  // Only phoneNumber now
      // Basic validation
      if (editableData.phoneNumber.trim().length === 0) {
        alert('Please enter a phone number!')
        return
      }

      try {
        setLoading(true)

        // Update in users table
        const { error: updateError } = await supabase
          .from('users')
          .update({ phone_number: editableData.phoneNumber })
          .eq('user_uid', currentUserId)

        if (updateError) {
          console.error('Error updating user data:', updateError)
          alert('Failed to update. Please try again.')
          return
        }

        // Update original value
        setOriginalValues(prev => ({
          ...prev,
          phoneNumber: editableData.phoneNumber
        }))

        setEditingFields(prev => ({
          ...prev,
          phoneNumber: false
        }))

        alert('Phone number updated successfully!')
      } catch (error) {
        console.error('Error saving field:', error)
        alert('An error occurred while saving your changes')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChangePassword = async () => {
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

    try {
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password: editableData.newPassword
      })

      if (error) {
        console.error('Error updating password:', error)
        alert('Failed to update password. Please try again.')
        return
      }

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
    } catch (error) {
      console.error('Error changing password:', error)
      alert('An error occurred while changing your password')
    } finally {
      setLoading(false)
    }
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

  const formatPhoneNumber = (number: string): string => {
    const cleaned = number.replace(/\s+/g, '')

    if (cleaned.startsWith('0')) {
      return '+63' + cleaned.substring(1)
    }

    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formattedNumber = formatPhoneNumber(editableData.phoneNumber)

      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phoneNumber: formattedNumber }
      })

      if (error) throw error
      console.log("Data sent:", data)
      setSentCode(data)

      setShowOtpModal(true)
    } catch (error) {
      console.error('Error sending OTP:', error)
    }
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setSentCode('')
    setOtpCode('')
  }

  const verifyOtp = async () => {
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
    // try {
    //   const formattedNumber = formatPhoneNumber(editableData.phoneNumber)

    //   const { data, error } = await supabase.functions.invoke('verify-otp', {
    //     body: { phoneNumber: formattedNumber, otpCode },
    //   })

    //   if (error) throw error

    //   if (data.status === 'approved') {
    //     alert('OTP verified successfully!')
    //     closeOtpModal()

    //     // Save the phone number after OTP verification
    //     await saveField('phoneNumber')
    //   } else {
    //     alert('Invalid or expired OTP.')
    //   }
    // } catch (error) {
    //   console.error('Error verifying OTP:', error)
    //   alert('Failed to verify OTP. Please try again.')
    // }
  }

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['staff']}>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">
        {/* Password Verification Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Verify Your Password
              </h2>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Please enter your current password to continue editing this sensitive information.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter your current password"
                  onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                />
              </div>
              <div className="flex gap-2 sm:gap-3 justify-end">
                <button
                  onClick={closePasswordModal}
                  className="px-3 sm:px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPassword}
                  className="px-3 sm:px-4 py-2 bg-[#964B00] text-yellow-400 rounded-md hover:bg-[#7a3d00] text-sm sm:text-base"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Enter OTP Code
              </h2>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                We've sent a verification code to your current phone number. Please enter it below to continue.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-lg tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                />
              </div>
              <div className="text-center mb-4">
                <button
                  onClick={handleSubmit}
                  className="text-[#964B00] text-sm hover:underline"
                >
                  Resend OTP
                </button>
              </div>
              <div className="flex gap-2 sm:gap-3 justify-end">
                <button
                  onClick={closeOtpModal}
                  className="px-3 sm:px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyOtp}
                  className="px-3 sm:px-4 py-2 bg-[#964B00] text-yellow-400 rounded-md hover:bg-[#7a3d00] text-sm sm:text-base"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
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
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <img src="/public/angierens-logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
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
            <h3 className="font-bold text-lg text-amber-900">
              {staticData.firstName} {staticData.lastName}
            </h3>
            <p className="text-sm text-amber-800">{editableData.phoneNumber}</p>
            <p className="text-sm text-amber-800">{editableData.email}</p>
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
                    : 'text-amber-900 hover:bg-amber-300'}
            `}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="px-4 pb-6">
            <button
              className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors cursor-pointer"
              onClick={handleLogout}
            >
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

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="bg-amber-800 text-white p-3 sm:p-4 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-white hover:bg-amber-700 rounded-lg"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold">MY INFO</h1>
              </div>
              <div className="flex items-center gap-2 lg:gap-6">
                <span className="text-amber-200 text-xs sm:text-sm lg:text-lg font-semibold hidden sm:inline">
                  Date: {getCurrentDate()}
                </span>
                <span className="text-amber-200 text-xs sm:text-sm lg:text-lg font-semibold hidden sm:inline">
                  Time: {getCurrentTime()}
                </span>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                    >
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            Notifications
                          </h3>
                        </div>
                        <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                          {notifications.map((notification, index) => (
                            <div
                              key={notification.id}
                              className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
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
                        <div className="p-3 sm:p-4 border-t border-gray-200">
                          <button
                            onClick={markAllAsRead}
                            className="w-full bg-yellow-400 text-black py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
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
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-2xl">
              <div className="space-y-6">
                {/* First Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm sm:text-base lg:text-lg font-medium text-gray-700 sm:w-48 sm:text-right">
                    First Name:
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={staticData.firstName}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      disabled
                    />
                  </div>
                </div>

                {/* Middle Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm sm:text-base lg:text-lg font-medium text-gray-700 sm:w-48 sm:text-right">
                    Middle Name:
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={staticData.middleName}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      disabled
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm sm:text-base lg:text-lg font-medium text-gray-700 sm:w-48 sm:text-right">
                    Last Name:
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={staticData.lastName}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      disabled
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm sm:text-base lg:text-lg font-medium text-gray-700 sm:w-48 sm:text-right">
                    Phone Number:
                  </label>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                    {editingFields.phoneNumber ? (
                      <>
                        <input
                          type="text"
                          value={editableData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveField('phoneNumber')}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => cancelEditing('phoneNumber')}
                            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={editableData.phoneNumber}
                          className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm sm:text-base"
                          disabled
                        />
                        <button
                          onClick={() => startEditing('phoneNumber')}
                          className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Email - Non-editable */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm sm:text-base lg:text-lg font-medium text-gray-700 sm:w-48 sm:text-right">
                    Email Address:
                  </label>
                  <div className="flex-1">
                    <input
                      type="email"
                      value={editableData.email}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Email cannot be changed as it is your login username
                    </p>
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="text-sm sm:text-base lg:text-lg font-medium text-gray-700 sm:w-48 sm:text-right">
                    Password:
                  </label>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                    {editingFields.password ? (
                      <div className="flex-1 space-y-3">
                        <input
                          type="password"
                          value={editableData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                          placeholder="New password"
                        />
                        <input
                          type="password"
                          value={editableData.retypePassword}
                          onChange={(e) => handleInputChange('retypePassword', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm sm:text-base"
                          placeholder="Retype password"
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleChangePassword}
                            className="px-3 sm:px-4 py-2 bg-[#964B00] hover:bg-[#7a3d00] text-yellow-400 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                          >
                            <Save className="h-4 w-4" />
                            Save Password
                          </button>
                          <button
                            onClick={() => cancelEditing('password')}
                            className="px-3 sm:px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
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
                          className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm sm:text-base"
                          disabled
                        />
                        <button
                          onClick={() => startEditing('password')}
                          className="p-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
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

        {loading && <LoadingSpinner />}
      </div>
    </ProtectedRoute>
  )
}