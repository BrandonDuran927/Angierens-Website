// Owner View-Only Menu Interface - No editing capabilities

import React, { useState } from 'react'
import { createLazyFileRoute, Link, useLocation } from '@tanstack/react-router'
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
    LucideCalendar
} from 'lucide-react'

export const Route = createLazyFileRoute('/admin-interface/menu')({
    component: RouteComponent,
})

interface Notification {
    id: string
    type: string
    title: string
    time: string
    icon: string
    read: boolean
}

interface MenuItem {
    id: number
    name: string
    image: string
    inclusions: string[]
    available: boolean
}

function RouteComponent() {
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

    const [menuItems] = useState<MenuItem[]>([
        {
            id: 1,
            name: '5 in 1 Mix in Bilao (PALABOK)',
            available: true,
            inclusions: [
                '40 pcs. Pork Shanghai',
                '12 pcs. Pork BBQ',
                '30 pcs. Pork Shanghai',
                '30 slices Cordon Bleu'
            ],
            image: "/public/menu-page img/pancit malabonbon.png"
        },
        {
            id: 2,
            name: '5 in 1 Mix in Bilao (SPAGHETTI)',
            available: true,
            inclusions: [
                '40 pcs. Pork Shanghai',
                '12 pcs. Pork BBQ',
                '30 pcs. Pork Shanghai',
                '30 slices Cordon Bleu'
            ],
            image: "/public/menu-page img/spaghetto.png"
        },
        {
            id: 3,
            name: '5 in 1 Mix in Bilao (VALENCIANA)',
            available: true,
            inclusions: [
                '40 pcs. Pork Shanghai',
                '12 pcs. Pork BBQ',
                '30 pcs. Pork Shanghai',
                '30 slices Cordon Bleu'
            ],
            image: "/public/menu-page img/valencia.png"
        },
        {
            id: 4,
            name: '5 in 1 Mix in Bilao (SOTANGHON GUISADO)',
            available: true,
            inclusions: [
                '40 pcs. Pork Shanghai',
                '12 pcs. Pork BBQ',
                '30 pcs. Pork Shanghai',
                '30 slices Cordon Bleu'
            ],
            image: "/public/menu-page img/sotanghonney.png"
        },
        {
            id: 5,
            name: '5 in 1 BAKEDMAC',
            available: true,
            inclusions: [
                '40 pcs. Pork Shanghai',
                '12 pcs. Pork BBQ',
                '30 pcs. Buttered Puto',
                '30 slices Cordon Bleu'
            ],
            image: "/public/menu-page img/baked mac.png"
        },
        {
            id: 6,
            name: '5 in 1 Mix in Bilao (SPECIAL PANSIT MALABON)',
            image: '/public/menu-page img/special.png',
            inclusions: [
                '40 pcs. Pork Shanghai',
                '12 pcs. Pork BBQ',
                '30 pcs. Pork Shanghai',
                '30 slices Cordon Bleu'
            ],
            available: true
        }
    ])

    const [showNotifications, setShowNotifications] = useState(false)
    const [showMenuDetails, setShowMenuDetails] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)

    // View-only addons data
    const [addons] = useState([
        { id: '1', name: 'Puto', quantity: 2, available: true },
        { id: '2', name: 'Sapin-sapin', quantity: 2, available: true }
    ])

    const [showAddonsModal, setShowAddonsModal] = useState(false)

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

    const openMenuDetails = (item: MenuItem) => {
        setSelectedMenuItem(item)
        setShowMenuDetails(true)
    }

    const closeMenuDetails = () => {
        setShowMenuDetails(false)
        setSelectedMenuItem(null)
    }

    const openAddonsModal = () => {
        setShowAddonsModal(true)
    }

    const closeAddonsModal = () => {
        setShowAddonsModal(false)
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
                {/* Header */}
                <header className="bg-amber-800 text-white p-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">MENU OVERVIEW</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-amber-200">Date: July 21, 2025</span>
                            <span className="text-amber-200">Time: 11:00 AM</span>

                            {/* Notifications */}
                            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                <div className='relative'>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
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
                                    {showNotifications && (
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

                {/* Menu Content */}
                <main className="flex-1 p-8">
                    <button
                        onClick={() => openAddonsModal()}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-8"
                    >
                        View Add-ons
                    </button>

                    {/* Menu Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {menuItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-amber-200">
                                {/* Clickable area for viewing details */}
                                <div onClick={() => openMenuDetails(item)} className="cursor-pointer">
                                    {/* Food Image */}
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={item.image || "/path/to/default-food-image.jpg"}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Optional overlay for better visual effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
                                    </div>


                                    {/* Item Details */}
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-gray-800 mb-3">{item.name}</h3>

                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Inclusions:</p>
                                            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                                                {item.inclusions.map((inclusion, idx) => (
                                                    <div key={idx}>{inclusion}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Availability Status - Read Only */}
                                <div className="px-6 pb-6">
                                    <div className="relative">
                                        <div
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-semibold ${item.available
                                                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                : 'bg-red-100 text-red-800 border-2 border-red-300'
                                                }`}
                                        >
                                            <span>Status: {item.available ? 'Available' : 'Unavailable'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Menu Item Details Modal - View Only */}
            {showMenuDetails && selectedMenuItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Header with food image */}
                        <div className="relative h-48 bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center rounded-t-2xl">
                            <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center relative overflow-hidden">
                                {/* Mock food image */}
                                <div className="absolute inset-2 bg-gradient-to-br from-red-400 to-orange-400 rounded-full"></div>
                                <div className="absolute inset-3 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full"></div>
                                <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-lime-300 rounded-full"></div>
                            </div>
                        </div>

                        {/* Details Content - Read Only */}
                        <div className="p-6 space-y-4">
                            {/* Food Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name:</label>
                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                                    {selectedMenuItem.name}
                                </div>
                            </div>

                            {/* Inclusions */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Inclusions:</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMenuItem.inclusions.map((inclusion, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {inclusion}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Availability Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability:</label>
                                <div className={`w-full px-4 py-3 border rounded-lg font-medium ${selectedMenuItem.available
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                    {selectedMenuItem.available ? 'Available' : 'Unavailable'}
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="pt-4">
                                <button
                                    onClick={closeMenuDetails}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Add-ons Modal - Read Only */}
            {showAddonsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">Add-ons Overview</h2>
                                <button
                                    onClick={closeAddonsModal}
                                    className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Table Header */}
                            <div className="grid grid-cols-3 gap-4 mb-4 text-lg font-semibold text-gray-700">
                                <div>Item name</div>
                                <div className="text-center">Quantity</div>
                                <div className="text-center">Availability</div>
                            </div>

                            {/* Add-ons List - Read Only */}
                            <div className="space-y-3">
                                {addons.map((addon) => (
                                    <div key={addon.id} className="grid grid-cols-3 gap-4 items-center">
                                        {/* Item Name */}
                                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold border border-yellow-200">
                                            {addon.name}
                                        </div>

                                        {/* Quantity Display */}
                                        <div className="flex items-center justify-center">
                                            <span className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg border">
                                                {addon.quantity}
                                            </span>
                                        </div>

                                        {/* Availability Status */}
                                        <div className="flex justify-center">
                                            <div
                                                className={`px-4 py-2 rounded-lg font-semibold min-w-[80px] text-center border-2 ${addon.available
                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                    : 'bg-red-100 text-red-800 border-red-300'
                                                    }`}
                                            >
                                                {addon.available ? 'Available' : 'Unavailable'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={closeAddonsModal}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
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