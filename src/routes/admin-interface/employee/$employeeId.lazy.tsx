import { createLazyFileRoute, Link, useParams, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    MessageSquare,
    Users,
    Menu,
    RefreshCw,
    LogOut,
    Bell,
    Heart,
    Star,
    ArrowLeft,
    Eye,
    Search,
    Filter,
    X,
    LucideCalendar
} from 'lucide-react'

export const Route = createLazyFileRoute(
    '/admin-interface/employee/$employeeId',
)({
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
    const { employeeId } = useParams({ from: '/admin-interface/employee/$employeeId' })
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false)
    const [isReasonDetailModalOpen, setIsReasonDetailModalOpen] = useState(false)
    const location = useLocation()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const RidersCancellationModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Riders Cancellation Request</h2>
                        <button
                            onClick={() => setIsCancellationModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Details Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Order ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Date</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Time</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Reason</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-300">Approval Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">#16</td>
                                    <td className="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">May 17, 2025</td>
                                    <td className="px-4 py-3 text-sm text-gray-800 border-b border-gray-200">4:00 PM</td>
                                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-800">May emer...</span>
                                            <button
                                                onClick={() => {
                                                    setIsCancellationModalOpen(false)
                                                    setIsReasonDetailModalOpen(true)
                                                }}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 text-xs font-medium rounded transition-colors"
                                            >
                                                View
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm border-b border-gray-200">
                                        <div className="flex gap-2">
                                            <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs font-medium rounded transition-colors">
                                                Approve
                                            </button>
                                            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs font-medium rounded transition-colors">
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )

    const ReasonDetailModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Riders Cancellation Reason</h2>
                        <button
                            onClick={() => {
                                setIsReasonDetailModalOpen(false)
                                setIsCancellationModalOpen(true)
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                        Pasensya na po, meron emergency this afternoon, need ko po asikasahin
                    </p>
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={() => {
                            setIsReasonDetailModalOpen(false)
                            setIsCancellationModalOpen(true)
                        }}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )

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
            icon: Menu,
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

    // Sample employee data - in real app this would come from API/props
    const employeeData = {
        name: "Russel Carlo",
        role: "Rider",
        status: "Active",
        orders: [
            {
                id: "#06",
                customer: "Brandon Duran",
                date: "May 16, 2025",
                time: "10:30 AM",
                price: "₱ 2,350",
                fulfillment: "Delivery",
                payment: "Online - GCash 100%",
                status: "For Delivery"
            },
            {
                id: "#16",
                customer: "Ambrucio Felmar",
                date: "May 17, 2025",
                time: "4:00 PM",
                price: "₱ 980",
                fulfillment: "Delivery",
                payment: "Online - COD: 50% ...",
                status: "For Delivery"
            }
        ]
    }

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
                        const isActive = location.pathname.includes('/admin-interface/employee') && item.route === '/admin-interface/employee'

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
                                <span className="font- text-xl">{item.label}</span>
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
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <header className="bg-amber-800 text-white p-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/admin-interface/employee"
                                className="p-2 hover:bg-amber-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div>
                                <h2 className="text-2xl font-bold">EMPLOYEE MANAGEMENT</h2>
                                <p className="text-amber-200 mt-1">Rider - {employeeData.name}</p>
                            </div>
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

                {/* Employee Detail Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Status Badge */}
                    <div className="mb-6">
                        <button
                            onClick={() => setIsCancellationModalOpen(true)}
                            className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-full text-sm font-medium transition-colors"
                        >
                            Riders Cancellation Request
                        </button>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-400">
                        <div className="p-6">
                            {/* Search and Filter */}
                            {/* Search and Filter */}
                            <div className="flex justify-between items-center mb-6">
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

                            {/* Filter Tabs */}
                            <div className="flex gap-4 mb-6">
                                <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium">
                                    New Assigned
                                </button>
                                <button className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg">
                                    Completed
                                </button>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Customer Name</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Fulfillment Type</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Payment Method</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                            <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employeeData.orders.map((order, index) => (
                                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-4 px-4 font-medium text-gray-800">{order.id}</td>
                                                <td className="py-4 px-4 text-gray-800">{order.customer}</td>
                                                <td className="py-4 px-4 text-gray-600">{order.date}</td>
                                                <td className="py-4 px-4 text-gray-600">{order.time}</td>
                                                <td className="py-4 px-4 font-medium text-gray-800">{order.price}</td>
                                                <td className="py-4 px-4 text-gray-600">{order.fulfillment}</td>
                                                <td className="py-4 px-4 text-gray-600">{order.payment}</td>
                                                <td className="py-4 px-4 text-gray-600">{order.status}</td>
                                                <td className="py-4 px-4">
                                                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                                                        <Eye className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-6">
                                <p className="text-sm text-gray-600">Showing 1 to 2 out of 2 records</p>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        ←
                                    </button>
                                    <button className="bg-yellow-400 text-black px-3 py-1 rounded-lg font-medium">
                                        1
                                    </button>
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {isCancellationModalOpen && <RidersCancellationModal />}
            {isReasonDetailModalOpen && <ReasonDetailModal />}
        </div>
    )
}