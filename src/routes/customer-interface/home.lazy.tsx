import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Bell, Heart, Star, MessageSquare, X, Menu } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useNavigate } from '@tanstack/react-router'

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
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(3);
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

  // Sample reviews data
  const reviews = [
    {
      id: 1,
      name: "Joshua Rivera",
      type: "Delivery Review",
      rating: 5,
      date: "May 14, 2025",
      time: "11:20 AM",
      comment: "Delivery was on time and the food arrived safely packed. There was just a slight delay due to traffic, but I appreciated being able to track the rider on the website.",
      likes: 20
    },
    {
      id: 2,
      name: "Camille Santos",
      type: "Staff Review",
      rating: 5,
      date: "May 13, 2025",
      time: "4:50 PM",
      comment: "The staff was friendly and accommodating when I had to update my order. They responded quickly and made sure everything was correct before sending it out.",
      likes: 15
    },
    {
      id: 3,
      name: "Maria Dela Cruz",
      type: "Food Review",
      rating: 5,
      date: "May 12, 2025",
      time: "2:30 PM",
      comment: "Amazing bilao! The food was fresh, hot, and delicious. Perfect for our family gathering. Will definitely order again!",
      likes: 25
    },
    {
      id: 4,
      name: "Juan Mendoza",
      type: "Service Review",
      rating: 4,
      date: "May 11, 2025",
      time: "6:15 PM",
      comment: "Great service and authentic Filipino taste. The portions were generous and worth the price. Only minor issue was the packaging could be improved.",
      likes: 12
    },
    {
      id: 5,
      name: "Ana Reyes",
      type: "Overall Experience",
      rating: 5,
      date: "May 10, 2025",
      time: "12:45 PM",
      comment: "Exceeded our expectations! The food reminded me of my grandmother's cooking. The bilao presentation was beautiful and the taste was incredible.",
      likes: 30
    }
  ];

  // Navigation items with their corresponding routes
  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: true },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
  ];


  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`text-xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

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
                    to="/"
                    className="bg-white text-amber-800 px-6 py-2 rounded font-semibold hover:bg-gray-100 no-underline"
                  >
                    VIEW MENU
                  </Link>
                  <Link
                    to="/"
                    className="bg-yellow-400 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-500 no-underline"
                  >
                    PLACE ORDER NOW
                  </Link>
                </div>

                <button
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
                    <select className="bg-yellow-400 text-black px-4 py-2 pr-10 rounded font-semibold appearance-none cursor-pointer">
                      <option>All Reviews</option>
                      <option>Delivery Reviews</option>
                      <option>Staff Reviews</option>
                      <option>Food Reviews</option>
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
                  <div className="space-y-4 sm:space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-amber-800 rounded-2xl sm:rounded-4xl p-4 sm:p-6 text-white">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="font-bold text-base sm:text-lg">{review.name}</h3>
                            <p className="text-amber-200 text-sm">{review.type}: {renderStars(review.rating)}</p>
                          </div>
                          <div className="text-left sm:text-right text-sm text-amber-200">
                            <p>{review.date}</p>
                            <p>{review.time}</p>
                          </div>
                        </div>

                        <div className="bg-yellow-400 text-black p-3 sm:p-4 rounded-lg mb-4">
                          <p className="text-sm leading-relaxed">{review.comment}</p>
                        </div>

                        <div className="flex items-center justify-end">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">👍</span>
                            <span className="text-sm">{review.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { title: "3 in 1 Bilao Bilao (Panlasang)", price: "₱999", src: "/home-page menu-img/1.png" },
                  { title: "4 in 1 Bilao Bilao (Panlasang)", price: "₱1,299", src: "/home-page menu-img/2.png" },
                  { title: "5 in 1 Bilao Bilao (Panlasang)", price: "₱1,599", src: "/home-page menu-img/3.png" },
                  { title: "6 in 1 Bilao Bilao (Panlasang)", price: "₱1,899", src: "/home-page menu-img/4.png" }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 text-center">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      A hearty and flavorful blend of authentic Filipino dishes, perfectly portioned for sharing and celebrating with family and friends.
                    </p>
                    <p className="font-bold text-lg mb-3">{item.price}</p>
                    <Link
                      to="/"
                      className="bg-yellow-400 text-black px-4 py-2 rounded text-sm font-semibold hover:bg-yellow-500 w-full block text-center no-underline"
                    >
                      ORDER NOW
                    </Link>
                  </div>
                ))}
              </div>
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