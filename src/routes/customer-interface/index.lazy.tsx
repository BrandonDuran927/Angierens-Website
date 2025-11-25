import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Type definitions
interface MenuItem {
  menu_id: string
  name: string
  price: number
  image_url: string | null
  category: string | null
  description: string
  inclusion: string | null
  is_available: boolean
  size: string | null
}

interface AddOnOption {
  add_on: string
  name: string
  price: number
}

interface AddOns {
  [key: string]: number
}

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

export const Route = createLazyFileRoute('/customer-interface/')({
  component: RouteComponent,
})

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
  const [notificationCount, setNotificationCount] = useState(3)
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [addOns, setAddOns] = useState<AddOns>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [addOnOptions, setAddOnOptions] = useState<AddOnOption[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>(['All Categories'])

  useEffect(() => {
    fetchMenuItems()
    // fetchAddOns()
    if (user) {
      fetchCartCount()
    }
  }, [user])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true })

      if (error) throw error

      if (data) {
        setMenuItems(data)

        // Extract unique categories
        const uniqueCategories = ['All Categories', ...new Set(data.map(item => item.category).filter(Boolean) as string[])]
        setCategories(uniqueCategories)
        console.log('Fetched menu items:', data)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  // const fetchAddOns = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('add_on')
  //       .select('*')
  //       .order('name', { ascending: true })

  //     if (error) throw error

  //     if (data) {
  //       setAddOnOptions(data)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching add-ons:', error)
  //   }
  // }

  const fetchCartCount = async () => {
    if (!user?.id) return

    try {
      // Get or create cart for user
      let { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('cart_id')
        .eq('customer_uid', user.id)
        .single()

      if (cartError && cartError.code !== 'PGRST116') {
        throw cartError
      }

      if (cartData) {
        // Count cart items
        const { data: itemsData, error: itemsError } = await supabase
          .from('cart_item')
          .select('cart_item_id')
          .eq('cart_id', cartData.cart_id)

        if (itemsError) throw itemsError

        setCartCount(itemsData?.length || 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }

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

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const openOrderModal = (item: MenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
    setOrderQuantity(1)
    setAddOns({})
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setOrderQuantity(1)
    setAddOns({})
  }

  const updateAddOnQuantity = (addOnId: string, quantity: number) => {
    setAddOns(prev => ({
      ...prev,
      [addOnId]: Math.max(0, quantity)
    }))
  }

  const calculateTotal = () => {
    if (!selectedItem) return 0

    const basePrice = Number(selectedItem.price) * orderQuantity
    const addOnPrice = Object.entries(addOns).reduce((total, [addOnId, quantity]) => {
      const addOn = addOnOptions.find(ao => ao.add_on === addOnId)
      return total + (addOn ? Number(addOn.price) * (quantity as number) : 0)
    }, 0)

    return basePrice + addOnPrice
  }

  const addToCart = async () => {
    if (!user?.id) {
      alert('Please sign in to add items to cart')
      navigate({ to: '/login' })
      return
    }

    if (!selectedItem) return

    try {
      // Get or create cart for user
      let { data: cartData, error: cartError } = await supabase
        .from('cart')
        .select('cart_id')
        .eq('customer_uid', user.id)
        .single()

      if (cartError && cartError.code === 'PGRST116') {
        // Cart doesn't exist, create one
        const { data: newCart, error: createError } = await supabase
          .from('cart')
          .insert([{
            customer_uid: user.id,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) throw createError
        cartData = newCart
      } else if (cartError) {
        throw cartError
      }

      if (!cartData) throw new Error('Failed to get or create cart')

      // Add cart item
      const { data: cartItem, error: itemError } = await supabase
        .from('cart_item')
        .insert([{
          cart_id: cartData.cart_id,
          menu_id: selectedItem.menu_id,
          quantity: orderQuantity,
          price: Number(selectedItem.price)
        }])
        .select()
        .single()

      if (itemError) throw itemError

      // Add cart item add-ons if any
      const addOnEntries = Object.entries(addOns).filter(([_, qty]) => qty > 0)

      if (addOnEntries.length > 0) {
        const addOnInserts = addOnEntries.map(([addOnId, quantity]) => {
          const addOn = addOnOptions.find(ao => ao.add_on === addOnId)
          return {
            cart_item_id: cartItem.cart_item_id,
            add_on_id: addOnId,
            quantity: quantity,
            price: addOn ? Number(addOn.price) : 0
          }
        })

        const { error: addOnError } = await supabase
          .from('cart_item_add_on')
          .insert(addOnInserts)

        if (addOnError) throw addOnError
      }

      // Update cart count
      await fetchCartCount()

      closeModal()
      alert('Item added to cart successfully!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    }
  }

  // Parse inclusions from text to array
  const parseInclusions = (inclusion: string | null): string[] => {
    if (!inclusion) return []
    // Split by newline or comma, filter out empty strings
    return inclusion.split(/[\n,]/).map(item => item.trim()).filter(Boolean)
  }

  // Navigation items with their corresponding routes
  const navigationItems = [
    { name: 'HOME', route: '/', active: false, showWhenLoggedOut: true },
    { name: 'MENU', route: '/customer-interface/', active: true, showWhenLoggedOut: true },
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

  // Add this helper function near the top of your component, after the state declarations
  const getImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/api/placeholder/300/200'

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // Construct the Supabase storage URL
    // Encode the filename to handle spaces and special characters
    const encodedFileName = encodeURIComponent(imageUrl)
    return `https://tvuawpgcpmqhsmwbwypy.supabase.co/storage/v1/object/public/menu-images/${encodedFileName}`
  }

  return (
    <div className="min-h-screen min-w-[320px] bg-gradient-to-br from-amber-50 to-orange-100">
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
              {user && (
                <Link
                  to="/login"
                  className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
                >
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
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
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification, index) => (
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
                          ))
                        )}
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

              )}

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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 mb-[50px]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Explore Our Best Menu!</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Discover our authentic Filipino dishes made with love</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72 lg:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search food"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="relative inline-block w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] bg-yellow-400 text-black px-3 sm:px-4 md:px-6 py-2 sm:py-3 pr-8 sm:pr-10 rounded-lg font-semibold appearance-none cursor-pointer shadow-md text-sm sm:text-base"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4 sm:h-5 sm:w-5 pointer-events-none" />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
              <p className="text-gray-700 font-medium">Processing...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              {filteredItems.map((item) => {
                const inclusions = parseInclusions(item.inclusion)
                return (
                  <div key={item.menu_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* Price Tag */}
                    <div className="relative">
                      <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-base sm:text-lg z-10">
                        ₱ {Number(item.price).toLocaleString()}
                      </div>

                      {/* Food Image Container */}
                      <div className="relative h-48 sm:h-64 overflow-hidden">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{item.name}</h3>

                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}

                      {/* Inclusions */}
                      {inclusions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Inclusion:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                            {inclusions.map((inclusion, index) => (
                              <p key={index}>{inclusion}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Button */}
                      <button
                        onClick={() => openOrderModal(item)}
                        className="w-full bg-yellow-400 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors duration-200 shadow-md text-sm sm:text-base"
                      >
                        ORDER NOW
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* No Results */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found matching your search.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Order Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header with close button */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">{selectedItem.description}</p>

              {/* Inclusions */}
              {parseInclusions(selectedItem.inclusion).length > 0 && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">What's Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parseInclusions(selectedItem.inclusion).map((inclusion: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700 text-sm">{inclusion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={orderQuantity <= 1}
                  >
                    <Minus className="h-4 w-4 text-gray-700" />
                  </button>
                  <span className="text-2xl font-bold w-16 text-center text-gray-900">{orderQuantity}</span>
                  <button
                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                    className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer - sticky at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₱{calculateTotal().toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={addToCart}
                  className="w-full sm:w-auto bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 active:scale-95 transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer id="contact" className="py-6 sm:py-8" style={{ backgroundColor: "#F9ECD9" }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Angieren's Lutong Bahay</h3>
              <p className="text-gray-600 text-sm">
                Authentic Filipino home-cooked meals delivered to your doorstep.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link></li>
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
  )
}