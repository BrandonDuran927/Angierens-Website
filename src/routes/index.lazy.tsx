import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Bell, Heart, Star, MessageSquare, X, Menu, ChevronDown, Clock, MapPin, Phone, Mail, Facebook, Instagram, ArrowRight, Sparkles, ChefHat, HeartHandshake } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'

export const Route = createLazyFileRoute('/')({
  component: App,
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

// Skeleton component for loading states
const MenuCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 animate-pulse">
    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3" />
    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
    <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto mb-4" />
    <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
    <div className="h-10 bg-gray-200 rounded-xl w-full" />
  </div>
)

const ReviewCardSkeleton = () => (
  <div className="bg-amber-800/50 rounded-2xl p-6 animate-pulse">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 bg-amber-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-amber-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-amber-700 rounded w-1/4" />
      </div>
    </div>
    <div className="bg-amber-700/50 rounded-xl p-4">
      <div className="h-3 bg-amber-600 rounded w-full mb-2" />
      <div className="h-3 bg-amber-600 rounded w-4/5" />
    </div>
  </div>
)

function App() {
  const { user, signOut } = useUser()
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("Navigated to /customer-interface")
    console.log("Current logged-in user:", user)
  }, [user])

  async function handleLogout() {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const [notifications, setNotifications] = useState<Notification[]>([

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

  const navigationItems = [
    { name: 'HOME', route: '/', active: true, showWhenLoggedOut: true },
    { name: 'MENU', route: '/customer-interface/', active: false, showWhenLoggedOut: true },
    { name: 'ORDER', route: '/customer-interface/order', active: false, showWhenLoggedOut: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false, showWhenLoggedOut: false },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false, showWhenLoggedOut: false }
  ].filter(item => user || item.showWhenLoggedOut);

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
    <div className="min-h-screen min-w-[320px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
          className="fixed inset-0 glass-dark z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile/Tablet Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-gradient-to-b from-amber-800 to-amber-900 transform transition-transform duration-300 ease-out z-50 lg:hidden shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-yellow-400/20">
          <span className="text-yellow-400 text-xl font-bold">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-yellow-400 p-2 hover:bg-amber-700/50 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {navigationItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.route}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-5 py-3.5 rounded-xl text-lg font-semibold transition-all duration-300 ${item.active
                ? 'bg-yellow-400 text-amber-900 shadow-lg'
                : 'text-yellow-400 hover:bg-amber-700/50 hover:translate-x-2'
                }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay to close notification dropdown when clicking outside */}
      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="overflow-hidden">
        {/* Opening Hours Banner */}
        <section className={`px-3 sm:px-6 lg:px-10 pt-6 lg:pt-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-400/20 to-yellow-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative flex flex-col lg:flex-row items-center p-6 sm:p-8 lg:p-10">
              {/* Logo section */}
              <div className="w-40 h-40 sm:w-52 sm:h-52 lg:w-72 lg:h-72 flex-shrink-0 bg-[url('/angierens-logo.png')] bg-contain bg-center bg-no-repeat mb-6 lg:mb-0 animate-float" />

              {/* Content section */}
              <div className="w-full lg:ml-8 text-center lg:text-left">
                {/* Opening hours badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 px-6 py-3 rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-lg mb-6">
                  <Clock className="h-5 w-5" />
                  <span>OPENING HOURS: 9AM - 5PM Mon-Sun</span>
                </div>

                <div className="space-y-4 text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed">
                  <p className="font-medium">
                    We are open from <span className="text-amber-700 font-semibold">Monday to Saturday, 9:00 AM to 5:00 PM</span>. Our last call for orders is at 7:30 PM to make sure everything is prepared and delivered on time. Deliveries start at 10:00 AM, while pickup orders can be collected as early as 9:00 AM.
                  </p>
                  <p>
                    We are closed on Sundays to give our team a day of rest, and we may also pause operations on national holidays — please check our Facebook page for updates.
                  </p>
                  <p className="text-amber-800 font-semibold italic">
                    💡 Pro tip: Order ahead during peak hours, especially on holidays and weekends!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section ref={heroRef} className={`px-3 sm:px-6 lg:px-10 py-8 lg:py-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-3xl shadow-2xl overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-yellow-400 rounded-full" />
              <div className="absolute top-20 right-20 w-32 h-32 border border-yellow-400 rounded-full" />
              <div className="absolute bottom-10 left-1/4 w-16 h-16 border border-yellow-400 rounded-full" />
            </div>

            <div className="relative flex flex-col lg:flex-row items-center justify-between p-6 sm:p-10 lg:p-16">
              {/* Text content */}
              <div className="w-full lg:flex-1 text-center lg:text-left mb-8 lg:mb-0 z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                  Angieren's — where every bilao is a
                  <span className="text-yellow-400"> masterpiece</span>, crafted with
                  <span className="text-yellow-400"> heart</span>.
                </h1>

                <p className="text-amber-200 text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
                  Styled with art, and made to satisfy. Experience authentic Filipino home-cooked meals.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                  <Link
                    to="/customer-interface"
                    className="group inline-flex items-center justify-center gap-2 btn-primary text-amber-900 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl no-underline"
                  >
                    VIEW MENU
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Reviews button */}
                <button
                  onClick={() => setIsReviewsModalOpen(true)}
                  className="group inline-flex items-center gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 border border-white/20"
                >
                  <div className="text-left">
                    <span className="text-white font-bold text-lg block">Customer Reviews</span>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-yellow-400 ml-2 text-sm">5.0</span>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-white group-hover:translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Hero image */}
              <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] bg-[url('/rounded-bilao.png')] bg-contain bg-center bg-no-repeat flex-shrink-0 animate-float drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* Reviews Modal */}
        {isReviewsModalOpen && (
          <div className="fixed inset-0 glass-dark flex items-center justify-center z-50 p-4 animate-fade-in">
            <div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Customer Reviews</h2>
                  <p className="text-gray-500 mt-1">See what our customers are saying</p>
                </div>
                <button
                  onClick={() => setIsReviewsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
                  aria-label="Close reviews"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Filter Dropdown */}
              <div className="px-6 sm:px-8 pt-6 flex items-center gap-4">
                <span className="text-gray-600 font-medium">Filter by:</span>
                <div className="relative">
                  <select
                    value={reviewFilter}
                    onChange={(e) => setReviewFilter(e.target.value)}
                    className="appearance-none bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 px-5 py-2.5 pr-10 rounded-full font-semibold cursor-pointer shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    <option value="all">All Reviews</option>
                    <option value="delivery">Delivery</option>
                    <option value="staff">Staff</option>
                    <option value="food">Food</option>
                    <option value="service">Service</option>
                    <option value="overall">Overall</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-900 pointer-events-none" />
                </div>
              </div>

              {/* Reviews List */}
              <div className="p-6 sm:p-8 overflow-y-auto max-h-[55vh] custom-scrollbar">
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <ReviewCardSkeleton key={i} />)}
                  </div>
                ) : reviews.filter(review => reviewFilter === 'all' || review.review_type === reviewFilter).length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium text-lg">No reviews available for this category.</p>
                    <p className="text-gray-400 text-sm mt-2">Try selecting a different filter.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {reviews.filter(review => reviewFilter === 'all' || review.review_type === reviewFilter).map((review, index) => {
                      const order = review.order ? review.order[0] : null
                      const user = order?.users ? order.users[0] : null
                      const userName = user
                        ? `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim()
                        : 'Anonymous User'
                      return (
                        <div
                          key={review.review_id}
                          className="bg-gradient-to-br from-amber-800 to-amber-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full flex items-center justify-center text-amber-900 font-bold text-lg shadow-md">
                              {userName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{userName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-amber-200 text-sm bg-amber-700/50 px-2 py-0.5 rounded-full">
                                  {formatReviewType(review.review_type)}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-xl border border-white/10">
                            <p className="text-sm sm:text-base leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="text-center">
                  <p className="text-gray-600 font-medium">Thank you for your reviews! We appreciate your feedback. 💛</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Section */}
        <section className="py-12 sm:py-16 px-3 sm:px-6 lg:px-10">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
              FEATURED
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-4">Our Best Sellers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our most loved dishes, handpicked for their exceptional taste and quality</p>
          </div>

          <div className="bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            {isLoadingMenu ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <MenuCardSkeleton key={i} />)}
              </div>
            ) : featuredMenuItems.length === 0 ? (
              <div className="text-center py-16 text-white">
                <Sparkles className="h-16 w-16 mx-auto text-yellow-400/50 mb-4" />
                <p className="text-lg font-medium">No menu items available at the moment.</p>
                <p className="text-amber-200 mt-2">Please check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredMenuItems.map((item, index) => (
                  <div
                    key={item.menu_id}
                    className={`bg-white rounded-2xl p-6 text-center hover-lift card-hover opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}
                    style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl" />
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto object-cover relative z-10 shadow-lg ring-4 ring-yellow-400/30"
                      />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {getMenuDescription(item.name)}
                    </p>
                    <p className="font-bold text-2xl text-amber-700 mb-4">{formatPrice(item.price)}</p>
                    <Link
                      to="/customer-interface"
                      className="group inline-flex items-center justify-center gap-2 btn-primary text-amber-900 px-6 py-3 rounded-xl text-sm font-bold w-full shadow-md no-underline"
                    >
                      ORDER NOW
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* View full menu button */}
            <div className="text-center mt-8">
              <Link
                to="/customer-interface"
                className="inline-flex items-center gap-2 text-yellow-400 font-semibold hover:text-yellow-300 transition-colors group"
              >
                View Full Menu
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 sm:py-16 px-3 sm:px-6 lg:px-10 bg-white">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-4">Our Awesome Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Experience the difference with our commitment to excellence in every meal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Quality Food",
                description: "We use only the freshest ingredients to create delicious, high-standard meals that you'll love. Every dish is prepared with premium quality in mind.",
                src: "/home-page service-img/1.png",
                icon: Sparkles,
                color: "from-yellow-400 to-amber-500"
              },
              {
                title: "Cook like a Chef",
                description: "Expertly prepared with a touch of culinary artistry in every dish. Our skilled cooks bring restaurant-quality taste to your home.",
                src: "/home-page service-img/2.png",
                icon: ChefHat,
                color: "from-orange-400 to-red-500"
              },
              {
                title: "Made with Love",
                description: "Each meal is prepared with passion, care, and a deep love for cooking to bring joy to your dining experience. Taste the difference love makes.",
                src: "/home-page service-img/3.png",
                icon: HeartHandshake,
                color: "from-pink-400 to-rose-500"
              }
            ].map((service, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 text-center hover-lift opacity-0 ${isVisible ? 'animate-fade-in-up' : ''}`}
                style={{ animationDelay: `${0.4 + index * 0.15}s`, animationFillMode: 'forwards' }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${service.color} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg`}>
                  <service.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-10 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg">
                ABOUT US
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-4 pb-2">Our Story</h2>
            </div>

            <div className="bg-white rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl">
              <div className="space-y-6 text-gray-700 text-base sm:text-lg leading-relaxed">
                <p>
                  <span className="text-amber-700 font-bold text-xl">Angieren's Lutong Bahay Bulacan</span> began with a simple dream — to bring the comforting taste of home-cooked Filipino meals to every table. What started as a small family kitchen has grown into a beloved food spot in Bulacan, known for its warmth, authenticity, and heartfelt service.
                </p>

                <p>
                  Rooted in tradition, our dishes are inspired by recipes passed down through generations — <span className="text-amber-700 font-semibold">rich with flavor, history, and love</span>. Every meal we serve reflects our passion for Filipino cuisine and our commitment to quality ingredients, careful preparation, and that special "lutong bahay" feel.
                </p>

                <p>
                  At Angieren's, we believe that food is more than just sustenance — it's a way to bring people together, to celebrate culture, and to share joy. Whether you're a regular or visiting for the first time, we welcome you like family.
                </p>

                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 mt-8">
                  <p className="text-center text-xl sm:text-2xl font-bold text-amber-800 italic">
                    "Come taste the tradition. Come feel the love." 💛
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Support</h4>
                <ul className="space-y-3 text-sm">
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
      </main>
    </div>

  );
}