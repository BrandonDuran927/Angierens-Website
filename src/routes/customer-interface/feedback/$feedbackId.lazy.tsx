import { createLazyFileRoute, Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { ShoppingCart, Bell, X, Menu, Edit, Heart, MessageSquare, Star, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabaseClient'
import { AlertModal, type AlertType } from '@/components/AlertModal'


export const Route = createLazyFileRoute(
  '/customer-interface/feedback/$feedbackId',
)({
  component: RouteComponent,
})

interface FeedbackData {
  orderId: string
  orderNumber: number | null
  orderType: string | null
  deliveryRating: number
  deliveryFeedback: string
  deliveryReviewId: string | null
  foodRating: number
  foodFeedback: string
  foodReviewId: string | null
  staffRating: number
  staffFeedback: string
  staffReviewId: string | null
  riderRating: number
  riderFeedback: string
  riderReviewId: string | null
}

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
    console.log("Navigated to /customer-interface/feedback")
    console.log("Current logged-in user:", user)
  }, [user])

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }

  const [cartCount] = useState(2)
  const [notificationCount] = useState(3)
  const { feedbackId } = useParams({ from: '/customer-interface/feedback/$feedbackId' })
  const [activeTab, setActiveTab] = useState('delivery')
  const [isEditing, setIsEditing] = useState(false)
  const [sendAnonymously, setSendAnonymously] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

  const navigationItems = [
    { name: 'HOME', route: '/customer-interface/home', active: false },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: true },
    { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
  ]

  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    orderId: feedbackId,
    orderNumber: null,
    orderType: null,
    deliveryRating: 0,
    deliveryFeedback: '',
    deliveryReviewId: null,
    foodRating: 0,
    foodFeedback: '',
    foodReviewId: null,
    staffRating: 0,
    staffFeedback: '',
    staffReviewId: null,
    riderRating: 0,
    riderFeedback: '',
    riderReviewId: null
  })
  // Fetch order and reviews from Supabase
  useEffect(() => {
    const fetchOrderAndReviews = async () => {
      if (!feedbackId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('order')
          .select('order_number, order_type')  // CHANGE THIS LINE - add order_type
          .eq('order_id', feedbackId)
          .single()

        if (orderError) {
          console.error('Error fetching order:', orderError)
          setIsLoading(false)
          return
        }

        // Fetch all reviews for this order
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('review')
          .select('*')
          .eq('order_id', feedbackId)

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError)
        }

        // Initialize feedback data with order info
        const newFeedbackData: FeedbackData = {
          orderId: feedbackId,
          orderNumber: orderData?.order_number || null,
          orderType: orderData?.order_type || null,
          deliveryRating: 0,
          deliveryFeedback: '',
          deliveryReviewId: null,
          foodRating: 0,
          foodFeedback: '',
          foodReviewId: null,
          staffRating: 0,
          staffFeedback: '',
          staffReviewId: null,
          riderRating: 0,
          riderFeedback: '',
          riderReviewId: null
        }

        // Map reviews to feedback data
        if (reviewsData && reviewsData.length > 0) {
          reviewsData.forEach(review => {
            const type = review.review_type.toLowerCase() as 'delivery' | 'food' | 'staff' | 'rider'

            if (type === 'delivery') {
              newFeedbackData.deliveryRating = review.rating
              newFeedbackData.deliveryFeedback = review.comment
              newFeedbackData.deliveryReviewId = review.review_id
            } else if (type === 'food') {
              newFeedbackData.foodRating = review.rating
              newFeedbackData.foodFeedback = review.comment
              newFeedbackData.foodReviewId = review.review_id
            } else if (type === 'staff') {
              newFeedbackData.staffRating = review.rating
              newFeedbackData.staffFeedback = review.comment
              newFeedbackData.staffReviewId = review.review_id
            } else if (type === 'rider') {
              newFeedbackData.riderRating = review.rating
              newFeedbackData.riderFeedback = review.comment
              newFeedbackData.riderReviewId = review.review_id
            }
          })
        }

        setFeedbackData(newFeedbackData)
      } catch (err) {
        console.error('Unexpected error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderAndReviews()
  }, [feedbackId])



  const allTabs = [
    { id: 'delivery', label: 'Delivery Review', rating: feedbackData.deliveryRating, feedback: feedbackData.deliveryFeedback },
    { id: 'food', label: 'Food Review', rating: feedbackData.foodRating, feedback: feedbackData.foodFeedback },
    { id: 'staff', label: 'Staff Review', rating: feedbackData.staffRating, feedback: feedbackData.staffFeedback },
    { id: 'rider', label: 'Rider Review', rating: feedbackData.riderRating, feedback: feedbackData.riderFeedback }
  ]

  const tabs = feedbackData.orderType === 'Pick-up'
    ? allTabs.filter(tab => tab.id !== 'delivery' && tab.id !== 'rider')
    : allTabs

  const currentTab = tabs.find(tab => tab.id === activeTab) || tabs[0]

  // If current activeTab is filtered out, switch to first available tab
  useEffect(() => {
    if (!tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'food')
    }
  }, [feedbackData.orderType, activeTab, tabs])

  const handleStarClick = (rating: number) => {
    if (!isEditing) return

    setFeedbackData(prev => ({
      ...prev,
      [`${activeTab}Rating`]: rating
    }))
  }

  const handleFeedbackChange = (value: string) => {
    if (!isEditing) return

    setFeedbackData(prev => ({
      ...prev,
      [`${activeTab}Feedback`]: value
    }))
  }

  const handleSubmit = async () => {
    if (!isEditing) return

    try {
      setIsSaving(true)

      // Get the review ID for the current tab
      const reviewIdKey = `${activeTab}ReviewId` as keyof FeedbackData
      const existingReviewId = feedbackData[reviewIdKey]
      const ratingKey = `${activeTab}Rating` as keyof FeedbackData
      const commentKey = `${activeTab}Feedback` as keyof FeedbackData
      const rating = feedbackData[ratingKey] as number
      const comment = feedbackData[commentKey] as string

      // Validate that user has entered something
      if (rating === 0) {
        showAlert('Please provide a rating', 'warning')
        setIsSaving(false)
        return
      }

      if (!comment || comment.trim() === '') {
        showAlert('Please provide a comment', 'warning')
        setIsSaving(false)
        return
      }

      // Map activeTab to review_type enum
      const reviewTypeMap: { [key: string]: string } = {
        delivery: 'Delivery',
        food: 'Food',
        staff: 'Staff',
        rider: 'Rider'
      }

      const reviewType = reviewTypeMap[activeTab]

      if (existingReviewId) {
        // Update existing review
        const { error } = await supabase
          .from('review')
          .update({
            rating: rating,
            comment: comment,
            is_hidden: sendAnonymously
          })
          .eq('review_id', existingReviewId)

        if (error) {
          console.error('Error updating review:', error)
          showAlert('Failed to update review. Please try again.', 'error')
          setIsSaving(false)
          return
        }
      } else {
        // Insert new review
        const { data, error } = await supabase
          .from('review')
          .insert({
            order_id: feedbackId,
            review_type: reviewType,
            rating: rating,
            comment: comment,
            is_hidden: sendAnonymously
          })
          .select()

        if (error) {
          console.error('Error inserting review:', error)
          showAlert('Failed to submit review. Please try again.', 'error')
          setIsSaving(false)
          return
        }

        // Update local state with new review ID
        if (data && data.length > 0) {
          setFeedbackData(prev => ({
            ...prev,
            [`${activeTab}ReviewId`]: data[0].review_id
          }))
        }
      }

      showAlert('Review submitted successfully!', 'success')
      setIsEditing(false)
    } catch (err) {
      console.error('Unexpected error submitting review:', err)
      showAlert('An unexpected error occurred. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-8 h-8 cursor-pointer transition-colors ${index < rating
          ? 'text-yellow-400 fill-yellow-400'
          : 'text-gray-300'
          } ${isEditing ? 'hover:text-yellow-300' : ''}`}
        onClick={() => handleStarClick(index + 1)}
      />
    ))
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

        <div className="max-w-4xl mx-auto my-6 sm:my-10 px-4 sm:px-6 lg:px-0">
          {/* Header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Link
              to="/customer-interface/feedback"
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
              ORDER ID: #{feedbackData.orderNumber || ''}
            </h1>
          </div>

          {/* Tabs + Edit Button in one row */}
          <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-3">
            {/* Category Tabs */}
            <div className="flex gap-2 sm:gap-3 lg:gap-4 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-full font-semibold text-white transition-colors text-sm sm:text-base ${activeTab === tab.id
                    ? 'bg-[#B8860B]'
                    : 'bg-[#8B4513] hover:bg-[#A0522D]'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-[#964B00] text-yellow-400 rounded-lg hover:bg-[#7a3d00] transition-colors font-semibold"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Review'}
            </button>
          </div>


          {/* Feedback Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border-2 sm:border-4 border-yellow-300">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                How was your {currentTab.label.split(' ')[0]}?
              </h2>

              {/* Star Rating */}
              <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 justify-center sm:justify-start">
                {renderStars(currentTab.rating)}
              </div>

              {/* Feedback Text Area */}
              <div className="mb-6 sm:mb-8">
                <textarea
                  value={currentTab.feedback}
                  onChange={(e) => handleFeedbackChange(e.target.value)}
                  placeholder={`Share your ${activeTab} experience...`}
                  disabled={!isEditing}
                  className={`w-full h-40 sm:h-48 lg:h-64 p-3 sm:p-4 border-2 border-gray-300 rounded-lg resize-none text-gray-700 text-base sm:text-lg leading-relaxed ${isEditing
                    ? 'bg-white focus:border-yellow-400 focus:outline-none'
                    : 'bg-gray-50 cursor-not-allowed'
                    }`}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isEditing || isSaving}
                className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-colors ${isEditing && !isSaving
                  ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isSaving ? 'Submitting...' : 'Submit Feedback'}
              </button>
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
      {isLoading && <LoadingSpinner />}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </ProtectedRoute>
  )
}