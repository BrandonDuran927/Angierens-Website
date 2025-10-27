import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu } from 'lucide-react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

// TODO: (DONE) Implement T&C Privacy policy modal
// TODO: Add database functionality -> Store user details

export const Route = createLazyFileRoute('/signup')({
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showTCModal, setShowTCModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [isLoading, setIsLoading] = useState(false);


  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
    country: '',
    postalCode: '',
    province: '',
    provinceCode: 'NCR',
    city: '',
    cityCode: '',
    barangay: '',
    barangayCode: '',
    address_line: '',
    phone_number: '',
    otherContact: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)

  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );


  // Fetch provinces on mount
  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/')
      .then(res => res.json())
      .then(data => {
        setProvinces(data)
        console.log(data)
      })
      .catch(error => console.error('Error fetching provinces:', error));
  }, []);

  // NCR code only - 130000000
  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/130000000/cities-municipalities/')
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(error => console.error('Error fetching NCR cities:', error));
  }, []);

  // Fetch barangays dynamically when a city is selected
  useEffect(() => {
    if (form.cityCode) {
      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${form.cityCode}/barangays`)
        .then(res => res.json())
        .then(data => setBarangays(data))
        .catch(error => console.error('Error fetching barangays:', error));
    } else {
      setBarangays([]);
    }
  }, [form.cityCode]);

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

  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: false },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
  ];

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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const { name, value } = target

    // Special handling for province selection to also store the name
    if (name === 'provinceCode') {
      const selectedProvince = provinces.find(p => p.code === value);
      setForm(prev => ({
        ...prev,
        provinceCode: value,
        province: selectedProvince?.name || '',
        cityCode: '', // Reset city when province changes
        city: '',
        barangay: ''
      }));
      return;
    }

    // Special handling for city selection to also store the name
    if (name === 'cityCode') {
      const selectedCity = cities.find(c => c.code === value);
      setForm(prev => ({
        ...prev,
        cityCode: value,
        city: selectedCity?.name || '',
        barangay: '' // Reset barangay when city changes
      }));
      return;
    }

    if (name === 'barangay') {
      const selectedBarangay = barangays.find(b => b.code === value)
      setForm(prev => ({
        ...prev,
        barangayCode: value,
        barangay: selectedBarangay?.name || ''
      }))
      return
    }

    setForm(prev => ({
      ...prev,
      [name]: target.type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }))
  }

  const formatPhoneNumber = (number: string): string => {
    const cleaned = number.replace(/\s+/g, '')

    if (cleaned.startsWith('0')) {
      return '+63' + cleaned.substring(1)
    }

    return cleaned
  }

  // Add this inside your component (above the return)
  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);

    const { birthMonth, birthDay, birthYear } = updatedForm;

    if (birthMonth && birthDay && birthYear) {
      const birthDate = new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay));
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      if (age < 18) {
        alert("You must be at least 18 years old to sign up.");
        setForm({
          ...updatedForm,
          birthMonth: "",
          birthDay: "",
          birthYear: "",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Actual implementation
    // try {
    //   const formattedNumber = formatPhoneNumber(form.mobile)

    //   const { data, error } = await supabase.functions.invoke('send-otp', {
    //     body: { phoneNumber: formattedNumber }
    //   })

    //   if (error) throw error
    //   console.log("Data sent:", data)
    //   setSentCode(data)

    //   setShowOtpModal(true)
    // } catch (error) {
    //   console.error('Error sending OTP:', error)
    // }

    // Mock function
    setShowOtpModal(true)
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setSentCode('')
    setOtpCode('')
  }

  const verifyOtp = async () => {
    try {
      // Temporary mock OTP verification (for testing only)
      alert('OTP verified successfully!')

      await signUpNewUser()

      closeOtpModal()
      navigate({ to: "/login" })
    } catch (error) {
      console.error('Error verifying OTP or signing up:', error)
    }
    // try {
    //   const formattedNumber = formatPhoneNumber(form.mobile)

    //   const { data, error } = await supabase.functions.invoke('verify-otp', {
    //     body: { phoneNumber: formattedNumber, otpCode },
    //   })

    //   if (error) throw error

    //   if (data.status === 'approved') {
    //     alert('OTP verified successfully!')
    //     closeOtpModal()
    //     navigate({ to: "/login" })
    //   } else {
    //     alert('Invalid or expired OTP.')
    //   }
    // } catch (error) {
    //   console.error('Error verifying OTP:', error)
    // }
  }

  async function signUpNewUser() {
    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (authError) throw authError

      const userAuthId = authData?.user?.id
      if (!userAuthId) throw new Error("Auth signup failed, no user ID returned.")

      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            user_uid: userAuthId,
            first_name: form.firstName,
            middle_name: form.middleName,
            last_name: form.lastName,
            email: form.email,
            phone_number: form.phone_number,
            is_active: true,
            user_role: "Customer",
            date_hired: null,
            birth_date: `${form.birthYear}-${form.birthMonth}-${form.birthDay}`,
            gender: form.gender,
            other_contact: form.otherContact,
          },
        ])
        .select("user_uid")

      if (userError) throw userError

      const userId = userData[0].user_uid

      const { error: addressError } = await supabase.from("address").insert([
        {
          address_type: "Primary",
          address_line: form.address_line,
          region: form.provinceCode,
          city: form.city,
          barangay: form.barangay,
          postal_code: form.postalCode,
          customer_id: userId,
        },
      ])

      if (addressError) throw addressError

      console.log("User registration successful!", { userId, form })
    } catch (error) {
      console.error("Error inserting to database:", error)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen min-w-[320px] bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">

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

              {/* Sign In Button */}
              <Link to="/login">
                <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                  SIGN IN
                </button>
              </Link>
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

      <div className="flex-grow">
        <form onSubmit={handleSubmit} className="bg-white max-w-5xl mx-auto px-4 py-6 space-y-10 my-10">
          <p className="text-m text-gray-600">
            Please confirm that the information you input is correct. The Angieren's Team will not be liable if the information does not match.
          </p>
          <hr />
          {/* FIRST STEP */}
          <section>
            <h2 className="text-xl font-bold pb-1 mb-4">FIRST STEP</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Middle Name</label>
                <input type="text" name="middleName" value={form.middleName} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold">Month *</label>
                <select
                  name="birthMonth"
                  value={form.birthMonth}
                  onChange={handleBirthChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select your month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold">Day *</label>
                <input
                  type="number"
                  name="birthDay"
                  value={form.birthDay}
                  onChange={handleBirthChange}
                  min="1"
                  max="31"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Year *</label>
                <select
                  name="birthYear"
                  value={form.birthYear}
                  onChange={handleBirthChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select your year</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECOND STEP */}
          <section>
            <h2 className="text-xl font-bold pb-1 mb-4">SECOND STEP</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Country *</label>
                <select name="country" value={form.country} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your country</option>
                  <option value="Philippines">Philippines</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Postal Code *</label>
                <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>

              <div>
                <label className="block text-sm font-semibold">Region *</label>
                <select
                  name="provinceCode"
                  value="NCR"
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
                  required
                >
                  <option value="NCR">NCR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold">City/Municipality *</label>
                <select
                  name="cityCode"
                  value={form.cityCode}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select City/Municipality</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>

              </div>

              <div>
                <label className="block text-sm font-semibold">Barangay *</label>
                <select
                  name="barangay"
                  value={form.barangayCode}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={!form.cityCode}
                >
                  <option value="">
                    {form.cityCode ? 'Select your barangay' : 'Select city first'}
                  </option>
                  {barangays.map((barangay) => (
                    <option key={barangay.code} value={barangay.code}>
                      {barangay.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold">Address *</label>
                <input type="text" name="address_line" value={form.address_line} onChange={handleChange}
                  placeholder="House/Unit/Floor No., Building Name, Street Name"
                  className="w-full border rounded px-3 py-2" required />
              </div>

              <div>
                <label className="block text-sm font-semibold">Mobile Number *</label>
                <input type="text" name="phone_number" value={form.phone_number} onChange={handleChange}
                  placeholder="ex. 09xxxxxxxxx"
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Other Contact Number (Mobile/Landline)</label>
                <input type="text" name="otherContact" value={form.otherContact} onChange={handleChange}
                  placeholder="ex. 8-xxxxxxx"
                  className="w-full border rounded px-3 py-2" />
              </div>
            </div>
          </section>

          {/* THIRD STEP */}
          <section>
            <h2 className="text-xl font-bold pb-1 mb-4">THIRD STEP</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div></div>

              <div>
                <label className="block text-sm font-semibold">Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <div className="mt-4">
              <label className="inline-flex items-start space-x-2">
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange}
                  className="mt-1" required />
                <span className="text-sm text-gray-700">
                  I am at least 18 years old and have read and agreed to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowTCModal(true)
                    }}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPrivacyModal(true)
                    }}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Privacy Policy
                  </button>
                  {' '}of Angieren's Lutong Bahay.
                </span>
              </label>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="pt-6">
            <button
              type="submit"
              className="bg-amber-100 hover:bg-amber-200 border border-black px-6 py-2 rounded text-black font-semibold"
            >
              REGISTER
            </button>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <footer className="py-8 mt-16" style={{ backgroundColor: '#F9ECD9' }}>
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
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Menu</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-800">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
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

      {
        showOtpModal && (
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
        )
      }

      {/* Terms and Conditions Modal */}
      {showTCModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
                <button
                  onClick={() => setShowTCModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p>By accessing and using Angieren's Lutong Bahay online ordering system, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">2. Service Description</h3>
                  <p>Angieren's Lutong Bahay provides an online ordering platform for authentic Filipino home-cooked meals with delivery and pick-up options. We reserve the right to modify or discontinue the service at any time without notice.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">3. User Account</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You agree to provide accurate and complete information during registration</li>
                    <li>You are responsible for all activities that occur under your account</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Orders and Payment</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All orders are subject to availability and confirmation</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Payment must be made through authorized payment methods (GCash)</li>
                    <li>Proof of payment must be uploaded for order confirmation</li>
                    <li>Orders cannot be cancelled once the chef has started preparing the food</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Delivery</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Delivery is available within Metro Manila (NCR) only</li>
                    <li>Delivery times are estimates and may vary due to traffic or other factors</li>
                    <li>You must provide accurate delivery address information</li>
                    <li>Additional delivery charges may apply based on location</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">6. Cancellations and Refunds</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cancellation requests must be submitted before the order is accepted by staff</li>
                    <li>Refunds are processed at our discretion based on the circumstances</li>
                    <li>Refund processing time may take 3-5 business days</li>
                    <li>No refunds will be issued for orders that have been prepared or delivered</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">7. Food Safety and Quality</h3>
                  <p>While we strive to maintain the highest standards of food safety and quality, we are not liable for any adverse reactions or allergies. Customers are responsible for informing us of any dietary restrictions or allergies.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">8. Intellectual Property</h3>
                  <p>All content on this platform, including text, graphics, logos, and images, is the property of Angieren's Lutong Bahay and is protected by copyright laws.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">9. Limitation of Liability</h3>
                  <p>Angieren's Lutong Bahay shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">10. Contact Information</h3>
                  <p>For questions regarding these Terms and Conditions, please contact us at:</p>
                  <p className="mt-2">Email: info@angierens.com<br />Phone: +63 912 345 6789</p>
                </section>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setShowTCModal(false)}
                className="w-full bg-[#964B00] text-yellow-400 py-3 rounded-lg font-semibold hover:bg-[#7a3d00] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6 text-gray-700">
                <p className="text-sm text-gray-600">Last Updated: October 26, 2025</p>

                <section>
                  <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
                  <p className="mb-2">We collect the following types of information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, gender</li>
                    <li><strong>Address Information:</strong> Delivery address including barangay, city, and postal code</li>
                    <li><strong>Order Information:</strong> Order history, preferences, and payment details</li>
                    <li><strong>Usage Information:</strong> How you interact with our platform</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
                  <p className="mb-2">We use your information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Processing and fulfilling your orders</li>
                    <li>Communicating with you about your orders</li>
                    <li>Providing customer support</li>
                    <li>Sending order updates and notifications</li>
                    <li>Improving our services and user experience</li>
                    <li>Preventing fraud and ensuring platform security</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">3. Information Sharing</h3>
                  <p className="mb-2">We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Delivery Riders:</strong> Name, phone number, and delivery address to facilitate delivery</li>
                    <li><strong>Kitchen Staff:</strong> Order details to prepare your food</li>
                    <li><strong>Payment Processors:</strong> Payment information for transaction processing</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  </ul>
                  <p className="mt-2">We do not sell your personal information to third parties.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Data Retention</h3>
                  <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Order history may be retained for accounting and legal purposes.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">6. Your Rights</h3>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Object to processing of your data</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">7. Cookies and Tracking</h3>
                  <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">8. Children's Privacy</h3>
                  <p>Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">9. Changes to Privacy Policy</h3>
                  <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">10. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
                  <p className="mt-2">
                    Email: info@angierens.com<br />
                    Phone: +63 912 345 6789<br />
                    Address: Metro Manila, Philippines
                  </p>
                </section>

                <section className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Your Consent</h3>
                  <p>By using our service, you consent to the collection and use of your information as described in this Privacy Policy.</p>
                </section>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-[#964B00] text-yellow-400 py-3 rounded-lg font-semibold hover:bg-[#7a3d00] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner />}
    </div >
  )
}