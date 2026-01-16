import { useState } from 'react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import {
    MessageSquare,
    Menu,
    LogOut,
    Bell,
    Heart,
    Star,
    MenuIcon,
    Search,
    Eye,
    X,
    Package,
    Truck,
    Calendar,
    Settings,
    User,
    DollarSign,
    ChefHat
} from 'lucide-react'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useLocation } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'

export const Route = createLazyFileRoute('/staff/menu')({
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
    price: string
    inclusion: string | null
    is_available: boolean
    category: string | null
    size: string | null
    image_url: string | null
}

interface AddOn {
    add_on: string
    name: string
    price: number
    quantity?: number
}

function RouteComponent() {
    const location = useLocation()
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('')

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

    const { signOut } = useUser()

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
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



    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [addons, setAddons] = useState<AddOn[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddonsModal, setShowAddonsModal] = useState(false)

    const [processingAction, setProcessingAction] = useState(false)


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

    useEffect(() => {
        fetchMenuItems()
        fetchAddons()
    }, [])

    const getImageUrl = (imageUrl: string | null): string => {
        if (!imageUrl) return '/api/placeholder/300/200'

        // If it's already a full URL, return it
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl
        }

        // Construct the Supabase storage URL
        // Encode the filename to handle spaces and special characters
        const encodedFileName = encodeURIComponent(imageUrl)
        return `https://tvuawpgcpmqhsmwbwypy.supabase.co/storage/v1/object/public/menu-images/${encodedFileName}`
    }

    const fetchMenuItems = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('menu')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            console.log('Fetched menu items:', data)
            setMenuItems(data || [])
        } catch (err) {
            console.error('Error fetching menu items:', err)
            showAlert('Failed to load menu items', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchAddons = async () => {
        try {
            const { data, error } = await supabase
                .from('add_on')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            setAddons(data || [])
        } catch (err) {
            console.error('Error fetching add-ons:', err)
        }
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

    const handleToggleAvailability = async (menuId: string, currentAvailability: boolean) => {
        try {
            setProcessingAction(true)
            const { error } = await supabase
                .from('menu')
                .update({ is_available: !currentAvailability })
                .eq('menu_id', menuId)

            if (error) throw error

            showAlert(
                `Menu item marked as ${!currentAvailability ? 'available' : 'unavailable'}!`,
                'success'
            )
            await fetchMenuItems()
        } catch (err) {
            console.error('Error toggling availability:', err)
            showAlert('Failed to update availability', 'error')
        } finally {
            setProcessingAction(false)
        }
    }

    // Add-on management functions
    const openAddonsModal = () => {
        setShowAddonsModal(true)
    }

    const closeAddonsModal = () => {
        setShowAddonsModal(false)
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    const filteredMenuItems = menuItems.filter(item => {
        const query = searchQuery.toLowerCase()
        return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query)) ||
            (item.size && item.size.toLowerCase().includes(query))
        )
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

    return (
        <ProtectedRoute allowedRoles={['staff']}>

            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">

                {/* Sidebar */}
                <div
                    className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-yellow-400 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              `}
                >
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

                    <div className="px-6 py-4 border-b-2 border-amber-600">
                        <h3 className="font-bold text-lg text-amber-900">Jenny Frenzzy</h3>
                        <p className="text-sm text-amber-800">+63 912 212 1209</p>
                        <p className="text-sm text-amber-800">jennyfrenzzy@gmail.com</p>
                    </div>

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

                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <header className="bg-amber-800 text-white p-4 shadow-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 text-white hover:bg-amber-700 rounded-lg"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl lg:text-3xl font-bold">MENU</h1>
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
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={openAddonsModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-amber-900 font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Eye className="h-5 w-5" />
                                View Add-ons
                            </button>
                        </div>

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

                        {/* Menu Items Table */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200">
                            <div className="overflow-x-auto">
                                <table className="w-full table-fixed">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[15%]">
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[20%]">
                                                Description
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                Price
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[12%]">
                                                Category
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                Size
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[13%]">
                                                Availability
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[20%]">
                                                Actions
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                Image
                                            </th>
                                        </tr>
                                    </thead>
                                    {loading ? (
                                        <tbody>
                                            <tr>
                                                <td colSpan={7} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                                                        <p className="text-gray-700 font-medium">Loading...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ) : (
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMenuItems.map((item, index) => (
                                                <tr
                                                    key={item.menu_id}
                                                    className={`hover:bg-amber-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div
                                                            className="text-sm font-semibold text-gray-900 max-w-[160px] overflow-hidden text-ellipsis truncate"
                                                            title={item.name}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="text-sm text-gray-700 max-w-[200px] overflow-hidden text-ellipsis truncate"
                                                            title={item.description}
                                                        >
                                                            {item.description || '-'}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-amber-600 overflow-hidden text-ellipsis truncate">
                                                            ₱{item.price}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.category ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-amber-100 text-amber-800 max-w-[100px] truncate">
                                                                {item.category}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.size ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[80px] truncate">
                                                                {item.size}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

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

                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => handleToggleAvailability(item.menu_id, item.is_available)}
                                                            className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${item.is_available
                                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                                }`}
                                                        >
                                                            {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                                        </button>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                            <img
                                                                src={getImageUrl(item.image_url)}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/api/placeholder/300/200'
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    )}
                                </table>
                            </div>
                        </div>
                    </main>
                </div>


                {/* View Add-ons Modal - Read Only */}
                {showAddonsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-amber-900">View Add-ons</h2>
                                    <button
                                        onClick={closeAddonsModal}
                                        className="text-amber-900 hover:text-amber-700 text-3xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Add-ons List */}
                                {addons.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600">
                                        <MenuIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-xl">No add-ons available</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider">
                                                        Price
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
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {addon.name}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-amber-600">
                                                                ₱{Number(addon.price).toFixed(2)}
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

                {/* Processing Overlay */}
                {processingAction && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                            <p className="text-gray-700 font-medium">Processing...</p>
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