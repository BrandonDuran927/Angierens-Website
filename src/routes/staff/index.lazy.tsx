import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    Search, Heart, MessageSquare, Star, Plus, Eye, Bell, Menu, X, Filter, Calendar, CreditCard, Truck,
    Clock,
    Settings,
    User,
    DollarSign,
    Package,
    LogOut,
    Upload
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { fetchOrders } from '@/lib/api'
import type { Order } from '@/lib/api'
import { supabase } from '@/lib/supabaseClient'

export const Route = createLazyFileRoute('/staff/')({
    component: RouteComponent,
})

interface OrderDisplay {
    id: string
    customerName: string
    date: string
    time: string
    price: string
    fulfillmentType: string
    paymentMethod: string
    status: 'pending' | 'accepted' | 'rejected'
    orderData?: Order
}

interface OrderForm {
    fullName: string
    email: string
    phone: string
    fulfillmentType: string
    selectedMenuItems: SelectedMenuItem[]
    addOns: {
        [key: string]: number
    }
}

interface SelectedMenuItem {
    menu_id: string
    name: string
    price: number
    quantity: number
    inclusion: string
}

interface MenuItem {
    menu_id: string
    name: string
    price: number
    inclusion: string
    is_available: boolean
}

interface AddOn {
    add_on: string
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

interface Filters {
    dateRange: string
    paymentMethod: string
    fulfillmentType: string
    priceRange: string
    status: string
}

function RouteComponent() {
    const [activeTab, setActiveTab] = useState('New Orders')
    const [activeTimeTab, setActiveTimeTab] = useState('Today')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [showOrderBackView, setShowOrderBackView] = useState(false)
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<OrderDisplay | null>(null)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [returnPaymentProof, setReturnPaymentProof] = useState<File | null>(null)
    const [orders, setOrders] = useState<OrderDisplay[]>([])
    const [loading, setLoading] = useState(true)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [addOns, setAddOns] = useState<AddOn[]>([])
    const [menuSearchQuery, setMenuSearchQuery] = useState('')

    const handleReturnPaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReturnPaymentProof(e.target.files[0])
        }
    }

    const handleRejectDone = async () => {
        if (!selectedOrder?.orderData) return

        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: 'Completed',
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', selectedOrder.orderData.order_id)

            if (error) throw error

            console.log('Order rejected with proof:', returnPaymentProof)
            setIsRejectModalOpen(false)
            setReturnPaymentProof(null)
            setIsOrderDetailsModalOpen(false)
            loadOrders()
        } catch (error) {
            console.error('Error rejecting order:', error)
            alert('Failed to reject order')
        }
    }

    const handleRejectCancel = () => {
        setIsRejectModalOpen(false)
        setReturnPaymentProof(null)
    }

    const notificationCount = 1

    const [filters, setFilters] = useState<Filters>({
        dateRange: '',
        paymentMethod: '',
        fulfillmentType: '',
        priceRange: '',
        status: ''
    })

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'order',
            title: 'We are now preparing your food (#6). Thank you for trusting Angieren\'s Lutong Bahay.',
            time: '20 sec ago',
            icon: 'heart',
            read: false
        }
    ])

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

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    }

    const [orderForm, setOrderForm] = useState<OrderForm>({
        fullName: '',
        email: '',
        phone: '',
        fulfillmentType: '',
        selectedMenuItems: [],
        addOns: {}
    })

    // Load orders from Supabase
    const loadOrders = async () => {
        try {
            setLoading(true)
            const data = await fetchOrders()

            const formattedOrders: OrderDisplay[] = data.map(order => ({
                id: `#${order.order_number}`,
                customerName: order.user.customer_name,
                date: order.schedule.schedule_date
                    ? new Date(order.schedule.schedule_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                    : new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                time: order.schedule.schedule_time || order.time,
                price: `₱ ${Number(order.total_price).toLocaleString()}`,
                fulfillmentType: order.order_type,
                paymentMethod: order.payment.paymentMethod || 'On-site',
                status: order.order_status === 'New Orders' ? 'pending' :
                    order.order_status === 'In Process' ? 'accepted' : 'rejected',
                orderData: order
            }))

            setOrders(formattedOrders)
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    // Load menu items
    const loadMenuItems = async () => {
        try {
            const { data, error } = await supabase
                .from('menu')
                .select('*')
                .eq('is_available', true)
                .order('name')

            if (error) throw error
            setMenuItems(data || [])
        } catch (error) {
            console.error('Error loading menu items:', error)
        }
    }

    // Load add-ons
    const loadAddOns = async () => {
        try {
            const { data, error } = await supabase
                .from('add_on')
                .select('*')
                .order('name')

            if (error) throw error

            const addOnsData = data || []
            setAddOns(addOnsData)

            // Initialize addOns in form
            const initialAddOns: { [key: string]: number } = {}
            addOnsData.forEach(addon => {
                initialAddOns[addon.add_on] = 0
            })
            setOrderForm(prev => ({ ...prev, addOns: initialAddOns }))
        } catch (error) {
            console.error('Error loading add-ons:', error)
        }
    }

    useEffect(() => {
        loadOrders()
        loadMenuItems()
        loadAddOns()
    }, [])

    const itemsPerPage = 10

    // Filter orders based on active tab and search
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTab =
            (activeTab === 'New Orders' && order.status === 'pending') ||
            (activeTab === 'In Process' && order.status === 'accepted') ||
            (activeTab === 'Completed' && order.status === 'rejected')

        const today = new Date().toDateString()
        const orderDate = new Date(order.orderData?.schedule.schedule_date || order.date).toDateString()
        const matchesTimeTab =
            (activeTimeTab === 'Today' && orderDate === today) ||
            (activeTimeTab === 'Scheduled' && orderDate !== today)

        return matchesSearch && matchesTab && matchesTimeTab
    })

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredOrders.length)
    const currentOrders = filteredOrders.slice(startIndex, endIndex)

    const handleAcceptOrder = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (!order?.orderData) return

        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: 'In Process',
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', order.orderData.order_id)

            if (error) throw error

            await loadOrders()
            alert('Order accepted successfully!')
        } catch (error) {
            console.error('Error accepting order:', error)
            alert('Failed to accept order')
        }
    }

    const handleRejectOrder = (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (order) {
            setSelectedOrder(order)
            setIsRejectModalOpen(true)
        }
    }

    const openOrderDetails = (order: OrderDisplay) => {
        setSelectedOrder(order)
        setIsOrderDetailsModalOpen(true)
    }

    const closeOrderDetails = () => {
        setSelectedOrder(null)
        setIsOrderDetailsModalOpen(false)
        setShowOrderBackView(false)
    }

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const applyFilters = () => {
        console.log('Apply filters:', filters)
        setIsFilterOpen(false)
    }

    const clearFilters = () => {
        setFilters({
            dateRange: '',
            paymentMethod: '',
            fulfillmentType: '',
            priceRange: '',
            status: ''
        })
    }

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

    const { user, signOut } = useUser()

    useEffect(() => {
        console.log("Navigated to /staff")
        console.log("Current logged-in user:", user)
    }, [user])

    // Add menu item to order
    const addMenuItemToOrder = (menuItem: MenuItem) => {
        setOrderForm(prev => {
            const existing = prev.selectedMenuItems.find(item => item.menu_id === menuItem.menu_id)
            if (existing) {
                return {
                    ...prev,
                    selectedMenuItems: prev.selectedMenuItems.map(item =>
                        item.menu_id === menuItem.menu_id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                }
            } else {
                return {
                    ...prev,
                    selectedMenuItems: [
                        ...prev.selectedMenuItems,
                        {
                            menu_id: menuItem.menu_id,
                            name: menuItem.name,
                            price: Number(menuItem.price),
                            quantity: 1,
                            inclusion: menuItem.inclusion || ''
                        }
                    ]
                }
            }
        })
    }

    // Remove menu item from order
    const removeMenuItemFromOrder = (menuId: string) => {
        setOrderForm(prev => {
            const item = prev.selectedMenuItems.find(item => item.menu_id === menuId)
            if (item && item.quantity > 1) {
                return {
                    ...prev,
                    selectedMenuItems: prev.selectedMenuItems.map(item =>
                        item.menu_id === menuId
                            ? { ...item, quantity: item.quantity - 1 }
                            : item
                    )
                }
            } else {
                return {
                    ...prev,
                    selectedMenuItems: prev.selectedMenuItems.filter(item => item.menu_id !== menuId)
                }
            }
        })
    }

    // Calculate order totals
    const calculateOrderTotal = () => {
        const menuTotal = orderForm.selectedMenuItems.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        )
        const addOnsTotal = Object.entries(orderForm.addOns).reduce(
            (sum, [addOnId, quantity]) => {
                const addOn = addOns.find(a => a.add_on === addOnId)
                return sum + (addOn ? Number(addOn.price) * quantity : 0)
            },
            0
        )
        return menuTotal + addOnsTotal
    }

    // Submit manual order
    const handleSubmitOrder = async () => {
        try {
            if (!orderForm.fullName || !orderForm.email || !orderForm.phone || !orderForm.fulfillmentType) {
                alert('Please fill in all customer information fields')
                return
            }

            if (orderForm.selectedMenuItems.length === 0) {
                alert('Please add at least one menu item to the order')
                return
            }

            // Create or get user
            let userId = ''
            const { data: existingUser } = await supabase
                .from('users')
                .select('user_uid')
                .eq('email', orderForm.email)
                .single()

            if (existingUser) {
                userId = existingUser.user_uid
            } else {
                const nameParts = orderForm.fullName.trim().split(' ')
                const firstName = nameParts[0] || ''
                const lastName = nameParts[nameParts.length - 1] || ''
                const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null

                const { data: newUser, error: userError } = await supabase
                    .from('users')
                    .insert({
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email: orderForm.email,
                        phone_number: orderForm.phone,
                        is_active: true,
                        user_role: 'customer',
                        gender: 'Other'
                    })
                    .select()
                    .single()

                if (userError) throw userError
                userId = newUser.user_uid
            }

            // Create schedule
            const { data: schedule, error: scheduleError } = await supabase
                .from('schedule')
                .insert({
                    schedule_date: new Date().toISOString().split('T')[0],
                    schedule_time: new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })
                })
                .select()
                .single()

            if (scheduleError) throw scheduleError

            // Create payment
            const { data: payment, error: paymentError } = await supabase
                .from('payment')
                .insert({
                    payment_method: 'On-site',
                    payment_date: new Date().toISOString()
                })
                .select()
                .single()

            if (paymentError) throw paymentError

            // Create order
            const totalPrice = calculateOrderTotal()
            const { data: order, error: orderError } = await supabase
                .from('order')
                .insert({
                    customer_uid: userId,
                    schedule_id: schedule.schedule_id,
                    payment_id: payment.payment_id,
                    order_status: 'New Orders',
                    order_type: orderForm.fulfillmentType === 'pickup' ? 'Pick-up' : 'Delivery',
                    total_price: totalPrice,
                    additional_information: 'Walk-in customer order'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            for (const item of orderForm.selectedMenuItems) {
                const { error: itemError } = await supabase
                    .from('order_item')
                    .insert({
                        order_id: order.order_id,
                        menu_id: item.menu_id,
                        quantity: item.quantity,
                        subtotal_price: item.price * item.quantity
                    })

                if (itemError) throw itemError
            }

            // Create add-on items if any
            for (const [addOnId, quantity] of Object.entries(orderForm.addOns)) {
                if (quantity > 0) {
                    const addOn = addOns.find(a => a.add_on === addOnId)
                    if (addOn) {
                        const { error: addOnError } = await supabase
                            .from('order_item')
                            .insert({
                                order_id: order.order_id,
                                menu_id: addOnId,
                                quantity: quantity,
                                subtotal_price: Number(addOn.price) * quantity
                            })

                        if (addOnError) throw addOnError
                    }
                }
            }

            alert('Order created successfully!')
            setIsAddOrderModalOpen(false)
            setOrderForm({
                fullName: '',
                email: '',
                phone: '',
                fulfillmentType: '',
                selectedMenuItems: [],
                addOns: {}
            })
            loadOrders()
        } catch (error) {
            console.error('Error creating order:', error)
            alert('Failed to create order')
        }
    }

    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-hidden">
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
                            <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                <img src="/angierens-logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
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
                    <h3 className="font-bold text-lg text-amber-900">
                        {user?.first_name} {user?.last_name}
                    </h3>
                    <p className="text-sm text-amber-800">{user?.phone_number}</p>
                    <p className="text-sm text-amber-800">{user?.email}</p>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <header className="bg-amber-800 text-white p-3 sm:p-4 shadow-md flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 text-white hover:bg-amber-700 rounded-lg"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <h1 className="text-lg sm:text-xl lg:text-3xl font-bold">ORDERS</h1>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                            <span className="text-amber-200 text-xs lg:text-sm font-semibold hidden md:inline">
                                {getCurrentDate()}
                            </span>
                            <span className="text-amber-200 text-xs lg:text-sm font-semibold hidden md:inline">
                                {getCurrentTime()}
                            </span>
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="relative p-2 bg-yellow-400 text-amber-900 hover:bg-yellow-500 rounded-full"
                                >
                                    <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                                    {notificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {notificationCount}
                                        </span>
                                    )}
                                </button>
                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                                        </div>

                                        <div className="max-h-64 overflow-y-auto">
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
                </header>

                {/* Time Tabs */}
                <div className="bg-white border-b border-gray-200 px-3 sm:px-6 pt-3 sm:pt-4 flex-shrink-0">
                    <div className="flex gap-2 overflow-x-auto">
                        {['Today', 'Scheduled'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTimeTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${activeTimeTab === tab
                                    ? 'bg-yellow-400 text-amber-800'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="bg-white px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex gap-2 overflow-x-auto mb-3 sm:mb-4">
                        {['New Orders', 'In Process', 'Completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                    ? 'bg-yellow-400 text-amber-800'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                        <div className="relative flex-1 max-w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search order by ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                            <button
                                onClick={() => setIsAddOrderModalOpen(true)}
                                className="flex items-center gap-2 bg-amber-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors text-sm whitespace-nowrap"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Order</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content - Mobile First */}
                <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading orders...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View (Default) */}
                            <div className="space-y-3 sm:space-y-4 lg:hidden">
                                <div className="bg-yellow-400 p-4 rounded-xl sticky top-0 z-10 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-base sm:text-lg font-bold">{activeTab} {activeTimeTab}</h2>
                                        <span className="text-lg sm:text-xl font-bold">{filteredOrders.length}</span>
                                    </div>
                                </div>

                                {currentOrders.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">No orders found</p>
                                    </div>
                                ) : (
                                    currentOrders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{order.id}</h3>
                                                    <p className="text-sm text-gray-600">{order.customerName}</p>
                                                </div>
                                                <button
                                                    onClick={() => openOrderDetails(order)}
                                                    className="text-gray-600 hover:text-gray-800 active:text-gray-900 p-1"
                                                    aria-label="View order details"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Date</p>
                                                    <p className="font-medium">{order.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Time</p>
                                                    <p className="font-medium">{order.time}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Price</p>
                                                    <p className="font-medium">{order.price}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-xs mb-1">Fulfillment</p>
                                                    <p className="font-medium">{order.fulfillmentType}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-500 text-xs mb-1">Payment</p>
                                                    <p className="font-medium">{order.paymentMethod}</p>
                                                </div>
                                            </div>

                                            {order.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRejectOrder(order.id)}
                                                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptOrder(order.id)}
                                                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Table Header */}
                                <div className="bg-yellow-400 p-6 border-b border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold">{activeTab} {activeTimeTab}</h2>
                                        <span className="text-2xl font-bold">{filteredOrders.length} Orders</span>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    {currentOrders.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600">No orders found</p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fulfillment</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.price}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fulfillmentType}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <div className="flex gap-2">
                                                                {order.status === 'pending' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleRejectOrder(order.id)}
                                                                            className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleAcceptOrder(order.id)}
                                                                            className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => openOrderDetails(order)}
                                                                    className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                                                                    aria-label="View order details"
                                                                >
                                                                    <Eye className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Add Order Modal */}
            {isAddOrderModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800">Add Order Manually (Walk-in)</h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Customer Info & Orders */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name:</label>
                                        <input
                                            type="text"
                                            placeholder="Type the full name of the customer"
                                            value={orderForm.fullName}
                                            onChange={(e) => setOrderForm(prev => ({ ...prev, fullName: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address:</label>
                                        <input
                                            type="email"
                                            placeholder="Type the working email address..."
                                            value={orderForm.email}
                                            onChange={(e) => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number:</label>
                                        <input
                                            type="tel"
                                            placeholder="Type the working phone number..."
                                            value={orderForm.phone}
                                            onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Fulfillment Type:</label>
                                        <select
                                            value={orderForm.fulfillmentType}
                                            onChange={(e) => setOrderForm(prev => ({ ...prev, fulfillmentType: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="">Select fulfillment type</option>
                                            <option value="pickup">Pick-up</option>
                                            <option value="delivery">Delivery</option>
                                        </select>
                                    </div>

                                    {/* Add orders section */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Add orders:</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input
                                                type="text"
                                                placeholder="Search a name of the item"
                                                value={menuSearchQuery}
                                                onChange={(e) => setMenuSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>

                                        {/* Current Added Orders List */}
                                        {orderForm.selectedMenuItems.length > 0 && (
                                            <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg">
                                                <h4 className="text-sm font-semibold text-gray-700">Current Orders:</h4>
                                                <div className="space-y-2">
                                                    {orderForm.selectedMenuItems.map((item) => (
                                                        <div key={item.menu_id} className="flex justify-between items-center text-sm">
                                                            <span>• {item.name} (x{item.quantity})</span>
                                                            <span className="font-semibold">₱ {(item.price * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="border-t border-gray-300 pt-2 mt-2">
                                                    <div className="flex justify-between items-center font-semibold">
                                                        <span>Subtotal</span>
                                                        <span className="text-lg">₱ {calculateOrderTotal().toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Available Menu items to add */}
                                        <div className="mt-3">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Available Items:</h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {filteredMenuItems.length === 0 ? (
                                                    <p className="text-sm text-gray-500 text-center py-4">No items found</p>
                                                ) : (
                                                    filteredMenuItems.map((menuItem) => {
                                                        const selectedItem = orderForm.selectedMenuItems.find(
                                                            item => item.menu_id === menuItem.menu_id
                                                        )
                                                        const quantity = selectedItem?.quantity || 0

                                                        return (
                                                            <div key={menuItem.menu_id} className="bg-amber-600 text-white p-3 rounded-lg">
                                                                <div className="flex justify-between items-start gap-3">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-semibold">{menuItem.name}</h4>
                                                                        <p className="text-sm opacity-90 mt-1">₱ {Number(menuItem.price).toLocaleString()}</p>
                                                                        {menuItem.inclusion && (
                                                                            <>
                                                                                <p className="text-sm opacity-90 mt-1">Inclusion:</p>
                                                                                <p className="text-xs opacity-75">{menuItem.inclusion}</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => removeMenuItemFromOrder(menuItem.menu_id)}
                                                                            disabled={quantity === 0}
                                                                            className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center disabled:opacity-50"
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <span className="text-white font-semibold w-6 text-center">{quantity}</span>
                                                                        <button
                                                                            onClick={() => addMenuItemToOrder(menuItem)}
                                                                            className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Add-ons */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Add-ons:</h3>
                                    <div className="space-y-3">
                                        {addOns.length === 0 ? (
                                            <p className="text-sm text-gray-500">No add-ons available</p>
                                        ) : (
                                            addOns.map((addon) => (
                                                <div key={addon.add_on} className="flex items-center justify-between">
                                                    <div>
                                                        <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                                                            {addon.name}
                                                        </span>
                                                        <span className="text-sm text-gray-600 ml-2">₱ {Number(addon.price).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: {
                                                                    ...prev.addOns,
                                                                    [addon.add_on]: Math.max(0, (prev.addOns[addon.add_on] || 0) - 1)
                                                                }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center">{orderForm.addOns[addon.add_on] || 0}</span>
                                                        <button
                                                            onClick={() => setOrderForm(prev => ({
                                                                ...prev,
                                                                addOns: {
                                                                    ...prev.addOns,
                                                                    [addon.add_on]: (prev.addOns[addon.add_on] || 0) + 1
                                                                }
                                                            }))}
                                                            className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Total Summary */}
                                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">Order Summary</h4>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span>Menu Items:</span>
                                                <span className="font-semibold">
                                                    ₱ {orderForm.selectedMenuItems.reduce(
                                                        (sum, item) => sum + (item.price * item.quantity), 0
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Add-ons:</span>
                                                <span className="font-semibold">
                                                    ₱ {Object.entries(orderForm.addOns).reduce(
                                                        (sum, [addOnId, quantity]) => {
                                                            const addOn = addOns.find(a => a.add_on === addOnId)
                                                            return sum + (addOn ? Number(addOn.price) * quantity : 0)
                                                        }, 0
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="border-t border-yellow-400 pt-2 mt-2">
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span>Total:</span>
                                                    <span>₱ {calculateOrderTotal().toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
                            <button
                                onClick={() => {
                                    setIsAddOrderModalOpen(false)
                                    setOrderForm({
                                        fullName: '',
                                        email: '',
                                        phone: '',
                                        fulfillmentType: '',
                                        selectedMenuItems: [],
                                        addOns: {}
                                    })
                                    setMenuSearchQuery('')
                                }}
                                className="px-6 py-2 border border-red-400 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitOrder}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                            >
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {isOrderDetailsModalOpen && selectedOrder && selectedOrder.orderData && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600 font-medium">FRONT</span>
                                <span className="text-xl font-bold text-gray-800">Order ID: {selectedOrder.id}</span>
                                <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                    {selectedOrder.orderData.order_status}
                                </span>
                            </div>
                            <button
                                onClick={closeOrderDetails}
                                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedOrder.customerName}</h3>
                                <p className="text-gray-600 text-lg">
                                    {selectedOrder.orderData.schedule.schedule_time} - {selectedOrder.orderData.order_type}
                                </p>
                            </div>

                            {/* Date and Time */}
                            <div className="flex justify-between items-center text-gray-500">
                                <span>{selectedOrder.date}</span>
                                <span>{selectedOrder.time}</span>
                            </div>

                            {/* Items Table */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <span className="font-medium text-gray-700">Items</span>
                                    <span className="font-medium text-gray-700 text-center">Qty</span>
                                    <span className="font-medium text-gray-700 text-right">Price</span>
                                </div>

                                <div className="space-y-3">
                                    {selectedOrder.orderData.order_item.map((item: any) => (
                                        <div key={item.order_item_id} className="grid grid-cols-3 gap-4 items-start">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.menu.name}</p>
                                                {item.menu.inclusion && (
                                                    <p className="text-sm text-gray-600">{item.menu.inclusion}</p>
                                                )}
                                            </div>
                                            <div className="text-center font-medium">{item.quantity}</div>
                                            <div className="text-right font-bold">₱ {Number(item.subtotal_price).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">Subtotal</span>
                                    <span className="text-lg font-bold">
                                        ₱ {selectedOrder.orderData.order_item.reduce(
                                            (sum: number, item: any) => sum + Number(item.subtotal_price), 0
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                {selectedOrder.orderData.delivery && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium">Delivery fee</span>
                                        <span className="text-lg font-bold">
                                            ₱ {Number(selectedOrder.orderData.delivery.delivery_fee || 0).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
                                    <span className="text-xl font-bold">Total</span>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {selectedOrder.price}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="h-5 w-5 text-gray-600" />
                                    <span className="font-medium text-gray-700">Payment Method</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-800">{selectedOrder.paymentMethod}</p>
                            </div>

                            {/* Additional Information */}
                            {selectedOrder.orderData.additional_information && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-2">Additional Information</h4>
                                    <p className="text-gray-800">{selectedOrder.orderData.additional_information}</p>
                                </div>
                            )}

                            {/* Delivery Information */}
                            {selectedOrder.orderData.delivery && (
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Truck className="h-5 w-5 text-amber-600" />
                                        <h4 className="font-medium text-gray-800">Delivery Information</h4>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <span className="font-medium">Address:</span>{' '}
                                            {selectedOrder.orderData.delivery.address.address_line}, {selectedOrder.orderData.delivery.address.barangay}, {selectedOrder.orderData.delivery.address.city}, {selectedOrder.orderData.delivery.address.region} {selectedOrder.orderData.delivery.address.postal_code}
                                        </p>
                                        {selectedOrder.orderData.order_status && (
                                            <p><span className="font-medium">Status:</span> {selectedOrder.orderData.order_status}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer with Actions */}
                        {selectedOrder.status === 'pending' && (
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => handleRejectOrder(selectedOrder.id)}
                                    className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                                >
                                    Reject Order
                                </button>
                                <button
                                    onClick={() => {
                                        handleAcceptOrder(selectedOrder.id)
                                        closeOrderDetails()
                                    }}
                                    className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                >
                                    Accept Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reject Order Modal */}
            {isRejectModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Reject Order</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to reject order {selectedOrder.id}?
                            </p>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Return Payment Proof (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-amber-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleReturnPaymentProofUpload}
                                        className="hidden"
                                        id="returnPaymentProof"
                                    />
                                    <label htmlFor="returnPaymentProof" className="cursor-pointer">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            {returnPaymentProof ? returnPaymentProof.name : 'Click to upload payment proof'}
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleRejectCancel}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectDone}
                                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Filter Orders</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">All dates</option>
                                    <option value="today">Today</option>
                                    <option value="week">This week</option>
                                    <option value="month">This month</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                <select
                                    value={filters.paymentMethod}
                                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">All methods</option>
                                    <option value="cash">Cash</option>
                                    <option value="gcash">GCash</option>
                                    <option value="card">Card</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fulfillment Type</label>
                                <select
                                    value={filters.fulfillmentType}
                                    onChange={(e) => handleFilterChange('fulfillmentType', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">All types</option>
                                    <option value="pickup">Pick-up</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <select
                                    value={filters.priceRange}
                                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">All prices</option>
                                    <option value="0-500">₱0 - ₱500</option>
                                    <option value="500-1000">₱500 - ₱1,000</option>
                                    <option value="1000+">₱1,000+</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 border-t border-gray-200">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                            >
                                Clear All
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pb-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg transition-colors ${currentPage === page
                                    ? 'bg-amber-500 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}