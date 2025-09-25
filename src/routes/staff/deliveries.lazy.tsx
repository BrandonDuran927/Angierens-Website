import { createLazyFileRoute, Link } from '@tanstack/react-router'
import React, { useState } from 'react'
import {
    Search,
    Filter,
    Eye,
    Bell,
    ChevronLeft,
    ChevronRight,
    Clock,
    Menu,
    CreditCard,
    X,
    Calendar,
    Settings,
    User,
    DollarSign,
    Package,
    Truck,
    LogOut,
    Star
} from 'lucide-react'

// Route definition
export const Route = createLazyFileRoute('/staff/deliveries')({
    component: RouteComponent,
})

// Your DeliveryManagement component
function RouteComponent() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('All Assigned Orders')
    const [currentPage, setCurrentPage] = useState(1)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [selectedRider, setSelectedRider] = useState('')
    const [deliveryStatus, setDeliveryStatus] = useState('')
    const ordersPerPage = 10
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<any>(null)
    const [selectedRiderForModal, setSelectedRiderForModal] = useState<string>('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState({
        dateRange: '',
        assignedRider: '',
        status: '',
        priceRange: '',
        customerName: ''
    })
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [showOrderBackView, setShowOrderBackView] = useState(false)
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false)
    const [cancellationDetails, setCancellationDetails] = useState<any>(null)


    const deliveryOrders = [
        {
            id: '#06',
            customerName: 'Brandon Duran',
            assignedRider: null,
            assignedDate: 'May 16, 2025',
            assignedTime: '10:30 AM',
            price: '₱ 2,350',
            cancellationRequest: 'Pending',
            status: 'For Delivery',
            address: '123 Main St, Quezon City',

            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
        {
            id: '#07',
            customerName: 'Russel Carlo',
            assignedRider: 'Lenny Wise',
            assignedDate: 'May 17, 2025',
            assignedTime: '9:40 AM',
            price: '₱ 850',
            cancellationRequest: 'Pending',
            status: 'Preparing',
            address: '456 Oak Ave, Makati City',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425,
            cancellationDetails: {
                date: 'May 20, 2025',
                time: '11:45 AM',
                reason: 'Bhos, my 3mergeny kMi, pxensia n',
                requestedBy: 'Lenny Wise'
            }
        },
        {
            id: '#08',
            customerName: 'Charles Caadiang',
            assignedRider: 'Marky Nayz',
            assignedDate: 'May 17, 2025',
            assignedTime: '11:02 AM',
            price: '₱ 980',
            cancellationRequest: 'None',
            status: 'Queueing',
            address: '789 Pine Rd, Pasig City',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
        {
            id: '#09',
            customerName: 'Prince Manuel',
            assignedRider: null,
            assignedDate: 'May 17, 2025',
            assignedTime: '11:40 AM',
            price: '₱ 450',
            cancellationRequest: 'None',
            status: 'Ready',
            address: '321 Elm St, Taguig City',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
        {
            id: '#10',
            customerName: 'Shiela Anne',
            assignedRider: null,
            assignedDate: 'May 18, 2025',
            assignedTime: '2:00 PM',
            price: '₱ 450',
            cancellationRequest: 'None',
            status: 'Preparing',
            address: '654 Birch Ln, Manila',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
        {
            id: '#11',
            customerName: 'Selita Sesina',
            assignedRider: 'Penny Lise',
            assignedDate: 'May 19, 2025',
            assignedTime: '9:05 AM',
            price: '₱ 850',
            cancellationRequest: 'None',
            status: 'Preparing',
            address: '987 Cedar Ave, Mandaluyong',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
        {
            id: '#12',
            customerName: 'Karina Mikana',
            assignedRider: 'Penny Lise',
            assignedDate: 'May 20, 2025',
            assignedTime: '10:24 AM',
            price: '₱ 2450',
            cancellationRequest: 'None',
            status: 'Queueing',
            address: '147 Maple St, San Juan',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
        {
            id: '#13',
            customerName: 'Elliot Kingsman',
            assignedRider: 'Marky Nayz',
            assignedDate: 'May 21, 2025',
            assignedTime: '2:40 PM',
            price: '₱ 980',
            cancellationRequest: 'None',
            status: 'Queueing',
            address: '258 Willow Dr, Pasay City',
            // Add these new properties:
            deliveryTime: '2PM To Be Delivered',
            contact: '+63 123 123 1234',
            specialInstructions: 'Please ring the doorbell twice',
            fulfillmentType: 'Delivery',
            orderType: 'Today',
            paymentPercentage: '100',
            items: [
                {
                    name: '5 in 1 Mix in Bilao (Palabok)',
                    addOns: '20 pcs. Puto',
                    quantity: 2,
                    price: 2350
                }
            ],
            deliveryFee: 75,
            totalAmount: 2425
        },
    ]

    const riders = ['Penny Lise', 'Lenny Wise', 'Marky Nayz', 'Jeremy Lyde', 'Morphy Fyde']
    const statusOptions = ['For Delivery', 'Preparing', 'Queueing', 'Ready', 'Completed']

    // Sample notifications
    const notifications = [
        {
            id: 1,
            title: 'New delivery order #14 assigned to Penny Lise',
            time: '2 minutes ago',
            icon: 'truck',
        },
        {
            id: 2,
            title: 'Order #06 delivery completed successfully',
            time: '15 minutes ago',
            icon: 'check',
        },
        {
            id: 3,
            title: 'Rider Marky Nayz is running late for order #08',
            time: '30 minutes ago',
            icon: 'clock',
        },
    ]

    const notificationCount = notifications.length


    const getNotificationIcon = (icon: string) => {
        switch (icon) {
            case 'truck':
                return <Truck className="h-5 w-5" />
            case 'check':
                return <div className="text-green-600">✓</div>
            case 'clock':
                return <Clock className="h-5 w-5" />
            default:
                return <Bell className="h-5 w-5" />
        }
    }

    const markAllAsRead = () => {
        setIsNotificationOpen(false)
    }

    // Filter orders based on active tab
    const getFilteredOrders = () => {
        let filtered = deliveryOrders

        // Filter by tab
        if (activeTab === 'No Assigned Rider') {
            filtered = filtered.filter((order) => !order.assignedRider || order.assignedRider === '')
        } else if (activeTab === 'Completed') {
            filtered = filtered.filter((order) => order.status === 'Completed')
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (order) =>
                    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by selected rider
        if (selectedRider) {
            filtered = filtered.filter((order) => order.assignedRider === selectedRider)
        }

        // Filter by delivery status
        if (deliveryStatus) {
            filtered = filtered.filter((order) => order.status === deliveryStatus)
        }

        return filtered
    }

    const filteredOrders = getFilteredOrders()
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
    const startIndex = (currentPage - 1) * ordersPerPage
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length)
    const currentOrders = filteredOrders.slice(startIndex, endIndex)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'For Delivery':
                return 'bg-blue-100 text-blue-800'
            case 'Preparing':
                return 'bg-yellow-100 text-yellow-800'
            case 'Queueing':
                return 'bg-orange-100 text-orange-800'
            case 'Ready':
                return 'bg-green-100 text-green-800'
            case 'Completed':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const openOrderDetails = (order: any) => {
        setSelectedOrder(order)
        setIsOrderDetailsModalOpen(true)
    }

    const closeOrderDetails = () => {
        setIsOrderDetailsModalOpen(false)
        setSelectedOrder(null)
        setShowOrderBackView(false)
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

    const assignRiderToOrder = (riderId: string, orderId: string) => {
        // Update the order with the assigned rider
        // You'll need to implement the logic to update your deliveryOrders array
        console.log('Assigning rider', riderId, 'to order', orderId)

        // Close modal
        setIsAssignModalOpen(false)
        setSelectedOrderForAssign(null)
        setSelectedRiderForModal('')
    }

    const getRiderCurrentOrders = (riderName: string) => {
        return deliveryOrders.filter(order => order.assignedRider === riderName)
    }

    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            dateRange: '',
            assignedRider: '',
            status: '',
            priceRange: '',
            customerName: ''
        })
    }

    const applyFilters = () => {
        // Apply the filters to your data
        console.log('Applying filters:', filters)
        setIsFilterOpen(false)
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleCancellationRequest = (order: any) => {
        setCancellationDetails(order.cancellationDetails)
        setIsCancellationModalOpen(true)
    }

    const approveCancellation = () => {
        console.log('Cancellation approved')
        setIsCancellationModalOpen(false)
        setCancellationDetails(null)
        // Update order status logic here
    }

    const rejectCancellation = () => {
        console.log('Cancellation rejected')
        setIsCancellationModalOpen(false)
        setCancellationDetails(null)
        // Update order logic here
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">

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

            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
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
                                <h1 className="text-xl lg:text-3xl font-bold">DELIVERIES</h1>
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

                {/* Main Content */}
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
                                    <select
                                        value={selectedRider}
                                        onChange={(e) => setSelectedRider(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">Select Rider</option>
                                        {riders.map((rider) => (
                                            <option key={rider} value={rider}>
                                                {rider}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={deliveryStatus}
                                        onChange={(e) => setDeliveryStatus(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="">Select Status</option>
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                {['All Assigned Orders', 'No Assigned Rider', 'Completed'].map((tab) => (
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned Rider
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cancellation Request
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.assignedRider ? (
                                                    order.assignedRider
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">N/A</span>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrderForAssign(order)
                                                                setIsAssignModalOpen(true)
                                                            }}
                                                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                                        >
                                                            + Rider
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assignedDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assignedTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{order.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.cancellationRequest}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status}
                                                </span>
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
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Rider Assignment Modal */}
                    {isAssignModalOpen && selectedOrderForAssign && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Select Rider For Order {selectedOrderForAssign.id}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setIsAssignModalOpen(false)
                                            setSelectedOrderForAssign(null)
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left side - Rider Selection */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Available Riders</h3>
                                        <div className="space-y-3">
                                            {riders.map((rider) => {
                                                const currentOrders = getRiderCurrentOrders(rider)
                                                const isOnDelivery = currentOrders.some(order => order.status === 'For Delivery')

                                                return (
                                                    <div
                                                        key={rider}
                                                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => setSelectedRiderForModal(rider)}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <h4 className="font-medium text-gray-800">{rider}</h4>
                                                                <p className="text-sm text-gray-600">
                                                                    Current Status: {isOnDelivery ? 'On Delivery' : 'Available'}
                                                                </p>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {currentOrders.length} orders
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Right side - Selected Rider's Orders */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">
                                            {selectedRiderForModal ? `${selectedRiderForModal}'s Assigned Orders` : 'Select a rider to view orders'}
                                        </h3>

                                        {selectedRiderForModal && (
                                            <div>
                                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Current Status:</span>
                                                        {getRiderCurrentOrders(selectedRiderForModal).some(order => order.status === 'For Delivery')
                                                            ? ' On Delivery (order #' + getRiderCurrentOrders(selectedRiderForModal).find(order => order.status === 'For Delivery')?.id + ')'
                                                            : ' Available'
                                                        }
                                                    </p>
                                                </div>

                                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                                    <div className="text-sm font-medium text-gray-700 grid grid-cols-4 gap-2 pb-2 border-b">
                                                        <span>Order ID</span>
                                                        <span>Customer</span>
                                                        <span>Date</span>
                                                        <span>Status</span>
                                                    </div>

                                                    {getRiderCurrentOrders(selectedRiderForModal).map((order) => (
                                                        <div key={order.id} className="text-sm grid grid-cols-4 gap-2 py-2 border-b border-gray-100">
                                                            <span className="font-medium">{order.id}</span>
                                                            <span>{order.customerName}</span>
                                                            <span>{order.assignedDate}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    ))}

                                                    {getRiderCurrentOrders(selectedRiderForModal).length === 0 && (
                                                        <p className="text-gray-500 text-sm italic py-4">No assigned orders</p>
                                                    )}
                                                </div>

                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => assignRiderToOrder(selectedRiderForModal, selectedOrderForAssign.id)}
                                                        className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                                                    >
                                                        Assign Order {selectedOrderForAssign.id}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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

                                    {/* Assigned Rider Filter */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Truck className="h-4 w-4 text-amber-600" />
                                            Assigned Rider
                                        </label>
                                        <select
                                            value={filters.assignedRider}
                                            onChange={(e) => handleFilterChange('assignedRider', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            <option value="">All Riders</option>
                                            <option value="unassigned">Unassigned</option>
                                            {riders.map((rider) => (
                                                <option key={rider} value={rider}>
                                                    {rider}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Delivery Status Filter */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Clock className="h-4 w-4 text-amber-600" />
                                            Delivery Status
                                        </label>
                                        <select
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        >
                                            <option value="">All Statuses</option>
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
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

                                    {/* Customer Name Filter */}
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Search className="h-4 w-4 text-amber-600" />
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter customer name..."
                                            value={filters.customerName || ''}
                                            onChange={(e) => handleFilterChange('customerName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                        />
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
                                        <span className="text-xl font-bold text-gray-800">Order ID: {selectedOrder.id}</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
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
                                        <p className="text-gray-600 text-lg">{selectedOrder.deliveryTime || '2PM To Be Delivered'}</p>
                                        {selectedOrder.assignedRider && (
                                            <p className="text-amber-600 font-medium mt-1">
                                                Assigned to: {selectedOrder.assignedRider}
                                            </p>
                                        )}
                                    </div>

                                    {/* Date and Time */}
                                    <div className="flex justify-between items-center text-gray-500">
                                        <span>{selectedOrder.assignedDate}</span>
                                        <span>{selectedOrder.assignedTime}</span>
                                    </div>

                                    {/* Items Table */}
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <span className="font-medium text-gray-700">Items</span>
                                            <span className="font-medium text-gray-700 text-center">Qty</span>
                                            <span className="font-medium text-gray-700 text-right">Price</span>
                                        </div>

                                        <div className="space-y-3">
                                            {selectedOrder.items ? selectedOrder.items.map((item: any, index: number) => (
                                                <div key={index} className="grid grid-cols-3 gap-4 items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{item.name}</p>
                                                        {item.addOns && (
                                                            <p className="text-sm text-gray-600">add-ons: {item.addOns}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-center font-medium">{item.quantity}</div>
                                                    <div className="text-right font-bold">₱ {item.price.toLocaleString()}</div>
                                                </div>
                                            )) : (
                                                <div className="grid grid-cols-3 gap-4 items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-800">Order items</p>
                                                        <p className="text-sm text-gray-600">Details not available</p>
                                                    </div>
                                                    <div className="text-center font-medium">1</div>
                                                    <div className="text-right font-bold">{selectedOrder.price}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pricing Summary */}
                                    <div className="border-t border-gray-200 pt-4 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium">Price</span>
                                            <span className="text-lg font-bold">{selectedOrder.price}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium">Delivery fee</span>
                                            <span className="text-lg font-bold">₱ {selectedOrder.deliveryFee || 75}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-3">
                                            <span>Total Amount</span>
                                            <span>₱ {selectedOrder.totalAmount || selectedOrder.price}</span>
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
                                            Remove
                                        </button>
                                        {selectedOrder.cancellationRequest === 'Pending' && selectedOrder.cancellationDetails && (
                                            <button
                                                onClick={() => handleCancellationRequest(selectedOrder)}
                                                className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                            >
                                                Cancellation Request
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancellation Request Modal */}
                    {isCancellationModalOpen && cancellationDetails && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Clock className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-800">Cancellation Request</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsCancellationModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-6">
                                    {/* Request Details */}
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </div>
                                            <span className="font-semibold text-orange-800">Rider Cancellation Request</span>
                                        </div>
                                        <p className="text-orange-700 text-sm">
                                            This order has a pending cancellation request from the assigned rider.
                                        </p>
                                    </div>

                                    {/* Date and Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Request Date</label>
                                            <div className="p-3 bg-gray-100 rounded-lg border">
                                                <span className="text-gray-800">{cancellationDetails.date}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Request Time</label>
                                            <div className="p-3 bg-gray-100 rounded-lg border">
                                                <span className="text-gray-800">{cancellationDetails.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Requested By */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Requested By</label>
                                        <div className="p-3 bg-gray-100 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">
                                                        {cancellationDetails.requestedBy?.charAt(0) || 'R'}
                                                    </span>
                                                </div>
                                                <span className="text-gray-800 font-medium">{cancellationDetails.requestedBy}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Cancellation</label>
                                        <div className="p-4 bg-gray-100 rounded-lg border min-h-[100px]">
                                            <p className="text-gray-800 leading-relaxed">{cancellationDetails.reason}</p>
                                        </div>
                                    </div>

                                    {/* Warning */}
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-white text-xs font-bold">!</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-red-800 mb-1">Important Decision Required</p>
                                                <p className="text-red-700 text-sm">
                                                    Please review the cancellation reason carefully. Approving will remove this order from the delivery queue.
                                                    Rejecting will require the rider to continue with the delivery.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => setIsCancellationModalOpen(false)}
                                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Review Later
                                    </button>
                                    <button
                                        onClick={rejectCancellation}
                                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={approveCancellation}
                                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                    >
                                        Approve Cancellation
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
                                            ← BACK
                                        </button>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
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
                                        <p className="text-gray-600">{selectedOrder.address}</p>
                                    </div>

                                    {/* Assigned Rider */}
                                    {selectedOrder.assignedRider && (
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Assigned Rider:</h4>
                                            <p className="text-gray-600">{selectedOrder.assignedRider}</p>
                                        </div>
                                    )}

                                    {/* Customer Contact */}
                                    <div className="flex">
                                        <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Customer Contact #:</h4>
                                        <p className="text-gray-600">{selectedOrder.contact || '+63 123 123 1234'}</p>
                                    </div>

                                    {/* Special Instructions */}
                                    <div className="flex">
                                        <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Special Instructions:</h4>
                                        <p className="text-gray-600">{selectedOrder.specialInstructions || 'No special instructions'}</p>
                                    </div>

                                    {/* Fulfillment Type */}
                                    <div className="flex">
                                        <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Fulfillment Type:</h4>
                                        <p className="text-gray-600">{selectedOrder.fulfillmentType || 'Delivery'}</p>
                                    </div>

                                    {/* Order Type */}
                                    <div className="flex">
                                        <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Order Type:</h4>
                                        <p className="text-gray-600">{selectedOrder.orderType || 'Today'}</p>
                                    </div>

                                    {/* Payment Percentage */}
                                    <div className="flex">
                                        <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Payment %:</h4>
                                        <p className="text-gray-600">{selectedOrder.paymentPercentage || '100'}%</p>
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
                </main>
            </div>
        </div>
    )
}



