import { createLazyFileRoute, useLocation, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    MessageSquare,
    Users,
    Menu as MenuIcon,
    X,
    Bell,
    Star,
    Heart,
    Search,
    Filter,
    Menu,
    Calendar,
    Settings,
    User,
    DollarSign,
    Package,
    Truck,
    LogOut
} from 'lucide-react'

export const Route = createLazyFileRoute('/staff/refund')({
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

interface RefundRequest {
    id: string
    orderId: string
    customerName: string
    item: string
    date: string
    time: string
    confirmation: 'Pending' | 'Approved' | 'Rejected'
    paymentMethod: string
    gcashNumber: string
    orderMethod: string
    requestDateTime: string
    items: Array<{
        name: string
        qty: number
        price: number
    }>
    priceOfFood: number
    deliveryFee: number
    downPayment: number
    gcashFees: number
    total: number
}

function RouteComponent() {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [filterModal, setFilterModal] = useState({
        isOpen: false,
        dateFrom: '',
        dateTo: '',
        status: 'All'
    })


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

    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([
        {
            id: '1',
            orderId: '#017',
            customerName: 'Russel Carlo',
            item: 'Bilao 1',
            date: 'May 17, 2025',
            time: '14:04:23',
            confirmation: 'Pending',
            paymentMethod: 'GCash 50%',
            gcashNumber: '+63 948....',
            orderMethod: 'Delivery',
            requestDateTime: 'Sat, May 17, 2025  10:32 AM',
            items: [
                {
                    name: 'Sapin-sapin Kutsinta',
                    qty: 1,
                    price: 650
                }
            ],
            priceOfFood: 650,
            deliveryFee: 75,
            downPayment: 362.5,
            gcashFees: 7.25,
            total: 355.25
        },
        {
            id: '2',
            orderId: '#018',
            customerName: 'Maria Santos',
            item: 'Adobo Rice',
            date: 'May 16, 2025',
            time: '12:30:15',
            confirmation: 'Approved',
            paymentMethod: 'Cash',
            gcashNumber: '',
            orderMethod: 'Pickup',
            requestDateTime: 'Fri, May 16, 2025  12:35 PM',
            items: [
                {
                    name: 'Adobo Rice',
                    qty: 2,
                    price: 120
                }
            ],
            priceOfFood: 240,
            deliveryFee: 0,
            downPayment: 120,
            gcashFees: 0,
            total: 240
        },
        {
            id: '3',
            orderId: '#019',
            customerName: 'John Dela Cruz',
            item: 'Pancit Canton',
            date: 'May 16, 2025',
            time: '10:45:30',
            confirmation: 'Rejected',
            paymentMethod: 'GCash 100%',
            gcashNumber: '+63 912....',
            orderMethod: 'Delivery',
            requestDateTime: 'Fri, May 16, 2025  10:50 AM',
            items: [
                {
                    name: 'Pancit Canton',
                    qty: 1,
                    price: 180
                }
            ],
            priceOfFood: 180,
            deliveryFee: 75,
            downPayment: 255,
            gcashFees: 5.5,
            total: 249.5
        },
        {
            id: '4',
            orderId: '#020',
            customerName: 'Anna Garcia',
            item: 'Lechon Kawali',
            date: 'May 15, 2025',
            time: '16:20:45',
            confirmation: 'Pending',
            paymentMethod: 'GCash 75%',
            gcashNumber: '+63 905....',
            orderMethod: 'Delivery',
            requestDateTime: 'Thu, May 15, 2025  16:25 PM',
            items: [
                {
                    name: 'Lechon Kawali',
                    qty: 1,
                    price: 320
                }
            ],
            priceOfFood: 320,
            deliveryFee: 75,
            downPayment: 296.25,
            gcashFees: 6.75,
            total: 289.5
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

    const handleConfirmationChange = (requestId: string, newStatus: 'Approved' | 'Rejected') => {
        setRefundRequests(prev =>
            prev.map(request =>
                request.id === requestId
                    ? { ...request, confirmation: newStatus }
                    : request
            )
        )
    }

    const handleOpenReviewModal = (request: RefundRequest) => {
        setSelectedRefund(request)
        setIsReviewModalOpen(true)
    }

    const handleApproveRefund = () => {
        if (selectedRefund) {
            handleConfirmationChange(selectedRefund.id, 'Approved')
            setIsReviewModalOpen(false)
        }
    }

    const handleRejectRefund = () => {
        if (selectedRefund) {
            handleConfirmationChange(selectedRefund.id, 'Rejected')
            setIsReviewModalOpen(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-500 text-white'
            case 'Approved':
                return 'bg-green-500 text-white'
            case 'Rejected':
                return 'bg-red-500 text-white'
            default:
                return 'bg-gray-500 text-white'
        }
    }

    const filteredRequests = refundRequests.filter(request => {
        const matchesSearch = request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.item.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterModal.status === 'All' || request.confirmation === filterModal.status

        const requestDate = new Date(request.date)
        const matchesDateRange = (!filterModal.dateFrom || requestDate >= new Date(filterModal.dateFrom)) &&
            (!filterModal.dateTo || requestDate <= new Date(filterModal.dateTo))

        return matchesSearch && matchesFilter && matchesDateRange
    })

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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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


    return (
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
                            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                                <img src="/api/placeholder/40/40" alt="Logo" className="w-8 h-8 rounded-full" />
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

                {/* Logout Button */}
                <div className="px-4 pb-6">
                    <button className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors">
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

            <div className="flex-1 flex flex-col min-w-0">
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
                                <h1 className="text-xl lg:text-3xl font-bold">REFUND</h1>
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

                {/* Refund Content */}
                <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
                    {/* Search + Filter */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="bg-white flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search a name, order, or etc"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                            />
                        </div>
                        <button
                            onClick={() => setFilterModal({ ...filterModal, isOpen: true })}
                            className="bg-white flex items-center justify-center sm:justify-start gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                        >
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filter</span>
                        </button>
                    </div>

                    {/* Refund Table (scrollable on small screens) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-0 overflow-hidden">
                        {/* Scrollable Table */}
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-[800px] w-full text-sm sm:text-base">
                                <thead className="bg-amber-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-medium">ORDER ID</th>
                                        <th className="px-6 py-4 text-left font-medium">CUSTOMER</th>
                                        <th className="px-6 py-4 text-left font-medium">ITEM</th>
                                        <th className="px-6 py-4 text-left font-medium">DATE</th>
                                        <th className="px-6 py-4 text-left font-medium">TIME</th>
                                        <th className="px-6 py-4 text-left font-medium">STATUS</th>
                                        <th className="px-6 py-4 text-center font-medium">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="p-4">{request.orderId}</td>
                                            <td className="p-4">{request.customerName}</td>
                                            <td className="p-4">{request.item}</td>
                                            <td className="p-4">{request.date}</td>
                                            <td className="p-4">{request.time}</td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                        request.confirmation
                                                    )}`}
                                                >
                                                    {request.confirmation}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleOpenReviewModal(request)}
                                                    className="bg-yellow-400 text-amber-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-500 transition-colors"
                                                >
                                                    REVIEW
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRequests.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-gray-500">
                                                No refund requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Review Modal */}
            {isReviewModalOpen && selectedRefund && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full shadow-xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-400">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Refund Details</h3>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Customer Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-gray-800 font-medium">{selectedRefund.customerName}</p>
                                <p className="text-gray-600 text-sm">
                                    Payment Method: {selectedRefund.paymentMethod}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                {selectedRefund.gcashNumber && (
                                    <p className="text-gray-600 text-sm">Gcash #: {selectedRefund.gcashNumber}</p>
                                )}
                                <p className="text-gray-600 text-sm">Order Method: {selectedRefund.orderMethod}</p>
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="flex flex-col sm:flex-row justify-between mb-6">
                            <div>
                                <p className="text-gray-800">{selectedRefund.date}</p>
                                <p className="text-gray-600 text-sm">Request date and time:</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-gray-800">{selectedRefund.time}</p>
                                <p className="text-gray-600 text-sm">{selectedRefund.requestDateTime}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6">
                            <div className="grid grid-cols-3 gap-4 font-medium text-gray-800 mb-2 text-sm sm:text-base">
                                <span>Items</span>
                                <span className="text-center">Qty</span>
                                <span className="text-right">Price</span>
                            </div>
                            {selectedRefund.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-3 gap-4 text-gray-700 py-2 text-sm sm:text-base"
                                >
                                    <span>{item.name}</span>
                                    <span className="text-center">{item.qty}</span>
                                    <span className="text-right">₱ {item.price}</span>
                                </div>
                            ))}
                        </div>

                        <hr className="border-gray-300 mb-4" />

                        {/* Pricing Breakdown */}
                        <div className="space-y-2 mb-6 text-sm sm:text-base">
                            <div className="flex justify-between">
                                <span className="text-gray-800">Price of food:</span>
                                <span className="text-gray-800">₱ {selectedRefund.priceOfFood}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-800">Delivery fee:</span>
                                <span className="text-gray-800">₱ {selectedRefund.deliveryFee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-800">Down payment 50%:</span>
                                <span className="text-gray-800">₱ {selectedRefund.downPayment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-800">Gcash fees:</span>
                                <span className="text-gray-800">- ₱ {selectedRefund.gcashFees}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                                <span className="text-gray-800">Total:</span>
                                <span className="text-gray-800">₱ {selectedRefund.total}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                            {selectedRefund.confirmation === 'Pending' ? (
                                <>
                                    <button
                                        onClick={handleApproveRefund}
                                        className="flex-1 bg-green-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm sm:text-base"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={handleRejectRefund}
                                        className="flex-1 bg-red-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {filterModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-400">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Filter Options</h3>
                            <button
                                onClick={() => setFilterModal({ ...filterModal, isOpen: false })}
                                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Date Range */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">From</label>
                                    <input
                                        type="date"
                                        value={filterModal.dateFrom}
                                        onChange={(e) => setFilterModal({ ...filterModal, dateFrom: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">To</label>
                                    <input
                                        type="date"
                                        value={filterModal.dateTo}
                                        onChange={(e) => setFilterModal({ ...filterModal, dateTo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <div className="space-y-2">
                                {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterModal({ ...filterModal, status })}
                                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${filterModal.status === status ? 'bg-yellow-100 text-amber-800' : 'text-gray-700'
                                            } text-sm sm:text-base`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                            <button
                                onClick={() =>
                                    setFilterModal({ isOpen: false, dateFrom: '', dateTo: '', status: 'All' })
                                }
                                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setFilterModal({ ...filterModal, isOpen: false })}
                                className="flex-1 bg-yellow-400 text-amber-800 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors text-sm sm:text-base"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}
