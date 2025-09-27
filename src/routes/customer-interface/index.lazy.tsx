import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu } from 'lucide-react'
import { Fragment } from 'react'

// Type definitions
interface MenuItem {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  inclusions: string[],
  src: string
}

interface AddOnOption {
  id: string
  name: string
  price: number
  unit: string
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(3)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [addOns, setAddOns] = useState<AddOns>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const categories = [
    'All Categories',
    'Bilao Mix',
    'Baked Mac',
    'Special Dishes',
    'Beverages',
    'Desserts'
  ]

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

  const addOnOptions: AddOnOption[] = [
    { id: 'puto', name: 'Puto', price: 250, unit: '20pcs' },
    { id: 'sapin-sapin', name: 'Sapin-sapin', price: 150, unit: '10pcs' },
    { id: 'kutsinta', name: 'Kutsinta', price: 200, unit: '15pcs' },
    { id: 'biko', name: 'Biko', price: 180, unit: '1 tray' },
    { id: 'leche-flan', name: 'Leche Flan', price: 300, unit: '1 whole' },
    { id: 'ube-halaya', name: 'Ube Halaya', price: 250, unit: '1 tray' }
  ]

  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: '5 in 1 Mix in Bilao (PALABOK)',
      price: 1850,
      image: '/api/placeholder/300/200',
      category: 'Bilao Mix',
      description: 'A hearty bilao with classic palabok, crispy pork shanghai, juicy pork BBQ, and cheesy cordon bleu — perfect for any celebration!',
      inclusions: [
        '40 pcs. Pork Shanghai',
        '12 pcs. Pork BBQ',
        '30 pcs. Pork Shanghai',
        '30 slices Cordon Bleu'
      ],
      src: "/public/menu-page img/pancit malabonbon.png"
    },
    {
      id: 2,
      name: '5 in 1 Mix in Bilao (SPAGHETTI)',
      price: 1900,
      image: '/api/placeholder/300/200',
      category: 'Bilao Mix',
      description: 'Delicious spaghetti with our signature meat sauce, served with crispy sides for a complete meal experience.',
      inclusions: [
        '40 pcs. Pork Shanghai',
        '12 pcs. Pork BBQ',
        '30 pcs. Pork Shanghai',
        '30 slices Cordon Bleu'
      ],
      src: "/public/menu-page img/spaghetto.png"
    },
    {
      id: 3,
      name: '5 in 1 Mix in Bilao (VALENCIANA)',
      price: 1900,
      image: '/api/placeholder/300/200',
      category: 'Bilao Mix',
      description: 'Traditional valenciana rice dish with mixed meats and vegetables, served with delicious side dishes.',
      inclusions: [
        '40 pcs. Pork Shanghai',
        '12 pcs. Pork BBQ',
        '30 pcs. Pork Shanghai',
        '30 slices Cordon Bleu'
      ],
      src: "/public/menu-page img/valencia.png"
    },
    {
      id: 4,
      name: '5 in 1 Mix in Bilao (SOTANGHON GUISADO)',
      price: 2000,
      image: '/api/placeholder/300/200',
      category: 'Bilao Mix',
      description: 'Savory sotanghon noodles with mixed vegetables and meat, perfect for family gatherings.',
      inclusions: [
        '40 pcs. Pork Shanghai',
        '12 pcs. Pork BBQ',
        '30 pcs. Pork Shanghai',
        '30 slices Cordon Bleu'
      ],
      src: "/public/menu-page img/sotanghonney.png"
    },
    {
      id: 5,
      name: '5 in 1 BAKEDMAC',
      price: 2100,
      image: '/api/placeholder/300/200',
      category: 'Baked Mac',
      description: 'Creamy baked macaroni with cheese and meat, served with complementary Filipino favorites.',
      inclusions: [
        '40 pcs. Pork Shanghai',
        '12 pcs. Pork BBQ',
        '30 pcs. Buttered Puto',
        '30 slices Cordon Bleu'
      ],
      src: "/public/menu-page img/baked mac.png"
    },
    {
      id: 6,
      name: '5 in 1 Mix in Bilao (SPECIAL PANSIT MALABON)',
      price: 1900,
      image: '/api/placeholder/300/200',
      category: 'Special Dishes',
      description: 'Authentic Pansit Malabon with thick rice noodles, seafood, and special sauce, served with sides.',
      inclusions: [
        '40 pcs. Pork Shanghai',
        '12 pcs. Pork BBQ',
        '30 pcs. Pork Shanghai',
        '30 slices Cordon Bleu'
      ],
      src: "/public/menu-page img/special.png"
    }
  ]

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

    const basePrice = selectedItem.price * orderQuantity
    const addOnPrice = Object.entries(addOns).reduce((total, [addOnId, quantity]) => {
      const addOn = addOnOptions.find(ao => ao.id === addOnId)
      return total + (addOn ? addOn.price * (quantity as number) : 0)
    }, 0)

    return basePrice + addOnPrice
  }

  const addToCart = () => {
    setCartCount(prev => prev + 1)
    closeModal()
    // Add your cart logic here
  }

  // Navigation items with their corresponding routes
  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: false },
    { name: 'MENU', route: '/customer-interface/', active: true },
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
                <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                  <span className="hidden sm:inline">LOG OUT</span>
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 mb-[50px]">
        {/* Page Header - Better tablet layout */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Explore Our Best Menu!</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Discover our authentic Filipino dishes made with love</p>
          </div>

          {/* Search Bar - Better tablet sizing */}
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

        {/* Category Filter - Better tablet sizing */}
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

        {/* Menu Items Grid - Better tablet grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Price Tag */}
              <div className="relative">
                <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-base sm:text-lg z-10">
                  ₱ {item.price.toLocaleString()}
                </div>

                {/* Food Image Container */}
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Optional overlay for better price tag visibility */}
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{item.name}</h3>

                {/* Inclusions */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Inclusion:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                    {item.inclusions.map((inclusion, index) => (
                      <p key={index}>{inclusion}</p>
                    ))}
                  </div>
                </div>

                {/* Order Button */}
                <button
                  onClick={() => openOrderModal(item)}
                  className="w-full bg-yellow-400 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors duration-200 shadow-md text-sm sm:text-base"
                >
                  ORDER NOW
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
          </div>
        )}
      </main>

      {/* Order Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Item details */}
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{selectedItem.name}</h2>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{selectedItem.description}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 p-2 flex-shrink-0"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Inclusion:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedItem.inclusions.map((inclusion: string, index: number) => (
                      <p key={index} className="text-gray-600 text-sm">{inclusion}</p>
                    ))}
                  </div>
                </div>

                {/* Quantity selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{orderQuantity}</span>
                    <button
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total and Add to Cart */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t gap-4">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 text-center sm:text-left">
                    Total: ₱{calculateTotal().toLocaleString()}
                  </div>
                  <button
                    onClick={addToCart}
                    className="w-full sm:w-auto bg-yellow-400 text-black px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors duration-200 shadow-md"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>

              {/* Right side - Add-ons - Full width on mobile */}
              <div className="w-full lg:w-80 bg-gray-50 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Add-ons:</h3>
                <div className="space-y-3">
                  {addOnOptions.map((addOn) => (
                    <div key={addOn.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <button className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                          {addOn.name}
                        </button>
                        <div className="text-xs text-gray-600 mt-1">
                          ₱{addOn.price} / {addOn.unit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateAddOnQuantity(addOn.id, (addOns[addOn.id] || 0) - 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{addOns[addOn.id] || 0}</span>
                        <button
                          onClick={() => updateAddOnQuantity(addOn.id, (addOns[addOn.id] || 0) + 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
  )
}