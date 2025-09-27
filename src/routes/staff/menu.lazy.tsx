import React, { useState } from 'react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
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
    ChevronDown,
    Plus,
    X,
    Calendar,
    Settings,
    User,
    DollarSign,
    Package,
    Truck,
} from 'lucide-react'

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
    id: number
    name: string
    image: string
    inclusions: string[]
    available: boolean
}

function RouteComponent() {
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
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)


    const [menuItems, setMenuItems] = useState<MenuItem[]>([
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

    const toggleAvailability = (id: number) => {
        setMenuItems(prev => prev.map(item =>
            item.id === id ? { ...item, available: !item.available } : item
        ))
    }

    const [showMenuModal, setShowMenuModal] = useState(false)
    const [showInclusionModal, setShowInclusionModal] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [menuForm, setMenuForm] = useState({
        name: '',
        description: '',
        price: '',
        inclusions: [] as string[],
        image: null as string | null
    })
    const [inclusionForm, setInclusionForm] = useState({
        name: '',
        quantity: ''
    })

    const openMenuModal = (item?: MenuItem) => {
        if (item) {
            setSelectedMenuItem(item)
            setIsEditMode(true)
            setMenuForm({
                name: item.name,
                description: '',
                price: '',
                inclusions: [...item.inclusions],
                image: item.image
            })
        } else {
            setSelectedMenuItem(null)
            setIsEditMode(false)
            setMenuForm({
                name: '',
                description: '',
                price: '',
                inclusions: [],
                image: null
            })
        }
        setShowMenuModal(true)
    }

    const closeMenuModal = () => {
        setShowMenuModal(false)
        setSelectedMenuItem(null)
        setIsEditMode(false)
        setMenuForm({
            name: '',
            description: '',
            price: '',
            inclusions: [],
            image: null
        })
    }

    const openInclusionModal = () => {
        setInclusionForm({ name: '', quantity: '' })
        setShowInclusionModal(true)
    }

    const closeInclusionModal = () => {
        setShowInclusionModal(false)
        setInclusionForm({ name: '', quantity: '' })
    }

    const addInclusion = () => {
        if (inclusionForm.name && inclusionForm.quantity) {
            const newInclusion = `${inclusionForm.quantity} ${inclusionForm.name}`
            setMenuForm(prev => ({
                ...prev,
                inclusions: [...prev.inclusions, newInclusion]
            }))
            closeInclusionModal()
        }
    }

    const removeInclusion = (index: number) => {
        setMenuForm(prev => ({
            ...prev,
            inclusions: prev.inclusions.filter((_, i) => i !== index)
        }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // setMenuForm(prev => ({ ...prev, image: string })) TODO: Change this
        }
    }

    const saveMenuItem = () => {
        console.log('Saving menu item:', menuForm)
        closeMenuModal()
    }

    const removeMenuItem = () => {
        if (selectedMenuItem) {
            setMenuItems(prev => prev.filter(item => item.id !== selectedMenuItem.id))
            closeMenuModal()
        }
    }

    const [showAddonsModal, setShowAddonsModal] = useState(false)
    const [addons, setAddons] = useState([
        { id: '1', name: 'Puto', quantity: 2, available: true },
        { id: '2', name: 'Sapin-sapin', quantity: 2, available: true }
    ])
    const [showAddAddonForm, setShowAddAddonForm] = useState(false)
    const [newAddonName, setNewAddonName] = useState('')

    const openAddonsModal = () => {
        setShowAddonsModal(true)
    }

    const closeAddonsModal = () => {
        setShowAddonsModal(false)
        setShowAddAddonForm(false)
        setNewAddonName('')
    }

    const updateAddonQuantity = (id: string, change: number) => {
        setAddons(prev => prev.map(addon =>
            addon.id === id
                ? { ...addon, quantity: Math.max(0, addon.quantity + change) }
                : addon
        ))
    }

    const toggleAddonAvailability = (id: string) => {
        setAddons(prev => prev.map(addon =>
            addon.id === id ? { ...addon, available: !addon.available } : addon
        ))
    }

    const removeAddon = (id: string) => {
        setAddons(prev => prev.filter(addon => addon.id !== id))
    }

    const addNewAddon = () => {
        if (newAddonName.trim()) {
            const newAddon = {
                id: Date.now().toString(),
                name: newAddonName.trim(),
                quantity: 1,
                available: true
            }
            setAddons(prev => [...prev, newAddon])
            setNewAddonName('')
            setShowAddAddonForm(false)
        }
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
                <main className="flex-1 p-8">
                    <button
                        onClick={() => openAddonsModal()}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors mb-8"
                    >
                        Manage Add-ons
                    </button>

                    {/* Menu Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {menuItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-amber-200">
                                {/* Clickable area for editing */}
                                <div onClick={() => openMenuModal(item)} className="cursor-pointer">
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

                                {/* Availability Dropdown - outside clickable area */}
                                <div className="px-6 pb-6">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the edit modal
                                                toggleAvailability(item.id);
                                            }}
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-semibold cursor-pointer ${item.available
                                                ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800'
                                                : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                                                }`}
                                        >
                                            <span>{item.available ? 'Available' : 'Unavailable'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Menu Item */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-dashed border-gray-300 hover:border-yellow-400 transition-colors">
                            <div className="h-64 flex items-center justify-center bg-gray-50">
                                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                                    <Plus className="h-12 w-12 text-gray-400" />
                                </div>
                            </div>

                            <div className="p-6 text-center">
                                <button
                                    onClick={() => openMenuModal()}
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add menu
                                </button>
                            </div>
                        </div>
                    </div>

                </main>

                {/* Menu Item Modal */}
                {showMenuModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            {/* Header with food image */}
                            <div className="relative h-48 bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center rounded-t-2xl">
                                <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center relative overflow-hidden">
                                    <img
                                        src={selectedMenuItem?.image || "/path/to/default-food-image.jpg"}
                                        alt={selectedMenuItem?.name || "Food item"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* File upload overlay */}
                                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity rounded-t-2xl">
                                    <div className="bg-white p-3 rounded-full">
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 space-y-4">
                                {/* Food Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name:</label>
                                    <input
                                        type="text"
                                        value={menuForm.name}
                                        onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter the name of the food..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description:</label>
                                    <textarea
                                        value={menuForm.description}
                                        onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Enter the description of the food..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none"
                                    />
                                </div>

                                {/* Inclusions */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inclusions:</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {menuForm.inclusions.map((inclusion, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                                            >
                                                {inclusion}
                                                <button
                                                    onClick={() => removeInclusion(idx)}
                                                    className="ml-2 text-gray-600 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                        <button
                                            onClick={openInclusionModal}
                                            className="inline-flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price:</label>
                                    <input
                                        type="text"
                                        value={menuForm.price}
                                        onChange={(e) => setMenuForm(prev => ({ ...prev, price: e.target.value }))}
                                        placeholder="Enter the price of the food..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                    />
                                </div>

                                {/* Remove Food Button - only show in edit mode */}
                                {isEditMode && (
                                    <button
                                        onClick={removeMenuItem}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Remove Food
                                    </button>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={closeMenuModal}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        ✗
                                    </button>
                                    <button
                                        onClick={saveMenuItem}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        ✓
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Inclusion Modal */}
                {showInclusionModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Inclusions</h2>

                                <div className="space-y-4">
                                    {/* Inclusion Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Inclusion Name:</label>
                                        <input
                                            type="text"
                                            value={inclusionForm.name}
                                            onChange={(e) => setInclusionForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Enter the name of the food..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity:</label>
                                        <input
                                            type="text"
                                            value={inclusionForm.quantity}
                                            onChange={(e) => setInclusionForm(prev => ({ ...prev, quantity: e.target.value }))}
                                            placeholder="Enter the quantity..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={closeInclusionModal}
                                        className="flex-1 border-2 border-red-400 text-red-500 hover:bg-red-50 font-semibold py-2 px-4 rounded-full transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addInclusion}
                                        className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Manage Add-ons Modal */}
                {showAddonsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-800">Manage Add-ons</h2>
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
                                <div className="grid grid-cols-4 gap-4 mb-4 text-lg font-semibold text-gray-700">
                                    <div>Item name</div>
                                    <div className="text-center">QTY</div>
                                    <div className="text-center">Availability</div>
                                    <div></div>
                                </div>

                                {/* Add-ons List */}
                                <div className="space-y-3">
                                    {addons.map((addon) => (
                                        <div key={addon.id} className="grid grid-cols-4 gap-4 items-center">
                                            {/* Item Name */}
                                            <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold">
                                                {addon.name}
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => updateAddonQuantity(addon.id, -1)}
                                                    className="w-8 h-8 border border-gray-400 rounded flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    −
                                                </button>
                                                <span className="text-lg font-semibold min-w-[20px] text-center">
                                                    {addon.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateAddonQuantity(addon.id, 1)}
                                                    className="w-8 h-8 border border-gray-400 rounded flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Availability Toggle */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleAddonAvailability(addon.id)}
                                                    className={`px-4 py-2 rounded-lg font-semibold min-w-[80px] cursor-pointer ${addon.available
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'bg-gray-300 text-gray-600'
                                                        }`}
                                                >
                                                    {addon.available ? 'Yes' : 'No'}
                                                </button>
                                            </div>

                                            {/* Delete Button */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => removeAddon(addon.id)}
                                                    className="w-10 h-10 border-2 border-red-400 text-red-500 rounded-lg hover:bg-red-50 flex items-center justify-center"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Addon Section */}
                                {showAddAddonForm ? (
                                    <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newAddonName}
                                                onChange={(e) => setNewAddonName(e.target.value)}
                                                placeholder="Enter add-on name..."
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                                                onKeyPress={(e) => e.key === 'Enter' && addNewAddon()}
                                            />
                                            <button
                                                onClick={addNewAddon}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                                            >
                                                Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowAddAddonForm(false)
                                                    setNewAddonName('')
                                                }}
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddAddonForm(true)}
                                        className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition-colors"
                                    >
                                        Add another item
                                    </button>
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
        </div >
    )
}
