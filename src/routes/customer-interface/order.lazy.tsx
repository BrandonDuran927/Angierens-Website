import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ShoppingCart, Bell, Search, Filter, Star, Heart, MessageSquare, Menu, X } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { supabase } from '@/lib/supabaseClient'


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
    deliveryStatus?: 'queueing' | 'on-delivery' | 'claim-order' | 'refunding'
    createdAt: string
    proofOfPaymentUrl?: string | null
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
    const { user, signOut } = useUser()
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Navigated to /customer-interface/order")
        console.log("Current logged-in user:", user)
    }, [user])

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }

    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [cartCount] = useState(2)
    const [notificationCount] = useState(3)
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showRefundModal, setShowRefundModal] = useState(false)
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [refundStep, setRefundStep] = useState(1)
    const [cancelStep, setCancelStep] = useState(1)
    const [selectedReason, setSelectedReason] = useState('')
    const [gcashNumber, setGcashNumber] = useState('')
    const [confirmGcashNumber, setConfirmGcashNumber] = useState('')
    const [currentOrderId, setCurrentOrderId] = useState<string>('')
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploadPreview, setUploadPreview] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)
    const [showViewReceiptModal, setShowViewReceiptModal] = useState(false)
    const [viewReceiptUrl, setViewReceiptUrl] = useState<string>('')


    const navigationItems = [
        { name: 'HOME', route: '/', active: false },
        { name: 'MENU', route: '/customer-interface/', active: false },
        { name: 'ORDER', route: '/customer-interface/order', active: true },
        { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
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

    // Fetch orders from Supabase
    useEffect(() => {
        if (user) {
            fetchOrders()
        }
    }, [user])

    const fetchOrders = async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('order')
                .select(`
                    *,
                    payment (*),
                    order_item (
                        *,
                        menu (*),
                        order_item_add_on (
                            *,
                            add_on (*)
                        )
                    )
                `)
                .eq('customer_uid', user.id)
                .order('created_at', { ascending: false })

            if (ordersError) throw ordersError

            // Transform the data to match the Order interface
            const transformedOrders: Order[] = ordersData.map((order: any) => {
                // Map Supabase status to UI status
                let uiStatus: Order['status'] = 'pending'
                let deliveryStatus: Order['deliveryStatus'] | undefined = undefined

                if (order.order_status === 'Pending' && order.payment?.is_paid === false) {
                    uiStatus = 'to-pay'
                } else if (order.order_status === 'Pending' && order.payment?.is_paid === true) {
                    uiStatus = 'pending'
                } else if (order.order_status === 'Queueing') {
                    uiStatus = 'in-process'
                    deliveryStatus = 'queueing'
                } else if (order.order_status === 'On Delivery') {
                    uiStatus = 'in-process'
                    deliveryStatus = 'on-delivery'
                } else if (order.order_status === 'Claim Order') {
                    uiStatus = 'in-process'
                    deliveryStatus = 'claim-order'
                } else if (order.order_status === 'Refunding') {
                    uiStatus = 'in-process'
                    deliveryStatus = 'refunding'
                } else if (order.order_status === 'Completed') {
                    uiStatus = 'completed'
                } else if (order.order_status === 'Cancelled') {
                    uiStatus = 'cancelled'
                } else if (order.order_status === 'Refund') {
                    uiStatus = 'refunded'
                }

                // Get first menu item for display (or aggregate if needed)
                const firstItem = order.order_item[0]
                const menuName = firstItem?.menu?.name || 'Unknown Item'
                const menuImage = firstItem?.menu?.image_url || '/placeholder.png'
                const inclusions = firstItem?.menu?.inclusion
                    ? firstItem.menu.inclusion.split(',').map((i: string) => i.trim())
                    : []

                // Aggregate add-ons from all order items
                const allAddOns: string[] = []
                order.order_item.forEach((item: any) => {
                    item.order_item_add_on?.forEach((addOn: any) => {
                        if (addOn.add_on?.name) {
                            allAddOns.push(`${addOn.add_on.name} ${addOn.quantity}x`)
                        }
                    })
                })

                return {
                    id: order.order_id,
                    orderNumber: `#${String(order.order_number).padStart(2, '0')}`,
                    name: menuName,
                    inclusions: inclusions,
                    addOns: allAddOns.length > 0 ? allAddOns.join(', ') : 'None',
                    price: Number(firstItem?.menu?.price || 0),
                    quantity: order.order_item.reduce((sum: number, item: any) => sum + Number(item.quantity), 0),
                    status: uiStatus,
                    deliveryStatus: deliveryStatus,
                    image: menuImage,
                    totalAmount: Number(order.total_price),
                    createdAt: order.created_at,
                    proofOfPaymentUrl: order.payment?.proof_of_payment_url
                }
            })

            console.log('Fetched orders:', transformedOrders)

            setOrders(transformedOrders)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenUploadModal = (orderId: string) => {
        setCurrentOrderId(orderId)
        setShowUploadModal(true)
        setSelectedFile(null)
        setUploadPreview('')
    }

    const handleCloseUploadModal = () => {
        setShowUploadModal(false)
        setSelectedFile(null)
        setUploadPreview('')
        setCurrentOrderId('')
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }

            setSelectedFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setUploadPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUploadProof = async () => {
        if (!selectedFile || !currentOrderId) return

        setIsUploading(true)
        try {
            // Get the order to find payment_id
            const { data: orderData, error: orderError } = await supabase
                .from('order')
                .select('payment_id, order_number')
                .eq('order_id', currentOrderId)
                .single()

            if (orderError) throw orderError

            // Generate unique filename
            const fileExt = selectedFile.name.split('.').pop()
            const fileName = `${user?.id}_order${orderData.order_number}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('payment-receipts')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-receipts')
                .getPublicUrl(filePath)

            // Update payment record with proof URL
            const { error: paymentError } = await supabase
                .from('payment')
                .update({
                    proof_of_payment_url: publicUrl,
                    payment_date: new Date().toISOString()
                })
                .eq('payment_id', orderData.payment_id)

            if (paymentError) throw paymentError

            alert('Proof of payment uploaded successfully! Waiting for admin verification.')
            handleCloseUploadModal()
            await fetchOrders() // Refresh orders
        } catch (error) {
            console.error('Error uploading proof:', error)
            alert('Failed to upload proof of payment. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveProof = async () => {
        if (!currentOrderId) return

        const confirmed = window.confirm('Are you sure you want to remove the proof of payment? You will need to upload a new one.')
        if (!confirmed) return

        setIsUploading(true)
        try {
            const { data: orderData, error: orderError } = await supabase
                .from('order')
                .select(`
                  payment_id,
                  payment:payment_id (
                  proof_of_payment_url
                )
                `)
                .eq('order_id', currentOrderId)
                .single();


            if (orderError) throw orderError

            const proofUrl = orderData.payment?.[0]?.proof_of_payment_url;

            if (proofUrl) {
                const urlParts = proofUrl.split('/')
                const fileName = urlParts[urlParts.length - 1]

                await supabase.storage
                    .from('payment-receipts')
                    .remove([fileName])
            }

            const { error: paymentError } = await supabase
                .from('payment')
                .update({
                    proof_of_payment_url: null
                })
                .eq('payment_id', orderData.payment_id)

            if (paymentError) throw paymentError

            alert('Proof of payment removed successfully. You can now upload a new one.')
            handleCloseViewReceipt()
            await fetchOrders() // Refresh orders
        } catch (error) {
            console.error('Error removing proof:', error)
            alert('Failed to remove proof of payment. Please try again.')
        } finally {
            setIsUploading(false)
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

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'to-pay', label: 'To Pay' },
        { id: 'in-process', label: 'In Process' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
        { id: 'refunded', label: 'Refunded' },
    ]

    const getDeliveryStatusInfo = (deliveryStatus?: string) => {
        switch (deliveryStatus) {
            case 'queueing':
                return { text: 'Queueing', color: 'bg-purple-100 text-purple-700 border-purple-300' }
            case 'refunding':
                return { text: 'Refunding', color: 'bg-pink-100 text-pink-700 border-pink-300' }
            case 'on-delivery':
                return { text: 'On Delivery', color: 'bg-blue-100 text-blue-700 border-blue-300' }
            case 'claim-order':
                return { text: 'Claim Order', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' }
            default:
                return { text: '', color: '' }
        }
    }

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

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === 'all' || order.status === activeTab
        const matchesSearch = order.name.toLowerCase().includes(searchQuery.toLowerCase()) || order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())

        let matchesDate = true
        if (selectedDate && selectedCategory) {
            const orderDate = new Date(order.createdAt).toDateString()
            const filterDate = selectedDate.toDateString()
            matchesDate = orderDate === filterDate
        }

        let matchesCategory = true
        if (selectedCategory && !selectedDate) {
            matchesCategory = order.status === selectedCategory
        }

        return matchesTab && matchesSearch && matchesDate && matchesCategory
    })

    const formatPrice = (price: number) => `₱${price.toLocaleString()}`

    // Refund Modal Handlers
    const handleOpenRefundModal = (orderId: string) => {
        setCurrentOrderId(orderId)
        setShowRefundModal(true)
        setRefundStep(1)
        setSelectedReason('')
        setGcashNumber('')
        setConfirmGcashNumber('')
    }

    const handleCloseRefundModal = () => {
        setShowRefundModal(false)
        setRefundStep(1)
        setSelectedReason('')
        setGcashNumber('')
        setConfirmGcashNumber('')
    }

    const handleProceedToCancel = () => {
        setRefundStep(2)
    }

    const handleConfirmCancel = () => {
        setRefundStep(3)
    }

    const handleGcashSubmit = async () => {
        if (gcashNumber !== confirmGcashNumber) {
            alert('GCash numbers do not match')
            return
        }

        try {
            // Create refund request
            const { error: refundError } = await supabase
                .from('refund')
                .insert({
                    order_id: currentOrderId,
                    reason: selectedReason,
                    status: 'Pending',
                    request_date: new Date().toISOString(),
                    gcash_number: gcashNumber
                })

            if (refundError) throw refundError

            // Update order status to Refunding
            const { error: orderError } = await supabase
                .from('order')
                .update({
                    order_status: 'Refunding',
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', currentOrderId)

            if (orderError) throw orderError

            setRefundStep(4)
        } catch (error) {
            console.error('Error submitting refund:', error)
            alert('Failed to submit refund request')
        }
    }

    const handleGoBackToOrder = async () => {
        handleCloseRefundModal()
        await fetchOrders() // Refresh orders list
    }

    // Cancel Order Modal Handlers
    const handleOpenCancelModal = (orderId: string) => {
        setCurrentOrderId(orderId)
        setShowCancelModal(true)
        setCancelStep(1)
        setSelectedReason('')
    }

    const handleCloseCancelModal = () => {
        setShowCancelModal(false)
        setCancelStep(1)
        setSelectedReason('')
    }

    const handleProceedToCancelOrder = () => {
        setCancelStep(2)
    }

    const handleConfirmCancelOrder = async () => {
        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: 'Cancelled',
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', currentOrderId)

            if (error) throw error

            setCancelStep(3)
        } catch (error) {
            console.error('Error cancelling order:', error)
            alert('Failed to cancel order')
        }
    }

    const handleGoBackFromCancel = async () => {
        handleCloseCancelModal()
        await fetchOrders() // Refresh orders list
    }

    const handleOpenViewReceipt = (receiptUrl: string, orderId: string) => {
        setViewReceiptUrl(receiptUrl)
        setCurrentOrderId(orderId)
        setShowViewReceiptModal(true)
    }

    const handleCloseViewReceipt = () => {
        setShowViewReceiptModal(false)
        setViewReceiptUrl('')
    }

    const logoStyle: React.CSSProperties = {
        width: '140px',
        height: '140px',
        backgroundImage: "url('/angierens-logo.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'absolute' as const,
        top: '8px',
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

    const applyFilters = () => {
        setIsFilterModalOpen(false)
        // The filtering is already reactive through the filteredOrders computed value
    }

    const clearFilters = () => {
        setSelectedDate(null)
        setSelectedCategory('')
        setIsFilterModalOpen(false)
    }

    return (
        <ProtectedRoute allowedRoles={['customer']}>
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

                            {/* Hamburger Menu Button */}
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

                                {/* Conditional Button */}
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap"
                                    >
                                        <span className="hidden sm:inline">SIGN OUT</span>
                                        <span className="sm:hidden">OUT</span>
                                    </button>
                                ) : (
                                    <Link to="/login">
                                        <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                                            <span className="hidden sm:inline">SIGN IN</span>
                                            <span className="sm:hidden">IN</span>
                                        </button>
                                    </Link>
                                )}
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
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-gray-400 text-base sm:text-lg px-4">Loading orders...</div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400 text-base sm:text-lg px-4">No orders found</div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div key={order.id} className="p-3 sm:p-6">
                                        <div className="flex items-start gap-3 sm:gap-6">
                                            <div className="flex-shrink-0">
                                                <img src={getImageUrl(order.image)} alt={order.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200" />
                                            </div>

                                            <Link
                                                to="/customer-interface/specific-order/$orderId"
                                                params={{ orderId: order.id }}
                                                className="flex-1 hover:bg-gray-50 p-2 sm:p-4 rounded-lg transition-colors block"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">{order.name} {order.quantity > 1 && `${order.quantity}x`}</h3>
                                                        {order.inclusions.length > 0 && (
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                <div className="mb-1 font-medium">Inclusion:</div>
                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                                    {order.inclusions.map((item, i) => (
                                                                        <div key={i} className="text-xs">{item}</div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-medium">Add-ons:</span> {order.addOns}
                                                        </div>
                                                    </div>

                                                    <div className="text-left sm:text-right">
                                                        <div className={`font-bold text-base sm:text-lg mb-2 ${getStatusColor(order.status)}`}>
                                                            {order.status.toUpperCase().replace('-', ' ')}
                                                        </div>
                                                        {order.status === 'in-process' && order.deliveryStatus && (
                                                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 border ${getDeliveryStatusInfo(order.deliveryStatus).color}`}>
                                                                {getDeliveryStatusInfo(order.deliveryStatus).text}
                                                            </div>
                                                        )}
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleOpenRefundModal(order.id);
                                                    }}
                                                    className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base"
                                                >
                                                    Refund
                                                </button>
                                            )}
                                            {order.status === 'to-pay' && (
                                                <>
                                                    {order.proofOfPaymentUrl ? (
                                                        <>
                                                            {/* Refund Button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleOpenRefundModal(order.id);
                                                                }}
                                                                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base"
                                                            >
                                                                Refund
                                                            </button>

                                                            {/* View Receipt Button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (order.proofOfPaymentUrl) {
                                                                        handleOpenViewReceipt(order.proofOfPaymentUrl, order.id);
                                                                    }
                                                                }}
                                                                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm sm:text-base whitespace-nowrap"
                                                            >
                                                                View Receipt
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {/* Cancel Button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleOpenCancelModal(order.id);
                                                                }}
                                                                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base"
                                                            >
                                                                Cancel
                                                            </button>

                                                            {/* Upload Proof of Payment Button */}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleOpenUploadModal(order.id);
                                                                }}
                                                                className="px-3 sm:px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 text-sm sm:text-base whitespace-nowrap"
                                                            >
                                                                Upload Proof of Payment
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            {order.status === 'in-process' && order.deliveryStatus === 'on-delivery' && (
                                                <Link
                                                    to="/customer-interface/specific-order/$orderId"
                                                    params={{ orderId: order.id }}
                                                    className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base inline-block"
                                                >
                                                    Track Order
                                                </Link>
                                            )}

                                            {order.status === 'completed' && (
                                                <>
                                                    <Link
                                                        to="/customer-interface/feedback"
                                                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm sm:text-base"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        <span className="hidden sm:inline">Rate</span>
                                                    </Link>
                                                    <Link
                                                        to="/customer-interface"
                                                        className="px-3 sm:px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 text-sm sm:text-base"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <span className="hidden sm:inline">Buy Again</span>
                                                    </Link>
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
                        <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
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
                                    onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                                    className="w-full px-3 py-2 rounded border border-gray-300"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Step 1: Select Cancellation Reason */}
                        {refundStep === 1 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-black mb-8">Select Cancellation Reason</h2>

                                <div className="space-y-4 mb-8">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="change-address"
                                            checked={selectedReason === 'change-address'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Need to change delivery address</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="modify-order"
                                            checked={selectedReason === 'modify-order'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Need to modify order (size, color, etc.)</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="dont-want"
                                            checked={selectedReason === 'dont-want'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Don't want to buy anymore</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value="others"
                                            checked={selectedReason === 'others'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Others</span>
                                    </label>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleCloseRefundModal}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                                    >
                                        Not Now
                                    </button>
                                    <button
                                        onClick={handleProceedToCancel}
                                        disabled={!selectedReason}
                                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                    >
                                        Proceed to Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Cancel Place Order Confirmation */}
                        {refundStep === 2 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-black mb-6">Cancel Place Order</h2>

                                <div className="mb-6">
                                    <p className="text-lg text-gray-700 mb-2">
                                        Are you sure you want to cancel Order {orders.find(o => o.id === currentOrderId)?.orderNumber}?
                                    </p>
                                    <p className="text-lg text-gray-700 mb-6">
                                        Once you Place Order, your request will begin the refund process.
                                    </p>

                                    <p className="text-lg font-medium text-gray-800 mb-4">Please note the following:</p>

                                    <ul className="space-y-3 text-gray-700">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <div>
                                                <p>Your down payment will not be refunded immediately.</p>
                                                <p className="text-sm">It will go through processing and may take time to complete.</p>
                                            </div>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <div>
                                                <p>The refund will not be full.</p>
                                                <p className="text-sm">A portion of the amount will be deducted to cover Gcash transaction.</p>
                                            </div>
                                        </li>
                                    </ul>

                                    <div className="mt-6 text-gray-700">
                                        <p className="mb-2">You will receive a notification once the refund is completed.</p>
                                        <p>If you have any concerns, feel free to contact our support.</p>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setRefundStep(1)}
                                        className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 px-6 rounded-full transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmCancel}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
                                    >
                                        Proceed to Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: GCash Number Input */}
                        {refundStep === 3 && (
                            <div className="p-8 bg-yellow-400">
                                <h2 className="text-xl font-bold text-black mb-6 text-center">
                                    Please enter the GCash number where you want the refund to be sent.
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-lg font-medium text-black mb-2">
                                            Enter the number:
                                        </label>
                                        <input
                                            type="text"
                                            value={gcashNumber}
                                            onChange={(e) => setGcashNumber(e.target.value)}
                                            placeholder="+63 ...."
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-yellow-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-black mb-2">
                                            Re-enter the number:
                                        </label>
                                        <input
                                            type="text"
                                            value={confirmGcashNumber}
                                            onChange={(e) => setConfirmGcashNumber(e.target.value)}
                                            placeholder="+63 ...."
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-yellow-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-4 mt-8">
                                    <button
                                        onClick={() => setRefundStep(2)}
                                        className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 px-6 rounded-full transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleGcashSubmit}
                                        disabled={!gcashNumber || !confirmGcashNumber || gcashNumber !== confirmGcashNumber}
                                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-medium py-3 px-6 rounded-full transition-colors"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Cancellation in Process */}
                        {refundStep === 4 && (
                            <div className="p-8 text-center">
                                <h2 className="text-2xl font-bold text-black mb-6">Cancellation in Process...</h2>

                                <div className="space-y-4 text-gray-700 text-lg mb-8">
                                    <p>Your cancellation request has been received and please kindly wait for the process.</p>

                                    <p>Please note that the down payment will be returned only after all necessary check are completed.</p>

                                    <p>You will receive a notification once, the refund is finalized.</p>

                                    <p className="font-medium">Thank you for your patience.</p>
                                </div>

                                <button
                                    onClick={handleGoBackToOrder}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-8 rounded-full transition-colors"
                                >
                                    Go back to Order
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Order Modal (To Pay) */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {/* Step 1: Select Cancellation Reason */}
                        {cancelStep === 1 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-black mb-8">Select Cancellation Reason</h2>

                                <div className="space-y-4 mb-8">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="cancel-reason"
                                            value="change-mind"
                                            checked={selectedReason === 'change-mind'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Changed my mind</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="cancel-reason"
                                            value="wrong-item"
                                            checked={selectedReason === 'wrong-item'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Ordered wrong item</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="cancel-reason"
                                            value="found-better"
                                            checked={selectedReason === 'found-better'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Found a better option</span>
                                    </label>

                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="cancel-reason"
                                            value="others"
                                            checked={selectedReason === 'others'}
                                            onChange={(e) => setSelectedReason(e.target.value)}
                                            className="w-5 h-5 text-yellow-500"
                                        />
                                        <span className="text-lg text-gray-700">Others</span>
                                    </label>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleCloseCancelModal}
                                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                                    >
                                        Not Now
                                    </button>
                                    <button
                                        onClick={handleProceedToCancelOrder}
                                        disabled={!selectedReason}
                                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                                    >
                                        Proceed to Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Cancel Order Confirmation */}
                        {cancelStep === 2 && (
                            <div className="p-8">
                                <h2 className="text-2xl font-bold text-black mb-6">Cancel Order</h2>

                                <div className="mb-6">
                                    <p className="text-lg text-gray-700 mb-2">
                                        Are you sure you want to cancel Order {orders.find(o => o.id === currentOrderId)?.orderNumber}?
                                    </p>
                                    <p className="text-lg text-gray-700 mb-6">
                                        This order has not been paid yet, so you can cancel it without any charges.
                                    </p>

                                    <p className="text-lg font-medium text-gray-800 mb-4">Please note:</p>

                                    <ul className="space-y-3 text-gray-700">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <p>Once cancelled, you will need to place a new order if you change your mind.</p>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                            <p>Your order will be removed from the system immediately.</p>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setCancelStep(1)}
                                        className="flex-1 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-medium py-3 px-6 rounded-full transition-colors"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        onClick={handleConfirmCancelOrder}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-full transition-colors"
                                    >
                                        Confirm Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Cancellation Success */}
                        {cancelStep === 3 && (
                            <div className="p-8 text-center">
                                <h2 className="text-2xl font-bold text-black mb-6">Order Cancelled Successfully</h2>

                                <div className="space-y-4 text-gray-700 text-lg mb-8">
                                    <p>Your order has been cancelled.</p>

                                    <p>You can place a new order anytime from our menu.</p>

                                    <p className="font-medium">Thank you for considering Angieren's Lutong Bahay!</p>
                                </div>

                                <button
                                    onClick={handleGoBackFromCancel}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-8 rounded-full transition-colors"
                                >
                                    Go back to Orders
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Proof of Payment Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-black mb-4">Upload Proof of Payment</h2>

                            <p className="text-gray-600 mb-4">
                                Please upload a clear photo of your payment receipt or screenshot.
                            </p>

                            {/* File Input */}
                            <div className="mb-4">
                                <label className="block w-full">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 transition-colors">
                                        {uploadPreview ? (
                                            <div className="space-y-2">
                                                <img
                                                    src={uploadPreview}
                                                    alt="Preview"
                                                    className="max-h-64 mx-auto rounded-lg"
                                                />
                                                <p className="text-sm text-gray-600">
                                                    {selectedFile?.name}
                                                </p>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setSelectedFile(null)
                                                        setUploadPreview('')
                                                    }}
                                                    className="text-red-500 text-sm hover:text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-gray-600">Click to upload image</p>
                                                <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCloseUploadModal}
                                    disabled={isUploading}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUploadProof}
                                    disabled={!selectedFile || isUploading}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 text-black font-medium py-3 px-6 rounded-lg transition-colors"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>

                            {isUploading && (
                                <p className="text-center text-sm text-gray-600 mt-3">
                                    Please wait while we upload your payment proof...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* View Receipt Modal */}
            {showViewReceiptModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                        {/* Header with title and close button */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-black">Payment Receipt</h2>
                            <button
                                onClick={handleCloseViewReceipt}
                                disabled={isUploading}
                                className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Image Container */}
                        <div className="flex-1 overflow-auto p-4">
                            <img
                                src={viewReceiptUrl}
                                alt="Payment Receipt"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>

                        {/* Footer with action buttons */}
                        <div className="flex gap-3 p-4 border-t border-gray-200">
                            <button
                                onClick={handleCloseViewReceipt}
                                disabled={isUploading}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleRemoveProof}
                                disabled={isUploading}
                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                {isUploading ? 'Removing...' : 'Remove & Replace'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    )
}