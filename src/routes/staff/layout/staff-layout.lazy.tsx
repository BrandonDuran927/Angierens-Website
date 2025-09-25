import { createLazyFileRoute, Outlet, useLocation, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, X, Bell, Truck, Clock, Package, Calendar, Settings, Star, DollarSign, User, LogOut } from 'lucide-react'

export const Route = createLazyFileRoute('/staff/layout/staff-layout')({
    component: RouteComponent,
})

interface StaffLayoutProps {
    title: string
    children?: React.ReactNode
}

function RouteComponent() {
    return <div>Hello "/staff/layout/staff-layout"!</div>
}

export default function StaffLayout({ title }: StaffLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const location = useLocation()

    // Navigation items with their corresponding routes
    const navigationItems = [
        {
            name: 'Orders',
            route: '/staff/orders',
            icon: <Package className="h-5 w-5" />,
            active: location.pathname === '/staff/orders'
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
            route: '/staff/account',
            icon: <User className="h-5 w-5" />,
            active: location.pathname === '/staff/account'
        },
        {
            name: 'Refund',
            route: '/staff/refund',
            icon: <DollarSign className="h-5 w-5" />,
            active: location.pathname === '/staff/refund'
        },
    ]

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
            {/* Sidebar */}
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
                    <div className="mt-2">
                        <span className="inline-flex items-center gap-2 bg-amber-700 text-white px-3 py-1 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Online
                        </span>
                    </div>
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

            {/* Main content */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Header bar */}
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
                            <h1 className="text-xl lg:text-3xl font-bold">{title}</h1>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-6">
                            <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">
                                Date: {getCurrentDate()}
                            </span>
                            <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">
                                Time: {getCurrentTime()}
                            </span>

                            {/* Notifications */}
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

                {/* Render child screens */}
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}