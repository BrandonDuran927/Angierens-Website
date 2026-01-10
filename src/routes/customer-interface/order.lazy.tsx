import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ShoppingCart, Bell, Search, Filter, Star, Heart, MessageSquare, Menu, X, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
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
    status: 'pending' | 'in-process' | 'completed' | 'refunded' | 'rejected'
    image: string
    totalAmount: number
    deliveryStatus?: 'queueing' | 'on-delivery' | 'claim-order' | 'refunding' | 'preparing' | 'cooking' | 'ready'
    createdAt: string
    proofOfPaymentUrl?: string | null
    order_items?: Array<{
        id: string
        name: string
        quantity: number
        subtotal: number
        image: string
        inclusions: string[]
    }>
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
    const [isVisible, setIsVisible] = useState(false)

    // Trigger entrance animation
    useEffect(() => {
        setIsVisible(true)
    }, [])

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
                    delivery (
                        delivery_fee
                    ),
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
                    uiStatus = 'pending'
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
                } else if (order.order_status === 'Refund') {
                    uiStatus = 'refunded'
                } else if (order.order_status === 'Rejected') {
                    uiStatus = 'rejected'
                } else if (order.order_status === 'Preparing' || order.order_status === 'Cooking' || order.order_status === 'Ready') {
                    // Consolidate Preparing, Cooking, and Ready into single "Preparing" status for customer view
                    uiStatus = 'in-process'
                    deliveryStatus = 'preparing'
                }


                // Build detailed order items array
                const orderItems = order.order_item.map((item: any) => {
                    const inclusions = item.menu?.inclusion
                        ? item.menu.inclusion.split(',').map((i: string) => i.trim())
                        : []

                    return {
                        id: item.order_item_id,
                        name: item.menu?.name || 'Unknown Item',
                        quantity: Number(item.quantity),
                        subtotal: Number(item.subtotal_price),
                        image: item.menu?.image_url || '/placeholder.png',
                        inclusions: inclusions
                    }
                })

                // Get first item for summary display
                const firstItem = order.order_item[0]
                const displayImage = firstItem?.menu?.image_url || '/placeholder.png'

                // Create summary name
                const itemCount = order.order_item.length
                let summaryName = ''
                if (itemCount === 1) {
                    summaryName = firstItem?.menu?.name || 'Unknown Item'
                } else {
                    summaryName = `${itemCount} items`
                }

                // Aggregate add-ons from all order items with combined quantities
                const addOnsMap = new Map<string, number>()
                order.order_item.forEach((item: any) => {
                    item.order_item_add_on?.forEach((addOn: any) => {
                        if (addOn.add_on?.name) {
                            const currentQty = addOnsMap.get(addOn.add_on.name) || 0
                            addOnsMap.set(addOn.add_on.name, currentQty + addOn.quantity)
                        }
                    })
                })

                // Format add-ons with total quantities
                const allAddOns: string[] = Array.from(addOnsMap.entries()).map(
                    ([name, quantity]) => `${name} (${quantity}x)`
                )

                // Get inclusions from first item only for summary
                const summaryInclusions = firstItem?.menu?.inclusion
                    ? firstItem.menu.inclusion.split(',').map((i: string) => i.trim())
                    : []

                // Calculate total amount including delivery fee
                const subtotal = Number(order.total_price)
                const deliveryFee = order.delivery?.delivery_fee ? Number(order.delivery.delivery_fee) : 0
                const totalWithDelivery = subtotal + deliveryFee

                return {
                    id: order.order_id,
                    orderNumber: `#${String(order.order_number).padStart(2, '0')}`,
                    name: summaryName,
                    inclusions: summaryInclusions,
                    addOns: allAddOns.length > 0 ? allAddOns.join(', ') : 'None',
                    price: Number(firstItem?.menu?.price || 0),
                    quantity: order.order_item.reduce((sum: number, item: any) => sum + Number(item.quantity), 0),
                    status: uiStatus,
                    deliveryStatus: deliveryStatus,
                    image: displayImage,
                    totalAmount: totalWithDelivery,
                    createdAt: order.created_at,
                    proofOfPaymentUrl: order.payment?.proof_of_payment_url,
                    order_items: orderItems
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

            alert('Proof of payment uploaded successfully! Waiting for staff verification.')
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
        { id: 'completed', label: 'Completed' },
        { id: 'refunded', label: 'Refunded' },
        { id: 'rejected', label: 'Rejected' },
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
            case 'preparing':
                return { text: 'Preparing', color: 'bg-orange-100 text-orange-700 border-orange-300' }
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
            case 'refunded': return 'text-purple-600'
            case 'rejected': return 'text-gray-600'
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

    const formatPrice = (price: number) => `₱${price.toFixed(2)}`

    // Refund Modal Handlers
    const handleOpenRefundModal = async (orderId: string) => {
        try {
            // Verify current order status from database before allowing refund
            const { data: orderData, error } = await supabase
                .from('order')
                .select('order_status')
                .eq('order_id', orderId)
                .single()

            if (error) throw error

            // Only allow refund for Pending or Queueing status
            if (orderData.order_status !== 'Pending' && orderData.order_status !== 'Queueing') {
                alert(`Cannot request refund. This order is already in "${orderData.order_status}" status and cannot be cancelled.`)
                // Refresh orders to show current status
                await fetchOrders()
                return
            }

            // Proceed with refund modal
            setCurrentOrderId(orderId)
            setShowRefundModal(true)
            setRefundStep(1)
            setSelectedReason('')
            setGcashNumber('')
            setConfirmGcashNumber('')
        } catch (error) {
            console.error('Error checking order status:', error)
            alert('Failed to verify order status. Please try again.')
        }
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
      scroll-behavior: smooth;
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

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes pulse-soft {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .animate-fade-in {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .animate-slide-in-right {
      animation: slideInRight 0.6s ease-out forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    .glass-effect {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .glass-dark {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    .hover-lift {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .hover-lift:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .hover-glow {
      transition: box-shadow 0.3s ease;
    }

    .hover-glow:hover {
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.4);
    }

    .text-gradient {
      background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn-primary {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      transform: scale(1.02);
    }

    .card-hover {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .card-hover:hover {
      transform: translateY(-5px) scale(1.02);
    }

    .notification-badge {
      animation: pulse-soft 2s infinite;
    }

    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(146, 64, 14, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(146, 64, 14, 0.7);
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
                <header className={`sticky top-0 z-40 glass-effect shadow-sm transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-auto mx-2 sm:mx-4 md:mx-10">
                        <div className="flex items-center justify-between p-2 sm:p-4 relative">
                            {/* Logo */}
                            <div
                                className="flex-shrink-0 bg-cover bg-center dynamic-logo z-50 hover:scale-105 transition-transform duration-300"
                                style={logoStyle}
                            />

                            {/* Main Content Container */}
                            <div className="flex items-center justify-end w-full pl-[150px] sm:pl-[160px] lg:pl-[180px] gap-2 sm:gap-4">
                                {/* Desktop Navigation */}
                                <nav className="hidden lg:flex xl:gap-2 bg-gradient-to-r from-amber-800 to-amber-900 py-2 px-4 xl:px-6 rounded-full shadow-lg">
                                    {navigationItems.map((item, index) => (
                                        <Link
                                            key={item.name}
                                            to={item.route}
                                            className={`px-4 xl:px-5 py-2.5 rounded-full text-sm xl:text-base font-semibold transition-all duration-300 whitespace-nowrap ${item.active
                                                ? 'bg-yellow-400 text-amber-900 shadow-md'
                                                : 'text-yellow-400 hover:bg-amber-700/50 hover:text-yellow-300'
                                                }`}
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>

                                {/* Hamburger Menu Button - Show on tablet and mobile */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="lg:hidden p-2.5 text-amber-900 hover:bg-amber-100 rounded-full bg-yellow-400 shadow-md transition-all duration-300 hover:scale-105"
                                    aria-label="Open menu"
                                >
                                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>

                                {/* Right Side Controls */}
                                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 bg-gradient-to-r from-amber-800 to-amber-900 py-2 px-3 sm:px-4 md:px-5 rounded-full shadow-lg">
                                    {/* Cart Icon */}
                                    {user && (
                                        <Link
                                            to="/customer-interface/cart"
                                            className="relative p-2 sm:p-2.5 text-yellow-400 hover:bg-amber-700/50 rounded-full transition-all duration-300 hover:scale-110"
                                            aria-label="Shopping cart"
                                        >
                                            <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" />
                                            {cartCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold notification-badge">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    {/* Notifications */}
                                    {user && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                                className="relative p-2 sm:p-2.5 text-yellow-400 hover:bg-amber-700/50 rounded-full transition-all duration-300 hover:scale-110"
                                                aria-label="Notifications"
                                            >
                                                <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
                                                {notificationCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold notification-badge">
                                                        {notificationCount}
                                                    </span>
                                                )}
                                            </button>

                                            {/* Notification Dropdown */}
                                            {isNotificationOpen && (
                                                <div className="absolute right-0 mt-3 w-72 sm:w-80 md:w-96 glass-effect rounded-2xl shadow-2xl border border-white/20 z-50 max-h-[70vh] overflow-hidden animate-fade-in">
                                                    <div className="p-4 sm:p-5 border-b border-gray-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
                                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">Notifications</h3>
                                                    </div>

                                                    <div className="max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
                                                        {notifications.length === 0 ? (
                                                            <div className="p-10 text-center text-gray-500">
                                                                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                                <p className="font-medium">No notifications yet</p>
                                                                <p className="text-sm text-gray-400 mt-1">We'll notify you when something arrives</p>
                                                            </div>
                                                        ) : (
                                                            notifications.map((notification, index) => (
                                                                <div
                                                                    key={notification.id}
                                                                    className={`p-4 border-b border-gray-100/50 hover:bg-amber-50/50 cursor-pointer transition-colors duration-200 ${index === notifications.length - 1 ? 'border-b-0' : ''}`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-amber-900 shadow-md">
                                                                            {getNotificationIcon(notification.icon)}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                                                                {notification.title}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 mt-1.5">
                                                                                {notification.time}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-amber-50 to-orange-50">
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="w-full btn-primary text-amber-900 py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-md"
                                                        >
                                                            <Bell className="h-4 w-4" />
                                                            Mark all as read
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Conditional Button */}
                                    {user ? (
                                        <button
                                            onClick={handleLogout}
                                            className="bg-transparent text-yellow-400 font-semibold py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-full border-2 border-yellow-400 hover:bg-yellow-400 hover:text-amber-900 transition-all duration-300 whitespace-nowrap hover:scale-105"
                                        >
                                            <span className="hidden sm:inline">SIGN OUT</span>
                                            <span className="sm:hidden">OUT</span>
                                        </button>
                                    ) : (
                                        <Link to="/login">
                                            <button className="btn-primary text-amber-900 font-semibold py-2 px-3 sm:px-5 text-xs sm:text-sm rounded-full shadow-md whitespace-nowrap hover:scale-105">
                                                <span className="hidden sm:inline">SIGN IN</span>
                                                <span className="sm:hidden">IN</span>
                                            </button>
                                        </Link>
                                    )}
                                </div>
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
                                                        {/* Check if multiple items */}
                                                        {order.order_items && order.order_items.length > 1 ? (
                                                            <>
                                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                                                                    Order {order.orderNumber} ({order.order_items.length} items)
                                                                </h3>
                                                                <div className="space-y-2 mb-3">
                                                                    {order.order_items.map((item, idx) => (
                                                                        <div key={item.id} className="flex items-start gap-2 text-sm">
                                                                            <span className="text-gray-400 mt-1">•</span>
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between items-start">
                                                                                    <span className="font-medium text-gray-800">
                                                                                        {item.name}
                                                                                    </span>
                                                                                    <span className="text-gray-600 ml-2 whitespace-nowrap">
                                                                                        {item.quantity}x - {formatPrice(item.subtotal)}
                                                                                    </span>
                                                                                </div>
                                                                                {item.inclusions.length > 0 && (
                                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                                        Inclusions: {item.inclusions.join(', ')}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {order.addOns !== 'None' && (
                                                                    <div className="text-sm text-gray-600 mt-2">
                                                                        <span className="font-medium">Add-ons:</span> {order.addOns}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                                                                    {order.order_items?.[0]?.name || order.name} {order.quantity > 1 && `(${order.quantity}x)`}
                                                                </h3>
                                                                {order.inclusions.length > 0 && (
                                                                    <div className="text-sm text-gray-600 mb-2">
                                                                        <div className="mb-1 font-medium">Inclusions:</div>
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
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="text-left sm:text-right sm:min-w-[200px] flex flex-col justify-between">
                                                        {/* Top section - Status and Delivery Status */}
                                                        <div className="space-y-2 mb-3">
                                                            <div className={`font-bold text-base sm:text-lg ${getStatusColor(order.status)}`}>
                                                                {order.status.toUpperCase().replace('-', ' ')}
                                                            </div>
                                                            {order.status === 'in-process' && order.deliveryStatus && (
                                                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getDeliveryStatusInfo(order.deliveryStatus).color}`}>
                                                                    {getDeliveryStatusInfo(order.deliveryStatus).text}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Bottom section - Order ID and Total */}
                                                        <div className="space-y-2">

                                                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                                                {formatPrice(order.totalAmount)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex justify-end gap-2 mt-2 sm:mt-4">
                                            {/* PENDING STATUS - Show Cancel/Upload or Refund/View Receipt */}
                                            {order.status === 'pending' && (
                                                <>
                                                    {order.proofOfPaymentUrl ? (
                                                        <>
                                                            {/* <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleOpenRefundModal(order.id);
                                                                }}
                                                                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm sm:text-base"
                                                            >
                                                                Refund
                                                            </button> */}
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

                                            {/* IN-PROCESS STATUS */}
                                            {order.status === 'in-process' && (
                                                <>
                                                    {/* Queueing - Show Refund button */}
                                                    {order.deliveryStatus === 'queueing' && (
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

                                                    {/* On Delivery - Show Track Order button */}
                                                    {order.deliveryStatus === 'on-delivery' && (
                                                        <Link
                                                            to="/customer-interface/specific-order/$orderId"
                                                            params={{ orderId: order.id }}
                                                            className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base inline-block"
                                                        >
                                                            Track Order
                                                        </Link>
                                                    )}
                                                </>
                                            )}

                                            {/* COMPLETED STATUS - Show Rate and Buy Again */}
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
                                                        onClick={(e) => e.stopPropagation()}
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
                <footer id="contact" className="bg-gradient-to-br from-amber-900 via-amber-950 to-black text-white py-12 sm:py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                            {/* Brand Column */}
                            <div className="sm:col-span-2 lg:col-span-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-[url('/angierens-logo.png')] bg-cover bg-center rounded-full" />
                                    <h3 className="text-xl font-bold">Angieren's</h3>
                                </div>
                                <p className="text-amber-200/80 text-sm leading-relaxed">
                                    Authentic Filipino home-cooked meals delivered to your doorstep. Taste the tradition, feel the love.
                                </p>
                                {/* Social Links */}
                                <div className="flex gap-3 mt-6">
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Home</Link></li>
                                    <li><Link to="/customer-interface" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Menu</Link></li>
                                    <li><a href="#about" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />About Us</a></li>
                                    <li><a href="#contact" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Contact</a></li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Support</h4>
                                <ul className="space-y-3 text-sm">
                                    <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />FAQ</Link></li>
                                    <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Help Center</Link></li>
                                    <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Terms & Conditions</Link></li>
                                    <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Privacy Policy</Link></li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h4>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-4 w-4 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-amber-200/60 text-xs mb-1">Email</p>
                                            <p className="text-amber-100">info@angierens.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="h-4 w-4 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-amber-200/60 text-xs mb-1">Phone</p>
                                            <p className="text-amber-100">+63 912 345 6789</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-4 w-4 text-yellow-400" />
                                        </div>
                                        <div>
                                            <p className="text-amber-200/60 text-xs mb-1">Location</p>
                                            <p className="text-amber-100">Bulacan, Philippines</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="border-t border-white/10 mt-10 pt-8">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-amber-200/60 text-sm">
                                    © 2024 Angieren's Lutong Bahay. All rights reserved.
                                </p>
                                <p className="text-amber-200/40 text-xs">
                                    Made with 💛 in Bulacan, Philippines
                                </p>
                            </div>
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
                                            type="tel"
                                            value={gcashNumber}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                if (value.length <= 11) {
                                                    setGcashNumber(value);
                                                }
                                            }}
                                            placeholder="09XXXXXXXXX"
                                            maxLength={11}
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-yellow-600"
                                        />
                                        {gcashNumber && !gcashNumber.startsWith('09') && (
                                            <p className="text-red-600 text-sm mt-1">Must start with 09</p>
                                        )}
                                        {gcashNumber && gcashNumber.length > 0 && gcashNumber.length < 11 && (
                                            <p className="text-red-600 text-sm mt-1">Must be 11 digits</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-lg font-medium text-black mb-2">
                                            Re-enter the number:
                                        </label>
                                        <input
                                            type="tel"
                                            value={confirmGcashNumber}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                                if (value.length <= 11) {
                                                    setConfirmGcashNumber(value);
                                                }
                                            }}
                                            placeholder="09XXXXXXXXX"
                                            maxLength={11}
                                            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-yellow-600"
                                        />
                                        {confirmGcashNumber && gcashNumber !== confirmGcashNumber && (
                                            <p className="text-red-600 text-sm mt-1">Numbers do not match</p>
                                        )}
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
                                        disabled={
                                            !gcashNumber ||
                                            !confirmGcashNumber ||
                                            gcashNumber !== confirmGcashNumber ||
                                            gcashNumber.length !== 11 ||
                                            !gcashNumber.startsWith('09')
                                        }
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

                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    )
}