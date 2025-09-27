// src/routes/customer-interface/specific-order/$orderId.tsx
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Package, CreditCard, Clock, ShoppingBag, Star, X, Menu, ShoppingCart, Bell, MessageSquare, Heart } from 'lucide-react'
import { useState } from 'react'

// Create the route definition using the dynamic param $orderId
export const Route = createLazyFileRoute('/customer-interface/specific-order/$orderId')({
  component: SpecificOrder,
})

// Type-safe component access to route params using Route.useParams
const mockOrderData = {
  orderId: '06',
  status: 'queuing',
  orderPlacedDate: '05/16/25 10:30 AM',
  paymentConfirmedDate: '05/16/25 10:40 AM',
  queuingDate: '05/16/25 10:40 AM',
  deliveryOption: 'Delivery',
  fulfillmentType: 'Current Day',
  paymentMethod: 'Online - GCash 100%',
  pickDate: 'May 17, 2025',
  pickTime: '2:00 PM',
  customer: {
    name: 'Brandon Duran',
    phone: '(+63) 982 248 2982',
    address: 'Blk 20, Lot 15, Queensville, Caloocan City'
  },
  items: [
    {
      id: 1,
      name: '5 in 1 Mix in Bilao (PALABOK) 2x',
      image: '/api/placeholder/100/100',
      inclusion: '40 pcs. Pork Shanghai, 12 pcs. Pork BBQ',
      details: '30 pcs. Pork Shanghai, 30 slices Cordon Bleu',
      addOns: 'Puto (20)',
      specialInstructions: 'Wag po paramihan yung bawang..'
    }
  ],
  pricing: {
    subtotal: 3950,
    deliveryFee: 75,
    total: 4025
  }
}

// Navigation items for header
const navigationItems = [
  { name: 'HOME', route: '/customer-interface/home', active: false },
  { name: 'MENU', route: '/customer-interface/', active: false },
  { name: 'ORDER', route: '/customer-interface/order', active: false },
  { name: 'FEEDBACK', route: '/customer-interface/feedback', active: false },
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

function SpecificOrder() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundStep, setRefundStep] = useState(1) // 1: reason, 2: confirm, 3: gcash, 4: processing
  const [selectedReason, setSelectedReason] = useState('')
  const [gcashNumber, setGcashNumber] = useState('')
  const [confirmGcashNumber, setConfirmGcashNumber] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { orderId } = Route.useParams()
  const order = mockOrderData // In real app, fetch based on orderId

  // Mock counts
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
    const steps = [
      { key: 'placed', label: 'Order Placed', date: order.orderPlacedDate, icon: Package, completed: true },
      { key: 'payment', label: 'Payment Confirmed', date: order.paymentConfirmedDate, icon: CreditCard, completed: true },
      { key: 'queuing', label: 'Queuing', date: order.queuingDate, icon: Clock, completed: order.status !== 'placed' },
      { key: 'preparing', label: 'Preparing', date: '', icon: ShoppingBag, completed: order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' },
      { key: 'ready', label: 'Ready', date: '', icon: Star, completed: order.status === 'ready' || order.status === 'delivered' }
    ]
    return steps
  }

  const formatPrice = (price: number) => `₱${price.toLocaleString()}`
  const steps = getProgressSteps()

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

  const handleGcashSubmit = () => {
    if (gcashNumber && confirmGcashNumber && gcashNumber === confirmGcashNumber) {
      setRefundStep(4)
    }
  }

  const handleGoBackToOrder = () => {
    handleCloseRefundModal()
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
        <div className="flex items-center justify-between ">
          <h1 className="text-2xl sm:text-4xl font-bold text-black mt-3">My order</h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-2 border-orange-200 my-[20px] sm:my-[30px]">
          {/* Order Header */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-b-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link to='/customer-interface/order'>
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </Link>
                <h2 className="text-lg sm:text-2xl font-bold text-black">Order ID: #{orderId}</h2>
              </div>
              <div className="text-amber-600 px-3 sm:px-6 py-1 sm:py-2 rounded-full text-sm sm:text-xl font-medium text-center">
                Your order is for payment
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between relative overflow-x-auto">
              {steps.map((step, index) => {
                const IconComponent = step.icon
                const isCompleted = step.completed
                const isActive = step.key === 'queuing'
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
                        {step.key === 'queuing' && (
                          <div className="mt-3 sm:mt-4">
                            <button
                              onClick={handleRefundClick}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1 text-xs sm:text-sm rounded-md font-medium transition-colors"
                            >
                              Refund Order
                            </button>
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
                <h3 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4">Delivery Address</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="font-semibold text-black text-base sm:text-lg">
                    {order.customer.name}
                  </div>
                  <div className="text-gray-500 text-sm sm:text-base">{order.customer.phone}</div>
                  <div className="text-gray-500 text-sm sm:text-base">{order.customer.address}</div>
                </div>
              </div>

              {/* Order Items */}
              <div className="lg:col-span-2">
                <div className="space-y-4 sm:space-y-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-black text-lg sm:text-xl mb-2 sm:mb-3 text-center sm:text-left">
                          {item.name}
                        </h4>
                        <div className="text-gray-600 space-y-2">
                          <div>
                            <span className="font-semibold text-black">Inclusion:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-1">
                              <div className="text-sm">40 pcs. Pork Shanghai</div>
                              <div className="text-sm">30 pcs. Pork Shanghai</div>
                              <div className="text-sm">12 pcs. Pork BBQ</div>
                              <div className="text-sm">30 slices Cordon Bleu</div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-black">Add-ons:</span> {item.addOns}
                          </div>
                        </div>
                      </div>
                      <div className="text-center sm:text-right text-sm text-gray-600 flex-shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <div className="space-y-1">
                          <div><span className="font-semibold text-black">Delivery Option:</span> {order.deliveryOption}</div>
                          <div><span className="font-semibold text-black">Fulfillment Type:</span> {order.fulfillmentType}</div>
                          <div><span className="font-semibold text-black">Payment Method:</span> {order.paymentMethod}</div>
                          <div><span className="font-semibold text-black">Pick Date:</span> {order.pickDate}</div>
                          <div><span className="font-semibold text-black">Pick Time:</span> {order.pickTime}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Special Instructions */}
                  <div className="mt-4 sm:mt-6">
                    <div className="text-sm">
                      <span className="font-semibold text-black">Special Instructions:</span>
                      <div className="text-gray-600 mt-1">Wag po paramihan yung bawang..</div>
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-black">Subtotal</span>
                        <span className="font-bold text-black">{formatPrice(order.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-black">Delivery Fee</span>
                        <span className="font-bold text-black">{formatPrice(order.pricing.deliveryFee)}</span>
                      </div>
                      <hr className="border-gray-300" />
                      <div className="flex justify-between text-lg sm:text-xl">
                        <span className="font-bold text-black">Order Total</span>
                        <span className="font-bold text-orange-600">{formatPrice(order.pricing.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* REFUND MODAL */}
      {showRefundModal && (
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
                    Are you sure you want to cancel Order #{orderId}?
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
    </div>
  )
}