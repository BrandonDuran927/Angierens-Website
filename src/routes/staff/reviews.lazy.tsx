import { createLazyFileRoute, useLocation, Link } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import {
  Menu,
  MessageSquare,
  Menu as MenuIcon,
  LogOut,
  Bell,
  Star,
  Heart,
  Eye,
  Package,
  Truck,
  Settings,
  DollarSign,
  X,
  Calendar,
  User,
  EyeOff,
  ChefHat
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { Review } from '@/lib/api'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'

export const Route = createLazyFileRoute('/staff/reviews')({
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
  const navigate = useNavigate();
  const { user, signOut } = useUser()

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
  }
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isHiddenReviewsModalOpen, setIsHiddenReviewsModalOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [processingReviewId, setProcessingReviewId] = useState<string | null>(null)
  const location = useLocation()

  // Alert Modal State
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title?: string
    message: string
    type: AlertType
  }>({ isOpen: false, message: '', type: 'info' })

  const showAlert = (message: string, type: AlertType = 'info', title?: string) => {
    setAlertModal({ isOpen: true, message, type, title })
  }

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    fetchReviews()

    // Subscribe to real-time changes
    const reviewsSubscription = supabase
      .channel('reviews_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'review' },
        () => {
          fetchReviews()
        }
      )
      .subscribe()

    return () => {
      reviewsSubscription.unsubscribe()
    }
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)

      // Fetch reviews with related order and user data
      const { data, error } = await supabase
        .from('review')
        .select(`
                    review_id,
                    review_type,
                    rating,
                    comment,
                    is_hidden,
                    order_id,
                    order:order_id (
                        customer_uid,
                        user:customer_uid (
                            first_name
                        )
                    )
                `)

      if (error) {
        console.error('Error fetching reviews:', error)
        return
      }

      console.log('Fetched reviews:', data)

      const transformedReviews: Review[] = (data || []).map((review: any) => ({
        review_id: review.review_id,
        customerName: review.order?.user?.first_name || 'Unknown',
        status_type: review.review_type,
        rating: Number(review.rating),
        comment: review.comment || '',
        is_hidden: review.is_hidden || false,
        order_id: review.order_id
      }))

      setReviews(transformedReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleReviewVisibility = async (reviewId: string, currentHiddenState: boolean) => {
    try {
      setProcessingReviewId(reviewId)

      const { error } = await supabase
        .from('review')
        .update({ is_hidden: !currentHiddenState })
        .eq('review_id', reviewId)

      if (error) {
        console.error('Error updating review visibility:', error)
        showAlert('Failed to update review visibility. Please try again.', 'error')
        return
      }

      // Update local state
      setReviews(prev =>
        prev.map(review =>
          review.review_id === reviewId
            ? { ...review, is_hidden: !currentHiddenState }
            : review
        )
      )

      // Show success message
      const action = !currentHiddenState ? 'hidden' : 'shown'
      console.log(`Review ${action} successfully`)
      setIsViewModalOpen(false)
    } catch (error) {
      console.error('Error toggling review visibility:', error)
      showAlert('An error occurred. Please try again.', 'error')
      setIsViewModalOpen(false)
    } finally {
      setProcessingReviewId(null)
      setIsViewModalOpen(false)
    }
  }

  const navigationItems = [
    {
      name: 'Orders',
      route: '/staff',
      icon: <Package className="h-5 w-5" />,
      active: location.pathname === '/staff'
    },
    {
      name: 'Deliveries',
      route: '/staff/deliveries',
      icon: <Truck className="h-5 w-5" />,
      active: location.pathname === '/staff/deliveries'
    },
    {
      name: 'Kitchen Display',
      route: '/staff/kitchen-display',
      icon: <ChefHat className="h-5 w-5" />,
      active: location.pathname === '/staff/kitchen-display'
    },
    {
      name: 'Schedule',
      route: '/staff/schedule',
      icon: <Calendar className="h-5 w-5" />,
      active: location.pathname === '/staff/schedule'
    },
    {
      name: 'Menu',
      route: '/staff/menu',
      icon: <Settings className="h-5 w-5" />,
      active: location.pathname === '/staff/menu'
    },
    {
      name: 'Reviews',
      route: '/staff/reviews',
      icon: <Star className="h-5 w-5" />,
      active: location.pathname === '/staff/reviews'
    },
    {
      name: 'Account',
      route: '/staff/my-info',
      icon: <User className="h-5 w-5" />,
      active: location.pathname === '/staff/my-info'
    },
    {
      name: 'Refund',
      route: '/staff/refund',
      icon: <DollarSign className="h-5 w-5" />,
      active: location.pathname === '/staff/refund'
    },
  ]

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DELIVERY\'S REVIEW':
        return 'bg-amber-600'
      case 'FOOD\'S REVIEW':
        return 'bg-amber-600'
      case 'RIDER\'S REVIEW':
        return 'bg-amber-600'
      case 'STAFF\'S REVIEW':
        return 'bg-amber-600'
      default:
        return 'bg-amber-600'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleViewReview = (review: Review) => {
    setSelectedReview(review)
    setIsViewModalOpen(true)
  }

  const handleShowHiddenReviews = () => {
    setIsHiddenReviewsModalOpen(true)
  }

  const reviewsByCategory = {
    'DELIVERY\'S REVIEW': reviews.filter(r => r.status_type === 'Delivery' && !r.is_hidden),
    'FOOD\'S REVIEW': reviews.filter(r => r.status_type === 'Food' && !r.is_hidden),
    'RIDER\'S REVIEW': reviews.filter(r => r.status_type === 'Rider' && !r.is_hidden),
    'STAFF\'S REVIEW': reviews.filter(r => r.status_type === 'Staff' && !r.is_hidden)
  }

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }


  return (
    <ProtectedRoute allowedRoles={['staff']}>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">
        {/* Sidebar - following the uploaded image design */}
        <div
          className={`
    fixed inset-y-0 left-0 z-50 w-64 bg-yellow-400 transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
        >
          {/* Header */}
          <div className="bg-amber-800 text-white px-6 py-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <img src="/public/angierens-logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Angieren's</h2>
                  <p className="text-lg font-bold">Lutong Bahay</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-amber-700 rounded-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b-2 border-amber-600">
            <h3 className="font-bold text-lg text-amber-900">Jenny Frenzzy</h3>
            <p className="text-sm text-amber-800">+63 912 212 1209</p>
            <p className="text-sm text-amber-800">jennyfrenzzy@gmail.com</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.route}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors w-full
                ${item.active
                    ? 'bg-amber-700 text-white shadow-lg'
                    : 'text-amber-900 hover:bg-amber-300'
                  }
              `}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="px-4 pb-6">
            <button
              className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-amber-800 text-white p-4 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-white hover:bg-amber-700 rounded-lg"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-3xl font-bold">REVIEWS</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-6">
                <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Date: {getCurrentDate()}</span>
                <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Time: {getCurrentTime()}</span>
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="relative p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                    >
                      <Bell className="h-6 w-6" />
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notificationCount}
                        </span>
                      )}
                    </button>
                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((notification, index) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                                  {getNotificationIcon(notification.icon)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 leading-relaxed">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 border-t border-gray-200">
                          <button
                            onClick={markAllAsRead}
                            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                          >
                            <Bell className="h-4 w-4" />
                            Mark all as read
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Orders Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Show Hidden Reviews Button */}
            <div className="mb-6">
              <button
                onClick={handleShowHiddenReviews}
                className="bg-yellow-400 text-amber-800 px-6 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
              >
                Show Hidden Reviews
              </button>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(reviewsByCategory).map(([category, categoryReviews]) => (
                <div
                  key={category}
                  className="space-y-4 bg-amber-800 rounded-lg h-[500px] overflow-y-auto"
                >
                  <div className="p-5 space-y-4">
                    <h3
                      className={`text-white text-center py-2 px-4 rounded-lg font-semibold ${getCategoryColor(
                        category
                      )}`}
                    >
                      {category}
                    </h3>

                    {categoryReviews.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-white text-sm italic opacity-80">
                          No reviews yet
                        </p>
                      </div>
                    ) : (
                      categoryReviews.map((review) => (
                        <div
                          key={review.review_id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                        >
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {review.customerName}
                            </h4>
                            <div className="flex gap-1">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewReview(review)}
                              className="bg-yellow-400 text-amber-800 px-3 py-1 rounded text-xs font-medium hover:bg-yellow-500 transition-colors flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              VIEW
                            </button>
                            <button
                              onClick={() => toggleReviewVisibility(review.review_id, review.is_hidden)}
                              disabled={processingReviewId === review.review_id}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <EyeOff className="h-3 w-3" />
                              {processingReviewId === review.review_id ? 'HIDING...' : 'HIDE'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
        {/* View Review Modal */}
        {isViewModalOpen && selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Review Details</h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">{selectedReview.customerName}</h4>
                  <div className="flex gap-1 mb-2">
                    {renderStars(selectedReview.rating)}
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(selectedReview.status_type)}`}>
                    {selectedReview.status_type}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">{selectedReview.comment}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => toggleReviewVisibility(selectedReview.review_id, selectedReview.is_hidden)}
                    disabled={processingReviewId === selectedReview.review_id}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    {processingReviewId === selectedReview.review_id ? 'Hiding...' : 'Hide Review'}
                  </button>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Reviews Modal */}
        {isHiddenReviewsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Hidden Reviews</h3>
                <button
                  onClick={() => setIsHiddenReviewsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.filter(review => review.is_hidden).map((review) => (
                  <div key={review.review_id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-800 mb-1">{review.customerName}</h4>
                      <div className="flex gap-1 mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(review.status_type)}`}>
                        {review.status_type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                    <button
                      onClick={() => toggleReviewVisibility(review.review_id, review.is_hidden)}
                      disabled={processingReviewId === review.review_id}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {processingReviewId === review.review_id ? 'Showing...' : 'Show Review'}
                    </button>
                  </div>
                ))}
                {reviews.filter(review => review.is_hidden).length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No hidden reviews found.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t mt-6">
                <button
                  onClick={() => setIsHiddenReviewsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {loading && <LoadingSpinner />}

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />
      </div>
    </ProtectedRoute>
  )
}