import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ShoppingCart, Bell, ChevronDown, ArrowLeft, Edit2, X, Menu, Calendar, Heart, Star, MessageSquare } from 'lucide-react'

export const Route = createLazyFileRoute('/customer-interface/payment')({
    component: RouteComponent,
})

interface OrderItem {
    id: string
    name: string
    addOns: string
    price: number
    quantity: number
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
    const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
    const [address, setAddress] = useState({
        line1: 'Blk 30, Lot 15, Queensville, Bagumbong, Caloocan City,',
        line2: 'Metro manila',
    });
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(2);
    const [notificationCount, setNotificationCount] = useState(3);
    const [deliveryOption, setDeliveryOption] = useState('delivery');
    const [fulfillmentType, setFulfillmentType] = useState('today');
    const [selectedTime, setSelectedTime] = useState('2:00 PM');
    const [paymentMethod, setPaymentMethod] = useState('gcash');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Navigation items with their corresponding routes - ORDER is now a direct link
    const navigationItems = [
        { name: 'HOME', route: '/customer-interface/home', active: false },
        { name: 'MENU', route: '/customer-interface/', active: false },
        { name: 'ORDER', route: '/customer-interface/order', active: false },
        { name: 'FEEDBACK', route: '/customer-interface/feedback', active: false },
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

    // Sample order data
    const orderItems: OrderItem[] = [
        {
            id: '1',
            name: '5 in 1 Mix in Bilao (Palabok)',
            addOns: '20 pcs. Puto',
            price: 3950,
            quantity: 2
        }
    ];

    const deliveryFee = 75;
    const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    const timeOptions = [
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
        '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
    ];

    const formatPrice = (price: number) => {
        return `₱ ${price.toLocaleString()}`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const generateCalendarDays = () => {
        const today = new Date();
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const handlePlaceOrder = () => {
        // Handle order placement logic here
        console.log('Order placed!');
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsCalendarDropdownOpen(false);
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
            <div className="max-w-6xl mx-auto pt-5 pb-20">
                {/* Header with Back Button */}
                <div className="flex items-center gap-3 mb-8">
                    <Link to="/customer-interface/cart" className="p-2 hover:bg-white/50 rounded-full">
                        <ArrowLeft className="w-6 h-6 text-gray-800" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Payment</h1>
                </div>

                <div className="flex gap-8">
                    {/* Left Column - Payment Details */}
                    <div className="flex-1 space-y-6">
                        {/* Address Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Address</h2>
                            <div className="flex items-center justify-between">
                                <div className="text-gray-600">
                                    <p>{address.line1}</p>
                                    <p>{address.line2}</p>
                                </div>

                                <button
                                    onClick={() => setIsEditAddressModalOpen(true)}
                                    className="p-2 text-orange-600 hover:text-orange-700"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-gray-600"
                                placeholder="Wag po paramihan yung bawang.."
                                defaultValue="Wag po paramihan yung bawang.."
                            />
                        </div>

                        {/* Delivery Options */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Options</h2>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setDeliveryOption('delivery')}
                                            className={`px-6 py-2 rounded-full font-medium transition-colors ${deliveryOption === 'delivery'
                                                ? 'bg-yellow-400 text-black'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            Delivery
                                        </button>
                                        <button
                                            onClick={() => setDeliveryOption('pickup')}
                                            className={`px-6 py-2 rounded-full font-medium transition-colors ${deliveryOption === 'pickup'
                                                ? 'bg-yellow-400 text-black'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            Pick-up
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Date {fulfillmentType === 'today' ? 'Today' : 'Selection'}</h2>
                                    {fulfillmentType === 'today' ? (
                                        <p className="text-gray-600 font-medium">May 17, 2025</p>
                                    ) : (
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                                                className="w-full px-4 py-3 bg-yellow-400 text-black rounded-lg font-medium flex items-center justify-between hover:bg-yellow-500 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(selectedDate)}
                                                </div>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isCalendarDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isCalendarDropdownOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4">
                                                    {/* Calendar Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <button
                                                            onClick={() => navigateMonth('prev')}
                                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            <ChevronDown className="w-4 h-4 rotate-90" />
                                                        </button>
                                                        <h3 className="font-semibold text-gray-800">
                                                            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                        </h3>
                                                        <button
                                                            onClick={() => navigateMonth('next')}
                                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                        >
                                                            <ChevronDown className="w-4 h-4 -rotate-90" />
                                                        </button>
                                                    </div>

                                                    {/* Calendar Grid */}
                                                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                            <div key={day} className="p-2 font-medium text-gray-500">
                                                                {day}
                                                            </div>
                                                        ))}
                                                        {generateCalendarDays().map((date, index) => {
                                                            const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                                                            const isSelected = date.toDateString() === selectedDate.toDateString();
                                                            const isDisabled = isDateDisabled(date);
                                                            const isToday = date.toDateString() === new Date().toDateString();

                                                            return (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => !isDisabled && handleDateSelect(date)}
                                                                    disabled={isDisabled}
                                                                    className={`p-2 rounded-lg transition-colors ${isSelected
                                                                        ? 'bg-yellow-400 text-black font-semibold'
                                                                        : isToday
                                                                            ? 'bg-blue-100 text-blue-600 font-medium'
                                                                            : isCurrentMonth
                                                                                ? isDisabled
                                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                                    : 'text-gray-700 hover:bg-gray-200'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                >
                                                                    {date.getDate()}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fulfillment and Time */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Fulfillment Type</h2>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setFulfillmentType('today')}
                                            className={`px-6 py-2 rounded-full font-medium transition-colors ${fulfillmentType === 'today'
                                                ? 'bg-yellow-400 text-black'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            Today
                                        </button>
                                        <button
                                            onClick={() => setFulfillmentType('scheduled')}
                                            className={`px-6 py-2 rounded-full font-medium transition-colors ${fulfillmentType === 'scheduled'
                                                ? 'bg-yellow-400 text-black'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            Scheduled
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Pick Time</h2>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                            className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium flex items-center justify-between hover:bg-yellow-500 transition-colors"
                                        >
                                            {selectedTime}
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isTimeDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                                {timeOptions.map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => {
                                                            setSelectedTime(time);
                                                            setIsTimeDropdownOpen(false);
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="w-96 space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Order</h2>

                            {orderItems.map((item) => (
                                <div key={item.id} className="mb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-600">add-ons: {item.addOns}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">x{item.quantity}</p>
                                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery fee</span>
                                    <span>{formatPrice(deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="gcash"
                                        name="payment"
                                        value="gcash"
                                        checked={paymentMethod === 'gcash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 focus:ring-2"
                                    />
                                    <label htmlFor="gcash" className="ml-3 flex items-center gap-2 text-gray-700">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">G</span>
                                        </div>
                                        GCash
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="cash"
                                        name="payment"
                                        value="cash"
                                        checked={paymentMethod === 'cash'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 focus:ring-2"
                                    />
                                    <label htmlFor="cash" className="ml-3 flex items-center gap-2 text-gray-700">
                                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                                            <span className="text-white font-bold text-xs">₱</span>
                                        </div>
                                        Cash
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="onsite"
                                        name="payment"
                                        value="onsite"
                                        checked={paymentMethod === 'onsite'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 focus:ring-2"
                                    />
                                    <label htmlFor="onsite" className="ml-3 text-gray-700">
                                        On-site Payment
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                        >
                            Place Order →
                        </button>
                    </div>
                </div>
            </div>

            {isEditAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Edit Address</h2>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={address.line1}
                                onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                                className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
                                placeholder="Address Line 1"
                            />
                            <input
                                type="text"
                                value={address.line2}
                                onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                                className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
                                placeholder="Address Line 2"
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditAddressModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditAddressModalOpen(false);
                                    // You could handle save logic here
                                }}
                                className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* FOOTER */}
            <footer id="contact" className="py-8 bottom-0 w-full z-10" style={{ backgroundColor: "#F9ECD9" }}>
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
    );
}