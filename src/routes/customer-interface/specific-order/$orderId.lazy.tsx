import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Package, CreditCard, Clock, ShoppingBag, Star, X, Menu, ShoppingCart, Bell, MessageSquare, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createLazyFileRoute('/customer-interface/specific-order/$orderId')({
  component: SpecificOrder,
})

// Navigation items for header
const navigationItems = [
  { name: 'HOME', route: '/customer-interface/home', active: false },
  { name: 'MENU', route: '/customer-interface/', active: false },
  { name: 'ORDER', route: '/customer-interface/order', active: false },
  { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
  { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
]

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

interface OrderItem {
  id: string
  name: string
  image: string
  quantity: number
  price: number
  inclusions: string[]
  addOns: string
}

interface OrderData {
  orderId: string
  orderNumber: string
  status: string
  orderPlacedDate: string
  paymentConfirmedDate: string
  // queuingDate: string
  // preparingDate: string
  // readyDate: string
  status_updated_at: string
  completedDate: string
  deliveryOption: string
  fulfillmentType: string
  isPaid: boolean
  paymentMethod: string
  pickDate: string
  pickTime: string
  customer: {
    name: string
    phone: string
    address: string
  }
  items: OrderItem[]
  pricing: {
    subtotal: number
    deliveryFee: number
    total: number
  }
  specialInstructions: string
  proofOfPaymentUrl: string | null
}

function SpecificOrder() {
  const { user } = useUser()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundStep, setRefundStep] = useState(1)
  const [selectedReason, setSelectedReason] = useState('')
  const [gcashNumber, setGcashNumber] = useState('')
  const [confirmGcashNumber, setConfirmGcashNumber] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showViewReceiptModal, setShowViewReceiptModal] = useState(false)

  const { orderId } = Route.useParams()

  const cartCount = 3
  const notificationCount = 1

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

  // Fetch order data
  useEffect(() => {
    if (orderId && user) {
      fetchOrderData()
    }
  }, [orderId, user])

  const fetchOrderData = async () => {
    setIsLoading(true)
    try {
      const { data: orderDataRaw, error: orderError } = await supabase
        .from('order')
        .select(`
          *,
          payment (*),
          schedule (*),
          order_item (
            *,
            menu (*),
            order_item_add_on (
              *,
              add_on (*)
            )
          ),
          delivery(*)
        `)
        .eq('order_id', orderId)
        .single()

      if (orderError) throw orderError

      // Get customer info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_uid', orderDataRaw.customer_uid)
        .single()

      if (userError) throw userError

      // Transform the data
      const items: OrderItem[] = orderDataRaw.order_item.map((item: any) => {
        const inclusions = item.menu?.inclusion
          ? item.menu.inclusion.split(',').map((i: string) => i.trim())
          : []

        const addOns: string[] = []
        item.order_item_add_on?.forEach((addOn: any) => {
          if (addOn.add_on?.name) {
            addOns.push(`${addOn.add_on.name} (${addOn.quantity})`)
          }
        })

        return {
          id: item.order_item_id,
          name: item.menu?.name || 'Unknown Item',
          image: item.menu?.image_url || '/placeholder.png',
          quantity: Number(item.quantity),
          price: Number(item.menu?.price || 0),
          inclusions: inclusions,
          addOns: addOns.length > 0 ? addOns.join(', ') : 'None'
        }
      })

      // Format dates
      const formatDate = (dateString: string | null) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }

      // Calculate delivery fee (you can adjust this logic)
      const deliveryFee = orderDataRaw.delivery.delivery_fee
      const subtotal = Number(orderDataRaw.total_price) - deliveryFee

      const transformed: OrderData = {
        orderId: orderDataRaw.order_id,
        orderNumber: `#${String(orderDataRaw.order_number).padStart(2, '0')}`,
        status: orderDataRaw.order_status,
        orderPlacedDate: formatDate(orderDataRaw.created_at),
        paymentConfirmedDate: orderDataRaw.payment?.is_paid && orderDataRaw.payment?.payment_date ? formatDate(orderDataRaw.payment.payment_date) : '',
        status_updated_at: formatDate(orderDataRaw.status_updated_at),
        completedDate: orderDataRaw.order_status === 'Completed' ? formatDate(orderDataRaw.completed_date) : '',
        deliveryOption: orderDataRaw.order_type || 'Delivery',
        fulfillmentType: orderDataRaw.fulfillment_type || 'Current Day',
        isPaid: orderDataRaw.payment?.is_paid || false,
        paymentMethod: orderDataRaw.payment?.payment_method || 'GCash',
        pickDate: orderDataRaw.schedule?.schedule_date
          ? new Date(orderDataRaw.schedule.schedule_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Not scheduled',
        pickTime: orderDataRaw.schedule?.schedule_time || 'Not scheduled',
        customer: {
          name: `${userData.first_name} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name}`,
          phone: userData.phone_number || 'N/A',
          address: orderDataRaw.delivery_address || 'N/A'
        },
        items: items,
        pricing: {
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: Number(orderDataRaw.total_price)
        },
        specialInstructions: orderDataRaw.special_instructions || 'None',
        proofOfPaymentUrl: orderDataRaw.payment?.proof_of_payment_url || null
      }

      console.log('Transformed Order Data:', transformed)
      setOrderData(transformed)
    } catch (error) {
      console.error('Error fetching order data:', error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const getProgressSteps = () => {
    if (!orderData) return []

    const steps = [
      {
        key: 'placed',
        label: 'Order Placed',
        date: orderData.orderPlacedDate,
        icon: Package,
        completed: true
      }
    ]

    if (orderData.status === 'Cancelled') {
      steps.push({
        key: 'cancelled',
        label: 'Cancelled',
        date: orderData.status_updated_at,
        icon: CreditCard,
        completed: true
      })
    } else {
      steps.push({

        key: 'payment',
        label: orderData.paymentConfirmedDate ? 'Payment Confirmed' : 'For Payment',
        date: orderData.paymentConfirmedDate,
        icon: CreditCard,
        completed: orderData.status !== 'Pending'
      })

    }

    // Third step - Dynamic based on order status
    if (orderData.status === 'Queueing') {
      steps.push({
        key: 'queuing',
        label: 'Queueing',
        date: orderData.status_updated_at,
        icon: Clock,
        completed: true
      })
    } else if (orderData.status === 'Preparing') {
      steps.push({
        key: 'preparing',
        label: 'Preparing',
        date: orderData.status_updated_at,
        icon: ShoppingBag,
        completed: true
      })
    } else if (orderData.status === 'Cooking') {
      steps.push({
        key: 'cooking',
        label: 'Cooking',
        date: orderData.status_updated_at,
        icon: ShoppingBag,
        completed: true
      })
    } else if (orderData.status === 'Ready' || orderData.status === 'On Delivery' || orderData.status === 'Claim Order' || orderData.status === 'Completed') {
      steps.push({
        key: 'ready',
        label: 'Ready',
        date: orderData.status_updated_at,
        icon: Star,
        completed: true
      })
    }


    if (orderData.status === 'Refunding' || orderData.status === 'Refund') {
      steps.push({
        key: 'refund',
        label: orderData.status === 'Refund' ? 'Refunded' : 'Refunding',
        date: orderData.status_updated_at,
        icon: ShoppingBag,
        completed: true
      })
    } else if (orderData.deliveryOption === 'Delivery') {
      steps.push({
        key: 'on-delivery',
        label: orderData.status === 'Claim Order' || orderData.status === 'Completed' ? 'On Delivered' : 'On Delivery',
        date: orderData.isPaid ? orderData.status_updated_at : '',
        icon: ShoppingBag,
        completed: orderData.isPaid ? true : false
      })
    }

    steps.push({
      key: 'order-completed',
      label: 'Order Complete',
      date: orderData.completedDate,
      icon: Package,
      completed: orderData.completedDate ? true : false
    })

    steps.push({
      key: 'rate',
      label: 'Rate Order',
      date: '',
      icon: Star,
      completed: orderData.status === 'Completed' ? true : false
    })

    return steps
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`

  const handleRefundClick = () => {
    setShowRefundModal(true)
    setRefundStep(1)
  }

  const handleCloseRefundModal = () => {
    setShowRefundModal(false)
    setRefundStep(1)
    setSelectedReason('')
    setGcashNumber('')
    setConfirmGcashNumber('')
  }

  const handleProceedToCancel = () => {
    if (selectedReason) {
      setRefundStep(2)
    }
  }

  const handleConfirmCancel = () => {
    setRefundStep(3)
  }

  const handleGcashSubmit = async () => {
    if (gcashNumber && confirmGcashNumber && gcashNumber === confirmGcashNumber) {
      try {
        // Create refund request
        const { error: refundError } = await supabase
          .from('refund')
          .insert({
            order_id: orderId,
            reason: selectedReason,
            status: 'Pending',
            request_date: new Date().toISOString(),
            gcash_number: gcashNumber
          })

        if (refundError) throw refundError

        // Update order status to Refunding
        const { error: orderError } = await supabase
          .from('order')
          .update({
            order_status: 'Refunding',
            status_updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId)

        if (orderError) throw orderError

        setRefundStep(4)
      } catch (error) {
        console.error('Error submitting refund:', error)
        alert('Failed to submit refund request')
      }
    }
  }

  const handleGoBackToOrder = () => {
    handleCloseRefundModal()
    // Optionally refresh order data
    fetchOrderData()
  }

  const getImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/api/placeholder/300/200'

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    const encodedFileName = encodeURIComponent(imageUrl)
    return `https://tvuawpgcpmqhsmwbwypy.supabase.co/storage/v1/object/public/menu-images/${encodedFileName}`
  }

  const handleOpenViewReceipt = () => {
    setShowViewReceiptModal(true)
  }

  const handleCloseViewReceipt = () => {
    setShowViewReceiptModal(false)
  }

  const handleConfirmPickup = async () => {
    try {
      const { error } = await supabase
        .from('order')
        .update({
          order_status: 'Completed',
          completed_date: new Date().toISOString()
        })
        .eq('order_id', orderId)

      if (error) throw error

      alert('Order confirmed as completed!')
      await fetchOrderData() // Refresh the order data
    } catch (error) {
      console.error('Error confirming pickup:', error)
      alert('Failed to confirm pickup. Please try again.')
    }
  }

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );

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

  const steps = orderData ? getProgressSteps() : []

  return (
    <ProtectedRoute allowedRoles={['customer']}>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">

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

        <main className="w-full max-w-screen-xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-4xl font-bold text-black mt-3">My order</h1>
          </div>

          {!orderData ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-2 border-orange-200 my-[20px] sm:my-[30px] p-8 text-center">
              <div className="text-2xl font-bold text-gray-600">Order not found</div>
            </div>
          ) : (
            /* Main Content Card */
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-2 border-orange-200 my-[20px] sm:my-[30px]">
              {/* Order Header */}
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-b-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Link to="/customer-interface/order">
                      <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                    </Link>
                    <h2 className="text-lg sm:text-2xl font-bold text-black">
                      Order ID: {orderData.orderNumber}
                    </h2>
                  </div>

                  {orderData.proofOfPaymentUrl && (
                    <button
                      onClick={handleOpenViewReceipt}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors"
                    >
                      View Proof of Payment
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="px-4 sm:px-8 py-4 sm:py-6">
                <div className="flex items-center justify-between relative overflow-x-auto">
                  {steps.map((step, index) => {
                    const IconComponent = step.icon
                    const isCompleted = step.completed
                    const isActive = step.key === orderData.status.toLowerCase()
                    const isLast = index === steps.length - 1

                    return (
                      <div key={step.key} className="flex items-center flex-shrink-0">
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 sm:border-4 ${isCompleted
                            ? 'bg-amber-700 border-amber-700 text-white'
                            : isActive
                              ? 'bg-white border-amber-700 text-amber-700'
                              : 'bg-white border-gray-300 text-gray-400'
                            }`}>
                            <IconComponent className="w-5 h-5 sm:w-7 sm:h-7" />
                          </div>
                          <div className="text-center mt-2 sm:mt-3">
                            <div className={`font-semibold text-xs sm:text-sm ${isCompleted || isActive ? 'text-black' : 'text-gray-500'
                              }`}>
                              {step.label}
                            </div>
                            {step.date && (
                              <div className="text-xs text-gray-500 mt-1">
                                {step.date}
                              </div>
                            )}

                            {/* Refund Button under "Queuing" */}
                            {step.key === 'queuing' && orderData.status === 'Queueing' && (
                              <div className="mt-3 sm:mt-4">
                                <button
                                  onClick={handleRefundClick}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-medium transition-colors"
                                >
                                  Refund Order
                                </button>
                              </div>
                            )}

                            {/* Track Rider Button under "On Delivery" */}
                            {step.key === 'on-delivery' && orderData.status === 'On Delivery' && (
                              <div className="mt-3 sm:mt-4">
                                <button
                                  onClick={() => alert('Track Rider feature - to be implemented')}
                                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-medium transition-colors"
                                >
                                  Track Rider
                                </button>
                              </div>
                            )}

                            {/* Confirm Pick-up and Report buttons under "Order Completed" */}
                            {step.key === 'order-completed' && orderData.status === 'Claim Order' && (
                              <div className="mt-3 sm:mt-4 flex flex-col gap-2">
                                <button
                                  onClick={handleConfirmPickup}
                                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-medium transition-colors whitespace-nowrap"
                                >
                                  Confirm Pick-up
                                </button>
                                <button
                                  onClick={() => alert('Report feature - to be implemented')}
                                  className="bg-gray-200 hover:bg-gray-300 text-black px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-medium transition-colors"
                                >
                                  Report
                                </button>
                              </div>
                            )}

                            {/* Rate button under last step when Completed */}
                            {step.key === 'rate' && orderData.status === 'Completed' && (
                              <div className="mt-3 sm:mt-4">
                                <Link
                                  to="/customer-interface/feedback"
                                  className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-medium transition-colors"
                                >
                                  Rate Order
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                          <div className={`w-16 sm:w-24 h-1 mx-2 sm:mx-4 ${isCompleted ? 'bg-amber-700' : 'bg-gray-300'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Content */}
              <div className="px-4 sm:px-8 pb-6 sm:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  {/* Delivery Address */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">
                      Delivery Address
                    </h3>
                    <div className="space-y-2 text-gray-600">
                      <div className="font-semibold text-black text-base sm:text-lg">
                        {orderData.customer.name}
                      </div>
                      <div className="text-gray-500 text-sm sm:text-base">
                        {orderData.customer.phone}
                      </div>
                      <div className="text-gray-500 text-sm sm:text-base">
                        {orderData.customer.address}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4 sm:space-y-6">
                      {orderData.items.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                          {/* Item image */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Item details */}
                          <div className="flex-1">
                            <h4 className="font-bold text-black text-lg sm:text-xl mb-2 sm:mb-3 text-center sm:text-left">
                              {item.name} {item.quantity > 1 && `${item.quantity}x`}
                            </h4>
                            <div className="text-gray-600 space-y-2">
                              {item.inclusions.length > 0 && (
                                <div>
                                  <span className="font-semibold text-black">Inclusion:</span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-1">
                                    {item.inclusions.map((inclusion, idx) => (
                                      <div key={idx} className="text-sm">
                                        {inclusion}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="text-sm">
                                <span className="font-semibold text-black">Add-ons:</span>{' '}
                                {item.addOns}
                              </div>
                            </div>
                          </div>
                          {/* Price */}
                          <div className="text-right text-sm flex-shrink-0">
                            <div className="font-bold text-black text-lg">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Move order details OUTSIDE the map, show once */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-bold text-black text-lg mb-4">Order Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold text-black">Delivery Option:</span>{' '}
                            <span className="text-gray-600">{orderData.deliveryOption}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Payment Method:</span>{' '}
                            <span className="text-gray-600">{orderData.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Schedule Date:</span>{' '}
                            <span className="text-gray-600">{orderData.pickDate}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-black">Schedule Time:</span>{' '}
                            <span className="text-gray-600">{orderData.pickTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      <div className="mt-4 sm:mt-6">
                        <div className="text-sm">
                          <span className="font-semibold text-black">
                            Special Instructions:
                          </span>
                          <div className="text-gray-600 mt-1">
                            {orderData.specialInstructions}
                          </div>
                        </div>
                      </div>

                      {/* Pricing Summary */}
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex justify-between text-base sm:text-lg">
                            <span className="text-black">Subtotal</span>
                            <span className="font-bold text-black">
                              {formatPrice(orderData.pricing.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-base sm:text-lg">
                            <span className="text-black">Delivery Fee</span>
                            <span className="font-bold text-black">
                              {formatPrice(orderData.pricing.deliveryFee)}
                            </span>
                          </div>
                          <hr className="border-gray-300" />
                          <div className="flex justify-between text-lg sm:text-xl">
                            <span className="font-bold text-black">Order Total</span>
                            <span className="font-bold text-orange-600">
                              {formatPrice(orderData.pricing.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End of Main Content Card */}
            </div>
          )}
        </main>


        {/* REFUND MODAL */}
        {showRefundModal && orderData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Step 1: Select Cancellation Reason */}
              {refundStep === 1 && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-black mb-8">Select Cancellation Reason</h2>

                  <div className="space-y-4 mb-8">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value="change-address"
                        checked={selectedReason === 'change-address'}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-5 h-5 text-yellow-500"
                      />
                      <span className="text-lg text-gray-700">Need to change delivery address</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value="modify-order"
                        checked={selectedReason === 'modify-order'}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-5 h-5 text-yellow-500"
                      />
                      <span className="text-lg text-gray-700">Need to modify order (size, color, etc.)</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value="dont-want"
                        checked={selectedReason === 'dont-want'}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-5 h-5 text-yellow-500"
                      />
                      <span className="text-lg text-gray-700">Don't want to buy anymore</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value="others"
                        checked={selectedReason === 'others'}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-5 h-5 text-yellow-500"
                      />
                      <span className="text-lg text-gray-700">Others</span>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleCloseRefundModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Not Now
                    </button>
                    <button
                      onClick={handleProceedToCancel}
                      disabled={!selectedReason}
                      className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      Proceed to Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Cancel Place Order Confirmation */}
              {refundStep === 2 && (
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-black mb-6">Cancel Place Order</h2>

                  <div className="mb-6">
                    <p className="text-lg text-gray-700 mb-2">
                      Are you sure you want to cancel Order {orderData.orderNumber}?
                    </p>
                    <p className="text-lg text-gray-700 mb-6">
                      Once you Place Order, your request will begin the refund process.
                    </p>

                    <p className="text-lg font-medium text-gray-800 mb-4">Please note the following:</p>

                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <p>Your down payment will not be refunded immediately.</p>
                          <p className="text-sm">It will go through processing and may take time to complete.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <p>The refund will not be full.</p>
                          <p className="text-sm">A portion of the amount will be deducted to cover Gcash transaction.</p>
                        </div>
                      </li>
                    </ul>

                    <div className="mt-6 text-gray-700">
                      <p className="mb-2">You will receive a notification once the refund is completed.</p>
                      <p>If you have any concerns, feel free to contact our support.</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setRefundStep(1)}
                      className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 px-6 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
                    >
                      Proceed to Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: GCash Number Input */}
              {refundStep === 3 && (
                <div className="p-8 bg-yellow-400">
                  <h2 className="text-xl font-bold text-black mb-6 text-center">
                    Please enter the GCash number where you want the refund to be sent.
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium text-black mb-2">
                        Enter the number:
                      </label>
                      <input
                        type="text"
                        value={gcashNumber}
                        onChange={(e) => setGcashNumber(e.target.value)}
                        placeholder="+63 ...."
                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-yellow-600"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-black mb-2">
                        Re-enter the number:
                      </label>
                      <input
                        type="text"
                        value={confirmGcashNumber}
                        onChange={(e) => setConfirmGcashNumber(e.target.value)}
                        placeholder="+63 ...."
                        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-yellow-600"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-8">
                    <button
                      onClick={() => setRefundStep(2)}
                      className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 px-6 rounded-full transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGcashSubmit}
                      disabled={!gcashNumber || !confirmGcashNumber || gcashNumber !== confirmGcashNumber}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-6 rounded-full transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Cancellation in Process */}
              {refundStep === 4 && (
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-black mb-6">Cancellation in Process...</h2>

                  <div className="space-y-4 text-gray-700 text-lg mb-8">
                    <p>Your cancellation request has been received and please kindly wait for the process.</p>

                    <p>Please note that the down payment will be returned only after all necessary check are completed.</p>

                    <p>You will receive a notification once, the refund is finalized.</p>

                    <p className="font-medium">Thank you for your patience.</p>
                  </div>

                  <button
                    onClick={handleGoBackToOrder}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-8 rounded-full transition-colors"
                  >
                    Go back to Order
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Receipt Modal */}
        {showViewReceiptModal && orderData && orderData.proofOfPaymentUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-black">Payment Receipt</h2>
                <button
                  onClick={handleCloseViewReceipt}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
                <img
                  src={orderData.proofOfPaymentUrl}
                  alt="Payment Receipt"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleCloseViewReceipt}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer id="contact" className="py-8 bottom-0 w-full z-10" style={{ backgroundColor: "#F9ECD9" }}>
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

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}
      </div>
    </ProtectedRoute>
  )
}