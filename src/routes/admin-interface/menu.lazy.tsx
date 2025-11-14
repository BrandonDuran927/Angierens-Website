import React, { useState, useEffect } from 'react'
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
    LucideCalendar,
    MenuIcon,
    Eye,
    Search
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'

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
    menu_id: string
    name: string
    description: string
    price: number
    inclusion: string | null
    is_available: boolean
    category: string | null
    size: string | null
    quantity_description: string | null
    image_url: string | null
}

interface AddOn {
    add_on: string
    name: string
    price: number
    quantity?: number // optional
}

function RouteComponent() {
    const { user, signOut } = useUser()
    const navigate = useNavigate();

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }


    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')

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

    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [addons, setAddons] = useState<AddOn[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showMenuDetails, setShowMenuDetails] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)

    const [showAddonsModal, setShowAddonsModal] = useState(false)

    // Fetch menu items from Supabase
    useEffect(() => {
        fetchMenuItems()
        fetchAddons()
    }, [])

    const fetchMenuItems = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('menu')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            setMenuItems(data || [])
        } catch (err) {
            console.error('Error fetching menu items:', err)
            setError('Failed to load menu items')
        } finally {
            setLoading(false)
        }
    }

    const fetchAddons = async () => {
        try {
            const { data, error } = await supabase
                .from('add_on')
                .select('*')

            if (error) throw error

            setAddons(data || [])
        } catch (err) {
            console.error('Error fetching add-ons:', err)
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    // Parse inclusions string to array
    const parseInclusions = (inclusion: string | null): string[] => {
        if (!inclusion) return []
        try {
            // Try parsing as JSON array first
            const parsed = JSON.parse(inclusion)
            if (Array.isArray(parsed)) return parsed
        } catch {
            // If not JSON, split by common delimiters
            return inclusion.split(/[,;\n]/).map(item => item.trim()).filter(item => item)
        }
        return []
    }

    // Filter menu items based on search query
    const filteredMenuItems = menuItems.filter(item => {
        const query = searchQuery.toLowerCase()
        return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query)) ||
            (item.size && item.size.toLowerCase().includes(query))
        )
    })

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
                fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg transform transition-transform duration-300 ease-in-out
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
                                    onClick={() => setIsSidebarOpen(false)}
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
                <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                    {/* Header */}
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
                                    <h2 className="text-xl lg:text-2xl font-bold">MENU</h2>
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

                    {/* Menu Content */}
                    <main className="flex-1 p-8">
                        <button
                            onClick={() => openAddonsModal()}
                            className="bg-yellow-400 hover:bg-yellow-500 text-amber-900 font-semibold px-6 py-3 rounded-lg transition-colors mb-8"
                        >
                            View Add-ons
                        </button>

                        {/* Search Filter */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                    <p className="text-gray-700 font-medium">Processing...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredMenuItems.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600">
                                    {searchQuery ? 'No menu items found matching your search' : 'No menu items found'}
                                </p>
                            </div>
                        )}

                        {/* Menu Items Table */}
                        {!loading && !error && menuItems.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[15%]">
                                                    Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[25%]">
                                                    Description
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                    Price
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[15%]">
                                                    Category
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                    Size
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[15%]">
                                                    Availability
                                                </th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMenuItems.map((item, index) => (
                                                <tr
                                                    key={item.menu_id}
                                                    className={`hover:bg-amber-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                        }`}
                                                >
                                                    {/* Name */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div
                                                            className="text-sm font-semibold text-gray-900 max-w-[160px] overflow-hidden text-ellipsis truncate"
                                                            title={item.name}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    </td>

                                                    {/* Description */}
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="text-sm text-gray-700 max-w-[250px] overflow-hidden text-ellipsis truncate"
                                                            title={item.description}
                                                        >
                                                            {item.description || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-amber-600">
                                                            ₱{Number(item.price).toFixed(2)}
                                                        </div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.category ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-amber-100 text-amber-800 max-w-[100px] truncate">
                                                                {item.category}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Size */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.size ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[80px] truncate">
                                                                {item.size}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Availability */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_available
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {item.is_available ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => openMenuDetails(item)}
                                                            className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Menu Item Details Modal - View Only */}
                {showMenuDetails && selectedMenuItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500">
                                <h2 className="text-2xl font-bold text-amber-900">Menu Item Details</h2>
                            </div>

                            {/* Details Content - Read Only */}
                            <div className="p-6 space-y-4">
                                {/* Food Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name:</label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold">
                                        {selectedMenuItem.name}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description:</label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                                        {selectedMenuItem.description || '-'}
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price:</label>
                                    <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold text-xl">
                                        ₱{Number(selectedMenuItem.price).toFixed(2)}
                                    </div>
                                </div>

                                {/* Category, Size, and Quantity in a Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
                                        <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                                            {selectedMenuItem.category || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Size:</label>
                                        <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                                            {selectedMenuItem.size || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity:</label>
                                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                                            {selectedMenuItem.quantity_description || '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Inclusions */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inclusions:</label>
                                    {selectedMenuItem.inclusion ? (
                                        <div className="flex flex-wrap gap-2">
                                            {parseInclusions(selectedMenuItem.inclusion).map((inclusion, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                                >
                                                    {inclusion}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400">
                                            No inclusions
                                        </div>
                                    )}
                                </div>

                                {/* Availability Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Availability:</label>
                                    <div className={`w-full px-4 py-3 border-2 rounded-lg font-semibold text-center ${selectedMenuItem.is_available
                                        ? 'bg-green-50 border-green-300 text-green-800'
                                        : 'bg-red-50 border-red-300 text-red-800'
                                        }`}>
                                        {selectedMenuItem.is_available ? '✓ Available' : '✗ Unavailable'}
                                    </div>
                                </div>

                                {/* Close Button */}
                                <div className="pt-4">
                                    <button
                                        onClick={closeMenuDetails}
                                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors cursor-pointer"
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
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-amber-900">Add-ons Overview</h2>
                                    <button
                                        onClick={closeAddonsModal}
                                        className="text-amber-900 hover:text-amber-700 text-3xl font-bold cursor-pointer"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {addons.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600">
                                        <MenuIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-xl">No add-ons available</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                                        <table className="w-full table-fixed">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[50%]">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[25%]">
                                                        Price
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[25%]">
                                                        Quantity
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {addons.map((addon, index) => (
                                                    <tr
                                                        key={addon.add_on}
                                                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                            }`}
                                                    >
                                                        {/* Name */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className="text-sm font-semibold text-gray-900 max-w-[200px] overflow-hidden text-ellipsis truncate"
                                                                title={addon.name}
                                                            >
                                                                {addon.name}
                                                            </div>
                                                        </td>

                                                        {/* Price */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-amber-600">
                                                                ₱{Number(addon.price).toFixed(2)}
                                                            </div>
                                                        </td>

                                                        {/* Quantity */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="text-sm font-medium text-gray-700">
                                                                {addon.quantity ?? '-'}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
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
        </ProtectedRoute>
    )
}