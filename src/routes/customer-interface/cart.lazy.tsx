import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Edit2, Trash2, Bell, Heart, X, MessageSquare, Star, Menu } from 'lucide-react'

export const Route = createLazyFileRoute('/customer-interface/cart')({
    component: RouteComponent,
})

interface CartItem {
    id: string
    name: string
    addOns: string
    price: number
    quantity: number
    image: string
    description?: string
    inclusions?: string[]
}

interface AddOnOption {
    id: string
    name: string
    price: number
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
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(2); // Set based on cart items
    const [notificationCount, setNotificationCount] = useState(3);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [addOns, setAddOns] = useState<Record<string, number>>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


    // Add-on options
    const addOnOptions: AddOnOption[] = [
        { id: '1', name: 'Puto (10 pcs)', price: 150 },
        { id: '2', name: 'Puto (20 pcs)', price: 300 },
        { id: '3', name: 'Extra Rice', price: 50 },
        { id: '4', name: 'Iced Tea', price: 25 },
        { id: '5', name: 'Soda', price: 35 },
    ];

    // Navigation items with their corresponding routes - ORDER is now a direct link
    const navigationItems = [
        { name: 'HOME', route: '/customer-interface/home', active: false },
        { name: 'MENU', route: '/customer-interface/', active: false },
        { name: 'ORDER', route: '/customer-interface/order', active: false },
        { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
        { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
    ];

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

    // Sample cart data - replace with your actual state management
    const [cartItems, setCartItems] = useState<CartItem[]>([
        {
            id: '1',
            name: '5 in 1 Mix in Bilao (PALABOK)',
            addOns: '20 pcs. Puto',
            price: 3950,
            quantity: 2,
            image: '/public/menu-page img/pancit malabonbon.png',
            description: 'A hearty and flavorful blend of authentic Filipino dishes, perfectly portioned for sharing and celebrating with family and friends.',
            inclusions: [
                'Palabok (Filipino rice noodles)',
                'Pansit Canton (stir-fried noodles)',
                'Biko (sticky rice cake)',
                'Suman (rice cake)',
                'Turon (banana spring roll)',
                'Lechon Kawali (crispy pork belly)',
                'Adobo (Filipino braised meat)',
                'Steamed Rice',
                'Banana Leaves for presentation'
            ]
        },
        // Add more items as needed
    ])

    const updateQuantity = (id: string, newQuantity: number) => {
        if (newQuantity === 0) {
            setCartItems(cartItems.filter(item => item.id !== id))
        } else {
            setCartItems(cartItems.map(item =>
                item.id === id ? { ...item, quantity: newQuantity } : item
            ))
        }
    }

    const removeItem = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id))
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    const formatPrice = (price: number) => {
        return `₱ ${price.toLocaleString()}`
    }

    const openEditModal = (item: CartItem) => {
        setSelectedItem(item);
        setOrderQuantity(item.quantity);
        setAddOns({}); // Reset add-ons for fresh selection
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedItem(null);
        setOrderQuantity(1);
        setAddOns({});
    };

    const updateAddOnQuantity = (addOnId: string, quantity: number) => {
        if (quantity <= 0) {
            const newAddOns = { ...addOns };
            delete newAddOns[addOnId];
            setAddOns(newAddOns);
        } else {
            setAddOns(prev => ({ ...prev, [addOnId]: quantity }));
        }
    };

    const calculateEditTotal = () => {
        if (!selectedItem) return 0;

        const baseTotal = selectedItem.price * orderQuantity;
        const addOnTotal = Object.entries(addOns).reduce((total, [addOnId, quantity]) => {
            const addOn = addOnOptions.find(option => option.id === addOnId);
            return total + (addOn ? addOn.price * quantity : 0);
        }, 0);

        return baseTotal + addOnTotal;
    };

    const updateCartItem = () => {
        if (!selectedItem) return;

        // Create add-ons string
        const addOnsList = Object.entries(addOns)
            .filter(([_, quantity]) => quantity > 0)
            .map(([addOnId, quantity]) => {
                const addOn = addOnOptions.find(option => option.id === addOnId);
                return addOn ? `${addOn.name} (${quantity})` : '';
            })
            .filter(Boolean)
            .join(', ');

        setCartItems(cartItems.map(item =>
            item.id === selectedItem.id
                ? {
                    ...item,
                    quantity: orderQuantity,
                    addOns: addOnsList || item.addOns
                }
                : item
        ));

        closeEditModal();
    };

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
                            <Link to="/login">
                                <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                                    <span className="hidden sm:inline">LOG OUT</span>
                                    <span className="sm:hidden">OUT</span>
                                </button>
                            </Link>
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
                    <span className="text-yellow-400 text-xl font-bold">Menu</span>
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

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Cart</h1>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-base sm:text-lg">Your cart is empty</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-4 sm:p-6">
                                    {/* Desktop Layout */}
                                    <div className="hidden lg:flex items-center gap-6">
                                        {/* Selection Checkbox */}
                                        <div className="flex-shrink-0">
                                            <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-400 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        </div>

                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="relative">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-24 h-24 object-cover rounded-full border-4 border-green-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-3">
                                                add-ons: {item.addOns}
                                            </p>
                                            <div className="text-xl font-bold text-gray-800">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-5 h-5 text-gray-800" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-lg">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-5 h-5 text-gray-800" />
                                            </button>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-orange-600 hover:text-orange-700 transition-colors"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile/Tablet Layout */}
                                    <div className="lg:hidden">
                                        {/* Top Row - Image, Details, and Actions */}
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Selection Checkbox - Mobile */}
                                            <div className="flex-shrink-0 mt-2">
                                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-yellow-400 border-2 border-yellow-400 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                                </div>
                                            </div>

                                            {/* Product Image - Mobile */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full border-2 sm:border-4 border-green-600"
                                                />
                                            </div>

                                            {/* Product Details - Mobile */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-600 text-xs sm:text-sm mb-2 truncate">
                                                    add-ons: {item.addOns}
                                                </p>
                                                <div className="text-lg sm:text-xl font-bold text-gray-800">
                                                    {formatPrice(item.price)}
                                                </div>
                                            </div>

                                            {/* Action Buttons - Mobile */}
                                            <div className="flex sm:flex-col gap-1 sm:gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-1.5 sm:p-2 text-orange-600 hover:text-orange-700 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Bottom Row - Quantity Controls (Mobile) */}
                                        <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
                                            <span className="text-sm font-medium text-gray-600 mr-2">Qty:</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                                            </button>
                                            <span className="w-6 sm:w-8 text-center font-semibold text-base sm:text-lg">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Summary */}
                {cartItems.length > 0 && (
                    <div className="border-t border-gray-300 pt-4 sm:pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                            <div className="bg-gray-100 px-4 py-2 sm:px-6 sm:py-3 rounded-full order-2 sm:order-1">
                                <span className="text-base sm:text-lg font-semibold text-gray-800">
                                    Cart Total: {formatPrice(calculateTotal())}
                                </span>
                            </div>
                            <Link
                                to='/customer-interface/payment'
                                className='bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold px-6 py-2.5 sm:px-8 sm:py-3 rounded-full transition-colors flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center text-sm sm:text-base'
                            >
                                Proceed to Checkout →
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex">
                            {/* Left side - Item details */}
                            <div className="flex-1 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedItem.name}</h2>
                                        <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                                    </div>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-gray-600 p-2"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Inclusion:</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedItem.inclusions?.map((inclusion: string, index: number) => (
                                            <p key={index} className="text-gray-600 text-sm">{inclusion}</p>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity selector */}
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-gray-700 font-medium">Quantity:</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="text-xl font-semibold w-12 text-center">{orderQuantity}</span>
                                        <button
                                            onClick={() => setOrderQuantity(orderQuantity + 1)}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Total and Update Cart */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="text-2xl font-bold text-gray-900">
                                        Total: ₱{calculateEditTotal().toLocaleString()}
                                    </div>
                                    <button
                                        onClick={updateCartItem}
                                        className="bg-yellow-400 text-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors duration-200 shadow-md"
                                    >
                                        Update Cart
                                    </button>
                                </div>
                            </div>

                            {/* Right side - Add-ons */}
                            <div className="w-80 bg-gray-50 p-6 border-l">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add-ons:</h3>
                                <div className="space-y-3">
                                    {addOnOptions.map((addOn) => (
                                        <div key={addOn.id} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <button className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                                                    {addOn.name}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateAddOnQuantity(addOn.id, (addOns[addOn.id] || 0) - 1)}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm">{addOns[addOn.id] || 0}</span>
                                                <button
                                                    onClick={() => updateAddOnQuantity(addOn.id, (addOns[addOn.id] || 0) + 1)}
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer id="contact" className="py-8 w-full z-10" style={{ backgroundColor: "#F9ECD9" }}>
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
        </div>
    )
}