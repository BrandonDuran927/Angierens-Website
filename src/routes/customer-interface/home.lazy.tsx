import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ShoppingCart, Bell, Heart, Star, MessageSquare, X, Menu } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'

export const Route = createLazyFileRoute('/customer-interface/home')({
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

interface Review {
  review_id: string
  review_type: 'delivery' | 'staff' | 'food' | 'service' | 'overall'
  rating: number
  comment: string
  order_id: string
  is_hidden: boolean
  order?: Array<{
    customer_uid: string
    users?: Array<{
      first_name: string
      middle_name: string | null
      last_name: string
    }> | null
  }> | null
}

interface MenuItem {
  menu_id: string
  name: string
  description: string
  price: string
  image_url: string | null
  category: string | null
  size: string | null
  is_available: boolean
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
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [cartCount] = useState(0);
  const [notificationCount] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [featuredMenuItems, setFeaturedMenuItems] = useState<MenuItem[]>([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [reviewFilter, setReviewFilter] = useState<string>('all')

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

  // Fetch reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoadingReviews(true)
        const { data, error } = await supabase
          .from('review')
          .select(`
            review_id,
            review_type,
            rating,
            comment,
            order_id,
            is_hidden,
            order (
              customer_uid,
              users (
                first_name,
                middle_name,
                last_name
              )
            )
          `)
          .eq('is_hidden', false)
          .limit(10)

        if (error) {
          console.error('Error fetching reviews:', error)
          throw error
        }
        console.log('Fetched reviews:', data)
        setReviews(data || [])
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [])

  // Fetch top 4 most expensive menu items
  useEffect(() => {
    const fetchFeaturedMenu = async () => {
      try {
        setIsLoadingMenu(true)
        // Fetch all available menu items
        const { data, error } = await supabase
          .from('menu')
          .select('*')
          .eq('is_available', true)

        if (error) throw error

        // Sort by price descending (convert string prices to numbers for accurate sorting)
        const sortedData = (data || []).sort((a, b) => {
          // Helper function to get the maximum price from a price string
          const getMaxPrice = (priceString: string) => {
            const cleanPrice = priceString.replace(/₱/g, '').trim()
            if (cleanPrice.includes(',')) {
              const prices = cleanPrice.split(',').map(p => parseFloat(p.trim()) || 0)
              return Math.max(...prices)
            }
            return parseFloat(cleanPrice || '0')
          }

          const priceA = getMaxPrice(a.price)
          const priceB = getMaxPrice(b.price)
          return priceB - priceA
        }).slice(0, 4) // Take only the top 4

        setFeaturedMenuItems(sortedData)
      } catch (error) {
        console.error('Error fetching menu items:', error)
      } finally {
        setIsLoadingMenu(false)
      }
    }

    fetchFeaturedMenu()
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

  // Helper functions for formatting
  const formatReviewType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'delivery': 'Delivery Review',
      'staff': 'Staff Review',
      'food': 'Food Review',
      'service': 'Service Review',
      'overall': 'Overall Experience'
    }
    return typeMap[type] || type
  }

  const getMenuDescription = (itemName: string): string => {
    const name = itemName.toLowerCase()

    if (name.includes('pansit') || name.includes('pancit')) {
      return 'Delicious stir-fried noodles with savory flavors, vegetables, and meat - a Filipino favorite for any celebration.'
    } else if (name.includes('lumpia')) {
      return 'Crispy golden spring rolls filled with seasoned vegetables and meat, perfect as an appetizer or party snack.'
    } else if (name.includes('lechon')) {
      return 'Tender, flavorful roasted pork with crispy skin - the centerpiece of Filipino feasts and celebrations.'
    } else if (name.includes('menudo')) {
      return 'Hearty tomato-based stew with pork, liver, and vegetables in a rich, savory sauce.'
    } else if (name.includes('caldereta') || name.includes('kaldereta')) {
      return 'Rich and spicy beef stew slow-cooked with tomatoes, bell peppers, and liver spread for depth of flavor.'
    } else if (name.includes('adobo')) {
      return 'Classic Filipino dish of tender meat marinated and simmered in soy sauce, vinegar, and garlic.'
    } else if (name.includes('kare-kare') || name.includes('kare kare')) {
      return 'Traditional oxtail and vegetable stew in rich peanut sauce, served with bagoong for authentic flavor.'
    } else if (name.includes('sinigang')) {
      return 'Tangy and savory tamarind-based soup with tender meat and fresh vegetables - comfort in a bowl.'
    } else if (name.includes('sisig')) {
      return 'Sizzling chopped pork with onions and peppers, served hot and crispy - a true Filipino bar favorite.'
    } else if (name.includes('dinuguan')) {
      return 'Savory pork blood stew cooked with vinegar and spices - a bold and traditional Filipino delicacy.'
    } else if (name.includes('mechado')) {
      return 'Tender beef stew in tomato sauce with potatoes and vegetables, infused with citrus flavor.'
    } else if (name.includes('afritada')) {
      return 'Hearty tomato-based stew with chicken or pork, potatoes, carrots, and bell peppers in savory sauce.'
    } else if (name.includes('bicol express')) {
      return 'Spicy and creamy pork dish cooked in coconut milk with chili peppers - a fiery Bicolano specialty.'
    } else if (name.includes('laing')) {
      return 'Taro leaves slow-cooked in rich coconut milk with shrimp paste and spices - a Bicolano delicacy.'
    } else if (name.includes('pinakbet') || name.includes('pakbet')) {
      return 'Healthy mixed vegetable dish with eggplant, squash, and okra in savory shrimp paste sauce.'
    } else if (name.includes('bbq') || name.includes('barbecue')) {
      return 'Grilled marinated meat skewers with sweet and savory glaze - perfect for sharing and celebrations.'
    } else {
      return 'A hearty and flavorful authentic Filipino dish, perfectly prepared for sharing with family and friends.'
    }
  }

  const formatPrice = (price: string) => {
    // Remove ₱ symbol if present
    const cleanPrice = price.replace(/₱/g, '').trim()

    // Check if price contains comma (multiple prices for different sizes)
    if (cleanPrice.includes(',')) {
      const prices = cleanPrice.split(',').map(p => parseFloat(p.trim()) || 0)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      // If all prices are the same, show single price
      if (minPrice === maxPrice) {
        return `₱${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }

      // Show price range
      return `₱${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ₱${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    // Single price
    const numPrice = parseFloat(cleanPrice || '0')
    return `₱${numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/home-page menu-img/1.png'

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // Construct the Supabase storage URL
    // Encode the filename to handle spaces and special characters
    const encodedFileName = encodeURIComponent(imageUrl)
    return `https://tvuawpgcpmqhsmwbwypy.supabase.co/storage/v1/object/public/menu-images/${encodedFileName}`
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  // Navigation items with their corresponding routes
  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: true },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
  ];

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
    <ProtectedRoute allowedRoles={['customer']}>
      <div className="min-h-screen min-w-[320px] bg-gradient-to-br from-amber-50 to-orange-100">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />

        {/* Customer Header */}
        <header className="w-auto mx-2 sm:mx-4 md:mx-10 my-3 border-b-8 border-amber-800">
          <div className="flex items-center justify-between p-2 sm:p-4 mb-5 relative">
            {/* Logo */}
            <div
              className="flex-shrink-0 bg-cover bg-center dynamic-logo z-50"
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
                <Link to="/login">
                  <button
                    className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap"
                    onClick={handleLogout}
                  >
                    <span className="hidden sm:inline">SIGN OUT</span>
                    <span className="sm:hidden">OUT</span>
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

        {/* Main Content */}
        <div className="bg-[url('/')] bg-cover bg-center bg-no-repeat overflow-hidden flex flex-col">
          {/* Header Section */}
          <div className="p-3 sm:p-6 lg:m-10 relative">
            <div className="flex flex-col lg:flex-row items-start justify-between bg-white p-4 sm:p-6 lg:pr-5 lg:pb-10 rounded-3xl">
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-[400px] lg:h-[400px] flex-shrink-0 bg-[url('/angierens-logo.png')] bg-contain bg-center bg-no-repeat lg:absolute lg:-top-10 lg:z-10 mb-4 lg:mb-0 mx-auto lg:mx-0"></div>
              <div className="w-full lg:ml-[320px] relative">
                <div className="lg:absolute lg:top-[-40px] lg:left-1/2 lg:-translate-x-1/2 lg:z-10 w-full lg:w-fit bg-yellow-400 text-black p-2 sm:p-4 lg:p-10 rounded-2xl lg:rounded-full font-semibold mb-4 text-xs sm:text-sm md:text-base lg:text-xl xl:text-3xl shadow-md shadow-black/40 text-center">
                  <div className="block lg:hidden text-xs sm:text-sm font-bold mb-1">OPENING HOURS</div>
                  <div className="hidden lg:block">OPENING HOURS: 9AM - 5PM Mon-Sun</div>
                  <div className="lg:hidden">9AM - 5PM Mon-Sun</div>
                </div>
                <div className="text-sm sm:text-base lg:text-lg text-gray-700 lg:mt-30 lg:ml-10 space-y-3 sm:space-y-4 lg:space-y-5 font-semibold">
                  <p>
                    We are open from Monday to Saturday, 9:00 AM to 5:00 PM. Our last call for orders is at 7:30 PM to make sure
                    everything is prepared and delivered on time. Deliveries start at 10:00 AM, while pickup orders can be collected as
                    early as 9:00 AM.
                  </p>
                  <p>
                    We are closed on Sundays to give our team a day of rest, and we may also pause operations on national holidays —
                    please check our Facebook page for updates.
                  </p>
                  <p>
                    For smoother service, we encourage customers to order ahead during peak hours, especially on holidays and
                    weekends.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-white p-3 sm:p-6 lg:m-10">
            <div className="bg-amber-800 flex flex-col lg:flex-row items-center justify-between rounded-2xl p-4 sm:p-6 lg:p-10 relative">
              <div className="w-full lg:flex-1 lg:pl-10 text-center lg:text-left mb-6 lg:mb-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  Angieren's — where every bilao is
                </h1>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                  a masterpiece, crafted with heart,
                </h2>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
                  styled with art, and made to satisfy.
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center lg:justify-start">
                  <Link
                    to="/customer-interface"
                    className="bg-white text-amber-800 px-6 py-2 rounded font-semibold hover:bg-gray-100 no-underline"
                  >
                    VIEW MENU
                  </Link>
                  <Link
                    to="/customer-interface"
                    className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500 no-underline"
                  >
                    PLACE ORDER NOW
                  </Link>
                </div>                <button
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="block cursor-pointer hover:scale-105 transition-transform duration-200 bg-transparent border-none p-0 text-left mx-auto lg:mx-0"
                >
                  <div className="text-center lg:text-left">
                    {/* Reviews text at the top */}
                    <span className="text-lg sm:text-xl font-bold text-white pb-2 block">Reviews</span>



                    {/* Stars at the bottom */}
                    <div className="flex items-center justify-center lg:justify-start gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl sm:text-2xl">★</span>
                      ))}
                    </div>
                  </div>
                </button>
              </div>

              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px] bg-[url('/rounded-bilao.png')] bg-contain bg-center bg-no-repeat lg:absolute lg:right-20 lg:top-1/2 lg:-translate-y-1/2 lg:z-10 flex-shrink-0" />
            </div>
          </div>

          {/* Reviews Modal */}
          {isReviewsModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Reviews</h2>
                  <button
                    onClick={() => setIsReviewsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-3xl leading-none cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                {/* Filter Dropdown */}
                <div className="pl-4 sm:pl-6 pt-4 sm:pt-6">
                  <div className="relative inline-block">
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value)}
                      className="bg-yellow-400 text-black px-4 py-2 pr-10 rounded font-semibold appearance-none cursor-pointer"
                    >
                      <option value="all">All Reviews</option>
                      <option value="Delivery">Delivery Reviews</option>
                      <option value="Staff">Staff Reviews</option>
                      <option value="Food">Food Reviews</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                  {isLoadingReviews ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                    </div>
                  ) : reviews.filter(review => reviewFilter === 'all' || review.review_type === reviewFilter).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No reviews available for this category.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {reviews.filter(review => reviewFilter === 'all' || review.review_type === reviewFilter).map((review) => {
                        const order = review.order ? review.order[0] : null
                        const user = order?.users ? order.users[0] : null
                        const userName = user
                          ? `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim()
                          : 'Anonymous'

                        return (
                          <div key={review.review_id} className="bg-amber-800 rounded-2xl sm:rounded-4xl p-4 sm:p-6 text-white">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                              <div className="mb-2 sm:mb-0">
                                <h3 className="text-lg sm:text-xl font-bold">{userName}</h3>
                                <p className="text-sm text-yellow-200">{formatReviewType(review.review_type)}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <div className="bg-yellow-400 text-black p-3 sm:p-4 rounded-xl">
                              <p className="text-sm sm:text-base leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-6 border-t bg-gray-50">
                  <div className="text-center text-sm text-gray-600">
                    <p>Thank you for your reviews! We appreciate your feedback.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Menu Section */}
          <div className="py-6 sm:py-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-amber-700 text-white px-4 sm:px-6 py-2 rounded inline-block font-semibold shadow-lg shadow-black/20">
                OUR MENUS
              </div>
            </div>

            <div className="bg-amber-800 mx-3 sm:mx-4 rounded-lg p-4 sm:p-6">
              {isLoadingMenu ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : featuredMenuItems.length === 0 ? (
                <div className="text-center py-12 text-white">
                  <p>No menu items available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {featuredMenuItems.map((item) => (
                    <div key={item.menu_id} className="bg-white rounded-lg p-4 text-center">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                      />
                      <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {getMenuDescription(item.name)}
                      </p>
                      <p className="font-bold text-lg mb-3">{formatPrice(item.price)}</p>
                      <Link
                        to="/customer-interface"
                        className="bg-yellow-400 text-black px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-500 w-full block text-center no-underline"
                      >
                        ORDER NOW
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Services Section */}
          <div className="py-6 sm:py-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-amber-700 text-white px-4 sm:px-6 py-2 rounded inline-block font-semibold shadow-lg shadow-black/20">
                OUR AWESOME SERVICES
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-3 sm:px-4 justify-items-center">
              {[
                {
                  title: "Quality Food",
                  description: "We use only the freshest ingredients to create delicious, high-standard meals that you'll love.",
                  src: "/home-page service-img/1.png"
                },
                {
                  title: "Cook like a Chef",
                  description: "Expertly prepared with a touch of culinary artistry in every dish, taste and flavoring a picture perfect meal.",
                  src: "/home-page service-img/2.png"
                },
                {
                  title: "Made with Love",
                  description: "Each meal is prepared with passion, care, and a deep love for cooking to bring joy to your dining experience.",
                  src: "/home-page service-img/3.png"
                }
              ].map((service, index) => (
                <div key={index} className="bg-white rounded-lg p-4 sm:p-6 text-center">
                  <img
                    src={service.src}
                    alt={service.title}
                    className='w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4'
                  />
                  <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3">{service.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div id="about" className="bg-white py-6 sm:py-8">
            <div className="text-center mb-4 sm:mb-6">
              <div className="bg-amber-700 text-white px-4 sm:px-6 py-2 rounded inline-block font-semibold shadow-lg shadow-black/20">
                ABOUT US
              </div>
            </div>

            <div className="px-4 max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">OUR STORY</h2>

              <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed font-semibold text-sm sm:text-base">
                <p>
                  Angieren's Lutong Bahay Bulacan began with a simple dream — to bring the
                  comforting taste of home-cooked Filipino meals to every table. What started as
                  a small family kitchen has grown into a beloved food spot in Bulacan, known for
                  its warmth, authenticity, and heartfelt service.
                </p>

                <p>
                  Rooted in tradition, our dishes are inspired by recipes passed down through
                  generations — rich with flavor, history, and love. Every meal we serve reflects
                  our passion for Filipino cuisine and our commitment to quality ingredients,
                  careful preparation, and that special "lutong bahay" feel.
                </p>

                <p>
                  At Angieren's, we believe that food is more than just sustenance — it's a way to
                  bring people together, to celebrate culture, and to share joy. Whether you're a
                  regular or visiting for the first time, we welcome you like family.
                </p>

                <p className="text-center font-semibold">
                  Come taste the tradition. Come feel the love.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer id="contact" className="py-6 sm:py-8" style={{ backgroundColor: "#F9ECD9" }}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="sm:col-span-2 lg:col-span-1">
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
              <div className="border-t border-gray-400 mt-6 sm:mt-8 pt-4 text-center text-sm text-gray-600">
                <p>&copy; 2024 Angieren's Lutong Bahay. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}