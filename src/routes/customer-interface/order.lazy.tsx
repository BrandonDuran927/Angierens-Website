import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ShoppingCart, Bell, Search, Filter, Star, Heart, MessageSquare, Menu, X } from 'lucide-react'

export const Route = createLazyFileRoute('/customer-interface/order')({
    component: RouteComponent,
})

interface Order {
    id: string
    orderNumber: string
    name: string
    inclusions: string[]
    addOns: string
    price: number
    quantity: number
    status: 'pending' | 'to-pay' | 'in-process' | 'completed' | 'cancelled' | 'refunded'
    image: string
    totalAmount: number
}

interface Notification {
    id: string
    type: 'order' | 'feedback'
    title: string
    time: string
    icon: 'heart' | 'message' | 'star'
    read: boolean
}

function RouteComponent() {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [cartCount] = useState(2)
    const [notificationCount] = useState(3)
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navigationItems = [
        { name: 'HOME', route: '/customer-interface/home', active: false },
        { name: 'MENU', route: '/customer-interface/', active: false },
        { name: 'ORDER', route: '/customer-interface/order', active: true },
        { name: 'FEEDBACK', route: '/customer-interface/feedback', active: false },
        { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
    ]

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

    const [orders] = useState<Order[]>([
        {
            id: '1',
            orderNumber: '#06',
            name: '5 in 1 Mix in Bilao (PALABOK)',
            inclusions: ['40 pcs. Pork Shanghai', '30 pcs. Pork Shanghai', '12 pcs. Pork BBQ', '30 slices Cordon Bleu'],
            addOns: 'Puto 20x',
            price: 3950,
            quantity: 2,
            status: 'pending',
            image: '/api/placeholder/80/80',
            totalAmount: 7900,
        },
        {
            id: '2',
            orderNumber: '#01',
            name: '5 in 1 Mix in Bilao (SPAGHETTI)',
            inclusions: ['40 pcs. Pork Shanghai', '30 pcs. Pork Shanghai', '12 pcs. Pork BBQ', '30 slices Cordon Bleu'],
            addOns: 'Puto 20x',
            price: 1900,
            quantity: 1,
            status: 'completed',
            image: '/api/placeholder/80/80',
            totalAmount: 1900,
        },
    ])

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'to-pay', label: 'To Pay' },
        { id: 'in-process', label: 'In Process' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'refunded', label: 'Refunded' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-orange-600'
            case 'to-pay': return 'text-blue-600'
            case 'in-process': return 'text-yellow-600'
            case 'completed': return 'text-green-600'
            case 'cancelled': return 'text-red-600'
            case 'refunded': return 'text-purple-600'
            default: return 'text-gray-600'
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === 'all' || order.status === activeTab
        const matchesSearch = order.name.toLowerCase().includes(searchQuery.toLowerCase()) || order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

    const formatPrice = (price: number) => `₱${price.toLocaleString()}`

    const logoStyle: React.CSSProperties = {
        width: '140px', // equivalent to w-35 (35 * 4px = 140px)
        height: '140px', // equivalent to h-35 (35 * 4px = 140px)
        backgroundImage: "url('/angierens-logo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'absolute' as const,
        top: '8px', // equivalent to top-2
        left: '16px'
    };

    const customStyles = `
        body {
            min-width: 320px;
        }

        @media (max-width: 410px) {
            .dynamic-logo {
            width: calc(max(80px, 140px - (410px - 100vw))) !important;
            height: calc(max(80px, 140px - (410px - 100vw))) !important;
            }
        }

        @media (min-width: 411px) and (max-width: 1023px) {
            .dynamic-logo {
            width: 120px !important;
            height: 120px !important;
            }
        }

        @media (min-width: 1024px) {
            .dynamic-logo {
            width: 140px !important;
            height: 140px !important;
            }
        }
    `;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />
            {/* Customer Header */}
            <header className="w-auto mx-2 sm:mx-4 md:mx-10 my-3 border-b-8 border-amber-800">
                <div className="flex items-center justify-between p-2 sm:p-4 mb-5 relative">
                    {/* Logo */}
                    <div
                        className="flex-shrink-0 bg-cover bg-center dynamic-logo"
                        style={logoStyle}
                    />

                    {/* Main Content Container */}
                    <div className="flex items-center justify-end w-full pl-[150px] sm:pl-[160px] lg:pl-[180px] gap-2 sm:gap-4">
                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex xl:gap-10 bg-[#964B00] py-2 px-6 xl:px-10 rounded-lg">
                            {navigationItems.map(item => (
                                <Link
                                    key={item.name}
                                    to={item.route}
                                    className={`px-3 xl:px-4 py-2 rounded-xl text-base xl:text-lg font-semibold transition-colors whitespace-nowrap ${item.active
                                        ? 'bg-yellow-400 text-[#964B00]'
                                        : 'text-yellow-400 hover:bg-[#7a3d00]'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Hamburger Menu Button - Show on tablet and mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-[#964B00] hover:bg-amber-100 rounded-lg bg-yellow-400"
                        >
                            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>

                        {/* Right Side Controls */}
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 bg-[#964B00] py-2 px-2 sm:px-4 md:px-6 rounded-lg">
                            {/* Cart Icon */}
                            <Link
                                to="/customer-interface/cart"
                                className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
                            >
                                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
                                >
                                    <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                                    {notificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
                                        <div className="p-3 sm:p-4 border-b border-gray-200">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
                                        </div>

                                        <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                                            {notifications.map((notification, index) => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                                                            {getNotificationIcon(notification.icon)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                                                {notification.time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-3 sm:p-4 border-t border-gray-200">
                                            <button
                                                onClick={markAllAsRead}
                                                className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Bell className="h-4 w-4" />
                                                Mark all as read
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Logout Button */}
                            <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                                <span className="hidden sm:inline">LOG OUT</span>
                                <span className="sm:hidden">OUT</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile/Tablet Drawer */}
            <div className={`fixed top-0 left-0 h-full w-72 sm:w-80 bg-[#964B00] transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
                    <span className="text-yellow-400 text-xl font-bold">Order</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-yellow-400 p-2"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex flex-col p-4 space-y-2">
                    {navigationItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.route}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`px-4 py-3 rounded-xl text-lg font-semibold transition-colors ${item.active
                                ? 'bg-yellow-400 text-[#964B00]'
                                : 'text-yellow-400 hover:bg-[#7a3d00]'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Overlay to close notification dropdown when clicking outside */}
            {isNotificationOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationOpen(false)}
                />
            )}

            {/* Main */}
            <div className="max-w-6xl mx-auto p-3 sm:p-8">
                <h1 className="text-2xl sm:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">My orders</h1>

                {/* Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative flex-1 max-w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search order by ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="bg-white flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="h-5 w-5" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px] sm:h-[800px]">
                    <div className="flex gap-1 sm:gap-2 pt-3 sm:pt-5 px-3 sm:pl-10 py-3 sm:py-5 border-b border-gray-500/50 flex-shrink-0 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Orders List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-base sm:text-lg px-4">No orders found</div>
                        ) : (
                            filteredOrders.map(order => (
                                <div key={order.id} className="p-3 sm:p-6">
                                    <div className="flex items-start gap-3 sm:gap-6">
                                        <div className="flex-shrink-0">
                                            <img src={order.image} alt={order.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200" />
                                        </div>

                                        <Link
                                            to="/customer-interface/specific-order/$orderId"
                                            params={{ orderId: order.id }}
                                            className="flex-1 hover:bg-gray-50 p-2 sm:p-4 rounded-lg transition-colors block"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                                                <div className="flex-1">
                                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">{order.name} {order.quantity > 1 && `${order.quantity}x`}</h3>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        <div className="mb-1 font-medium">Inclusion:</div>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                            {order.inclusions.map((item, i) => (
                                                                <div key={i} className="text-xs">{item}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">Add-ons:</span> {order.addOns}
                                                    </div>
                                                </div>

                                                <div className="text-left sm:text-right">
                                                    <div className={`font-bold text-base sm:text-lg mb-2 ${getStatusColor(order.status)}`}>{order.status.toUpperCase()}</div>
                                                    <div className="text-sm text-gray-600 mb-2">Order ID: {order.orderNumber}</div>
                                                    <div className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-4">Total: {formatPrice(order.totalAmount)}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end gap-2 mt-2 sm:mt-4">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {order.status === 'completed' && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                                                >
                                                    <Star className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Rate</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                    className="px-3 sm:px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 text-sm sm:text-base"
                                                >
                                                    Buy Again
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer id="contact" className="py-8" style={{ backgroundColor: "#F9ECD9" }}>
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Angieren's Lutong Bahay</h3>
                            <p className="text-gray-600 text-sm">
                                Authentic Filipino home-cooked meals delivered to your doorstep.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-3 text-gray-800">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/customer-interface/home" className="text-gray-600 hover:text-gray-800">Home</Link></li>
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Menu</Link></li>
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">About Us</Link></li>
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-3 text-gray-800">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">FAQ</Link></li>
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Help Center</Link></li>
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Terms & Conditions</Link></li>
                                <li><Link to="/" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold mb-3 text-gray-800">Connect With Us</h4>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-600">Email: info@angierens.com</p>
                                <p className="text-gray-600">Phone: +63 912 345 6789</p>
                                <div className="flex space-x-4 mt-4">
                                    <a href="#" className="text-gray-600 hover:text-gray-800">Facebook</a>
                                    <a href="#" className="text-gray-600 hover:text-gray-800">Instagram</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-400 mt-8 pt-4 text-center text-sm text-gray-600">
                        <p>&copy; 2024 Angieren's Lutong Bahay. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Filter Orders</h2>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Select category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="">All categories</option>
                                {tabs.filter(tab => tab.id !== 'all').map(tab => (
                                    <option key={tab.id} value={tab.id}>{tab.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block font-medium mb-1">Select date:</label>
                            <input
                                type="date"
                                value={selectedDate?.toISOString().split('T')[0] || ''}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="w-full px-3 py-2 rounded border border-gray-300"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100">Cancel</button>
                            <button onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
