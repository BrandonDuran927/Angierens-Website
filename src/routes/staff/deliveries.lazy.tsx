import { createLazyFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
    Search,
    Filter,
    Eye,
    Bell,
    ChevronLeft,
    ChevronRight,
    Clock,
    Menu,
    CreditCard,
    X,
    Calendar,
    Settings,
    User,
    DollarSign,
    Package,
    Truck,
    LogOut,
    Star,
    ChefHat
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'


// Route definition
export const Route = createLazyFileRoute('/staff/deliveries')({
    component: RouteComponent,
})

// Your DeliveryManagement component
function RouteComponent() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('All Assigned Orders')
    const [currentPage, setCurrentPage] = useState(1)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [selectedRider, setSelectedRider] = useState('')
    const [deliveryStatus, setDeliveryStatus] = useState('')
    const ordersPerPage = 10
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [selectedOrderForAssign, setSelectedOrderForAssign] = useState<any>(null)
    const [selectedRiderForModal, setSelectedRiderForModal] = useState<string>('')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [filters, setFilters] = useState({
        dateRange: '',
        assignedRider: '',
        status: '',
        priceRange: '',
        customerName: ''
    })
    const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [showOrderBackView, setShowOrderBackView] = useState(false)
    const [isCancellationModalOpen, setIsCancellationModalOpen] = useState(false)
    const [cancellationDetails, setCancellationDetails] = useState<any>(null)
    const [isRemoveRiderModalOpen, setIsRemoveRiderModalOpen] = useState(false)
    const [isRemovingRider, setIsRemovingRider] = useState(false)

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

    // NEW: State for fetched data from Supabase
    const [deliveryOrders, setDeliveryOrders] = useState<any[]>([])
    const [riders, setRiders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // NEW: Fetch delivery orders from Supabase
    useEffect(() => {
        fetchDeliveryOrders()
        fetchRiders()
    }, [])

    const fetchDeliveryOrders = async () => {
        try {
            setLoading(true)

            // Fetch orders with order_type = 'Delivery' and join with related tables
            const { data, error } = await supabase
                .from('order')
                .select(`
                    *,
                    customer:users!customer_uid(first_name, last_name, phone_number),
                    schedule:schedule(schedule_date, schedule_time),
                    delivery:delivery(
                        delivery_id,
                        delivery_time,
                        delivery_fee,
                        address:address(address_line, city, region),
                        rider:users!rider_id(first_name, last_name)
                    ),
                    payment:payment(*),
                    order_item(
                        *,
                        menu:menu(*),
                        order_item_add_on(
                            *,
                            add_on:add_on(*)
                        )
                    )
                `)
                .eq('order_type', 'Delivery')
                .order('created_at', { ascending: true })

            if (error) throw error

            // Transform the data to match the existing UI structure
            const transformedOrders = data?.map((order: any) => {
                const scheduleDate = order.schedule?.schedule_date
                    ? new Date(order.schedule.schedule_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    : 'TBD'

                return {
                    id: `#${order.order_number}`,
                    orderId: order.order_id,
                    customerName: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
                    assignedRider: order.delivery?.rider ? `${order.delivery.rider.first_name} ${order.delivery.rider.last_name}` : null,
                    assignedDate: scheduleDate,
                    assignedTime: order.schedule?.schedule_time || new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    price: `₱ ${parseFloat(order.total_price).toFixed(2)}`,
                    cancellationRequest: order.failed_delivery_reason ? 'Pending' : 'None',
                    status: order.order_status,
                    address: order.delivery?.address ?
                        `${order.delivery.address.address_line_1 || ''} ${order.delivery.address.address_line_2 || ''}, ${order.delivery.address.city || ''}, ${order.delivery.address.province || ''}`.trim()
                        : 'N/A',
                    deliveryTime: order.delivery?.delivery_time ?
                        new Date(order.delivery.delivery_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' To Be Delivered'
                        : order.schedule?.schedule_time || 'TBD',
                    contact: order.customer?.phone_number || 'N/A',
                    specialInstructions: order.additional_information || 'No special instructions',
                    fulfillmentType: order.order_type,
                    orderType: 'Today', // You can calculate this based on created_at vs current date
                    paymentPercentage: order.payment?.is_paid ? '100' : '0',
                    items: order.order_item?.map((item: any) => ({
                        name: item.menu?.name || 'Unknown Item',
                        addOns: item.order_item_add_on?.map((addon: any) => addon.add_on?.name).join(', ') || '',
                        quantity: item.quantity,
                        price: parseFloat(item.subtotal_price)
                    })) || [],
                    deliveryFee: order.delivery?.delivery_fee ? parseFloat(order.delivery.delivery_fee) : 0,
                    totalAmount: parseFloat(order.total_price),
                    deliveryId: order.delivery_id,
                    cancellationDetails: order.failed_delivery_reason ? {
                        date: new Date(order.status_updated_at).toLocaleDateString('en-US'),
                        time: new Date(order.status_updated_at).toLocaleTimeString('en-US'),
                        requestedBy: order.delivery?.rider ? `${order.delivery.rider.first_name} ${order.delivery.rider.last_name}` : 'Unknown',
                        reason: order.failed_delivery_reason
                    } : null
                }
            }) || []

            setDeliveryOrders(transformedOrders)
        } catch (error) {
            console.error('Error fetching delivery orders:', error)
        } finally {
            setLoading(false)
        }
    }

    // NEW: Fetch available riders from users table
    const fetchRiders = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('user_uid, first_name, last_name')
                .eq('user_role', 'rider') // Assuming 'Rider' is the enum value for riders
                .eq('is_active', true)

            if (error) throw error

            const riderNames = data?.map((rider: any) =>
                `${rider.first_name} ${rider.last_name}`
            ) || []

            setRiders(riderNames)
        } catch (error) {
            console.error('Error fetching riders:', error)
        }
    }

    const statusOptions = ['For Delivery', 'Preparing', 'Queueing', 'Ready', 'Completed']

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

    // Filter orders based on active tab
    const getFilteredOrders = () => {
        let filtered = deliveryOrders

        // Filter by tab
        if (activeTab === 'No Assigned Rider') {
            filtered = filtered.filter((order) => !order.assignedRider || order.assignedRider === '')
        } else if (activeTab === 'Completed') {
            filtered = filtered.filter((order) => order.status === 'Completed')
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (order) =>
                    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by selected rider
        if (selectedRider) {
            filtered = filtered.filter((order) => order.assignedRider === selectedRider)
        }

        // Filter by delivery status
        if (deliveryStatus) {
            filtered = filtered.filter((order) => order.status === deliveryStatus)
        }

        return filtered
    }

    const filteredOrders = getFilteredOrders()
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
    const startIndex = (currentPage - 1) * ordersPerPage
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length)
    const currentOrders = filteredOrders.slice(startIndex, endIndex)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'For Delivery':
                return 'bg-blue-100 text-blue-800'
            case 'Preparing':
                return 'bg-yellow-100 text-yellow-800'
            case 'Queueing':
                return 'bg-orange-100 text-orange-800'
            case 'Ready':
                return 'bg-green-100 text-green-800'
            case 'Completed':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const openOrderDetails = (order: any) => {
        setSelectedOrder(order)
        setIsOrderDetailsModalOpen(true)
    }

    const closeOrderDetails = () => {
        setIsOrderDetailsModalOpen(false)
        setSelectedOrder(null)
        setShowOrderBackView(false)
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

    // NEW: Update assignRiderToOrder to save to Supabase
    const assignRiderToOrder = async (riderName: string, orderId: string) => {
        try {
            // Find the rider's user_uid from the riderName
            const { data: riderData, error: riderError } = await supabase
                .from('users')
                .select('user_uid')
                .eq('user_role', 'rider')
                .ilike('first_name', riderName.split(' ')[0])
                .ilike('last_name', riderName.split(' ')[1])
                .single()

            if (riderError) throw riderError

            // Find the order to get its delivery_id
            const order = deliveryOrders.find(o => o.id === orderId)

            if (!order?.deliveryId) {
                // If no delivery record exists, create one first
                const { data: addressData } = await supabase
                    .from('address')
                    .select('address_id')
                    .limit(1)
                    .single()

                const { data: newDelivery, error: deliveryCreateError } = await supabase
                    .from('delivery')
                    .insert({
                        rider_id: riderData.user_uid,
                        address_id: addressData?.address_id,
                        delivery_fee: 20
                    })
                    .select()
                    .single()

                if (deliveryCreateError) throw deliveryCreateError

                // Update order with new delivery_id
                const { error: orderUpdateError } = await supabase
                    .from('order')
                    .update({
                        delivery_id: newDelivery.delivery_id,
                        order_status: 'On Delivery',
                    })
                    .eq('order_id', order.orderId)

                if (orderUpdateError) throw orderUpdateError
            } else {
                // Update existing delivery record with rider_id
                const { error: updateError } = await supabase
                    .from('delivery')
                    .update({ rider_id: riderData.user_uid })
                    .eq('delivery_id', order.deliveryId)

                if (updateError) throw updateError
            }

            // Refresh the orders list
            await fetchDeliveryOrders()

            // Close modal
            setIsAssignModalOpen(false)
            setSelectedOrderForAssign(null)
            setSelectedRiderForModal('')

            showAlert('Rider assigned successfully!', 'success')
        } catch (error) {
            console.error('Error assigning rider:', error)
            showAlert('Failed to assign rider. Please try again.', 'error')
        }
    }

    // Remove rider from delivery
    const removeRiderFromDelivery = async () => {
        if (!selectedOrder?.deliveryId) {
            showAlert('No delivery record found for this order.', 'error')
            return
        }

        // Check if order status allows rider removal
        // Only allow removal before delivery starts (before "On Delivery" or "Claim Order")
        const allowedStatuses = ['Pending', 'Queueing', 'Preparing', 'Cooking', 'Ready']

        if (!allowedStatuses.includes(selectedOrder.status)) {
            showAlert(`Cannot remove rider. Order status is "${selectedOrder.status}". Riders can only be removed from orders with status: Pending, Queueing, Preparing, Cooking, or Ready.`, 'warning')
            setIsRemoveRiderModalOpen(false)
            return
        }

        try {
            setIsRemovingRider(true)

            // Verify current status from database before proceeding
            const { data: orderData, error: verifyError } = await supabase
                .from('order')
                .select('order_status')
                .eq('order_id', selectedOrder.orderId)
                .single()

            if (verifyError) throw verifyError

            // Double-check status hasn't changed - only proceed if status is still allowed
            if (!allowedStatuses.includes(orderData.order_status)) {
                showAlert(`Cannot remove rider. Order status has changed to "${orderData.order_status}".`, 'warning')
                await fetchDeliveryOrders() // Refresh to show current status
                setIsRemoveRiderModalOpen(false)
                setIsOrderDetailsModalOpen(false)
                return
            }

            // Update the delivery record to set rider_id to null
            const { error: updateError } = await supabase
                .from('delivery')
                .update({
                    rider_id: null,
                    status_updated_at: new Date().toISOString()
                })
                .eq('delivery_id', selectedOrder.deliveryId)

            if (updateError) throw updateError

            // Refresh the orders list
            await fetchDeliveryOrders()

            // Close modals
            setIsRemoveRiderModalOpen(false)
            setIsOrderDetailsModalOpen(false)
            setSelectedOrder(null)

            showAlert('Rider removed successfully!', 'success')
        } catch (error) {
            console.error('Error removing rider:', error)
            showAlert('Failed to remove rider. Please try again.', 'error')
        } finally {
            setIsRemovingRider(false)
        }
    }

    const getRiderCurrentOrders = (riderName: string) => {
        return deliveryOrders.filter(order => order.assignedRider === riderName)
    }

    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            dateRange: '',
            assignedRider: '',
            status: '',
            priceRange: '',
            customerName: ''
        })
    }

    const applyFilters = () => {
        // Apply the filters to your data
        console.log('Applying filters:', filters)
        setIsFilterOpen(false)
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleCancellationRequest = (order: any) => {
        setCancellationDetails(order.cancellationDetails)
        setIsCancellationModalOpen(true)
    }

    const approveCancellation = async () => {
        try {
            if (!selectedOrder) return

            const { error } = await supabase
                .from('order')
                .update({
                    order_status: 'Cancelled',
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', selectedOrder.orderId)

            if (error) throw error

            await fetchDeliveryOrders()
            setIsCancellationModalOpen(false)
            setCancellationDetails(null)
            closeOrderDetails()
            showAlert('Cancellation approved successfully!', 'success')
        } catch (error) {
            console.error('Error approving cancellation:', error)
            showAlert('Failed to approve cancellation. Please try again.', 'error')
        }
    }

    const rejectCancellation = async () => {
        try {
            if (!selectedOrder) return

            const { error } = await supabase
                .from('order')
                .update({
                    failed_delivery_reason: null,
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', selectedOrder.orderId)

            if (error) throw error

            await fetchDeliveryOrders()
            setIsCancellationModalOpen(false)
            setCancellationDetails(null)
            showAlert('Cancellation rejected successfully!', 'success')
        } catch (error) {
            console.error('Error rejecting cancellation:', error)
            showAlert('Failed to reject cancellation. Please try again.', 'error')
        }
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

    const { user, signOut } = useUser()

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }


    return (
        <ProtectedRoute allowedRoles={['staff']}>

            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">

                {/* Rest of your existing UI code remains exactly the same */}
                {/* Sidebar, Header, Main Content, Modals - all unchanged */}

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
                        <button
                            className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors cursor-pointer"
                            onClick={handleLogout}
                        >
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

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Bar */}
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
                                    <h1 className="text-xl lg:text-3xl font-bold">DELIVERIES</h1>
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
                    <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto overflow-x-hidden">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-0 overflow-hidden">
                            {/* Table Header */}
                            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                                <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                                    <div className="w-full">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <input
                                                type="text"
                                                placeholder="Search order by ID..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-amber-500 
                       w-full text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    {['All Assigned Orders', 'No Assigned Rider', 'Completed'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors 
                      whitespace-nowrap text-xs sm:text-sm
                      ${activeTab === tab
                                                    ? 'bg-yellow-400 text-amber-800'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scrollable Table */}
                            <div className="w-full overflow-x-auto">
                                <table className="min-w-[800px] w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Rider</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Time</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancellation Request</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    {loading ? (
                                        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                                            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                                <p className="text-gray-700 font-medium">Processing...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {currentOrders.map((order) => {
                                                    // Check if order can have a rider assigned
                                                    const canAssignRider = !['Cancelled', 'Refunding', 'Rejected', 'Refund', 'Completed'].includes(order.status);

                                                    return (
                                                        <tr key={order.id} className="hover:bg-gray-50">
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">{order.id}</td>
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {order.assignedRider ? (
                                                                    order.assignedRider
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-gray-500">N/A</span>
                                                                        {canAssignRider && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelectedOrderForAssign(order)
                                                                                    setIsAssignModalOpen(true)
                                                                                }}
                                                                                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                                                                            >
                                                                                + Rider
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            {/* Copy paste the remaining <td> elements from old code */}
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">{order.assignedDate}</td>
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">{order.assignedTime}</td>
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap font-semibold">{order.price}</td>
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">{order.cancellationRequest}</td>
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap">
                                                                <button
                                                                    onClick={() => openOrderDetails(order)}
                                                                    className="text-gray-600 hover:text-gray-800 transition-colors"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </>
                                    )}
                                </table>
                            </div>
                        </div>
                        {/* Copy and paste all the modals from old code: Rider Assignment Modal, Filter Modal, Order Details Modal, Cancellation Request Modal, Order Back View Modal - they remain exactly the same */}

                        {/* Rider Assignment Modal */}
                        {isAssignModalOpen && selectedOrderForAssign && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Select Rider For Order {selectedOrderForAssign.id}
                                        </h2>
                                        <button
                                            onClick={() => {
                                                setIsAssignModalOpen(false)
                                                setSelectedOrderForAssign(null)
                                            }}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left side - Rider Selection */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Available Riders</h3>
                                            <div className="space-y-3">
                                                {riders.map((rider) => {
                                                    const currentOrders = getRiderCurrentOrders(rider)
                                                    const isOnDelivery = currentOrders.some(order => order.status === 'For Delivery')

                                                    return (
                                                        <div
                                                            key={rider}
                                                            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => setSelectedRiderForModal(rider)}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <h4 className="font-medium text-gray-800">{rider}</h4>
                                                                    <p className="text-sm text-gray-600">
                                                                        Current Status: {isOnDelivery ? 'On Delivery' : 'Available'}
                                                                    </p>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {currentOrders.length} orders
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Right side - Selected Rider's Orders */}
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">
                                                {selectedRiderForModal ? `${selectedRiderForModal}'s Assigned Orders` : 'Select a rider to view orders'}
                                            </h3>

                                            {selectedRiderForModal && (
                                                <div>
                                                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                                                        <p className="text-sm">
                                                            <span className="font-medium">Current Status:</span>
                                                            {getRiderCurrentOrders(selectedRiderForModal).some(order => order.status === 'For Delivery')
                                                                ? ' On Delivery (order #' + getRiderCurrentOrders(selectedRiderForModal).find(order => order.status === 'For Delivery')?.id + ')'
                                                                : ' Available'
                                                            }
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        <div className="text-sm font-medium text-gray-700 grid grid-cols-4 gap-2 pb-2 border-b">
                                                            <span>Order ID</span>
                                                            <span>Customer</span>
                                                            <span>Date</span>
                                                            <span>Status</span>
                                                        </div>

                                                        {getRiderCurrentOrders(selectedRiderForModal).map((order) => (
                                                            <div key={order.id} className="text-sm grid grid-cols-4 gap-2 py-2 border-b border-gray-100">
                                                                <span className="font-medium">{order.id}</span>
                                                                <span>{order.customerName}</span>
                                                                <span>{order.assignedDate}</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        ))}

                                                        {getRiderCurrentOrders(selectedRiderForModal).length === 0 && (
                                                            <p className="text-gray-500 text-sm italic py-4">No assigned orders</p>
                                                        )}
                                                    </div>

                                                    <div className="mt-6">
                                                        <button
                                                            onClick={() => assignRiderToOrder(selectedRiderForModal, selectedOrderForAssign.id)}
                                                            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                                                        >
                                                            Assign Order {selectedOrderForAssign.id}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Filter Modal */}
                        {isFilterOpen && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                            <Filter className="h-6 w-6 text-amber-600" />
                                            Filter Orders
                                        </h2>
                                        <button
                                            onClick={() => setIsFilterOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Date Range Filter */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Calendar className="h-4 w-4 text-amber-600" />
                                                Date Range
                                            </label>
                                            <select
                                                value={filters.dateRange}
                                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            >
                                                <option value="">All Dates</option>
                                                <option value="today">Today</option>
                                                <option value="yesterday">Yesterday</option>
                                                <option value="last7days">Last 7 Days</option>
                                                <option value="last30days">Last 30 Days</option>
                                                <option value="thisMonth">This Month</option>
                                                <option value="lastMonth">Last Month</option>
                                            </select>
                                        </div>

                                        {/* Assigned Rider Filter */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Truck className="h-4 w-4 text-amber-600" />
                                                Assigned Rider
                                            </label>
                                            <select
                                                value={filters.assignedRider}
                                                onChange={(e) => handleFilterChange('assignedRider', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            >
                                                <option value="">All Riders</option>
                                                <option value="unassigned">Unassigned</option>
                                                {riders.map((rider) => (
                                                    <option key={rider} value={rider}>
                                                        {rider}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Delivery Status Filter */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Clock className="h-4 w-4 text-amber-600" />
                                                Delivery Status
                                            </label>
                                            <select
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            >
                                                <option value="">All Statuses</option>
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Price Range Filter */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <DollarSign className="h-4 w-4 text-amber-600" />
                                                Price Range
                                            </label>
                                            <select
                                                value={filters.priceRange}
                                                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            >
                                                <option value="">All Price Ranges</option>
                                                <option value="0-500">₱0 - ₱500</option>
                                                <option value="501-1000">₱501 - ₱1,000</option>
                                                <option value="1001-2000">₱1,001 - ₱2,000</option>
                                                <option value="2001-5000">₱2,001 - ₱5,000</option>
                                                <option value="5000+">₱5,000+</option>
                                            </select>
                                        </div>

                                        {/* Customer Name Filter */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <Search className="h-4 w-4 text-amber-600" />
                                                Customer Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter customer name..."
                                                value={filters.customerName || ''}
                                                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={clearFilters}
                                            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                                        >
                                            Clear All Filters
                                        </button>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsFilterOpen(false)}
                                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={applyFilters}
                                                className="px-6 py-3 bg-yellow-400 text-amber-800 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center gap-2"
                                            >
                                                <Filter className="h-4 w-4" />
                                                Apply Filters
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Order Details Modal */}
                        {isOrderDetailsModalOpen && selectedOrder && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-600 font-medium">FRONT</span>
                                            <span className="text-xl font-bold text-gray-800">Order ID: {selectedOrder.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
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
                                            <p className="text-gray-600 text-lg">{selectedOrder.deliveryTime || '2PM To Be Delivered'}</p>
                                            {selectedOrder.assignedRider && (
                                                <p className="text-amber-600 font-medium mt-1">
                                                    Assigned to: {selectedOrder.assignedRider}
                                                </p>
                                            )}
                                        </div>

                                        {/* Date and Time */}
                                        <div className="flex justify-between items-center text-gray-500">
                                            <span>{selectedOrder.assignedDate}</span>
                                            <span>{selectedOrder.assignedTime}</span>
                                        </div>

                                        {/* Items Table */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <span className="font-medium text-gray-700">Items</span>
                                                <span className="font-medium text-gray-700 text-center">Qty</span>
                                                <span className="font-medium text-gray-700 text-right">Price</span>
                                            </div>

                                            <div className="space-y-3">
                                                {selectedOrder.items ? selectedOrder.items.map((item: any, index: number) => (
                                                    <div key={index} className="grid grid-cols-3 gap-4 items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{item.name}</p>
                                                            {item.addOns && (
                                                                <p className="text-sm text-gray-600">add-ons: {item.addOns}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-center font-medium">{item.quantity}</div>
                                                        <div className="text-right font-bold">₱ {item.price.toFixed(2)}</div>
                                                    </div>
                                                )) : (
                                                    <div className="grid grid-cols-3 gap-4 items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-800">Order items</p>
                                                            <p className="text-sm text-gray-600">Details not available</p>
                                                        </div>
                                                        <div className="text-center font-medium">1</div>
                                                        <div className="text-right font-bold">{selectedOrder.price}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pricing Summary */}
                                        <div className="border-t border-gray-200 pt-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-medium">Price</span>
                                                <span className="text-lg font-bold">{selectedOrder.price}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-medium">Delivery fee</span>
                                                <span className="text-lg font-bold">₱ {(selectedOrder.deliveryFee.toFixed(2))}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-3">
                                                <span>Total Amount</span>
                                                <span>₱ {(selectedOrder.totalAmount + (selectedOrder.deliveryFee)).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => {
                                                setIsOrderDetailsModalOpen(false)
                                                setShowOrderBackView(true)
                                            }}
                                            className="px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            See more
                                        </button>
                                        <div className="flex items-center gap-3">
                                            {selectedOrder.assignedRider &&
                                                ['Pending', 'Queueing', 'Preparing', 'Cooking', 'Ready'].includes(selectedOrder.status) && (
                                                    <button
                                                        onClick={() => setIsRemoveRiderModalOpen(true)}
                                                        className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                                    >
                                                        Remove Rider
                                                    </button>
                                                )}
                                            {selectedOrder.cancellationRequest === 'Pending' && selectedOrder.cancellationDetails && (
                                                <button
                                                    onClick={() => handleCancellationRequest(selectedOrder)}
                                                    className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                                >
                                                    Cancellation Request
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancellation Request Modal */}
                        {isCancellationModalOpen && cancellationDetails && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">Cancellation Request</h2>
                                        </div>
                                        <button
                                            onClick={() => setIsCancellationModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Request Details */}
                                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">!</span>
                                                </div>
                                                <span className="font-semibold text-orange-800">Rider Cancellation Request</span>
                                            </div>
                                            <p className="text-orange-700 text-sm">
                                                This order has a pending cancellation request from the assigned rider.
                                            </p>
                                        </div>

                                        {/* Date and Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Request Date</label>
                                                <div className="p-3 bg-gray-100 rounded-lg border">
                                                    <span className="text-gray-800">{cancellationDetails.date}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Request Time</label>
                                                <div className="p-3 bg-gray-100 rounded-lg border">
                                                    <span className="text-gray-800">{cancellationDetails.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requested By */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Requested By</label>
                                            <div className="p-3 bg-gray-100 rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-bold">
                                                            {cancellationDetails.requestedBy?.charAt(0) || 'R'}
                                                        </span>
                                                    </div>
                                                    <span className="text-gray-800 font-medium">{cancellationDetails.requestedBy}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Cancellation</label>
                                            <div className="p-4 bg-gray-100 rounded-lg border min-h-[100px]">
                                                <p className="text-gray-800 leading-relaxed">{cancellationDetails.reason}</p>
                                            </div>
                                        </div>

                                        {/* Warning */}
                                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-white text-xs font-bold">!</span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-red-800 mb-1">Important Decision Required</p>
                                                    <p className="text-red-700 text-sm">
                                                        Please review the cancellation reason carefully. Approving will remove this order from the delivery queue.
                                                        Rejecting will require the rider to continue with the delivery.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => setIsCancellationModalOpen(false)}
                                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            Review Later
                                        </button>
                                        <button
                                            onClick={rejectCancellation}
                                            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                        >
                                            Reject Request
                                        </button>
                                        <button
                                            onClick={approveCancellation}
                                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                        >
                                            Approve Cancellation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Back View Modal */}
                        {showOrderBackView && selectedOrder && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => {
                                                    setShowOrderBackView(false)
                                                    setIsOrderDetailsModalOpen(true)
                                                }}
                                                className="text-gray-600 hover:text-gray-800 font-medium"
                                            >
                                                ← BACK
                                            </button>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowOrderBackView(false)
                                                closeOrderDetails()
                                            }}
                                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Delivery Address */}
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Delivery Address:</h4>
                                            <p className="text-gray-600">{selectedOrder.address}</p>
                                        </div>

                                        {/* Assigned Rider */}
                                        {selectedOrder.assignedRider && (
                                            <div className="flex">
                                                <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Assigned Rider:</h4>
                                                <p className="text-gray-600">{selectedOrder.assignedRider}</p>
                                            </div>
                                        )}

                                        {/* Customer Contact */}
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Customer Contact #:</h4>
                                            <p className="text-gray-600">{selectedOrder.contact || '+63 123 123 1234'}</p>
                                        </div>

                                        {/* Special Instructions */}
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Special Instructions:</h4>
                                            <p className="text-gray-600">{selectedOrder.specialInstructions || 'No special instructions'}</p>
                                        </div>

                                        {/* Fulfillment Type */}
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Fulfillment Type:</h4>
                                            <p className="text-gray-600">{selectedOrder.fulfillmentType || 'Delivery'}</p>
                                        </div>

                                        {/* Order Type */}
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Order Type:</h4>
                                            <p className="text-gray-600">{selectedOrder.orderType || 'Today'}</p>
                                        </div>

                                        {/* Payment Percentage */}
                                        <div className="flex">
                                            <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Payment %:</h4>
                                            <p className="text-gray-600">{selectedOrder.paymentPercentage || '100'}%</p>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => {
                                                setShowOrderBackView(false)
                                                setIsOrderDetailsModalOpen(true)
                                            }}
                                            className="px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            Go back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Remove Rider Confirmation Modal */}
                        {isRemoveRiderModalOpen && selectedOrder && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                <Truck className="h-5 w-5 text-red-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">Remove Rider</h2>
                                        </div>
                                        <button
                                            onClick={() => setIsRemoveRiderModalOpen(false)}
                                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-4">
                                        <p className="text-gray-700">
                                            Are you sure you want to remove <span className="font-semibold">{selectedOrder.assignedRider}</span> from order <span className="font-semibold">{selectedOrder.id}</span>?
                                        </p>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-yellow-800 text-sm">
                                                This action will unassign the rider from this delivery. You can assign a new rider afterwards.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => setIsRemoveRiderModalOpen(false)}
                                            disabled={isRemovingRider}
                                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={removeRiderFromDelivery}
                                            disabled={isRemovingRider}
                                            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isRemovingRider ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Removing...
                                                </>
                                            ) : (
                                                'Remove Rider'
                                            )}
                                        </button>
                                    </div>
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
                    </main>
                </div>
            </div >
        </ProtectedRoute>
    )
}