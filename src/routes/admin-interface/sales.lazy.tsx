import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    MessageSquare,
    Users,
    Menu,
    RefreshCw,
    LogOut,
    LucideCalendar,
    Utensils,
    UserCheck,
    Bell,
    Heart,
    Star,
    Eye,
    Calendar,
    ChevronDown,
    Filter
} from 'lucide-react'

export const Route = createLazyFileRoute('/admin-interface/sales')({
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

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly'

function RouteComponent() {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const location = useLocation()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'best' | 'least'>('best')
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily')
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

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

    // Sample data for different time periods
    const dailySalesData = [
        { period: '6 AM', revenue: 2500, orders: 8 },
        { period: '9 AM', revenue: 4200, orders: 15 },
        { period: '12 PM', revenue: 8500, orders: 28 },
        { period: '3 PM', revenue: 6800, orders: 22 },
        { period: '6 PM', revenue: 12000, orders: 45 },
        { period: '9 PM', revenue: 5200, orders: 18 }
    ]

    const weeklySalesData = [
        { period: 'Mon', revenue: 35000, orders: 120 },
        { period: 'Tue', revenue: 42000, orders: 145 },
        { period: 'Wed', revenue: 38000, orders: 135 },
        { period: 'Thu', revenue: 45000, orders: 160 },
        { period: 'Fri', revenue: 52000, orders: 180 },
        { period: 'Sat', revenue: 68000, orders: 220 },
        { period: 'Sun', revenue: 58000, orders: 195 }
    ]

    const monthlySalesData = [
        { period: 'Week 1', revenue: 280000, orders: 950 },
        { period: 'Week 2', revenue: 320000, orders: 1100 },
        { period: 'Week 3', revenue: 298000, orders: 1020 },
        { period: 'Week 4', revenue: 340000, orders: 1180 }
    ]

    const yearlySalesData = [
        { period: 'Jan', revenue: 300000, orders: 1200 },
        { period: 'Feb', revenue: 400000, orders: 1500 },
        { period: 'Mar', revenue: 350000, orders: 1300 },
        { period: 'Apr', revenue: 1050000, orders: 3800 },
        { period: 'May', revenue: 850000, orders: 3100 },
        { period: 'Jun', revenue: 750000, orders: 2800 },
        { period: 'Jul', revenue: 1100000, orders: 4200 },
        { period: 'Aug', revenue: 950000, orders: 3600 },
        { period: 'Sep', revenue: 1000000, orders: 3800 },
        { period: 'Oct', revenue: 950000, orders: 3500 },
        { period: 'Nov', revenue: 1200000, orders: 4500 },
        { period: 'Dec', revenue: 1350000, orders: 5000 }
    ]

    const getCurrentData = () => {
        switch (timeFilter) {
            case 'daily': return dailySalesData
            case 'weekly': return weeklySalesData
            case 'monthly': return monthlySalesData
            case 'yearly': return yearlySalesData
            default: return dailySalesData
        }
    }

    const getCurrentStats = () => {
        const data = getCurrentData()
        const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
        const totalOrders = data.reduce((sum, item) => sum + item.orders, 0)
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        return {
            revenue: totalRevenue,
            orders: totalOrders,
            avgOrderValue: avgOrderValue
        }
    }

    const stats = getCurrentStats()

    // Sales data
    const totalRevenueData = [
        { month: 'Jan', value: 30 },
        { month: 'Feb', value: 40 },
        { month: 'Mar', value: 35 },
        { month: 'Apr', value: 105 },
        { month: 'May', value: 85 },
        { month: 'Jun', value: 75 },
        { month: 'Jul', value: 110 },
        { month: 'Aug', value: 95 },
        { month: 'Sep', value: 100 },
        { month: 'Oct', value: 95 },
        { month: 'Nov', value: 120 },
        { month: 'Dec', value: 135 },
        { month: 'Jan', value: 140 },
        { month: 'Feb', value: 150 },
        { month: 'Mar', value: 160 }
    ]

    const fulfillmentData = [
        { name: 'Pick-up', value: 70, color: '#f59e0b' },
        { name: 'Delivery', value: 30, color: '#fbbf24' }
    ]

    const bestSalesItems = [
        { rank: 1, name: 'Bilao 1', orders: 103, image: '🍛' },
        { rank: 2, name: 'Bilao 2', orders: 94, image: '🍛' },
        { rank: 3, name: 'Bilao 3', orders: 85, image: '🍛' },
        { rank: 4, name: 'Bilao 4', orders: 77, image: '🍛' },
        { rank: 5, name: 'Bilao 5', orders: 62, image: '🍛' },
        { rank: 6, name: 'Bilao 6', orders: 55, image: '🍛' }
    ]

    const leastSalesItems = [
        { rank: 1, name: 'Bilao 1', orders: 7, image: '🍛' },
        { rank: 2, name: 'Bilao 2', orders: 9, image: '🍛' },
        { rank: 3, name: 'Bilao 3', orders: 11, image: '🍛' },
        { rank: 4, name: 'Bilao 4', orders: 13, image: '🍛' },
        { rank: 5, name: 'Bilao 5', orders: 15, image: '🍛' },
        { rank: 6, name: 'Bilao 6', orders: 16, image: '🍛' }
    ]

    const filterOptions = [
        { value: 'daily', label: 'Daily Summary' },
        { value: 'weekly', label: 'Weekly Summary' },
        { value: 'monthly', label: 'Monthly Summary' },
        { value: 'yearly', label: 'Yearly Summary' }
    ]

    const SalesModal = () => {
        if (!isModalOpen) return null;

        const currentData = modalType === 'best' ? bestSalesItems : leastSalesItems;
        const title = modalType === 'best' ? 'Best Sales' : 'Least Sales';
        const iconColor = modalType === 'best' ? 'text-green-500' : 'text-red-500';
        const icon = modalType === 'best' ? '▲' : '▼';

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                            <span className={`text-xl ${iconColor}`}>{icon}</span>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-600 border-b-2 border-gray-200">
                                    <th className="pb-4 font-semibold">Rank</th>
                                    <th className="pb-4 font-semibold">Item</th>
                                    <th className="pb-4 font-semibold">Name</th>
                                    <th className="pb-4 font-semibold text-right">Orders</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentData.map((item) => (
                                    <tr key={item.rank} className="hover:bg-gray-50">
                                        <td className="py-4 text-sm font-medium text-gray-800">{item.rank}</td>
                                        <td className="py-4">
                                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
                                                {item.image}
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-800 font-medium">{item.name}</td>
                                        <td className="py-4 text-sm font-bold text-gray-800 text-right">{item.orders}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

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
                        const isActive = location.pathname === item.route ||
                            (location.pathname === '/admin-interface/sales' && item.route === '/admin-interface/sales')

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
                        <div>
                            <h2 className="text-2xl font-bold">SALES MANAGEMENT</h2>
                            <p className="text-amber-200 mt-1">Sales statistics and performance metrics</p>
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

                {/* Sales Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Time Filter Dropdown */}
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-800">Sales Summary</h1>
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-yellow-400 hover:bg-yellow-50 transition-colors"
                            >
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">{filterOptions.find(f => f.value === timeFilter)?.label}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {isFilterDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setTimeFilter(option.value as TimeFilter)
                                                setIsFilterDropdownOpen(false)
                                            }}
                                            className={`w-full text-left px-4 py-2 hover:bg-yellow-50 transition-colors ${timeFilter === option.value ? 'bg-yellow-100 text-amber-800 font-medium' : 'text-gray-700'
                                                } ${option === filterOptions[0] ? 'rounded-t-lg' : ''} ${option === filterOptions[filterOptions.length - 1] ? 'rounded-b-lg' : ''
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Stats Cards Row */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Revenue
                            </h3>
                            <p className="text-3xl font-bold text-gray-800">₱ {stats.revenue.toLocaleString()}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Orders</h3>
                            <p className="text-3xl font-bold text-gray-800">{stats.orders}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Average Order Value</h3>
                            <p className="text-3xl font-bold text-gray-800">₱{Math.round(stats.avgOrderValue).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Dynamic Sales Chart */}
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">
                                {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Sales Performance
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getCurrentData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="period"
                                            stroke="#666"
                                            fontSize={12}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            yAxisId="revenue"
                                            orientation="left"
                                            stroke="#f59e0b"
                                            fontSize={12}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                                        />
                                        <YAxis
                                            yAxisId="orders"
                                            orientation="right"
                                            stroke="#10b981"
                                            fontSize={12}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Bar
                                            yAxisId="revenue"
                                            dataKey="revenue"
                                            fill="#f59e0b"
                                            name="Revenue (₱)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Line
                                            yAxisId="orders"
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            name="Orders"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-amber-500 rounded"></div>
                                    <span className="text-sm text-gray-600">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span className="text-sm text-gray-600">Orders</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts and Analytics Row */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {/* Total Revenue Chart - Takes 2 columns, positioned on left */}
                        <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Total Revenue Trend</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={totalRevenueData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis
                                            dataKey="month"
                                            stroke="#666"
                                            fontSize={12}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            stroke="#666"
                                            fontSize={12}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `${value}k`}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#f59e0b' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Fulfillment Type Pie Chart - Takes 1 column, positioned on right */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Order Fulfillment</h3>
                            <div className="h-48 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={fulfillmentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {fulfillmentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Legend */}
                            <div className="mt-4 space-y-2">
                                {fulfillmentData.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: entry.color }}
                                            ></div>
                                            <span className="text-gray-700">{entry.value}% {entry.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sales Performance Tables Row */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Best Sales */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    Best Sales <span className="text-green-500">▲</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setModalType('best')
                                        setIsModalOpen(true)
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {bestSalesItems.slice(0, 6).map((item, index) => (
                                    <div key={item.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500 w-6">#{item.rank}</span>
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-xl">
                                                {item.image}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.orders} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">{item.orders}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Least Sales */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    Least Sales <span className="text-red-500">▼</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setModalType('least')
                                        setIsModalOpen(true)
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {leastSalesItems.slice(0, 6).map((item, index) => (
                                    <div key={item.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-500 w-6">#{item.rank}</span>
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-xl">
                                                {item.image}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.orders} orders</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">{item.orders}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Sales Modal */}
            <SalesModal />
        </div>
    )
}