import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { ShoppingCart, Bell, Edit, Save, X, Heart, Star, MessageSquare, Menu, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabaseClient'

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

interface UserData {
  user_uid: string
  first_name: string
  middle_name: string | null
  last_name: string
  email: string
  phone_number: string
  birth_date: string | null
  gender: string
  other_contact: string | null
}

interface AddressData {
  address_id: string
  address_type: string
  address_line: string
  region: string
  city: string
  barangay: string
  postal_code: string
}

function RouteComponent() {
  const { user, signOut } = useUser()
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    console.log("Navigated to /customer-interface/my-info")
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
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

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
    phoneNumber: '',
    email: '',
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
  const [sentCode, setSentCode] = useState('')

  // Store original values for cancel functionality
  const [originalValues, setOriginalValues] = useState({
    phoneNumber: '',
    email: ''
  })

  // Static user data (non-editable)
  const [staticData, setStaticData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
    otherContact: ''
  })

  // Address data
  const [addressData, setAddressData] = useState({
    country: 'Philippines',
    postalCode: '',
    region: '',
    city: '',
    barangay: '',
    addressLine: ''
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
        .select('user_uid, first_name, middle_name, last_name, email, phone_number, birth_date, gender, other_contact')
        .eq('user_uid', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        alert('Failed to load user information')
        return
      }

      if (userData) {
        // Parse birth_date
        let birthMonth = ''
        let birthDay = ''
        let birthYear = ''

        if (userData.birth_date) {
          const date = new Date(userData.birth_date)
          birthMonth = date.toLocaleString('en-US', { month: 'long' })
          birthDay = String(date.getDate()).padStart(2, '0')
          birthYear = String(date.getFullYear())
        }

        // Set static (non-editable) data
        setStaticData({
          firstName: userData.first_name || '',
          middleName: userData.middle_name || '',
          lastName: userData.last_name || '',
          birthMonth,
          birthDay,
          birthYear,
          gender: userData.gender || '',
          otherContact: userData.other_contact || ''
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

      // Fetch address data
      const { data: addressDataResult, error: addressError } = await supabase
        .from('address')
        .select('address_id, address_type, address_line, region, city, barangay, postal_code')
        .eq('customer_id', user.id)
        .eq('address_type', 'Primary')
        .maybeSingle()

      if (addressError) {
        console.log('No address found or error:', addressError)
        // Don't show error - address might not exist yet
      } else if (addressDataResult) {
        console.log('Fetched address data:', addressDataResult)

        setAddressData({
          country: 'Philippines',
          postalCode: addressDataResult.postal_code || '',
          region: addressDataResult.region || '',
          city: addressDataResult.city || '',
          barangay: addressDataResult.barangay || '',
          addressLine: addressDataResult.address_line || ''
        })
      }
    } catch (error) {
      console.error('Error in fetchCurrentUser:', error)
      alert('An error occurred while loading your information')
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { name: 'HOME', route: '/', active: false, showWhenLoggedOut: true },
    { name: 'MENU', route: '/customer-interface/', active: false, showWhenLoggedOut: true },
    { name: 'ORDER', route: '/customer-interface/order', active: false, showWhenLoggedOut: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false, showWhenLoggedOut: false },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: true, showWhenLoggedOut: false }
  ].filter(item => user || item.showWhenLoggedOut);

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

  const verifyPassword = async () => {
    console.log("Triggered")

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

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setSentCode('')
    setOtpCode('')
  }

  const saveField = async (field: string) => {
    if (!currentUserId) {
      alert('User not authenticated')
      return
    }

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

      try {
        setLoading(true)

        // Update in users table
        const updateData = field === 'phoneNumber'
          ? { phone_number: editableData.phoneNumber }
          : { email: editableData.email }

        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('user_uid', currentUserId)

        if (updateError) {
          console.error('Error updating user data:', updateError)
          alert('Failed to update. Please try again.')
          return
        }

        // If updating email, also update auth email
        if (field === 'email') {
          const { error: authError } = await supabase.auth.updateUser({
            email: editableData.email
          })

          if (authError) {
            console.error('Error updating auth email:', authError)
            alert('Profile updated but email verification may be required. Please check your inbox.')
          }
        }

        // Update original value
        setOriginalValues(prev => ({
          ...prev,
          [field]: editableData[field as keyof typeof editableData] as string
        }))

        setEditingFields(prev => ({
          ...prev,
          [field]: false
        }))

        alert(`${field === 'phoneNumber' ? 'Phone number' : 'Email address'} updated successfully!`)
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
      // const formattedNumber = formatPhoneNumber(editableData.phoneNumber)

      // const { data, error } = await supabase.functions.invoke('send-otp', {
      //   body: { phoneNumber: formattedNumber }
      // })

      // if (error) throw error
      // console.log("Data sent:", data)
      // setSentCode(data)

      setShowOtpModal(true)
    } catch (error) {
      console.error('Error sending OTP:', error)
    }
  }

  const verifyOtp = async () => {
    try {
      const formattedNumber = formatPhoneNumber(originalValues.phoneNumber)

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { phoneNumber: formattedNumber, otpCode },
      })

      if (error) throw error

      if (data.status === 'approved') {
        alert('OTP verified successfully! You can now edit your phone number.')
        closeOtpModal()

        // Now enable editing mode (don't save yet)
        setEditingFields(prev => ({
          ...prev,
          phoneNumber: true
        }))
      } else {
        alert('Invalid or expired OTP.')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      alert('Failed to verify OTP. Please try again.')
    }
  }

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  )

  const logoStyle: React.CSSProperties = {
    width: '140px',
    height: '140px',
    backgroundImage: "url('/angierens-logo.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'absolute' as const,
    top: '8px',
    left: '16px'
  };

  const customStyles = `
    body {
      min-width: 320px;
      scroll-behavior: smooth;
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

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes pulse-soft {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .animate-slide-in-right {
      animation: slideInRight 0.6s ease-out forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    .glass-effect {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .glass-dark {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .hover-glow {
      transition: box-shadow 0.3s ease;
    }

    .hover-glow:hover {
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
    }

    .text-gradient {
      background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn-primary {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      transform: scale(1.02);
    }

    .card-hover {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .card-hover:hover {
      transform: translateY(-5px) scale(1.02);
    }

    .notification-badge {
      animation: pulse-soft 2s infinite;
    }

    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(146, 64, 14, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(146, 64, 14, 0.7);
    }
  `;

  return (
    <ProtectedRoute allowedRoles={['customer']}>

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
                <button
                  onClick={handleSubmit}
                  className="text-[#964B00] text-sm hover:underline"
                >
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
        <header className={`sticky top-0 z-40 glass-effect shadow-sm transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-auto mx-2 sm:mx-4 md:mx-10">
            <div className="flex items-center justify-between p-2 sm:p-4 relative">
              {/* Logo */}
              <div
                className="flex-shrink-0 bg-cover bg-center dynamic-logo z-50 hover:scale-105 transition-transform duration-300"
                style={logoStyle}
              />

              {/* Main Content Container */}
              <div className="flex items-center justify-end w-full pl-[150px] sm:pl-[160px] lg:pl-[180px] gap-2 sm:gap-4">
                {/* Desktop Navigation */}
                <nav className="hidden lg:flex xl:gap-2 bg-gradient-to-r from-amber-800 to-amber-900 py-2 px-4 xl:px-6 rounded-full shadow-lg">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.name}
                      to={item.route}
                      className={`px-4 xl:px-5 py-2.5 rounded-full text-sm xl:text-base font-semibold transition-all duration-300 whitespace-nowrap ${item.active
                        ? 'bg-yellow-400 text-amber-900 shadow-md'
                        : 'text-yellow-400 hover:bg-amber-700/50 hover:text-yellow-300'
                        }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Hamburger Menu Button - Show on tablet and mobile */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2.5 text-amber-900 hover:bg-amber-100 rounded-full bg-yellow-400 shadow-md transition-all duration-300 hover:scale-105"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {/* Right Side Controls */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-gradient-to-r from-amber-800 to-amber-900 py-2 px-3 sm:px-4 md:px-5 rounded-full shadow-lg">
                  {/* Cart Icon */}
                  {user && (
                    <Link
                      to="/customer-interface/cart"
                      className="relative p-2 sm:p-2.5 text-yellow-400 hover:bg-amber-700/50 rounded-full transition-all duration-300 hover:scale-110"
                      aria-label="Shopping cart"
                    >
                      <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold notification-badge">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Notifications */}
                  {user && (
                    <div className="relative">
                      <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="relative p-2 sm:p-2.5 text-yellow-400 hover:bg-amber-700/50 rounded-full transition-all duration-300 hover:scale-110"
                        aria-label="Notifications"
                      >
                        <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                        {notificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold notification-badge">
                            {notificationCount}
                          </span>
                        )}
                      </button>

                      {/* Notification Dropdown */}
                      {isNotificationOpen && (
                        <div className="absolute right-0 mt-3 w-72 sm:w-80 md:w-96 glass-effect rounded-2xl shadow-2xl border border-white/20 z-50 max-h-[70vh] overflow-hidden animate-fade-in">
                          <div className="p-4 sm:p-5 border-b border-gray-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Notifications</h3>
                          </div>

                          <div className="max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-10 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No notifications yet</p>
                                <p className="text-sm text-gray-400 mt-1">We'll notify you when something arrives</p>
                              </div>
                            ) : (
                              notifications.map((notification, index) => (
                                <div
                                  key={notification.id}
                                  className={`p-4 border-b border-gray-100/50 hover:bg-amber-50/50 cursor-pointer transition-colors duration-200 ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-amber-900 shadow-md">
                                      {getNotificationIcon(notification.icon)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1.5">
                                        {notification.time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
                            <button
                              onClick={markAllAsRead}
                              className="w-full btn-primary text-amber-900 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-md"
                            >
                              <Bell className="h-4 w-4" />
                              Mark all as read
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conditional Button */}
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="bg-transparent text-yellow-400 font-semibold py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-full border-2 border-yellow-400 hover:bg-yellow-400 hover:text-amber-900 transition-all duration-300 whitespace-nowrap hover:scale-105"
                    >
                      <span className="hidden sm:inline">SIGN OUT</span>
                      <span className="sm:hidden">OUT</span>
                    </button>
                  ) : (
                    <Link to="/login">
                      <button className="btn-primary text-amber-900 font-semibold py-2 px-3 sm:px-5 text-xs sm:text-sm rounded-full shadow-md whitespace-nowrap hover:scale-105">
                        <span className="hidden sm:inline">SIGN IN</span>
                        <span className="sm:hidden">IN</span>
                      </button>
                    </Link>
                  )}
                </div>
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
                        {staticData.birthMonth || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">DAY</label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                        {staticData.birthDay || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">YEAR</label>
                      <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                        {staticData.birthYear || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gender - Read Only */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">GENDER</label>
                  <div className="flex gap-4">
                    <div className={`px-4 py-2 rounded-full border cursor-not-allowed ${staticData.gender === 'Male'
                      ? 'bg-gray-400 text-white border-gray-400'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                      MALE
                    </div>
                    <div className={`px-4 py-2 rounded-full border cursor-not-allowed ${staticData.gender === 'Female'
                      ? 'bg-gray-400 text-white border-gray-400'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                      FEMALE
                    </div>
                    <div className={`px-4 py-2 rounded-full border cursor-not-allowed ${staticData.gender === 'Other'
                      ? 'bg-gray-400 text-white border-gray-400'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}>
                      OTHER
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
                      {addressData.country}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">POSTAL CODE</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {addressData.postalCode || '-'}
                    </div>
                  </div>
                </div>

                {/* Region and City - Read Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">REGION</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {addressData.region || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">CITY</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {addressData.city || '-'}
                    </div>
                  </div>
                </div>

                {/* Barangay - Read Only */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">BARANGAY</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                    {addressData.barangay || '-'}
                  </div>
                </div>

                {/* Address - Read Only */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">ADDRESS</label>
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                    {addressData.addressLine || '-'}
                  </div>
                </div>

                {/* Mobile Number - Editable */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    MOBILE NUMBER
                  </label>
                  {editingFields.phoneNumber ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editableData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Enter mobile number"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmit}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                        <button
                          onClick={() => cancelEditing('phoneNumber')}
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
                        {editableData.phoneNumber || '-'}
                      </div>
                      <button
                        onClick={() => startEditing('phoneNumber')}
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed">
                      {editableData.email || '-'}
                    </div>
                  </div>
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
        <footer id="contact" className="bg-gradient-to-br from-amber-900 via-amber-950 to-black text-white py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {/* Brand Column */}
              <div className="sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[url('/angierens-logo.png')] bg-cover bg-center rounded-full" />
                  <h3 className="text-xl font-bold">Angieren's</h3>
                </div>
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  Authentic Filipino home-cooked meals delivered to your doorstep. Taste the tradition, feel the love.
                </p>
                {/* Social Links */}
                <div className="flex gap-3 mt-6">
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Home</Link></li>
                  <li><Link to="/customer-interface" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Menu</Link></li>
                  <li><a href="#about" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />About Us</a></li>
                  <li><a href="#contact" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Contact</a></li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Support</h4>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />FAQ</Link></li>
                  <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Help Center</Link></li>
                  <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Terms & Conditions</Link></li>
                  <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Privacy Policy</Link></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-amber-200/60 text-xs mb-1">Email</p>
                      <p className="text-amber-100">info@angierens.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-amber-200/60 text-xs mb-1">Phone</p>
                      <p className="text-amber-100">+63 912 345 6789</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-amber-200/60 text-xs mb-1">Location</p>
                      <p className="text-amber-100">Bulacan, Philippines</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/10 mt-10 pt-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-amber-200/60 text-sm">
                  © 2024 Angieren's Lutong Bahay. All rights reserved.
                </p>
                <p className="text-amber-200/40 text-xs">
                  Made with 💛 in Bulacan, Philippines
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  )
}