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
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createLazyFileRoute('/staff/')({
    component: RouteComponent,
})

type UserProfile = {
    user_uid: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    user_role: string;
    is_active: boolean;
    email: string;
};


interface OrderDisplay {
    id: string
    customerName: string
    scheduledDate: string
    scheduledTime: string
    date: string
    time: string
    price: string
    fulfillmentType: string
    paymentMethod: string
    order_status: string
    statusUpdatedAt: string | null
    orderData?: Order
    proofOfPaymentUrl?: string | null
}

interface OrderForm {
    fullName: string
    email: string
    phone: string
    fulfillmentType: string
    pickDate: string
    pickTime: string
    selectedMenuItems: SelectedMenuItem[]
    addOns: {
        [key: string]: number
    }
    // Add delivery fields
    deliveryAddress: {
        addressLine: string
        region: string
        city: string
        barangay: string
        postalCode: string
    }
}

interface SelectedMenuItem {
    menu_id: string
    name: string
    price: number
    quantity: number
    inclusion: string
    size: string | null
    selectedPriceIndex: number
}

interface MenuItem {
    menu_id: string
    name: string
    price: string
    inclusion: string
    is_available: boolean
    category: string
    size: string | null
    description: string
    image_url: string | null
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
    const navigate = useNavigate();
    type TabType = 'New Orders' | 'In Process' | 'Completed' | 'Refund' | 'Cancelled'
    const tabs: TabType[] = ['New Orders', 'In Process', 'Completed', 'Refund', 'Cancelled']
    const [activeTab, setActiveTab] = useState<TabType>('New Orders')
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
    const [showViewReceiptModal, setShowViewReceiptModal] = useState(false)
    const [viewReceiptUrl, setViewReceiptUrl] = useState<string>('')
    const [availableSchedules, setAvailableSchedules] = useState<any[]>([])
    const [selectedScheduleId, setSelectedScheduleId] = useState<string>('')


    const statusGroups = {
        'New Orders': ['Pending'],
        'In Process': ['Queueing', 'Preparing', 'Cooking', 'Ready', 'On Delivery', 'Claim Order'],
        'Completed': ['Completed', 'Refund'],
        'Refund': ['Refunding', 'Refund'],
        'Cancelled': ['Cancelled']
    }

    const handleReturnPaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReturnPaymentProof(e.target.files[0])
        }
    }

    const handleRejectDone = async () => {
        if (!selectedOrder?.orderData) return

        // Validate that return payment proof is uploaded
        if (!returnPaymentProof) {
            alert('Please upload return payment proof before rejecting the order. This is required to show proof that the customer\'s payment has been returned.');
            return;
        }

        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: 'Rejected',
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
        pickDate: '',
        pickTime: '',
        selectedMenuItems: [],
        addOns: {},
        deliveryAddress: {
            addressLine: '',
            region: '',
            city: '',
            barangay: '',
            postalCode: '',
        }
    })

    const loadOrders = async () => {
        try {
            setLoading(true)
            const data = await fetchOrders()

            // Sort orders by created_at ascending (earliest first)
            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.date).getTime()
                const dateB = new Date(b.date).getTime()
                return dateA - dateB
            })

            const formattedOrders: OrderDisplay[] = sortedData.map(order => {
                // Calculate total including delivery fee
                const subtotal = Number(order.total_price)
                const deliveryFee = order.delivery?.delivery_fee ? Number(order.delivery.delivery_fee) : 0
                const totalWithDelivery = subtotal + deliveryFee

                return {
                    id: `#${order.order_number}`,
                    customerName: order.user.customer_name,
                    time: order.time,
                    date: new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    scheduledDate: new Date(order.schedule.schedule_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    scheduledTime: order.schedule.schedule_time,
                    price: `₱ ${totalWithDelivery.toFixed(2)}`,
                    fulfillmentType: order.order_type,
                    paymentMethod: order.payment.paymentMethod || 'On-Site Payment',
                    order_status: order.order_status,
                    statusUpdatedAt: order.status_updated_at || null,
                    orderData: order,
                    proofOfPaymentUrl: order.payment.proof_of_payment_url || null
                }
            })

            console.log('Loaded orders:', formattedOrders)
            setOrders(formattedOrders)
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const parsePrices = (priceString: string): number[] => {
        if (!priceString) return []
        return priceString.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p))
    }

    const parseSizes = (sizeString: string | null): string[] => {
        if (!sizeString) return []
        return sizeString.split(',').map(s => s.trim()).filter(s => s)
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
        loadAvailableSchedules()
    }, [])

    const itemsPerPage = 10

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase())

        // Use statusGroups instead of status matching
        const matchesTab = statusGroups[activeTab]?.includes(order.order_status)

        // Date Range Filter
        let matchesDateRange = true
        if (filters.dateRange) {
            const orderDate = new Date(order.orderData?.date || '')
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (filters.dateRange === 'today') {
                const orderDateOnly = new Date(orderDate)
                orderDateOnly.setHours(0, 0, 0, 0)
                matchesDateRange = orderDateOnly.getTime() === today.getTime()
            } else if (filters.dateRange === 'week') {
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                matchesDateRange = orderDate >= weekAgo
            } else if (filters.dateRange === 'month') {
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                matchesDateRange = orderDate >= monthAgo
            }
        }

        // Payment Method Filter
        let matchesPaymentMethod = true
        if (filters.paymentMethod) {
            const orderPaymentMethod = order.paymentMethod.toLowerCase()
            if (filters.paymentMethod === 'cash') {
                matchesPaymentMethod = orderPaymentMethod.includes('cash') || orderPaymentMethod.includes('on-site')
            } else if (filters.paymentMethod === 'gcash') {
                matchesPaymentMethod = orderPaymentMethod.includes('gcash')
            } else if (filters.paymentMethod === 'card') {
                matchesPaymentMethod = orderPaymentMethod.includes('card')
            }
        }

        // Fulfillment Type Filter
        let matchesFulfillmentType = true
        if (filters.fulfillmentType) {
            const orderType = order.fulfillmentType.toLowerCase()
            matchesFulfillmentType = orderType.includes(filters.fulfillmentType.toLowerCase())
        }

        // Price Range Filter
        let matchesPriceRange = true
        if (filters.priceRange) {
            const priceString = order.price.replace(/[₱,\s]/g, '')
            const price = parseFloat(priceString)

            if (filters.priceRange === '0-500') {
                matchesPriceRange = price >= 0 && price <= 500
            } else if (filters.priceRange === '500-1000') {
                matchesPriceRange = price > 500 && price <= 1000
            } else if (filters.priceRange === '1000+') {
                matchesPriceRange = price > 1000
            }
        }

        return matchesSearch && matchesTab && matchesDateRange && matchesPaymentMethod && matchesFulfillmentType && matchesPriceRange
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
                    order_status: 'Queueing',
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

    const hasActiveFilters = () => {
        return filters.dateRange || filters.paymentMethod || filters.fulfillmentType || filters.priceRange || filters.status
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
    const [profile, setProfile] = useState<UserProfile | null>(null);

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }


    useEffect(() => {
        console.log("Navigated to /staff")
        console.log("Current logged-in user:", user)
    }, [user])

    useEffect(() => {
        setLoading(true);
        const fetchUserProfile = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("user_uid", user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
                return;
            }

            setProfile(data);
            setLoading(false);
        };

        fetchUserProfile();
    }, [user]);

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

    const handleNotifyCustomer = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId)
        if (!order?.orderData) return

        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: 'Claim Order',
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', order.orderData.order_id)

            if (error) throw error

            await loadOrders()
            closeOrderDetails()
            alert('Customer has been notified! Order status updated to "Claim Order".')
        } catch (error) {
            console.error('Error updating order status:', error)
            alert('Failed to notify customer')
        }
    }

    // Submit manual order
    const handleSubmitOrder = async () => {
        setLoading(true)
        try {
            if (!orderForm.fullName || !orderForm.email || !orderForm.phone || !orderForm.fulfillmentType) {
                alert('Please fill in all customer information fields')
                setLoading(false)
                return
            }

            if (orderForm.selectedMenuItems.length === 0) {
                alert('Please add at least one menu item to the order')
                setLoading(false)
                return
            }

            // Create or get user
            let userId = ''
            // Use .limit(1) instead of .single() to handle cases where multiple users have the same email
            const { data: existingUsers } = await supabase
                .from('users')
                .select('user_uid')
                .eq('email', orderForm.email)
                .limit(1)

            const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

            console.log('Existing user lookup response:', existingUser)
            console.log('Order form email:', orderForm.email)

            if (existingUser) {
                userId = existingUser.user_uid
            } else {
                const nameParts = orderForm.fullName.trim().split(' ')
                const firstName = nameParts[0] || ''
                const lastName = nameParts[nameParts.length - 1] || ''
                const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null

                const newUserId = crypto.randomUUID()

                console.log('Creating new user with ID:', newUserId)

                const { data: newUser, error: userError } = await supabase
                    .from('users')
                    .insert({
                        user_uid: newUserId,
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

                console.log('New user creation response:', newUser, userError)

                if (userError) throw userError
                userId = newUser.user_uid

            }

            if (!selectedScheduleId) {
                alert('Please select a schedule')
                setLoading(false)
                return
            }

            // Use the selected schedule
            const schedule = availableSchedules.find(s => s.schedule_id === selectedScheduleId)
            if (!schedule) {
                alert('Invalid schedule selected')
                setLoading(false)
                return
            }

            // Create payment
            const { data: payment, error: paymentError } = await supabase
                .from('payment')
                .insert({
                    payment_method: 'On-Site Payment',
                    payment_date: new Date().toISOString(),
                    amount_paid: calculateOrderTotal(),
                    is_paid: true
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
                    order_status: 'Queueing',
                    order_type: orderForm.fulfillmentType === 'pickup' ? 'Pick-up' : 'Delivery',
                    total_price: totalPrice,
                    additional_information: 'Walk-in customer order',
                    is_manual: true
                })
                .select()
                .single()

            if (orderError) throw orderError

            if (orderForm.fulfillmentType === 'delivery') {
                // Validate delivery address
                if (!orderForm.deliveryAddress.addressLine ||
                    !orderForm.deliveryAddress.barangay ||
                    !orderForm.deliveryAddress.city ||
                    !orderForm.deliveryAddress.region ||
                    !orderForm.deliveryAddress.postalCode) {
                    alert('Please fill in all delivery address fields')
                    setLoading(false)
                    return
                }

                // Create address
                const { data: address, error: addressError } = await supabase
                    .from('address')
                    .insert({
                        address_type: 'Secondary',
                        address_line: orderForm.deliveryAddress.addressLine,
                        region: orderForm.deliveryAddress.region,
                        city: orderForm.deliveryAddress.city,
                        barangay: orderForm.deliveryAddress.barangay,
                        postal_code: orderForm.deliveryAddress.postalCode,
                        customer_id: userId
                    })
                    .select()
                    .single()

                if (addressError) throw addressError

                // Create delivery record
                const { data: delivery, error: deliveryError } = await supabase
                    .from('delivery')
                    .insert({
                        address_id: address.address_id,
                        delivery_fee: 50,
                        delivery_status: null,
                        rider_id: null
                    })
                    .select()
                    .single()

                if (deliveryError) throw deliveryError

                // Update order with delivery_id
                const { error: orderUpdateError } = await supabase
                    .from('order')
                    .update({ delivery_id: delivery.delivery_id })
                    .eq('order_id', order.order_id)

                if (orderUpdateError) throw orderUpdateError
            }

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

            // Create add-on items if any - link them to the first order item (or modify logic as needed)
            if (Object.values(orderForm.addOns).some(qty => qty > 0)) {
                // Get the first order item to attach add-ons to
                const { data: firstOrderItem } = await supabase
                    .from('order_item')
                    .select('order_item_id')
                    .eq('order_id', order.order_id)
                    .limit(1)
                    .single()

                if (firstOrderItem) {
                    for (const [addOnId, quantity] of Object.entries(orderForm.addOns)) {
                        if (quantity > 0) {
                            const addOn = addOns.find(a => a.add_on === addOnId)
                            if (addOn) {
                                const { error: addOnError } = await supabase
                                    .from('order_item_add_on')
                                    .insert({
                                        order_item_id: firstOrderItem.order_item_id,
                                        add_on_id: addOnId,
                                        quantity: quantity,
                                        subtotal_price: Number(addOn.price) * quantity
                                    })

                                if (addOnError) throw addOnError
                            }
                        }
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
                pickDate: '',
                pickTime: '',
                selectedMenuItems: [],
                addOns: {},
                // Reset delivery address
                deliveryAddress: {
                    addressLine: '',
                    region: '',
                    city: '',
                    barangay: '',
                    postalCode: ''
                }
            })
            loadOrders()
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error('Error creating order:', error)
            alert('Failed to create order')
        }
    }

    // Add near loadMenuItems and loadAddOns functions
    const loadAvailableSchedules = async () => {
        try {
            const now = new Date()
            const today = now.toISOString().split('T')[0]
            const { data, error } = await supabase
                .from('schedule')
                .select('*')
                .eq('is_available', true)
                .gte('schedule_date', today)
                .order('schedule_date')
                .order('schedule_time')

            if (error) throw error

            // Filter out schedules that have already passed for today
            const filteredSchedules = (data || []).filter(schedule => {
                // If it's not today, keep the schedule
                if (schedule.schedule_date !== today) return true

                // If it's today, check if the time has passed
                const [hours, minutes] = schedule.schedule_time.split(':')
                const scheduleHour = parseInt(hours)
                const scheduleMinute = parseInt(minutes)

                const currentHour = now.getHours()
                const currentMinute = now.getMinutes()

                // Filter out if schedule time is before or equal to current time
                if (scheduleHour < currentHour) return false
                if (scheduleHour === currentHour && scheduleMinute <= currentMinute) return false

                return true
            })

            setAvailableSchedules(filteredSchedules)
        } catch (error) {
            console.error('Error loading schedules:', error)
        }
    }

    const filteredMenuItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
    )

    const formatScheduleTime = (dateStr: string, timeStr: string, orderType?: string): string => {
        // Convert to Date object for formatting
        const date = new Date(`${dateStr}T${timeStr}`);

        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
        });

        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });

        const actionText = orderType === 'Pick-up' ? 'for pick-up on' : 'to be delivered on';
        return `${formattedTime} ${actionText} ${formattedDate}`;
    }

    const orderPrice = selectedOrder?.orderData?.order_item.reduce((sum, item) => {
        let itemTotal = Number(item.subtotal_price);

        if (item.order_item_add_on && item.order_item_add_on.length > 0) {
            const addOnsTotal = item.order_item_add_on.reduce((addOnSum: number, addon: any) => {
                return addOnSum + Number(addon.subtotal_price);
            }, 0);
            itemTotal += addOnsTotal;
        }

        return sum + itemTotal;
    }, 0) || 0;

    const handleOpenViewReceipt = (receiptUrl: string) => {
        setViewReceiptUrl(receiptUrl)
        setShowViewReceiptModal(true)
    }

    const handleCloseViewReceipt = () => {
        setShowViewReceiptModal(false)
        setViewReceiptUrl('')
    }

    return (
        <ProtectedRoute allowedRoles={['staff']}>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">

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
                                    <h1 className="text-xl lg:text-3xl font-bold">ORDERS</h1>
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



                    {/* Status Tabs */}
                    <div className="bg-white px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
                        <div className="flex gap-2 overflow-x-auto mb-3 sm:mb-4">
                            {tabs.map((tab) => (
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
                                    className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors text-sm ${hasActiveFilters()
                                        ? 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <Filter className="h-4 w-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                    {hasActiveFilters() && (
                                        <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                                            {[filters.dateRange, filters.paymentMethod, filters.fulfillmentType, filters.priceRange].filter(Boolean).length}
                                        </span>
                                    )}
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

                        {/* Active Filters Display */}
                        {hasActiveFilters() && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                                {filters.dateRange && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                        Date: {filters.dateRange === 'today' ? 'Today' : filters.dateRange === 'week' ? 'This Week' : 'This Month'}
                                        <button
                                            onClick={() => handleFilterChange('dateRange', '')}
                                            className="hover:text-amber-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.paymentMethod && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                        Payment: {filters.paymentMethod === 'cash' ? 'Cash/On-Site' : filters.paymentMethod === 'gcash' ? 'GCash' : filters.paymentMethod}
                                        <button
                                            onClick={() => handleFilterChange('paymentMethod', '')}
                                            className="hover:text-amber-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.fulfillmentType && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                        Type: {filters.fulfillmentType === 'pick-up' ? 'Pick-up' : 'Delivery'}
                                        <button
                                            onClick={() => handleFilterChange('fulfillmentType', '')}
                                            className="hover:text-amber-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.priceRange && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                                        Price: {filters.priceRange === '0-500' ? '₱0-₱500' : filters.priceRange === '500-1000' ? '₱500-₱1,000' : '₱1,000+'}
                                        <button
                                            onClick={() => handleFilterChange('priceRange', '')}
                                            className="hover:text-amber-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-amber-600 hover:text-amber-800 font-medium underline"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Main Content - Mobile First */}
                    <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto">
                        {loading ? (
                            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                    <p className="text-gray-700 font-medium">Processing...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Results Counter */}
                                <div className="mb-4 text-sm text-gray-600">
                                    Showing <span className="font-semibold text-gray-800">{filteredOrders.length}</span> {filteredOrders.length === 1 ? 'order' : 'orders'}
                                    {hasActiveFilters() && <span className="text-amber-600"> (filtered)</span>}
                                </div>

                                {/* Mobile Card View (Default) */}
                                <div className="space-y-3 sm:space-y-4 lg:hidden">
                                    <div className="bg-yellow-400 p-4 rounded-xl sticky top-0 z-10 shadow-sm">
                                        <div className="flex justify-between items-center">
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

                                                {order.order_status === 'Pending' && (
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
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900s">{order.id}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.time}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.price}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fulfillmentType}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <div className="flex gap-2">
                                                                    {order.order_status === 'Pending' && (
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

                                        {orderForm.fulfillmentType === 'delivery' && (
                                            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400 space-y-3">
                                                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <Truck className="h-5 w-5" />
                                                    Delivery Address
                                                </h4>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address:</label>
                                                    <input
                                                        type="text"
                                                        placeholder="House/Building No., Street Name"
                                                        value={orderForm.deliveryAddress.addressLine}
                                                        onChange={(e) => setOrderForm(prev => ({
                                                            ...prev,
                                                            deliveryAddress: { ...prev.deliveryAddress, addressLine: e.target.value }
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Barangay:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Barangay"
                                                            value={orderForm.deliveryAddress.barangay}
                                                            onChange={(e) => setOrderForm(prev => ({
                                                                ...prev,
                                                                deliveryAddress: { ...prev.deliveryAddress, barangay: e.target.value }
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">City:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="City"
                                                            value={orderForm.deliveryAddress.city}
                                                            onChange={(e) => setOrderForm(prev => ({
                                                                ...prev,
                                                                deliveryAddress: { ...prev.deliveryAddress, city: e.target.value }
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Region:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Region"
                                                            value={orderForm.deliveryAddress.region}
                                                            onChange={(e) => setOrderForm(prev => ({
                                                                ...prev,
                                                                deliveryAddress: { ...prev.deliveryAddress, region: e.target.value }
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Postal Code"
                                                            value={orderForm.deliveryAddress.postalCode}
                                                            onChange={(e) => setOrderForm(prev => ({
                                                                ...prev,
                                                                deliveryAddress: { ...prev.deliveryAddress, postalCode: e.target.value }
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Schedule Selection */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                <Calendar className="inline h-4 w-4 mr-1" />
                                                Select Schedule:
                                            </label>
                                            <select
                                                value={selectedScheduleId}
                                                onChange={(e) => {
                                                    const scheduleId = e.target.value
                                                    setSelectedScheduleId(scheduleId)
                                                    const selected = availableSchedules.find(s => s.schedule_id === scheduleId)
                                                    if (selected) {
                                                        setOrderForm(prev => ({
                                                            ...prev,
                                                            pickDate: selected.schedule_date,
                                                            pickTime: selected.schedule_time
                                                        }))
                                                    }
                                                }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            >
                                                <option value="">Select a schedule</option>
                                                {availableSchedules.map((schedule) => (
                                                    <option key={schedule.schedule_id} value={schedule.schedule_id}>
                                                        {new Date(schedule.schedule_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })} at {schedule.schedule_time}
                                                    </option>
                                                ))}
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
                                                            <div key={`${item.menu_id}-${item.selectedPriceIndex}`} className="flex justify-between items-center text-sm">
                                                                <span>
                                                                    • {item.name} {item.size && `(${item.size})`} (x{item.quantity})
                                                                </span>
                                                                <span className="font-semibold">₱ {(item.price * item.quantity).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-300 pt-2 mt-2">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <span>Subtotal</span>
                                                            <span className="text-lg">₱ {calculateOrderTotal().toFixed(2)}</span>
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
                                                            const prices = parsePrices(menuItem.price)
                                                            const sizes = parseSizes(menuItem.size)
                                                            const hasVariants = prices.length > 1 || sizes.length > 1

                                                            return (
                                                                <div key={menuItem.menu_id} className="bg-amber-600 text-white p-3 rounded-lg">
                                                                    <div className="flex justify-between items-start gap-3">
                                                                        <div className="flex-1">
                                                                            <h4 className="font-semibold">{menuItem.name}</h4>
                                                                            <p className="text-xs opacity-75 mt-1">{menuItem.category}</p>

                                                                            {/* Price variants */}
                                                                            {prices.length === 1 ? (
                                                                                <p className="text-sm opacity-90 mt-1">₱ {prices[0].toFixed(2)}</p>
                                                                            ) : (
                                                                                <div className="mt-2 space-y-1">
                                                                                    <p className="text-xs opacity-75">Select size & price:</p>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {prices.map((price, index) => {
                                                                                            const size = sizes[index] || `Option ${index + 1}`
                                                                                            const isSelected = selectedItem?.selectedPriceIndex === index

                                                                                            return (
                                                                                                <button
                                                                                                    key={index}
                                                                                                    onClick={() => {
                                                                                                        // Remove old item first if exists
                                                                                                        setOrderForm(prev => ({
                                                                                                            ...prev,
                                                                                                            selectedMenuItems: prev.selectedMenuItems.filter(
                                                                                                                item => item.menu_id !== menuItem.menu_id
                                                                                                            )
                                                                                                        }))

                                                                                                        // Add with selected variant
                                                                                                        setOrderForm(prev => ({
                                                                                                            ...prev,
                                                                                                            selectedMenuItems: [
                                                                                                                ...prev.selectedMenuItems,
                                                                                                                {
                                                                                                                    menu_id: menuItem.menu_id,
                                                                                                                    name: menuItem.name,
                                                                                                                    price: price,
                                                                                                                    quantity: 1,
                                                                                                                    inclusion: menuItem.inclusion || '',
                                                                                                                    size: size,
                                                                                                                    selectedPriceIndex: index
                                                                                                                }
                                                                                                            ]
                                                                                                        }))
                                                                                                    }}
                                                                                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${isSelected
                                                                                                        ? 'bg-white text-amber-600'
                                                                                                        : 'bg-amber-500 hover:bg-amber-400'
                                                                                                        }`}
                                                                                                >
                                                                                                    {size}: ₱{price.toFixed(2)}
                                                                                                </button>
                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {menuItem.inclusion && (
                                                                                <>
                                                                                    <p className="text-sm opacity-90 mt-2">Inclusion:</p>
                                                                                    <p className="text-xs opacity-75">{menuItem.inclusion}</p>
                                                                                </>
                                                                            )}

                                                                            {selectedItem && (
                                                                                <p className="text-xs mt-2 bg-white/20 px-2 py-1 rounded inline-block">
                                                                                    Added: {selectedItem.quantity}x
                                                                                    {selectedItem.size && ` (${selectedItem.size})`}
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {/* Quantity controls or Add button */}
                                                                        <div className="flex items-center gap-2">
                                                                            {selectedItem ? (
                                                                                // Show quantity controls if already added
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => removeMenuItemFromOrder(menuItem.menu_id)}
                                                                                        className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center font-bold"
                                                                                    >
                                                                                        -
                                                                                    </button>
                                                                                    <span className="text-white font-semibold w-6 text-center">
                                                                                        {selectedItem.quantity}
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setOrderForm(prev => ({
                                                                                                ...prev,
                                                                                                selectedMenuItems: prev.selectedMenuItems.map(item =>
                                                                                                    item.menu_id === menuItem.menu_id
                                                                                                        ? { ...item, quantity: item.quantity + 1 }
                                                                                                        : item
                                                                                                )
                                                                                            }))
                                                                                        }}
                                                                                        className="w-8 h-8 bg-white text-amber-600 rounded-full flex items-center justify-center font-bold"
                                                                                    >
                                                                                        +
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                // Show Add button if not added yet
                                                                                prices.length === 1 && (
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setOrderForm(prev => ({
                                                                                                ...prev,
                                                                                                selectedMenuItems: [
                                                                                                    ...prev.selectedMenuItems,
                                                                                                    {
                                                                                                        menu_id: menuItem.menu_id,
                                                                                                        name: menuItem.name,
                                                                                                        price: prices[0],
                                                                                                        quantity: 1,
                                                                                                        inclusion: menuItem.inclusion || '',
                                                                                                        size: sizes[0] || null,
                                                                                                        selectedPriceIndex: 0
                                                                                                    }
                                                                                                ]
                                                                                            }))
                                                                                        }}
                                                                                        className="px-4 py-2 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors text-sm"
                                                                                    >
                                                                                        Add
                                                                                    </button>
                                                                                )
                                                                            )}
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
                                                            <span className="text-sm text-gray-600 ml-2">₱ {Number(addon.price).toFixed(2)}</span>
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
                                                        ).toFixed(2)}
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
                                                        ).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-yellow-400 pt-2 mt-2">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Total:</span>
                                                        <span>₱ {calculateOrderTotal().toFixed(2)}</span>
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
                                            pickDate: '',
                                            pickTime: '',
                                            selectedMenuItems: [],
                                            addOns: {},
                                            deliveryAddress: {
                                                addressLine: '',
                                                region: '',
                                                city: '',
                                                barangay: '',
                                                postalCode: ''
                                            }
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
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-600 font-medium">FRONT</span>
                                        <span className="text-xl font-bold text-gray-800">Order ID: {selectedOrder.id}</span>
                                        <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                            {selectedOrder.orderData.order_status}
                                        </span>
                                    </div>
                                    {selectedOrder.statusUpdatedAt && (
                                        <p className="text-sm text-gray-500">
                                            Status updated: {new Date(selectedOrder.statusUpdatedAt).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </p>
                                    )}
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
                                        {formatScheduleTime(selectedOrder.orderData.schedule.schedule_date, selectedOrder.orderData.schedule.schedule_time, selectedOrder.orderData.order_type)}
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
                                        {selectedOrder.orderData.order_item?.length ? (
                                            <>
                                                {selectedOrder.orderData.order_item.map((item: any) => (
                                                    <div key={item.order_item_id}>
                                                        {/* Main menu item */}
                                                        <div className="grid grid-cols-3 gap-4 items-start">
                                                            <div>
                                                                <p className="font-medium text-gray-800">{item.menu.name}</p>
                                                                {item.menu.inclusion && (
                                                                    <p className="text-sm text-gray-600 mb-1.5">inclusions: {item.menu.inclusion}</p>
                                                                )}
                                                            </div>
                                                            <div className="text-center font-medium">{item.quantity}</div>
                                                            <div className="text-right font-bold">₱ {Number(item.subtotal_price).toLocaleString()}</div>
                                                        </div>

                                                        {/* Add-ons for this item */}
                                                        {item.order_item_add_on && item.order_item_add_on.length > 0 && (
                                                            <div className="ml-6 mt-2 space-y-2">
                                                                {item.order_item_add_on.map((addon: any) => (
                                                                    <div key={addon.order_item_add_on_id} className="grid grid-cols-3 gap-4 items-start">
                                                                        <div>
                                                                            <p className="text-sm text-gray-600">+ {addon.add_on.name} (x{addon.quantity})</p>
                                                                        </div>
                                                                        <div className="text-center text-sm text-gray-600"></div>
                                                                        <div className="text-right text-sm font-semibold text-gray-600">₱ {Number(addon.subtotal_price).toFixed(2)}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <p className="text-gray-500 text-center italic">No items found.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium">Subtotal</span>
                                        <span className="text-lg font-bold">₱ {orderPrice?.toFixed(2)}</span>
                                    </div>
                                    {selectedOrder.orderData.delivery && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium">Delivery fee</span>
                                            <span className="text-lg font-bold">
                                                ₱ {Number(selectedOrder.orderData.delivery.delivery_fee || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center border-t-2 border-gray-300 pt-3">
                                        <span className="text-xl font-bold">Total</span>
                                        <span className="text-2xl font-bold text-amber-600">
                                            ₱ {(orderPrice + (selectedOrder.orderData.delivery ? Number(selectedOrder.orderData.delivery.delivery_fee || 0) : 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-5 w-5 text-gray-600" />
                                        <span className="font-medium text-gray-700">Payment Method</span>
                                    </div>

                                    <p className="text-lg font-semibold text-gray-800 mb-3">
                                        {selectedOrder.paymentMethod}
                                    </p>

                                    {selectedOrder.proofOfPaymentUrl && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (selectedOrder.proofOfPaymentUrl) {
                                                    handleOpenViewReceipt(selectedOrder.proofOfPaymentUrl);
                                                }
                                            }}
                                            className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm sm:text-base whitespace-nowrap"
                                        >
                                            View Receipt
                                        </button>
                                    )}
                                </div>


                                {/* Additional Information */}
                                {selectedOrder.orderData.additional_information && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-700 mb-2">Additional Information</h4>
                                        <p className="text-gray-800">{selectedOrder.orderData.additional_information}</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => {
                                            setIsOrderDetailsModalOpen(false)
                                            setShowOrderBackView(true)
                                        }}
                                        className="px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        See more
                                    </button>
                                    {selectedOrder.order_status === 'Pending' && (
                                        <div className="flex items-center gap-3">
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
                                    {selectedOrder.order_status === 'Ready' && selectedOrder.orderData?.order_type === 'Pick-up' && (
                                        <button
                                            onClick={() => handleNotifyCustomer(selectedOrder.id)}
                                            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
                                        >
                                            <Bell className="h-5 w-5" />
                                            Notify Customer
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Back View Modal */}
                {showOrderBackView && selectedOrder && selectedOrder.orderData && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                                        BACK
                                    </button>
                                    <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                        {selectedOrder.orderData.order_status}
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
                                {/* Delivery Information - Only show if order_type is Delivery */}
                                {selectedOrder.orderData.order_type === 'Delivery' && selectedOrder.orderData.delivery && (
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Truck className="h-5 w-5 text-amber-600" />
                                            <h4 className="font-medium text-gray-800">Delivery Information</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex">
                                                <h4 className="text-sm font-semibold text-gray-700 mr-4 min-w-[150px]">Address:</h4>
                                                <p className="text-sm text-gray-600">
                                                    {selectedOrder.orderData.delivery.address.address_line}, {selectedOrder.orderData.delivery.address.barangay}, {selectedOrder.orderData.delivery.address.city}, {selectedOrder.orderData.delivery.address.region} {selectedOrder.orderData.delivery.address.postal_code}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Customer Contact */}
                                <div className="flex">
                                    <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Customer Contact #:</h4>
                                    <p className="text-gray-600">{selectedOrder.orderData.user.phone_number}</p>
                                </div>

                                {/* Special Instructions */}
                                {selectedOrder.orderData.additional_information && (
                                    <div className="flex">
                                        <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Special Instructions:</h4>
                                        <p className="text-gray-600">{selectedOrder.orderData.additional_information}</p>
                                    </div>
                                )}

                                {/* Fulfillment Type */}
                                <div className="flex">
                                    <h4 className="text-lg font-semibold text-gray-800 mr-4 min-w-[200px]">Fulfillment Type:</h4>
                                    <p className="text-gray-600">{selectedOrder.orderData.order_type}</p>
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
                                        Upload Return Payment Proof <span className="text-red-500">*</span>
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
                                                {returnPaymentProof ? returnPaymentProof.name : 'Click to upload payment proof (Required)'}
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
                                        <option value="cash">Cash / On-Site Payment</option>
                                        <option value="gcash">GCash</option>
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
                                        <option value="pick-up">Pick-up</option>
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

                {/* View Receipt Modal */}
                {showViewReceiptModal && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-black">Payment Receipt</h2>
                                <button
                                    onClick={handleCloseViewReceipt}
                                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
                                <img
                                    src={viewReceiptUrl}
                                    alt="Payment Receipt"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>

                            <div className="p-4 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={handleCloseViewReceipt}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
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