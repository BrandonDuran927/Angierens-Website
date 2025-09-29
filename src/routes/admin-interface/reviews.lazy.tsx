import { createLazyFileRoute, useLocation, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    MessageSquare,
    Users,
    Menu as MenuIcon,
    RefreshCw,
    LogOut,
    Bell,
    Star,
    Heart,
    Eye,
    LucideCalendar
} from 'lucide-react'

export const Route = createLazyFileRoute('/admin-interface/reviews')({
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
    id: string
    customerName: string
    category: 'DELIVERY\'S REVIEW' | 'FOOD\'S REVIEW' | 'RIDER\'S REVIEW' | 'STAFF\'S REVIEW'
    rating: number
    comment: string
    isHidden: boolean
}

function RouteComponent() {
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isHiddenReviewsModalOpen, setIsHiddenReviewsModalOpen] = useState(false)
    const [showHiddenReviews, setShowHiddenReviews] = useState(false)
    const location = useLocation()

    const sidebarItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            route: '/admin-interface/'
        },
        {
            icon: ShoppingCart,
            label: 'Orders',
            route: '/admin-interface/orders'
        },
        {
            icon: TrendingUp,
            label: 'Sales',
            route: '/admin-interface/sales'
        },
        {
            icon: MessageSquare,
            label: 'Reviews',
            route: '/admin-interface/reviews'
        },
        {
            icon: Users,
            label: 'Employee',
            route: '/admin-interface/employee'
        },
        {
            icon: MenuIcon,
            label: 'Menu',
            route: '/admin-interface/menu'
        },
        {
            icon: RefreshCw,
            label: 'Refund',
            route: '/admin-interface/refund'
        },
        {
            icon: LucideCalendar,
            label: 'Schedule',
            route: '/admin-interface/schedule'
        }
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

    const [reviews, setReviews] = useState<Review[]>([
        {
            id: '1',
            customerName: 'Russel',
            category: 'DELIVERY\'S REVIEW',
            rating: 5,
            comment: 'Thank you for taking the time to share your positive experience with us!',
            isHidden: false
        },
        {
            id: '2',
            customerName: 'Carlo',
            category: 'FOOD\'S REVIEW',
            rating: 5,
            comment: 'WOWW',
            isHidden: false
        },
        {
            id: '3',
            customerName: 'Trajeco',
            category: 'RIDER\'S REVIEW',
            rating: 5,
            comment: 'Humble',
            isHidden: false
        },
        {
            id: '4',
            customerName: 'Marizon',
            category: 'STAFF\'S REVIEW',
            rating: 5,
            comment: 'Thank you',
            isHidden: false
        },
        {
            id: '5',
            customerName: 'Prince',
            category: 'DELIVERY\'S REVIEW',
            rating: 5,
            comment: 'Smooth.',
            isHidden: false
        },
        {
            id: '6',
            customerName: 'Brandon',
            category: 'FOOD\'S REVIEW',
            rating: 5,
            comment: 'Smooth',
            isHidden: false
        },
        {
            id: '7',
            customerName: 'Ring',
            category: 'RIDER\'S REVIEW',
            rating: 5,
            comment: 'Good Man',
            isHidden: false
        },
        {
            id: '8',
            customerName: 'Charles',
            category: 'STAFF\'S REVIEW',
            rating: 5,
            comment: 'Thank you for helping',
            isHidden: false
        },
        {
            id: '9',
            customerName: 'Duran',
            category: 'DELIVERY\'S REVIEW',
            rating: 5,
            comment: 'Stable Food',
            isHidden: false
        },
        {
            id: '10',
            customerName: 'Leonhard',
            category: 'FOOD\'S REVIEW',
            rating: 5,
            comment: 'I love Pancit',
            isHidden: false
        },
        {
            id: '11',
            customerName: 'Nozicka',
            category: 'RIDER\'S REVIEW',
            rating: 5,
            comment: 'Well Hardz Person',
            isHidden: false
        },
        {
            id: '12',
            customerName: 'Yasuo',
            category: 'STAFF\'S REVIEW',
            rating: 5,
            comment: 'Thank you so much',
            isHidden: false
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

    const toggleReviewVisibility = (reviewId: string) => {
        setReviews(prev =>
            prev.map(review =>
                review.id === reviewId
                    ? { ...review, isHidden: !review.isHidden }
                    : review
            )
        )
    }

    const handleViewReview = (review: Review) => {
        setSelectedReview(review)
        setIsViewModalOpen(true)
    }

    const handleShowHiddenReviews = () => {
        setIsHiddenReviewsModalOpen(true)
    }

    const visibleReviews = showHiddenReviews
        ? reviews
        : reviews.filter(review => !review.isHidden)

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    const publishedReviews = reviews.filter(review => !review.isHidden).length
    const todayReviews = 40 // This would be calculated based on today's date

    const reviewsByCategory = {
        'DELIVERY\'S REVIEW': reviews.filter(r => r.category === 'DELIVERY\'S REVIEW' && !r.isHidden),
        'FOOD\'S REVIEW': reviews.filter(r => r.category === 'FOOD\'S REVIEW' && !r.isHidden),
        'RIDER\'S REVIEW': reviews.filter(r => r.category === 'RIDER\'S REVIEW' && !r.isHidden),
        'STAFF\'S REVIEW': reviews.filter(r => r.category === 'STAFF\'S REVIEW' && !r.isHidden)
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">
            {/* Sidebar - Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            {/* Sidebar */}
            <div className={`
                                    fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg transform transition-transform duration-300 ease-in-out
                                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                                `}>
                {/* Logo */}
                <div className="p-6 border-b border-amber-600">
                    <div className="flex justify-center items-center gap-3">
                        <img src="/angierens-logo.png" alt="Logo" className="w-50 h-50 object-contain" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.route ||
                            (location.pathname === '/admin-interface' && item.route === '/admin-interface/') ||
                            (location.pathname === '/admin-interface/' && item.route === '/admin-interface/')

                        return (
                            <Link
                                key={index}
                                to={item.route}
                                onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile when link is clicked
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                                    ? 'bg-amber-800 text-yellow-300 shadow-md'
                                    : 'text-amber-900 hover:bg-amber-400 hover:text-amber-800'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium text-xl">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className='border-t border-amber-600'>
                    <div className='w-auto mx-4'>
                        <button className="w-full flex items-center gap-3 px-4 py-3 mt-5 bg-gray-200 opacity-75 text-gray-950 rounded-lg hover:bg-amber-700 hover:text-white transition-colors">
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="bg-amber-800 text-white p-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 text-white hover:bg-amber-700 rounded-lg"
                            >
                                <MenuIcon className="h-6 w-6" />
                            </button>
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold">ORDERS</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-4">
                            <span className="text-amber-200 text-xs lg:text-sm hidden sm:inline">Date: May 16, 2025</span>
                            <span className="text-amber-200 text-xs lg:text-sm hidden sm:inline">Time: 11:00 AM</span>
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <div className='relative'>
                                    <button
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className="relative p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                                    >
                                        <Bell className="h-6 w-6" />
                                        {notificationCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{notificationCount}</span>}
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
                            <div key={category} className="space-y-4 bg-amber-800 rounded-lg">
                                <div className="p-5 space-y-4">
                                    <h3 className={`text-white text-center py-2 px-4 rounded-lg font-semibold ${getCategoryColor(category)}`}>
                                        {category}
                                    </h3>
                                    {categoryReviews.map((review) => (
                                        <div key={review.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                                            <div className="mb-3">
                                                <h4 className="font-semibold text-gray-800 mb-1">{review.customerName}</h4>
                                                <div className="flex gap-1">
                                                    {renderStars(review.rating)}
                                                </div>
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
                                            </div>
                                        </div>
                                    ))}
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
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(selectedReview.category)}`}>
                                    {selectedReview.category}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">{selectedReview.comment}</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        toggleReviewVisibility(selectedReview.id)
                                        setIsViewModalOpen(false)
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedReview.isHidden
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    {selectedReview.isHidden ? 'Show Review' : 'Hide Review'}
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
                            {reviews.filter(review => review.isHidden).map((review) => (
                                <div key={review.id} className="bg-gray-50 rounded-lg p-4 border">
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-gray-800 mb-1">{review.customerName}</h4>
                                        <div className="flex gap-1 mb-2">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(review.category)}`}>
                                            {review.category}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                                    <button
                                        onClick={() => toggleReviewVisibility(review.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition-colors"
                                    >
                                        Show Review
                                    </button>
                                </div>
                            ))}
                            {reviews.filter(review => review.isHidden).length === 0 && (
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
        </div>
    )
}