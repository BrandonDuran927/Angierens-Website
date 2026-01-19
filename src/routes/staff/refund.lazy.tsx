import { createLazyFileRoute, useLocation, Link } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { MessageSquare, Menu as MenuIcon, X, Bell, Star, Heart, Search, Filter, Menu, Calendar, Settings, User, DollarSign, Package, Truck, LogOut, ChefHat } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'

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
    orderNumber: string
    customerName: string
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
    refundId: string
    response: string | null
    proofOfRefundUrl: string | null
}

function RouteComponent() {
    const navigate = useNavigate();
    const { user, signOut } = useUser()

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }
    const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const location = useLocation()
    const [filterModal, setFilterModal] = useState({
        isOpen: false,
        dateFrom: '',
        dateTo: '',
        status: 'All'
    })
    const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
    const [loading, setLoading] = useState(true)

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

    // Fetch refund requests from Supabase
    useEffect(() => {
        fetchRefundRequests()
    }, [])

    const fetchRefundRequests = async () => {
        try {
            setLoading(true)

            const { data: refunds, error } = await supabase
                .from('refund')
                .select(`
          refund_id,
          reason,
          status,
          request_date,
          gcash_number,
          response,
          proof_of_refund_url,
          order_id,
          order:order_id (
            order_id,
            order_number,
            order_type,
            total_price,
            created_at,
            customer_uid,
            payment_id,
            delivery_id,
            users:customer_uid (
              first_name,
              middle_name,
              last_name,
              phone_number
            ),
            payment:payment_id (
              payment_method,
              amount_paid,
              payment_date
            ),
            delivery:delivery_id (
              delivery_fee
            ),
            order_item (
              quantity,
              subtotal_price,
              menu:menu_id (
                name,
                price
              )
            )
          )
        `)
                .order('request_date', { ascending: false })

            if (error) throw error

            const formattedRefunds: RefundRequest[] = refunds.map((refund: any) => {
                const order = refund.order
                const user = order.users
                const payment = order.payment
                const delivery = order.delivery
                const orderItems = order.order_item

                // Format customer name
                const customerName = `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`

                // Format phone number for GCash (mask it)
                const phoneNumber = refund.gcash_number
                console.log('GCash Number:', phoneNumber)
                const maskedPhone = phoneNumber ? `+63 ${phoneNumber.substring(0, 3)}....` : ''
                console.log('Masked GCash Number:', maskedPhone)

                // Calculate price breakdown
                const priceOfFood = orderItems.reduce((sum: number, item: any) => sum + parseFloat(item.subtotal_price), 0)
                const deliveryFee = delivery ? parseFloat(delivery.delivery_fee) : 0
                const amountPaid = payment ? parseFloat(payment.amount_paid) : 0

                // Calculate GCash fees (2% of amount paid)
                const gcashFees = payment && payment.payment_method !== 'Cash' ? amountPaid * 0.02 : 0

                // Total refund amount = amount paid - gcash fees
                const totalRefund = amountPaid - gcashFees

                // Format payment method
                let paymentMethodDisplay = payment ? payment.payment_method : 'N/A'
                if (payment && payment.payment_method === 'GCash') {
                    const totalAmount = priceOfFood + deliveryFee
                    const percentage = totalAmount > 0 ? ((amountPaid / totalAmount) * 100).toFixed(0) : '0'
                    paymentMethodDisplay = `GCash`
                }

                // Format dates and times
                const orderDate = new Date(order.created_at)
                const requestDate = new Date(refund.request_date)

                const formatDate = (date: Date) => {
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                }

                const formatTime = (date: Date) => {
                    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                }

                const formatRequestDateTime = (date: Date) => {
                    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) + '  ' +
                        date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                }

                // Map refund status
                let confirmationStatus: 'Pending' | 'Approved' | 'Rejected' = 'Pending'
                if (refund.status === 'Approved') confirmationStatus = 'Approved'
                if (refund.status === 'Rejected') confirmationStatus = 'Rejected'

                // Format order items
                const items = orderItems.map((item: any) => ({
                    name: item.menu.name,
                    qty: item.quantity,
                    price: parseFloat(item.subtotal_price)
                }))

                return {
                    id: refund.refund_id,
                    refundId: refund.refund_id,
                    orderId: order.order_id,
                    orderNumber: `#${order.order_number.toString().padStart(3, '0')}`,
                    customerName,
                    date: formatDate(orderDate),
                    time: formatTime(orderDate),
                    confirmation: confirmationStatus,
                    paymentMethod: paymentMethodDisplay,
                    gcashNumber: payment && payment.payment_method !== 'On-Site Cash' ? maskedPhone : '',
                    orderMethod: order.order_type === 'Delivery' ? 'Delivery' : 'Pickup',
                    requestDateTime: formatRequestDateTime(requestDate),
                    items,
                    priceOfFood,
                    deliveryFee,
                    downPayment: amountPaid,
                    gcashFees: parseFloat(gcashFees.toFixed(2)),
                    total: parseFloat(totalRefund.toFixed(2)),
                    response: refund.response || null,
                    proofOfRefundUrl: refund.proof_of_refund_url || null
                }
            })

            setRefundRequests(formattedRefunds)
            console.log('Fetched refund requests:', formattedRefunds)
        } catch (error) {
            console.error('Error fetching refund requests:', error)
        } finally {
            setLoading(false)
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

    const handleOpenReviewModal = (request: RefundRequest) => {
        setSelectedRefund(request)
        setIsReviewModalOpen(true)
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
            request.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = filterModal.status === 'All' || request.confirmation === filterModal.status

        const requestDate = new Date(request.date)
        const matchesDateRange = (!filterModal.dateFrom || requestDate >= new Date(filterModal.dateFrom)) &&
            (!filterModal.dateTo || requestDate <= new Date(filterModal.dateTo))

        return matchesSearch && matchesFilter && matchesDateRange
    })

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

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
                    <main className="flex-1 p-6 overflow-y-auto">
                        {/* Search and Filter */}
                        <div className="mb-6 flex gap-4">
                            <div className="bg-white flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search a name, order, or etc"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => setFilterModal({ ...filterModal, isOpen: true })}
                                className="bg-white flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="h-4 w-4" />
                                Filter
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Scroll wrapper */}
                            <div className="overflow-x-auto">
                                {/* Force wide layout */}
                                <table className="min-w-[900px] w-full table-fixed">
                                    {/* Table Header */}
                                    <thead className="bg-amber-800 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium tracking-wider">ORDER #</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium tracking-wider">CUSTOMER NAME</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium tracking-wider">DATE</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium tracking-wider">TIME</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium tracking-wider">CONFIRMATION</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium tracking-wider">REFUND BUTTON</th>
                                        </tr>
                                    </thead>

                                    {/* Loading State */}
                                    {loading ? (
                                        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                                            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                                <p className="text-gray-700 font-medium">Processing...</p>
                                            </div>
                                        </div>
                                    ) : (

                                        <tbody className="divide-y divide-gray-200">
                                            {filteredRequests.map((request) => (
                                                <tr
                                                    key={request.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-800">{request.orderNumber}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{request.customerName}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{request.date}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">{request.time}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                                request.confirmation
                                                            )}`}
                                                        >
                                                            {request.confirmation}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">
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
                                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                                        No refund requests found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    )}
                                </table>
                            </div>
                        </div>

                    </main>
                </div>

                {/* Review Modal - View Only */}
                {isReviewModalOpen && selectedRefund && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-400">
                                <h3 className="text-xl font-bold text-gray-800">Refund Details</h3>
                                <button
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Customer Details */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-gray-800 font-medium">{selectedRefund.customerName}</p>
                                    <p className="text-gray-600 text-sm">Payment Method: {selectedRefund.paymentMethod}</p>
                                </div>
                                <div className="text-right">
                                    {selectedRefund.gcashNumber && (
                                        <p className="text-gray-600 text-sm">Gcash #: {selectedRefund.gcashNumber}</p>
                                    )}
                                    <p className="text-gray-600 text-sm">Order Method: {selectedRefund.orderMethod}</p>
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="flex justify-between mb-6">
                                <div>
                                    <p className="text-gray-800">{selectedRefund.date}</p>
                                    <p className="text-gray-600 text-sm">Request date and time:</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-800">{selectedRefund.time}</p>
                                    <p className="text-gray-600 text-sm">{selectedRefund.requestDateTime}</p>
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-6">
                                <div className="grid grid-cols-3 gap-4 font-medium text-gray-800 mb-2">
                                    <span>Items</span>
                                    <span className="text-center">Qty</span>
                                    <span className="text-right">Price</span>
                                </div>
                                {selectedRefund.items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-4 text-gray-700 py-2">
                                        <span>{item.name}</span>
                                        <span className="text-center">{item.qty}</span>
                                        <span className="text-right">₱ {item.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="border-gray-300 mb-4" />

                            {/* Pricing Breakdown */}
                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-800">Price of food:</span>
                                    <span className="text-gray-800">₱ {selectedRefund.priceOfFood.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-800">Delivery fee:</span>
                                    <span className="text-gray-800">₱ {selectedRefund.deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-800">Amount paid:</span>
                                    <span className="text-gray-800">₱ {selectedRefund.downPayment.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-800">Gcash fees (2%):</span>
                                    <span className="text-gray-800">- ₱ {selectedRefund.gcashFees.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span className="text-gray-800">Total refund:</span>
                                    <span className="text-gray-800">₱ {selectedRefund.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Response Section - Show when refund is processed */}
                            {selectedRefund.confirmation !== 'Pending' && selectedRefund.response && (
                                <div className="mb-6 p-4 rounded-lg border bg-gray-50">
                                    <h4 className="font-semibold text-gray-800 mb-2">Response</h4>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedRefund.response}</p>
                                </div>
                            )}

                            {/* Proof of Refund Image - Show when refund is approved */}
                            {selectedRefund.confirmation === 'Approved' && selectedRefund.proofOfRefundUrl && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-2">Proof of Refund</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <img
                                            src={selectedRefund.proofOfRefundUrl}
                                            alt="Proof of refund"
                                            className="w-full max-h-64 object-contain bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(selectedRefund.proofOfRefundUrl!, '_blank')}
                                        />
                                        <p className="text-xs text-gray-500 text-center py-2">Click image to view full size</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons - View Only (Close button only) */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Modal */}
                {filterModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-400">
                                <h3 className="text-xl font-bold text-gray-800">Filter Options</h3>
                                <button
                                    onClick={() => setFilterModal({ ...filterModal, isOpen: false })}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Date Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">From</label>
                                        <input
                                            type="date"
                                            value={filterModal.dateFrom}
                                            onChange={(e) => setFilterModal({ ...filterModal, dateFrom: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">To</label>
                                        <input
                                            type="date"
                                            value={filterModal.dateTo}
                                            onChange={(e) => setFilterModal({ ...filterModal, dateTo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
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
                                                }`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setFilterModal({ isOpen: false, dateFrom: '', dateTo: '', status: 'All' })}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setFilterModal({ ...filterModal, isOpen: false })}
                                    className="flex-1 bg-yellow-400 text-amber-800 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
