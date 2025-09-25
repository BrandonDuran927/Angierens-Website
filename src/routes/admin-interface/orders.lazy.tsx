import { createLazyFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import { LayoutDashboard, ShoppingCart, TrendingUp, MessageSquare, Users, Menu as MenuIcon, RefreshCw, LogOut, Search, Filter, Eye, Bell, Plus, ChevronLeft, ChevronRight, Calendar, Clock, CreditCard, Truck, DollarSign, X, Heart, Star, LucideCalendar } from 'lucide-react'

interface Order {
    id: string
    customerName: string
    date: string
    time: string
    price: string
    fulfillmentType: 'Delivery' | 'Pick-up'
    paymentMethod: string
    status: 'New Orders' | 'In Process' | 'Completed'
}

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
    const [showOrderBackView, setShowOrderBackView] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('New Orders')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
    const [orderForm, setOrderForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        fulfillmentType: '',
        selectedItems: [],
        addOns: {
            puto: 0,
            sapinSapin: 0,
            kutsinta: 0
        }
    })
    // 1. ADD THIS STATE VARIABLE (around line 45, with other useState declarations)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)

    const location = useLocation() // Hook to get current location

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

    const orders: Order[] = [
        {
            id: '#06',
            customerName: 'Brandon Duran',
            date: 'May 16, 2025',
            time: '10:30 AM',
            price: 'P 2,350',
            fulfillmentType: 'Delivery',
            paymentMethod: 'Online - GCash 100%',
            status: 'New Orders'
        },
        {
            id: '#07',
            customerName: 'Russel Carlo',
            date: 'May 17, 2025',
            time: '9:40 AM',
            price: 'P 850',
            fulfillmentType: 'Delivery',
            paymentMethod: 'Online - COD: 50% ...',
            status: 'New Orders'
        },
        {
            id: '#08',
            customerName: 'Charles Caadiang',
            date: 'May 17, 2025',
            time: '11:02 AM',
            price: 'P 980',
            fulfillmentType: 'Delivery',
            paymentMethod: 'Online - COD: 50% ...',
            status: 'New Orders'
        },
        {
            id: '#09',
            customerName: 'Prince Manuel',
            date: 'May 17, 2025',
            time: '11:40 AM',
            price: 'P 450',
            fulfillmentType: 'Delivery',
            paymentMethod: 'On-site',
            status: 'New Orders'
        },
        {
            id: '#10',
            customerName: 'Shiela Anne',
            date: 'May 18, 2025',
            time: '2:00 PM',
            price: 'P 450',
            fulfillmentType: 'Delivery',
            paymentMethod: 'Online - GCash 100%',
            status: 'New Orders'
        },
        {
            id: '#11',
            customerName: 'Selita Sesina',
            date: 'May 19, 2025',
            time: '9:05 AM',
            price: 'P 850',
            fulfillmentType: 'Pick-up',
            paymentMethod: 'Online - GCash 100%',
            status: 'New Orders'
        },
        {
            id: '#12',
            customerName: 'Karina Mikana',
            date: 'May 20, 2025',
            time: '10:24 AM',
            price: 'P 2450',
            fulfillmentType: 'Delivery',
            paymentMethod: 'Online - GCash 100%',
            status: 'New Orders'
        },
        {
            id: '#13',
            customerName: 'Elliot Kingsman',
            date: 'May 21, 2025',
            time: '2:40 PM',
            price: 'P 980',
            fulfillmentType: 'Delivery',
            paymentMethod: 'On-site',
            status: 'New Orders'
        },
        {
            id: '#14',
            customerName: 'Karina Mikana',
            date: 'May 22, 2025',
            time: '1:20 PM',
            price: 'P 2450',
            fulfillmentType: 'Delivery',
            paymentMethod: 'Online - GCash 100%',
            status: 'New Orders'
        },
        {
            id: '#15',
            customerName: 'Elliot Kingsman',
            date: 'May 22, 2025',
            time: '2:10 PM',
            price: 'P 980',
            fulfillmentType: 'Delivery',
            paymentMethod: 'On-site',
            status: 'New Orders'
        }
    ]

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

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredOrders.length / 10)
    const startIndex = (currentPage - 1) * 10
    const endIndex = Math.min(startIndex + 10, filteredOrders.length)
    const currentOrders = filteredOrders.slice(startIndex, endIndex)

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg">
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
                        const isActive = location.pathname === item.route

                        return (
                            <Link
                                key={index}
                                to={item.route}
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
                <div className='border-t border-amber-600 mt-auto'>
                    <div className='w-auto mx-4'>
                        <button className="w-full flex items-center gap-3 px-4 py-3 mt-5 bg-gray-200 opacity-75 text-gray-950 rounded-lg hover:bg-amber-700 hover:text-white transition-colors">
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="bg-amber-800 text-white p-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Orders</h2>
                            <p className="text-amber-200 text-sm">Recent transaction activity and all</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-amber-200">Date: May 16, 2025</span>
                            <span className="text-amber-200">Time: 11:00 AM</span>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Table Header */}
                        <div className="p-6 border-b border-gray-200">
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
                                    <button
                                        onClick={() => setIsAddOrderModalOpen(true)}
                                        className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Order Manually
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                {['New Orders', 'In Process', 'Completed'].map((tab) => (
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.fulfillmentType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.paymentMethod}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    For Approval
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                >
                                                    <Eye className="h-6 w-6" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
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
                    {/* Add Order Modal */}
                    {isAddOrderModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-800">Add Order Manually (On-site)</h2>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Left Column - Customer Info & Orders */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name:</label>
                                                <input
                                                    type="text"
                                                    placeholder="Type the full name of the customer"
                                                    value={orderForm.fullName}
                                                    onChange={(e) => setOrderForm(prev => ({ ...prev, fullName: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address:</label>
                                                <input
                                                    type="email"
                                                    placeholder="Type the working email address..."
                                                    value={orderForm.email}
                                                    onChange={(e) => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number:</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Type the working phone number..."
                                                    value={orderForm.phone}
                                                    onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fulfillment Type:</label>
                                                <select
                                                    value={orderForm.fulfillmentType}
                                                    onChange={(e) => setOrderForm(prev => ({ ...prev, fulfillmentType: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                >
                                                    <option value="">Select fulfillment type</option>
                                                    <option value="pickup">Pick-up</option>
                                                    <option value="delivery">Delivery</option>
                                                </select>
                                            </div>

                                            {/* Add orders section */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Add orders:</label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search a name of the item"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>

                                                {/* Current Added Orders List */}
                                                <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="text-sm font-semibold text-gray-700">Current Orders:</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span>• 5 in 1 Mix in Bilao (Palabok)</span>
                                                            <span className="font-semibold">₱ 3,750</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span>• 5 in 1 Mix in Bilao (Carbonara)</span>
                                                            <span className="font-semibold">₱ 3,750</span>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-300 pt-2 mt-2">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <span>Price</span>
                                                            <span className="text-lg">₱ 3,750</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Available Menu items to add */}
                                                <div className="mt-3">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Items:</h4>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        <div className="bg-amber-600 text-white p-3 rounded-lg">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <h4 className="font-semibold">5 in 1 Mix in Bilao (Palabok)</h4>
                                                                    <p className="text-sm opacity-90">Inclusion:</p>
                                                                    <p className="text-xs opacity-75">40 pcs. Pork Shanghai, 30 pcs. Pork Shanghai, 20 pcs. Cheese Stick</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center">-</button>
                                                                    <span className="text-white font-semibold">2</span>
                                                                    <button className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center">+</button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-amber-600 text-white p-3 rounded-lg">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <h4 className="font-semibold">5 in 1 Mix in Bilao (Palabok)</h4>
                                                                    <p className="text-sm opacity-90">Inclusion:</p>
                                                                    <p className="text-xs opacity-75">40 pcs. Pork Shanghai, 30 pcs. Pork Shanghai, 20 pcs. Cheese Stick</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center">-</button>
                                                                    <span className="text-white font-semibold">2</span>
                                                                    <button className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center">+</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Add-ons (same as before) */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Add-ons:</h3>
                                            <div className="space-y-3">
                                                {/* Puto */}
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Puto</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: { ...prev.addOns, puto: Math.max(0, prev.addOns.puto - 1) }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{orderForm.addOns.puto}</span>
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: { ...prev.addOns, puto: prev.addOns.puto + 1 }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Sapin-sapin */}
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Sapin-sapin</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: { ...prev.addOns, sapinSapin: Math.max(0, prev.addOns.sapinSapin - 1) }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{orderForm.addOns.sapinSapin}</span>
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: { ...prev.addOns, sapinSapin: prev.addOns.sapinSapin + 1 }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Kutsinta */}
                                                <div className="flex items-center justify-between">
                                                    <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Kutsinta</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: { ...prev.addOns, kutsinta: Math.max(0, prev.addOns.kutsinta - 1) }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{orderForm.addOns.kutsinta}</span>
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: { ...prev.addOns, kutsinta: prev.addOns.kutsinta + 1 }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setIsAddOrderModalOpen(false)}
                                        className="px-6 py-2 border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Handle form submission here
                                            console.log('Order form:', orderForm)
                                            setIsAddOrderModalOpen(false)
                                        }}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                                <span className="text-xl font-bold text-gray-800">Order ID: {selectedOrder.id}</span>
                                <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Pending
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
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedOrder.customerName}</h3>
                                <p className="text-gray-600 text-lg">2PM To Be Delivered</p>
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
                                    <div className="grid grid-cols-3 gap-4 items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">5 in 1 Mix in Bilao (Palabok)</p>
                                            <p className="text-sm text-gray-600">add-ons: 20 pcs. Puto</p>
                                        </div>
                                        <div className="text-center font-medium">2</div>
                                        <div className="text-right font-bold">₱ 4,100</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">Price</span>
                                    <span className="text-lg font-bold">₱ 4,100</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">Delivery fee</span>
                                    <span className="text-lg font-bold">₱ 75</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-3">
                                    <span>Remaining Total</span>
                                    <span>₱ 4,175</span>
                                </div>
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
                            <div className="flex items-center gap-3">
                                <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                                    Reject
                                </button>
                                <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                                    Accept
                                </button>
                            </div>
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
                                    Pending
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
                                <p className="text-gray-600">Blk 20, Lot 15, Queensville, Caloocan City</p>
                            </div>

                            {/* Customer Contact */}
                            <div className="flex">
                                <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Customer Contact #:</h4>
                                <p className="text-gray-600">+63 123 123 1234</p>
                            </div>

                            {/* Special Instructions */}
                            <div className="flex">
                                <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Special Instructions:</h4>
                                <p className="text-gray-600">Wag po paramihan yung bawang..</p>
                            </div>

                            {/* Fulfillment Type */}
                            <div className="flex">
                                <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Fulfillment Type:</h4>
                                <p className="text-gray-600">{selectedOrder.fulfillmentType}</p>
                            </div>

                            {/* Order Type */}
                            <div className="flex">
                                <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Order Type:</h4>
                                <p className="text-gray-600">Today</p>
                            </div>

                            {/* Payment Percentage */}
                            <div className="flex">
                                <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Payment %:</h4>
                                <p className="text-gray-600">100</p>
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
                            <div className="flex items-center gap-3">
                                <button className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                                    Reject
                                </button>
                                <button className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}