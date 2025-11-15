import { createLazyFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'
import { LayoutDashboard, ShoppingCart, TrendingUp, MessageSquare, Users, Menu as MenuIcon, RefreshCw, LogOut, Search, Filter, Eye, Bell, Plus, ChevronLeft, ChevronRight, Calendar, Clock, CreditCard, Truck, DollarSign, X, Heart, Star, LucideCalendar } from 'lucide-react'
import { fetchOrders } from '@/lib/api'
import type {
    Order
} from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'


interface Notification {
    id: string
    type: 'order' | 'feedback'
    title: string
    time: string
    icon: 'heart' | 'message' | 'star'
    read: boolean
}

interface FilterState {
    dateRange: string
    paymentMethod: string
    fulfillmentType: string
    priceRange: string
    status: string
}

export const Route = createLazyFileRoute('/admin-interface/orders')({
    component: AdminOrdersInterface,
})

function AdminOrdersInterface() {
    const { user, signOut } = useUser()
    const navigate = useNavigate();

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }


    type TabType = 'New Orders' | 'In Process' | 'Completed'
    const tabs: TabType[] = ['New Orders', 'In Process', 'Completed']
    const [activeTab, setActiveTab] = useState<TabType>('New Orders')


    const [showOrderBackView, setShowOrderBackView] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const orderPrice = selectedOrder?.order_item.reduce((sum, item) => {
        let itemTotal = Number(item.subtotal_price);

        if (item.order_item_add_on && item.order_item_add_on.length > 0) {
            const addOnsTotal = item.order_item_add_on.reduce((addOnSum: number, addon: any) => {
                return addOnSum + Number(addon.subtotal_price);
            }, 0);
            itemTotal += addOnsTotal;
        }

        return sum + itemTotal;
    }, 0) || 0;


    const location = useLocation()
    const statusGroups = {
        'New Orders': ['Pending'],
        'In Process': ['Queueing', 'Preparing', 'Cooking', 'Ready', 'Refunding', 'On Delivery', 'Claim Order'],
        'Completed': ['Completed', 'Cancelled', 'Refund']
    };



    const { data: orders = [], isLoading, error, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
        refetchInterval: 30000,
    })

    useEffect(() => {
        if (orders.length > 0) {
            console.log("✅ Orders fetched successfully:", orders)
        } else if (!isLoading && !error) {
            console.log("⚠️ No orders found.")
        }
    }, [orders, isLoading, error])

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

    const [filters, setFilters] = useState<FilterState>({
        dateRange: '',
        paymentMethod: '',
        fulfillmentType: '',
        priceRange: '',
        status: ''
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

    const openOrderDetails = (order: Order) => {
        setSelectedOrder(order)
        setIsOrderDetailsModalOpen(true)
    }

    const closeOrderDetails = () => {
        setSelectedOrder(null)
        setIsOrderDetailsModalOpen(false)
    }

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    }

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        console.log('Applying filters:', filters)
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setFilters({
            dateRange: '',
            paymentMethod: '',
            fulfillmentType: '',
            priceRange: '',
            status: ''
        })
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

    const filteredOrdersTab = orders.filter((order) =>
        statusGroups[activeTab]?.includes(order.order_status)
    );

    // Filter orders based on search query
    const filteredOrders = orders.filter(order =>
        order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / 10)
    const startIndex = (currentPage - 1) * 10
    const endIndex = Math.min(startIndex + 10, filteredOrders.length)
    const currentOrders = filteredOrders.slice(startIndex, endIndex)


    const LoadingSpinner = () => (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                <p className="text-gray-700 font-medium">Processing...</p>
            </div>
        </div>
    );

    const formatScheduleTime = (dateStr: string, timeStr: string): string => {
        // Convert to Date object for formatting
        const date = new Date(`${dateStr}T${timeStr}`);

        // Format time (e.g. 10:00:00 → 10 AM)
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
        });

        // Format date (e.g. 2025-11-03 → November 3, 2025)
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        return `${formattedTime} to be delivered on ${formattedDate}`;
    }

    return (
        <ProtectedRoute allowedRoles={['owner']}>

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
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 mt-5 bg-gray-200 opacity-75 text-gray-950 rounded-lg hover:bg-amber-700 hover:text-white transition-colors cursor-pointer"
                                onClick={handleLogout}
                            >
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-0 overflow-hidden">
                            {/* Table Header */}
                            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search order by ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsFilterOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Filter className="h-4 w-4" />
                                            Filter
                                        </button>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2 mb-4">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                                                ? 'bg-yellow-400 text-amber-800'
                                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrdersTab.length > 0 ? (
                                            filteredOrdersTab.map((order) => (
                                                <tr key={order.order_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {order.user.customer_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {order.date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {order.time}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ₱ {order.total_price}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {order.order_type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {order.payment.paymentMethod ?? 'No payment yet'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex gap-2">
                                                            {order.order_status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <button
                                                            onClick={() => openOrderDetails(order)}
                                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                                        >
                                                            <Eye className="h-6 w-6" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={9} className="text-center py-6 text-gray-500">
                                                    No orders found in this category
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {startIndex + 1} to {endIndex} out of {filteredOrders.length} records
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded-lg ${page === currentPage
                                                ? 'bg-yellow-400 text-amber-800 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* Filter Modal */}
                {isFilterOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    <Filter className="h-6 w-6 text-amber-600" />
                                    Filter Orders
                                </h2>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Date Range Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Calendar className="h-4 w-4 text-amber-600" />
                                        Date Range
                                    </label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">All Dates</option>
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="last7days">Last 7 Days</option>
                                        <option value="last30days">Last 30 Days</option>
                                        <option value="thisMonth">This Month</option>
                                        <option value="lastMonth">Last Month</option>
                                    </select>
                                </div>

                                {/* Payment Method Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <CreditCard className="h-4 w-4 text-amber-600" />
                                        Payment Method
                                    </label>
                                    <select
                                        value={filters.paymentMethod}
                                        onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">All Payment Methods</option>
                                        <option value="gcash">GCash</option>
                                        <option value="cod">Cash on Delivery (COD)</option>
                                        <option value="onsite">On-site Payment</option>
                                        <option value="mixed">Mixed Payment</option>
                                    </select>
                                </div>

                                {/* Fulfillment Type Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Truck className="h-4 w-4 text-amber-600" />
                                        Fulfillment Type
                                    </label>
                                    <select
                                        value={filters.fulfillmentType}
                                        onChange={(e) => handleFilterChange('fulfillmentType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">All Fulfillment Types</option>
                                        <option value="delivery">Delivery</option>
                                        <option value="pickup">Pick-up</option>
                                    </select>
                                </div>

                                {/* Price Range Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <DollarSign className="h-4 w-4 text-amber-600" />
                                        Price Range
                                    </label>
                                    <select
                                        value={filters.priceRange}
                                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">All Price Ranges</option>
                                        <option value="0-500">₱0 - ₱500</option>
                                        <option value="501-1000">₱501 - ₱1,000</option>
                                        <option value="1001-2000">₱1,001 - ₱2,000</option>
                                        <option value="2001-5000">₱2,001 - ₱5,000</option>
                                        <option value="5000+">₱5,000+</option>
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                        Order Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="new">New Orders</option>
                                        <option value="inprocess">In Process</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                >
                                    Clear All Filters
                                </button>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        className="px-6 py-3 bg-yellow-400 text-amber-800 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details Modal */}
                {isOrderDetailsModalOpen && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-600 font-medium">FRONT</span>
                                    <span className="text-xl font-bold text-gray-800">Order #: {selectedOrder.order_number}</span>
                                    <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                        {selectedOrder.order_status}
                                    </span>
                                </div>
                                <button
                                    onClick={closeOrderDetails}
                                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedOrder.user.customer_name}</h3>
                                    <p className="text-gray-600 text-lg">{formatScheduleTime(selectedOrder.schedule.schedule_date, selectedOrder.schedule.schedule_time)}</p>
                                </div>

                                {/* Date and Time */}
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>{selectedOrder.date}</span>
                                    <span>{selectedOrder.time}</span>
                                </div>

                                {/* Items Table */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <span className="font-medium text-gray-700">Items</span>
                                        <span className="font-medium text-gray-700 text-center">Qty</span>
                                        <span className="font-medium text-gray-700 text-right">Price</span>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedOrder?.order_item?.length ? (
                                            <>
                                                {selectedOrder.order_item.map((item) => (
                                                    <div key={item.order_item_id}>
                                                        {/* Main menu item */}
                                                        <div className="grid grid-cols-3 gap-4 items-start">
                                                            <div>
                                                                <p className="font-medium text-gray-800">{item.menu.name} (₱ {item.menu.price})</p>
                                                                {item.menu.inclusion && (
                                                                    <p className="text-sm text-gray-600 mb-1.5">inclusions: {item.menu.inclusion}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-center font-medium">{item.quantity}</div>
                                                            <div className="text-right font-bold">₱ {Number(item.subtotal_price).toLocaleString()}</div>
                                                        </div>

                                                        {/* Add-ons for this item */}
                                                        {item.order_item_add_on && item.order_item_add_on.length > 0 && (
                                                            <div className="ml-6 mt-2 space-y-2">
                                                                {item.order_item_add_on.map((addon: any) => (
                                                                    <div key={addon.order_item_add_on_id} className="grid grid-cols-3 gap-4 items-start">
                                                                        <div>
                                                                            <p className="text-sm text-gray-600">+ {addon.add_on.name} (₱ {addon.add_on.price})</p>
                                                                        </div>
                                                                        <div className="text-center text-sm text-gray-600">{addon.quantity}</div>
                                                                        <div className="text-right text-sm font-semibold text-gray-600">₱ {Number(addon.subtotal_price).toLocaleString()}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-center italic">No items found.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium">Subtotal</span>
                                        <span className="text-lg font-bold">₱ {orderPrice?.toLocaleString()}</span>
                                    </div>
                                    {selectedOrder.delivery && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium">Delivery fee</span>
                                            <span className="text-lg font-bold">
                                                ₱ {Number(selectedOrder.delivery.delivery_fee || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
                                        <span className="text-xl font-bold">Total</span>
                                        <span className="text-2xl font-bold text-amber-600">
                                            ₱ {(orderPrice + (selectedOrder.delivery ? Number(selectedOrder.delivery.delivery_fee || 0) : 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-5 w-5 text-gray-600" />
                                        <span className="font-medium text-gray-700">Payment Method</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {selectedOrder.payment.paymentMethod || 'On-Site Payment'}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setIsOrderDetailsModalOpen(false)
                                        setShowOrderBackView(true)
                                    }}
                                    className="px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                >
                                    See more
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Back View Modal */}
                {showOrderBackView && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            setShowOrderBackView(false)
                                            setIsOrderDetailsModalOpen(true)
                                        }}
                                        className="text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        BACK
                                    </button>
                                    <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                        {selectedOrder.order_status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowOrderBackView(false)
                                        closeOrderDetails()
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Delivery Address */}
                                <div className="flex">
                                    <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Delivery Address:</h4>
                                    <p className="text-gray-600">{selectedOrder.delivery.address.address_line}, {selectedOrder.delivery.address.barangay}, {selectedOrder.delivery.address.city}</p>
                                </div>

                                {/* Customer Contact */}
                                <div className="flex">
                                    <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Customer Contact #:</h4>
                                    <p className="text-gray-600">{selectedOrder.user.phone_number}</p>
                                </div>

                                {/* Special Instructions */}
                                <div className="flex">
                                    <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Special Instructions:</h4>
                                    <p className="text-gray-600">{selectedOrder.additional_information}</p>
                                </div>

                                {/* Fulfillment Type */}
                                <div className="flex">
                                    <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Fulfillment Type:</h4>
                                    <p className="text-gray-600">{selectedOrder.order_type}</p>
                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setShowOrderBackView(false)
                                        setIsOrderDetailsModalOpen(true)
                                    }}
                                    className="px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Go back
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading Spinner */}
                {isLoading && <LoadingSpinner />}
            </div>
        </ProtectedRoute>
    )
}









