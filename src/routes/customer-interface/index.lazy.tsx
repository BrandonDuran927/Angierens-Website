import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu, ArrowRight, Tag } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { AlertModal, type AlertType } from '@/components/AlertModal'
import { CustomerFooter } from '@/components/CustomerFooter'


// Type definitions
interface MenuItem {
  menu_id: string
  name: string
  price: string
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

  const [showTCModal, setShowTCModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
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
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOrderAddOnsModalOpen, setIsOrderAddOnsModalOpen] = useState(false)
  const [orderAddOns, setOrderAddOns] = useState<AddOns>({})
  const [isVisible, setIsVisible] = useState(false)
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    message: string
    type: AlertType
    title?: string
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  })

  const showAlert = (message: string, type: AlertType = 'info', title?: string) => {
    setAlertModal({ isOpen: true, message, type, title })
  }

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    fetchMenuItems()
    fetchAddOns()
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

  // Helper function to parse prices from string
  const parsePrices = (priceString: string): number[] => {
    if (!priceString) return []
    return priceString.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p))
  }

  // Helper function to get available sizes
  const getAvailableSizes = (item: MenuItem): string[] => {
    const prices = parsePrices(item.price)

    if (!item.size || item.size === 'NULL') {
      // If no size specified, return array with empty string for single price items
      return prices.length > 0 ? [''] : []
    }

    const sizes = item.size.split(',').map(s => s.trim())
    // Return only as many sizes as there are prices
    return sizes.slice(0, prices.length)
  }

  // Helper function to get price for selected size
  const getPriceForSize = (item: MenuItem, size: string = ''): number => {
    const prices = parsePrices(item.price)
    const sizes = getAvailableSizes(item)

    if (sizes.length === 0) return 0

    const sizeIndex = size ? sizes.indexOf(size) : 0
    return prices[sizeIndex >= 0 ? sizeIndex : 0] || prices[0] || 0
  }

  // Helper function to get display price (lowest price for items with multiple prices)
  const getDisplayPrice = (item: MenuItem): string => {
    const prices = parsePrices(item.price)

    if (prices.length === 0) return '0.00'
    if (prices.length === 1) return prices[0].toFixed(2)

    // For multiple prices, show range
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    return `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}`
  }

  const openOrderAddOnsModal = () => {
    if (!user?.id) {
      showAlert('Please sign in to place an order', 'warning')
      navigate({ to: '/login' })
      return
    }

    if (!selectedItem) return

    // Open add-ons modal instead of directly ordering
    setIsOrderAddOnsModalOpen(true)
    setOrderAddOns({})
  }

  const closeOrderAddOnsModal = () => {
    setIsOrderAddOnsModalOpen(false)
    setOrderAddOns({})
  }

  const updateOrderAddOnQuantity = (addOnId: string, quantity: number) => {
    setOrderAddOns(prev => ({
      ...prev,
      [addOnId]: Math.max(0, quantity)
    }))
  }

  const orderNow = async () => {
    if (isProcessing) return

    if (!user?.id) {
      showAlert('Please sign in to place an order', 'warning')
      navigate({ to: '/login' })
      return
    }

    if (!selectedItem) return

    const itemPrice = getPriceForSize(selectedItem, selectedSize)

    setIsProcessing(true)
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

      // For "Order Now", store the order details in session storage to bypass cart
      // This way we don't create or modify cart items
      const orderDetails = {
        menu_id: selectedItem.menu_id,
        name: selectedItem.name,
        description: selectedItem.description,
        image_url: selectedItem.image_url,
        quantity: orderQuantity,
        price: itemPrice,
        size: selectedSize,
        addOns: Object.entries(orderAddOns)
          .filter(([_, qty]) => qty > 0)
          .map(([addOnId, quantity]) => {
            const addOn = addOnOptions.find(ao => ao.add_on === addOnId)
            return {
              add_on_id: addOnId,
              name: addOn?.name || '',
              quantity: quantity,
              price: addOn ? Number(addOn.price) : 0
            }
          })
      }

      // Store in session storage
      sessionStorage.setItem('directOrder', JSON.stringify(orderDetails))

      // Navigate directly to payment without cart item ID
      closeModal()
      closeOrderAddOnsModal()
      navigate({
        to: '/customer-interface/payment',
        search: { directOrder: 'true' }
      } as any)
    } catch (error) {
      console.error('Error processing order:', error)
      showAlert('Failed to process order. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const fetchAddOns = async () => {
    try {
      const { data, error } = await supabase
        .from('add_on')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      if (data) {
        setAddOnOptions(data)
      }
    } catch (error) {
      console.error('Error fetching add-ons:', error)
    }
  }

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
    // Set default size to first available size
    const sizes = getAvailableSizes(item)
    setSelectedSize(sizes[0] || '')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    setOrderQuantity(1)
    setAddOns({})
    setSelectedSize('')
  }

  const calculateTotal = () => {
    if (!selectedItem) return 0

    const itemPrice = getPriceForSize(selectedItem, selectedSize)
    const basePrice = itemPrice * orderQuantity

    const addOnPrice = Object.entries(addOns).reduce((total, [addOnId, quantity]) => {
      const addOn = addOnOptions.find(ao => ao.add_on === addOnId)
      return total + (addOn ? Number(addOn.price) * (quantity as number) : 0)
    }, 0)

    return basePrice + addOnPrice
  }

  const addToCart = async () => {
    if (isProcessing) return // Prevent duplicate clicks

    if (!user?.id) {
      showAlert('Please sign in to add items to cart', 'warning')
      navigate({ to: '/login' })
      return
    }

    if (!selectedItem) return

    const itemPrice = getPriceForSize(selectedItem, selectedSize)

    setIsProcessing(true)
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

      // Check if the same item with the same price already exists in the cart
      const { data: existingCartItem, error: existingError } = await supabase
        .from('cart_item')
        .select('cart_item_id, quantity')
        .eq('cart_id', cartData.cart_id)
        .eq('menu_id', selectedItem.menu_id)
        .eq('price', itemPrice)
        .eq('size', selectedSize || '')
        .single()

      if (existingError && existingError.code !== 'PGRST116') {
        throw existingError
      }

      if (existingCartItem) {
        // Item already exists, update the quantity
        const newQuantity = existingCartItem.quantity + orderQuantity
        const { error: updateError } = await supabase
          .from('cart_item')
          .update({ quantity: newQuantity })
          .eq('cart_item_id', existingCartItem.cart_item_id)

        if (updateError) throw updateError
      } else {
        // Item doesn't exist, create a new cart item
        const { data: cartItem, error: itemError } = await supabase
          .from('cart_item')
          .insert([{
            cart_id: cartData.cart_id,
            menu_id: selectedItem.menu_id,
            quantity: orderQuantity,
            price: itemPrice,
            size: selectedSize || null
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
      }

      // Update cart count
      await fetchCartCount()

      closeModal()
      showAlert('Item added to cart successfully!', 'success')
    } catch (error) {
      console.error('Error adding to cart:', error)
      showAlert('Failed to add item to cart. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-amber-200"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-amber-600 animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-amber-900 font-semibold text-lg">Please wait...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Menu Items Grid with max height and scroll */}
            <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                {filteredItems.map((item) => {
                  const inclusions = parseInclusions(item.inclusion)
                  return (
                    <div key={item.menu_id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      {/* Price Tag */}
                      <div className="relative">
                        <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-base sm:text-lg z-10">
                          ₱ {getDisplayPrice(item)}
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
            </div>
          </>
        )}
      </main>

      {/* Order Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header with close button */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
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

              {/* Size selector - only show if there are multiple sizes */}
              {getAvailableSizes(selectedItem).length > 1 && getAvailableSizes(selectedItem)[0] !== '' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {getAvailableSizes(selectedItem).map((size) => {
                      const price = getPriceForSize(selectedItem, size)
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${selectedSize === size
                            ? 'border-yellow-400 bg-yellow-50 text-gray-900'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                        >
                          <div className="font-semibold">{size}</div>
                          <div className="text-sm text-gray-600">₱{price.toFixed(2)}</div>
                        </button>
                      )
                    })}
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
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₱{calculateTotal().toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={addToCart}
                    disabled={isProcessing}
                    className="flex-1 bg-white text-[#964B00] border-2 border-[#964B00] px-6 py-4 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Add To Cart'}
                  </button>
                  <button
                    onClick={openOrderAddOnsModal}
                    disabled={isProcessing}
                    className="flex-1 bg-yellow-400 text-black px-6 py-4 rounded-xl font-bold hover:bg-yellow-500 active:scale-95 transition-all duration-200 shadow-md hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {isProcessing ? 'Processing...' : 'Order Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Add-ons Modal */}
      {isOrderAddOnsModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-2 rounded-xl">
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    Customize Your Order
                  </h2>
                  <p className="text-gray-600">Add some extras to make your meal even better!</p>
                </div>
                <button
                  onClick={closeOrderAddOnsModal}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Selected Item Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-5 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-yellow-600" />
                  Your Selected Item
                </h3>
                <div className="flex items-center gap-4 bg-white p-3 rounded-xl">
                  <img
                    src={getImageUrl(selectedItem.image_url)}
                    alt={selectedItem.name}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{selectedItem.name}</h4>
                    <p className="text-sm text-gray-600">
                      Qty: {orderQuantity} × ₱{getPriceForSize(selectedItem, selectedSize).toFixed(2)}
                      {selectedSize && ` (${selectedSize})`}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    ₱{(getPriceForSize(selectedItem, selectedSize) * orderQuantity).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Add-ons Section */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-yellow-600" />
                  Available Add-ons
                </h4>
                <p className="text-sm text-gray-600 mb-4">Enhance your meal with these delicious extras</p>
                {addOnOptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">No add-ons available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addOnOptions.map((addOn) => (
                      <div key={addOn.add_on} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-yellow-400">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-lg text-sm font-bold mb-2">
                              {addOn.name}
                            </span>
                            <p className="text-sm font-bold text-gray-900">₱{Number(addOn.price).toFixed(2)} each</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-3 bg-white rounded-lg p-2">
                          <button
                            onClick={() => updateOrderAddOnQuantity(addOn.add_on, (orderAddOns[addOn.add_on] || 0) - 1)}
                            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-5 w-5 text-gray-700" />
                          </button>
                          <span className="w-12 text-center font-bold text-lg text-gray-900">
                            {orderAddOns[addOn.add_on] || 0}
                          </span>
                          <button
                            onClick={() => updateOrderAddOnQuantity(addOn.add_on, (orderAddOns[addOn.add_on] || 0) + 1)}
                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 flex items-center justify-center transition-all shadow-sm"
                          >
                            <Plus className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total and Buttons */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-gray-300">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 px-6 py-4 rounded-2xl border-2 border-yellow-400 w-full lg:w-auto">
                  <div className="text-sm text-gray-600 mb-1">Grand Total</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    ₱{(getPriceForSize(selectedItem, selectedSize) * orderQuantity + Object.entries(orderAddOns).reduce((sum, [addOnId, qty]) => {
                      const addOn = addOnOptions.find(a => a.add_on === addOnId);
                      return sum + (addOn ? Number(addOn.price) * qty : 0);
                    }, 0)).toFixed(2)}
                  </div>
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <button
                    onClick={closeOrderAddOnsModal}
                    className="flex-1 lg:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-2xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={orderNow}
                    disabled={isProcessing}
                    className="flex-1 lg:flex-none bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer, Privacy Policy, and Terms & Conditions */}
      <CustomerFooter />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}