import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { ShoppingCart, Bell, Edit, Save, X, Heart, Star, MessageSquare, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createLazyFileRoute('/customer-interface/my-info')({
  component: RouteComponent,
})

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

function RouteComponent() {
  const { user, signOut } = useUser()
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Navigated to /customer-interface")
    console.log("Current logged-in user:", user)
  }, [user])

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [cartCount] = useState(2)
  const [notificationCount] = useState(3)
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

  // Only editable fields are in state
  const [editableData, setEditableData] = useState({
    mobileNumber: '0934 344 9343',
    email: 'abahakarwelastik@students.nu-fairview.edu.ph',
    newPassword: '',
    retypePassword: ''
  })

  // Track which fields are currently being edited
  const [editingFields, setEditingFields] = useState({
    mobileNumber: false,
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
    mobileNumber: '0934 344 9343',
    email: 'abahakarwelastik@students.nu-fairview.edu.ph'
  })

  // Static user data (non-editable)
  const staticData = {
    firstName: 'Brandon',
    middleName: '',
    lastName: 'Duran',
    birthMonth: 'February',
    birthDay: '02',
    birthYear: '2004',
    gender: 'MALE',
    country: 'Philippines',
    postalCode: '1431',
    province: 'Metro Manila',
    city: 'Caloocan',
    address: 'Area subdivision/barangay/district'
  }

  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: false },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: true },
  ]

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const startEditing = (field: string) => {
    // Show password verification modal for sensitive fields
    if (field === 'mobileNumber' || field === 'email' || field === 'password') {
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
    if (field === 'mobileNumber' || field === 'email') {
      setEditableData(prev => ({
        ...prev,
        [field]: originalValues[field]
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
    if (pendingEdit === 'mobileNumber') {
      // For mobile number, show OTP modal
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

    // OTP verified, allow mobile number editing
    setShowOtpModal(false)
    setEditingFields(prev => ({
      ...prev,
      mobileNumber: true
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
    if (field === 'mobileNumber' || field === 'email') {
      // Basic validation
      if (field === 'email' && !editableData.email.includes('@')) {
        alert('Please enter a valid email address!')
        return
      }

      if (field === 'mobileNumber' && editableData.mobileNumber.trim().length === 0) {
        alert('Please enter a mobile number!')
        return
      }

      // Update original value
      setOriginalValues(prev => ({
        ...prev,
        [field]: editableData[field]
      }))

      setEditingFields(prev => ({
        ...prev,
        [field]: false
      }))

      alert(`${field === 'mobileNumber' ? 'Mobile number' : 'Email address'} updated successfully!`)
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

  const handleSaveInfo = () => {
    // Handle saving mobile number and email
    console.log('Information updated:', {
      mobileNumber: editableData.mobileNumber,
      email: editableData.email
    })
    alert('Information updated successfully!')
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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
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
                We've sent a verification code to your current mobile number. Please enter it below to continue.
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

                {/* Conditional Button */}
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">SIGN OUT</span>
                    <span className="sm:hidden">OUT</span>
                  </button>
                ) : (
                  <Link to="/login">
                    <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                      <span className="hidden sm:inline">SIGN IN</span>
                      <span className="sm:hidden">IN</span>
                    </button>
                  </Link>
                )}
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

        {/* Main Content */}
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <h1 className="text-xl font-medium text-gray-700 text-center">Your information</h1>
            </div>

            <div className="p-6 space-y-8">
              {/* Personal Details Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Personal details</h2>

                {/* Name Fields - Read Only */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">FIRST NAME</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">MIDDLE NAME</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.middleName || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">LAST NAME</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.lastName}
                    </div>
                  </div>
                </div>

                {/* Birthdate - Read Only */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Birthdate</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">MONTH</label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                        {staticData.birthMonth}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">DAY</label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                        {staticData.birthDay}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">YEAR</label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                        {staticData.birthYear}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gender - Read Only */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">GENDER</label>
                  <div className="flex gap-4">
                    <div className={`px-4 py-2 rounded-full border cursor-not-allowed ${staticData.gender === 'MALE'
                      ? 'bg-gray-400 text-white border-gray-400'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                      MALE
                    </div>
                    <div className={`px-4 py-2 rounded-full border cursor-not-allowed ${staticData.gender === 'FEMALE'
                      ? 'bg-gray-400 text-white border-gray-400'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                      FEMALE
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address Section - Read Only */}
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">Billing address</h2>

                {/* Country and Postal Code - Read Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">COUNTRY</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.country}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">POSTAL CODE</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.postalCode}
                    </div>
                  </div>
                </div>

                {/* Province and City - Read Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">PROVINCE</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.province}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">CITY</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {staticData.city}
                    </div>
                  </div>
                </div>

                {/* Address - Read Only */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">ADDRESS</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                    {staticData.address}
                  </div>
                </div>

                {/* Mobile Number - Editable */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    MOBILE NUMBER
                  </label>
                  {editingFields.mobileNumber ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editableData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Enter mobile number"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveField('mobileNumber')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => cancelEditing('mobileNumber')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed max-w-xs">
                        {editableData.mobileNumber}
                      </div>
                      <button
                        onClick={() => startEditing('mobileNumber')}
                        className="bg-[#964B00] hover:bg-[#7a3d00] text-yellow-400 p-2 rounded-md transition-colors"
                        title="Edit Mobile Number"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Email Address - Editable */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    EMAIL ADDRESS
                  </label>
                  {editingFields.email ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={editableData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveField('email')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => cancelEditing('email')}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                        {editableData.email}
                      </div>
                      <button
                        onClick={() => startEditing('email')}
                        className="bg-[#964B00] hover:bg-[#7a3d00] text-yellow-400 p-2 rounded-md transition-colors"
                        title="Edit Email Address"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Change Password Section - Editable */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-800 flex items-center">
                    CHANGE PASSWORD
                  </h2>
                  {!editingFields.password && (
                    <button
                      onClick={() => startEditing('password')}
                      className="bg-[#964B00] hover:bg-[#7a3d00] text-yellow-400 p-2 rounded-md transition-colors"
                      title="Change Password"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {editingFields.password ? (
                  <div className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">NEW PASSWORD</label>
                      <input
                        type="password"
                        value={editableData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    {/* Retype Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">RETYPE PASSWORD</label>
                      <input
                        type="password"
                        value={editableData.retypePassword}
                        onChange={(e) => handleInputChange('retypePassword', e.target.value)}
                        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Retype new password"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        className="bg-[#964B00] hover:bg-[#7a3d00] text-yellow-400 font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Change Password
                      </button>
                      <button
                        onClick={() => cancelEditing('password')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Click the edit button to change your password
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* FOOTER */}
        <footer id="contact" className="py-8" style={{ backgroundColor: "#F9ECD9" }}>
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
    </ProtectedRoute>
  )
}