import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Bell,
    Star,
    Heart,
    MessageSquare,
    Eye,
    Menu,
    X,
    Calendar,
    Settings,
    User,
    DollarSign,
    Package,
    Truck,
    LogOut,
    Search,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'

interface Notification {
    id: string
    type: 'order' | 'feedback'
    title: string
    time: string
    icon: 'heart' | 'message' | 'star'
    read: boolean
}

interface OrderItem {
    name: string
    quantity: number
    completed: boolean
    order_item_id?: string
    order_item_add_on_id?: string
    isAddOn?: boolean
}

interface Product {
    name: string
    items: OrderItem[]
    menu_id: string
}

interface Order {
    id: string
    orderNumber: string
    customerName: string
    deliveryTime: string
    status: 'Queueing' | 'Preparing' | 'Cooking' | 'Ready'
    date: string
    time: string
    products: Product[]
    totalAmount: number
    phoneNumber?: string
    deliveryOption?: string
    paymentMethod?: string
    deliveryAddress?: string
    specialInstructions?: string
}

export const Route = createLazyFileRoute('/chef-interface/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [activeOrderTab, setActiveOrderTab] = useState<'New Orders' | 'In Process' | 'Completed'>('New Orders')
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const navigate = useNavigate()

    const { user, signOut } = useUser()

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }



    // Fetch orders from Supabase
    const fetchOrders = async () => {
        try {
            setLoading(true)

            // Fetch orders with related data
            const { data: ordersData, error: ordersError } = await supabase
                .from('order')
                .select(`
                    *,
                    users!order_customer_uid_fkey(first_name, last_name, phone_number),
                    schedule(schedule_date, schedule_time),
                    delivery(
                        address(
                            *
                        )
                    ),
                    payment(payment_method),
                    order_item(
                        *,
                        menu(name),
                        order_item_add_on(
                            *,
                            add_on(name)
                        )
                    )
                `)
                .in('order_status', ['Queueing', 'Preparing', 'Cooking', 'Ready'])
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError

            // Transform data to match UI structure
            const transformedOrders: Order[] = ordersData?.map(order => {
                // Group items by menu
                const productMap = new Map<string, Product>()

                order.order_item?.forEach((item: any) => {
                    const menuId = item.menu_id
                    const menuName = item.menu?.name || 'Unknown Item'

                    if (!productMap.has(menuId)) {
                        productMap.set(menuId, {
                            name: menuName,
                            items: [],
                            menu_id: menuId
                        })
                    }

                    const product = productMap.get(menuId)!

                    // Add main item
                    product.items.push({
                        name: menuName,
                        quantity: Number(item.quantity),
                        completed: item.is_completed || false,
                        order_item_id: item.order_item_id,
                        isAddOn: false
                    })

                    // Add add-ons
                    item.order_item_add_on?.forEach((addOn: any) => {
                        product.items.push({
                            name: addOn.add_on?.name || 'Unknown Add-on',
                            quantity: Number(addOn.quantity),
                            completed: addOn.is_completed || false,
                            order_item_add_on_id: addOn.order_item_add_on_id,
                            isAddOn: true
                        })
                    })
                })

                const scheduleDate = order.schedule?.schedule_date
                    ? new Date(order.schedule.schedule_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    : 'TBD'

                const scheduleTime = order.schedule?.schedule_time || 'TBD'
                const orderTime = new Date(order.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })

                return {
                    id: order.order_id,
                    orderNumber: `#${String(order.order_number).padStart(2, '0')}`,
                    customerName: order.users?.first_name + ' ' + order.users?.last_name || 'Unknown Customer',
                    deliveryTime: scheduleTime,
                    status: order.order_status as any,
                    date: scheduleDate,
                    time: orderTime,
                    products: Array.from(productMap.values()),
                    totalAmount: Number(order.total_price),
                    phoneNumber: order.users?.phone_number,
                    deliveryOption: order.order_type,
                    paymentMethod: order.payment?.payment_method,
                    deliveryAddress: order.delivery?.delivery_address,
                    specialInstructions: order.additional_information
                }
            }) || []

            console.log('Fetched orders:', transformedOrders)

            setOrders(transformedOrders)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()

        // Set up real-time subscription
        const subscription = supabase
            .channel('order_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'order'
                },
                (payload) => {
                    console.log('Order change detected:', payload)
                    fetchOrders()
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const toggleExpandOrder = (orderId: string) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
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
            route: '/chef-interface',
            icon: <Package className="h-5 w-5" />,
            active: location.pathname === '/chef-interface'
        },
        {
            name: 'Account',
            route: '/chef-interface/my-info',
            icon: <User className="h-5 w-5" />,
            active: location.pathname === '/chef-interface/my-info'
        },
    ]

    const notificationCount = notifications.filter(n => !n.read).length

    const toggleItemCompletion = async (orderId: string, productIndex: number, itemIndex: number) => {
        const order = orders.find(o => o.id === orderId)
        if (!order) return

        const item = order.products[productIndex].items[itemIndex]

        // Only allow checking if order status is 'Cooking'
        if (order.status !== 'Cooking') {
            alert('You can only check items when the order status is "Cooking"')
            return
        }

        try {
            const newCompletedState = !item.completed

            if (item.isAddOn && item.order_item_add_on_id) {
                // Update add-on
                const { error } = await supabase
                    .from('order_item_add_on')
                    .update({ is_completed: newCompletedState })
                    .eq('order_item_add_on_id', item.order_item_add_on_id)

                if (error) throw error
            } else if (item.order_item_id) {
                // Update order item
                const { error } = await supabase
                    .from('order_item')
                    .update({ is_completed: newCompletedState })
                    .eq('order_item_id', item.order_item_id)

                if (error) throw error
            }

            // Update local state
            setOrders(prev => prev.map(o => {
                if (o.id === orderId) {
                    const updatedProducts = [...o.products]
                    updatedProducts[productIndex].items[itemIndex].completed = newCompletedState
                    return { ...o, products: updatedProducts }
                }
                return o
            }))
        } catch (error) {
            console.error('Error updating item completion:', error)
            alert('Failed to update item. Please try again.')
        }
    }

    const updateOrderStatus = async (newStatus: 'Preparing' | 'Cooking' | 'Ready') => {
        if (!selectedOrder) return

        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: newStatus,
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', selectedOrder.id)

            if (error) throw error

            // Update local state
            setOrders(prev => prev.map(order =>
                order.id === selectedOrder.id
                    ? { ...order, status: newStatus }
                    : order
            ))

            setIsStatusModalOpen(false)
            setSelectedOrder(null)
        } catch (error) {
            console.error('Error updating order status:', error)
            alert('Failed to update order status. Please try again.')
        }
    }

    const getActiveOrders = () => {
        let filtered = orders.filter(order => {
            if (activeOrderTab === 'New Orders') return order.status === 'Queueing'
            if (activeOrderTab === 'In Process') return ['Preparing', 'Cooking'].includes(order.status)
            if (activeOrderTab === 'Completed') return order.status === 'Ready'
            return false
        })

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(order =>
                order.customerName.toLowerCase().includes(query) ||
                order.orderNumber.toLowerCase().includes(query)
            )
        }

        return filtered
    }

    const activeOrders = getActiveOrders()

    const LoadingSpinner = () => (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                <p className="text-gray-700 font-medium">Processing...</p>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">
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
                                className="p-2 hover:bg-amber-700 rounded-lg"
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

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className="flex-1 flex flex-col w-full">
                    {/* Header */}
                    <header className="bg-amber-800 text-white p-3 md:p-4 shadow-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 md:gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 text-white hover:bg-amber-700 rounded-lg"
                                >
                                    <Menu className="h-5 w-5 md:h-6 md:w-6" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg md:text-xl lg:text-3xl font-bold">ORDERS</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                                <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Date: {getCurrentDate()}</span>
                                <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Time: {getCurrentTime()}</span>
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                            className="relative p-1.5 md:p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                                        >
                                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                                            {notificationCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
                                                    {notificationCount}
                                                </span>
                                            )}
                                        </button>
                                        {isNotificationOpen && (
                                            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                <div className="p-4 border-b border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                                                </div>

                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-4 text-center text-gray-500">
                                                            No notifications
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification, index) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
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
                                                        ))
                                                    )}
                                                </div>

                                                {notifications.length > 0 && (
                                                    <div className="p-4 border-t border-gray-200">
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Bell className="h-4 w-4" />
                                                            Mark all as read
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 p-3 md:p-4 lg:p-6">
                        {/* Tab Navigation */}
                        <div className="mb-4 md:mb-6">
                            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                                <button
                                    onClick={() => setActiveOrderTab('New Orders')}
                                    className={`px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base ${activeOrderTab === 'New Orders'
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    New Orders
                                </button>
                                <button
                                    onClick={() => setActiveOrderTab('In Process')}
                                    className={`px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base ${activeOrderTab === 'In Process'
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    In Process
                                </button>
                                <button
                                    onClick={() => setActiveOrderTab('Completed')}
                                    className={`px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base ${activeOrderTab === 'Completed'
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    Completed
                                </button>

                                <div className="w-full md:w-auto md:ml-auto flex items-center mt-2 md:mt-0">
                                    <div className="relative w-full md:w-auto">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
                                        <input
                                            type="text"
                                            placeholder="Type here.."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full md:w-auto pl-9 md:pl-10 pr-4 py-2 md:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm md:text-base"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Header */}
                        <div className="bg-yellow-400 rounded-t-lg p-3 md:p-4 flex justify-between items-center">
                            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-black">
                                {activeOrderTab === 'New Orders' ? 'New Orders Today' :
                                    activeOrderTab === 'In Process' ? 'Orders In Process' :
                                        'Completed Orders'}
                            </h2>
                            <span className="text-lg md:text-xl lg:text-2xl font-bold text-black">{activeOrders.length} Orders</span>
                        </div>

                        {/* Orders Container */}
                        <div className="bg-white rounded-b-lg p-3 md:p-4 lg:p-6 shadow-sm">
                            {activeOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">No orders found</p>
                                </div>
                            ) : (
                                <div className="md:overflow-x-auto">
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:pb-4">
                                        {activeOrders.map((order) => {
                                            const isExpanded = expandedOrderId === order.id

                                            return (
                                                <div
                                                    key={order.id}
                                                    className="bg-white rounded-lg shadow-lg border-4 border-yellow-400 w-full md:flex-shrink-0 md:w-96"
                                                >
                                                    {/* Order Header */}
                                                    <div className="p-3 md:p-4 border-b border-gray-200">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="text-base md:text-lg font-bold text-black">{order.customerName}</h3>
                                                                <p className="text-xs md:text-sm text-gray-600">{order.deliveryTime}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-base md:text-lg font-bold text-gray-500">{order.orderNumber}</span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedOrder(order)
                                                                            setIsStatusModalOpen(true)
                                                                        }}
                                                                        className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs md:text-sm font-medium hover:bg-orange-200"
                                                                    >
                                                                        {order.status}
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            className="h-3 w-3 md:h-4 md:w-4"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={2}
                                                                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
                                                            <span>{order.date}</span>
                                                            <span>{order.time}</span>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {isExpanded ? (
                                                        <div className="p-3 md:p-4 space-y-2 md:space-y-3 text-xs md:text-sm text-gray-700">
                                                            <p><span className="font-semibold">Customer Name:</span> {order.customerName}</p>
                                                            <p><span className="font-semibold">Order ID:</span> {order.orderNumber}</p>
                                                            <p><span className="font-semibold">Delivery date and time:</span> {order.date} {order.deliveryTime}</p>
                                                            <p><span className="font-semibold">Current status:</span> {order.status}</p>
                                                            <p><span className="font-semibold">Order Placed:</span> {order.date} {order.time}</p>
                                                            {order.phoneNumber && <p><span className="font-semibold">Phone Number:</span> {order.phoneNumber}</p>}
                                                            {order.deliveryOption && <p><span className="font-semibold">Delivery Option:</span> {order.deliveryOption}</p>}
                                                            {order.paymentMethod && <p><span className="font-semibold">Payment Method:</span> {order.paymentMethod}</p>}
                                                            {order.deliveryAddress && <p><span className="font-semibold">Delivery Address:</span> {order.deliveryAddress}</p>}
                                                            {order.specialInstructions && <p><span className="font-semibold">Special Instructions:</span> {order.specialInstructions}</p>}
                                                            <button
                                                                onClick={() => toggleExpandOrder(order.id)}
                                                                className="px-3 md:px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-xs md:text-sm mt-3 md:mt-4"
                                                            >
                                                                Back
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Compact View */}
                                                            <div className="p-3 md:p-4 max-h-80 overflow-y-auto">
                                                                {order.products.map((product, productIndex) => (
                                                                    <div key={productIndex} className="mb-4 md:mb-6 last:mb-4">
                                                                        <h4 className="font-bold text-sm md:text-base text-black mb-2 md:mb-3">{product.name}</h4>
                                                                        <div className="space-y-2">
                                                                            {product.items.map((item, itemIndex) => (
                                                                                <div key={itemIndex} className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2 md:gap-3">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={item.completed}
                                                                                            onChange={() =>
                                                                                                toggleItemCompletion(order.id, productIndex, itemIndex)
                                                                                            }
                                                                                            disabled={order.status !== 'Cooking'}
                                                                                            className={`w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2 ${order.status !== 'Cooking' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                                                                }`}
                                                                                        />
                                                                                        <span
                                                                                            className={`text-xs md:text-sm ${item.completed ? 'line-through text-gray-500' : 'text-black'
                                                                                                }`}
                                                                                        >
                                                                                            {item.name}
                                                                                        </span>
                                                                                    </div>
                                                                                    <span
                                                                                        className={`text-xs md:text-sm font-medium ${item.completed ? 'line-through text-gray-500' : 'text-black'
                                                                                            }`}
                                                                                    >
                                                                                        {item.quantity} pcs.
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Footer */}
                                                            <div className="p-3 md:p-4 border-t border-gray-200 flex justify-between items-center">
                                                                <div>
                                                                    <p className="text-xs md:text-sm text-gray-600">Total Amount</p>
                                                                    <p className="text-lg md:text-xl font-bold text-black">
                                                                        ₱ {order.totalAmount.toLocaleString()}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={() => toggleExpandOrder(order.id)}
                                                                    className="px-3 md:px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-50 font-medium text-xs md:text-sm"
                                                                >
                                                                    See More
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status Update Modal */}
                        {isStatusModalOpen && selectedOrder && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 w-full max-w-sm">
                                    {/* Header */}
                                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                                        Update Status
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mb-4 md:mb-6">
                                        Choose the new status for order <span className="font-semibold">{selectedOrder.orderNumber}</span>.
                                    </p>

                                    {/* Status Options */}
                                    <div className="space-y-2 md:space-y-3">
                                        {(['Preparing', 'Cooking', 'Ready'] as const).map((status) => {
                                            const colors: Record<typeof status, string> = {
                                                Preparing: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                                                Cooking: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                                                Ready: 'bg-green-100 text-green-700 hover:bg-green-200',
                                            };

                                            const icons: Record<typeof status, React.ReactNode> = {
                                                Preparing: (
                                                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" strokeWidth="2"
                                                        viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M12 8v4l3 3" />
                                                    </svg>
                                                ),
                                                Cooking: (
                                                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" strokeWidth="2"
                                                        viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M12 6v6h4" />
                                                    </svg>
                                                ),
                                                Ready: (
                                                    <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" strokeWidth="2"
                                                        viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ),
                                            };

                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateOrderStatus(status)}
                                                    className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition text-sm md:text-base ${colors[status]}`}
                                                >
                                                    {icons[status]}
                                                    {status}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-4 md:mt-6 flex justify-end">
                                        <button
                                            onClick={() => setIsStatusModalOpen(false)}
                                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm md:text-base"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
                {loading && <LoadingSpinner />}

            </div>
        </ProtectedRoute>
    )
}