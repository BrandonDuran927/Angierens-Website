import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Package, CreditCard, Clock, ShoppingBag, Star, X, Menu, ShoppingCart, Bell, MessageSquare, Heart, Navigation, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight, Truck, CheckCircle, User, FileText, Receipt } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useNavigate } from '@tanstack/react-router'
import { AlertModal, type AlertType } from '@/components/AlertModal'
import { CustomerFooter } from '@/components/CustomerFooter'

export const Route = createLazyFileRoute('/customer-interface/specific-order/$orderId')({
  component: SpecificOrder,
})

// Navigation items for header
const navigationItems = [
  { name: 'HOME', route: '/customer-interface/home', active: false },
  { name: 'MENU', route: '/customer-interface/', active: false },
  { name: 'ORDER', route: '/customer-interface/order', active: true },
  { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
  { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
]

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

interface OrderItem {
  id: string
  name: string
  image: string
  quantity: number
  price: number
  unitPrice: number
  inclusions: string[]
  addOns: string
  size: string | null
}

interface OrderData {
  orderId: string
  orderNumber: string
  status: string
  orderPlacedDate: string
  paymentConfirmedDate: string
  status_updated_at: string
  completedDate: string
  deliveryOption: string
  fulfillmentType: string
  isPaid: boolean
  paymentMethod: string
  pickDate: string
  pickTime: string
  customer: {
    name: string
    phone: string
    address: string
    latitude?: number
    longitude?: number
  }
  items: OrderItem[]
  pricing: {
    subtotal: number
    deliveryFee: number
    total: number
  }
  specialInstructions: string
  proofOfPaymentUrl: string | null
  riderId?: string | null
  refundData: {
    response: string | null
    proofOfRefundUrl: string | null
    status: string | null
  } | null
  rejectionData: {
    reason: string | null
    proofOfRefundUrl: string | null
  } | null
}

interface RiderLocation {
  latitude: number
  longitude: number
  updated_at: string
}

function SpecificOrder() {
  const { user, signOut } = useUser()
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundStep, setRefundStep] = useState(1)
  const [selectedReason, setSelectedReason] = useState('')
  const [gcashNumber, setGcashNumber] = useState('')
  const [confirmGcashNumber, setConfirmGcashNumber] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showViewReceiptModal, setShowViewReceiptModal] = useState(false)
  const [showRefundDetailsModal, setShowRefundDetailsModal] = useState(false)
  const [showTrackRiderModal, setShowTrackRiderModal] = useState(false)
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null)
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    message: string
    type: AlertType
    title?: string
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  })

  const showAlert = (message: string, type: AlertType = 'info', title?: string) => {
    setAlertModal({ isOpen: true, message, type, title })
  }

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }

  const { orderId } = Route.useParams()

  const cartCount = 0
  const notificationCount = 0

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

  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])


  // Fetch order data
  useEffect(() => {
    if (orderId && user) {
      fetchOrderData()
    }
  }, [orderId, user])

  const fetchOrderData = async () => {
    setIsLoading(true)
    try {
      const { data: orderDataRaw, error: orderError } = await supabase
        .from('order')
        .select(`
          *,
          payment (*),
          schedule (*),
          order_item (
            *,
            size,
            menu (*),
            order_item_add_on (
              *,
              add_on (*)
            )
          ),
          delivery(
            *,
            address (*)
          ),
          refund (*)
        `)
        .eq('order_id', orderId)
        .single()

      if (orderError) throw orderError

      // Get customer info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_uid', orderDataRaw.customer_uid)
        .single()

      if (userError) throw userError

      // Transform the data
      const items: OrderItem[] = orderDataRaw.order_item.map((item: any) => {
        const inclusions = item.menu?.inclusion
          ? item.menu.inclusion.split(',').map((i: string) => i.trim())
          : []

        const addOns: string[] = []
        let addOnsTotal = 0
        item.order_item_add_on?.forEach((addOn: any) => {
          if (addOn.add_on?.name) {
            addOns.push(`${addOn.add_on.name} (${addOn.quantity})`)
            addOnsTotal += Number(addOn.subtotal_price) || 0
          }
        })

        // Use subtotal_price from order_item (this is the actual price paid for this item)
        const itemSubtotal = Number(item.subtotal_price) || 0
        const quantity = Number(item.quantity) || 1
        // Calculate unit price (price per item before add-ons)
        const unitPrice = itemSubtotal / quantity

        return {
          id: item.order_item_id,
          name: item.menu?.name || 'Unknown Item',
          image: item.menu?.image_url || '/placeholder.png',
          quantity: quantity,
          price: itemSubtotal + addOnsTotal, // Total price for this item including add-ons
          unitPrice: unitPrice, // Original unit price of the menu item
          inclusions: inclusions,
          addOns: addOns.length > 0 ? addOns.join(', ') : 'None',
          size: item.size || null
        }
      })

      // Format dates
      const formatDate = (dateString: string | null) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }

      // Calculate delivery fee (you can adjust this logic)
      const deliveryFee = orderDataRaw.order_type === "Delivery" ? orderDataRaw.delivery?.delivery_fee || 0 : 0;
      const subtotal = Number(orderDataRaw.total_price)
      const totalPrice = subtotal + deliveryFee

      // Build address string from delivery.address if order type is Delivery
      let customerAddress = ''
      let customerLatitude: number | undefined
      let customerLongitude: number | undefined
      if (orderDataRaw.order_type === 'Delivery' && orderDataRaw.delivery?.address) {
        const addr = orderDataRaw.delivery.address
        const addressParts = [
          addr.address_line,
          addr.barangay,
          addr.city,
          addr.region,
          addr.postal_code
        ].filter(Boolean)
        customerAddress = addressParts.join(', ')
        customerLatitude = addr.latitude ? Number(addr.latitude) : undefined
        customerLongitude = addr.longitude ? Number(addr.longitude) : undefined
      }

      const transformed: OrderData = {
        orderId: orderDataRaw.order_id,
        orderNumber: `#${String(orderDataRaw.order_number).padStart(2, '0')}`,
        status: orderDataRaw.order_status,
        orderPlacedDate: formatDate(orderDataRaw.created_at),
        paymentConfirmedDate: orderDataRaw.payment?.is_paid && orderDataRaw.payment?.payment_date ? formatDate(orderDataRaw.payment.payment_date) : '',
        status_updated_at: formatDate(orderDataRaw.status_updated_at),
        completedDate: orderDataRaw.order_status === 'Completed' ? formatDate(orderDataRaw.completed_date) : '',
        deliveryOption: orderDataRaw.order_type || 'Delivery',
        fulfillmentType: orderDataRaw.fulfillment_type || 'Current Day',
        isPaid: orderDataRaw.payment?.is_paid || false,
        paymentMethod: orderDataRaw.payment?.payment_method || 'GCash',
        pickDate: orderDataRaw.schedule?.schedule_date
          ? new Date(orderDataRaw.schedule.schedule_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'Not scheduled',
        pickTime: orderDataRaw.schedule?.schedule_time || 'Not scheduled',
        customer: {
          name: `${userData.first_name} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name}`,
          phone: userData.phone_number || 'N/A',
          address: customerAddress,
          latitude: customerLatitude,
          longitude: customerLongitude
        },
        riderId: orderDataRaw.delivery?.rider_id || null,
        items: items,
        pricing: {
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: totalPrice
        },
        specialInstructions: orderDataRaw.special_instructions || 'None',
        proofOfPaymentUrl: orderDataRaw.payment?.proof_of_payment_url || null,
        refundData: orderDataRaw.refund && orderDataRaw.refund.length > 0 ? {
          response: orderDataRaw.refund[0].response || null,
          proofOfRefundUrl: orderDataRaw.refund[0].proof_of_refund_url || null,
          status: orderDataRaw.refund[0].status || null
        } : null,
        rejectionData: orderDataRaw.order_status === 'Rejected' ? {
          reason: orderDataRaw.rejection_reason || null,
          proofOfRefundUrl: orderDataRaw.payment?.return_payment_proof_url || null
        } : null
      }

      console.log('Transformed Order Data:', transformed)
      setOrderData(transformed)
    } catch (error) {
      console.error('Error fetching order data:', error)
    } finally {
      setIsLoading(false)
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

  const getProgressSteps = () => {
    if (!orderData) return []

    const steps = [
      {
        key: 'placed',
        label: 'Order Placed',
        date: orderData.orderPlacedDate,
        icon: Package,
        completed: true
      }
    ]

    if (orderData.status === 'Cancelled') {
      steps.push({
        key: 'cancelled',
        label: 'Cancelled',
        date: orderData.status_updated_at,
        icon: X,
        completed: true
      })
      return steps
    }

    // Queueing step - waiting in queue
    if (orderData.status === 'Queueing') {
      steps.push({
        key: 'queuing',
        label: 'In Queue',
        date: orderData.status_updated_at,
        icon: Clock,
        completed: true
      })
    } else if (['Preparing', 'Cooking', 'Ready', 'On Delivery', 'Claim Order', 'Completed'].includes(orderData.status)) {
      // Show "Preparing" for Preparing, Cooking, and Ready statuses (consolidated for customer view)
      steps.push({
        key: 'preparing',
        label: 'Preparing',
        date: orderData.status_updated_at,
        icon: ShoppingBag,
        completed: true
      })
    }

    // Handle refund/rejection statuses
    if (orderData.status === 'Refunding' || orderData.status === 'Refund') {
      steps.push({
        key: 'refund',
        label: orderData.status === 'Refund' ? 'Refunded' : 'Refunding',
        date: orderData.status_updated_at,
        icon: CreditCard,
        completed: true
      })
    } else if (orderData.status === 'Rejected') {
      steps.push({
        key: 'rejected',
        label: 'Rejected',
        date: orderData.status_updated_at,
        icon: X,
        completed: true
      })
    } else if (orderData.deliveryOption === 'Delivery') {
      // On Delivery step for delivery orders
      const isDelivered = orderData.status === 'Claim Order' || orderData.status === 'Completed'
      steps.push({
        key: 'on-delivery',
        label: isDelivered ? 'Delivered' : 'On Delivery',
        date: ['On Delivery', 'Claim Order', 'Completed'].includes(orderData.status) ? orderData.status_updated_at : '',
        icon: Truck,
        completed: ['On Delivery', 'Claim Order', 'Completed'].includes(orderData.status)
      })
    } else {
      // Ready for pickup step for pick-up orders
      steps.push({
        key: 'ready-pickup',
        label: 'Ready for Pickup',
        date: ['Ready', 'Claim Order', 'Completed'].includes(orderData.status) ? orderData.status_updated_at : '',
        icon: MapPin,
        completed: ['Ready', 'Claim Order', 'Completed'].includes(orderData.status)
      })
    }

    // Order completed step
    steps.push({
      key: 'order-completed',
      label: 'Completed',
      date: orderData.completedDate,
      icon: CheckCircle,
      completed: orderData.status === 'Completed'
    })

    return steps
  }

  const formatPrice = (price: number) => `₱${price.toFixed(2)}`

  const handleRefundClick = () => {
    setShowRefundModal(true)
    setRefundStep(1)
  }

  const handleCloseRefundModal = () => {
    setShowRefundModal(false)
    setRefundStep(1)
    setSelectedReason('')
    setGcashNumber('')
    setConfirmGcashNumber('')
  }

  const handleProceedToCancel = () => {
    if (selectedReason) {
      setRefundStep(2)
    }
  }

  const handleConfirmCancel = () => {
    setRefundStep(3)
  }

  const handleGcashSubmit = async () => {
    if (gcashNumber && confirmGcashNumber && gcashNumber === confirmGcashNumber) {
      try {
        // Create refund request
        const { error: refundError } = await supabase
          .from('refund')
          .insert({
            order_id: orderId,
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
          .eq('order_id', orderId)

        if (orderError) throw orderError

        setRefundStep(4)
      } catch (error) {
        console.error('Error submitting refund:', error)
        showAlert('Failed to submit refund request', 'error')
      }
    }
  }

  const handleGoBackToOrder = () => {
    handleCloseRefundModal()
    // Optionally refresh order data
    fetchOrderData()
  }

  const getImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/api/placeholder/300/200'

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    const encodedFileName = encodeURIComponent(imageUrl)
    return `https://tvuawpgcpmqhsmwbwypy.supabase.co/storage/v1/object/public/menu-images/${encodedFileName}`
  }

  const handleOpenViewReceipt = () => {
    setShowViewReceiptModal(true)
  }

  const handleCloseViewReceipt = () => {
    setShowViewReceiptModal(false)
  }

  const handleOpenRefundDetails = () => {
    setShowRefundDetailsModal(true)
  }

  const handleCloseRefundDetails = () => {
    setShowRefundDetailsModal(false)
  }

  const handleConfirmPickup = async () => {
    try {
      // First, get the delivery_id from the order
      const { data: orderRecord, error: fetchError } = await supabase
        .from('order')
        .select('delivery_id')
        .eq('order_id', orderId)
        .single()

      if (fetchError) throw fetchError

      // Update order status to Completed
      const { error: orderError } = await supabase
        .from('order')
        .update({
          order_status: 'Completed',
          completed_date: new Date().toISOString()
        })
        .eq('order_id', orderId)

      if (orderError) throw orderError

      // Update delivery status to Completed if delivery_id exists
      if (orderRecord?.delivery_id) {
        const { error: deliveryError } = await supabase
          .from('delivery')
          .update({
            delivery_status: 'complete order',
            status_updated_at: new Date().toISOString()
          })
          .eq('delivery_id', orderRecord.delivery_id)

        if (deliveryError) throw deliveryError
      }

      showAlert('Order confirmed as completed!', 'success')
      await fetchOrderData() // Refresh the order data
    } catch (error) {
      console.error('Error confirming pickup:', error)
      showAlert('Failed to confirm pickup. Please try again.', 'error')
    }
  }

  const handleOpenTrackRider = async () => {
    if (!orderData?.riderId) {
      showAlert('Rider information not available', 'warning')
      return
    }

    try {
      // Fetch initial rider location
      const { data, error } = await supabase
        .from('rider_location')
        .select('*')
        .eq('rider_id', orderData.riderId)
        .single()

      if (error) throw error

      if (data) {
        const riderLoc = {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          updated_at: data.updated_at
        }
        setRiderLocation(riderLoc)
      }

      setShowTrackRiderModal(true)
    } catch (error) {
      console.error('Error fetching rider location:', error)
      showAlert('Unable to fetch rider location. Please try again.', 'error')
    }
  }

  const handleCloseTrackRider = () => {
    setShowTrackRiderModal(false)
    setRiderLocation(null)
  }

  // Initialize Google Maps
  useEffect(() => {
    if (!showTrackRiderModal || !orderData?.customer.latitude || !orderData?.customer.longitude) return

    const initMap = async () => {
      try {
        // Load Google Maps script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`
        script.async = true
        script.defer = true

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve()
          script.onerror = reject
          if (!document.querySelector(`script[src="${script.src}"]`)) {
            document.head.appendChild(script)
          } else {
            resolve()
          }
        })

        const mapElement = document.getElementById('track-rider-map')
        if (!mapElement) return

        const storeLocation = { lat: 14.818589037203248, lng: 121.05753223366108 }
        const customerLocation = { lat: orderData.customer.latitude!, lng: orderData.customer.longitude! }

        // Calculate center point between store and customer
        const centerLat = (storeLocation.lat + customerLocation.lat) / 2
        const centerLng = (storeLocation.lng + customerLocation.lng) / 2

        const newMap = new google.maps.Map(mapElement, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true
        })

        // Add store marker (green)
        new google.maps.Marker({
          position: storeLocation,
          map: newMap,
          title: 'Angieren\'s Lutong Bahay',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          }
        })

        // Add customer marker (red)
        new google.maps.Marker({
          position: customerLocation,
          map: newMap,
          title: 'Delivery Address',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        })

        // Add rider marker (blue) if rider location exists
        if (riderLocation) {
          new google.maps.Marker({
            position: { lat: riderLocation.latitude, lng: riderLocation.longitude },
            map: newMap,
            title: 'Rider Location',
            icon: {
              url: '/delivery-bike.png',
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20)
            }
          })
        }

        // Fetch and draw routes
        const fetchAndDrawRoutes = async () => {
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

            // If rider location exists, show rider to customer route
            if (riderLocation) {
              const riderLoc = { lat: riderLocation.latitude, lng: riderLocation.longitude }
              const riderToCustomerResponse = await fetch(
                `${backendUrl}/api/directions?origin=${riderLoc.lat},${riderLoc.lng}&destination=${customerLocation.lat},${customerLocation.lng}`
              )
              const riderToCustomerData = await riderToCustomerResponse.json()

              if (riderToCustomerData.routes && riderToCustomerData.routes.length > 0) {
                const riderToCustomerPolyline = riderToCustomerData.routes[0].overview_polyline.points
                const decodedRiderToCustomer = google.maps.geometry.encoding.decodePath(riderToCustomerPolyline)

                // Draw rider to customer route (blue solid line)
                new google.maps.Polyline({
                  path: decodedRiderToCustomer,
                  geodesic: true,
                  strokeColor: '#4285F4',
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                  map: newMap
                })
              }
            } else {
              // If no rider location yet, show the planned store to customer route
              const storeToCustomerResponse = await fetch(
                `${backendUrl}/api/directions?origin=${storeLocation.lat},${storeLocation.lng}&destination=${customerLocation.lat},${customerLocation.lng}`
              )
              const storeToCustomerData = await storeToCustomerResponse.json()

              if (storeToCustomerData.routes && storeToCustomerData.routes.length > 0) {
                const storeToCustomerPolyline = storeToCustomerData.routes[0].overview_polyline.points
                const decodedStoreToCustomer = google.maps.geometry.encoding.decodePath(storeToCustomerPolyline)

                // Draw store to customer route (orange dashed - planned route)
                new google.maps.Polyline({
                  path: decodedStoreToCustomer,
                  geodesic: true,
                  strokeColor: '#FF8C00',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  map: newMap,
                  icons: [{
                    icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
                    offset: '0',
                    repeat: '20px'
                  }]
                })
              }
            }
          } catch (error) {
            console.error('Error fetching routes:', error)
          }
        }

        await fetchAndDrawRoutes()
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    initMap()
  }, [showTrackRiderModal, orderData, riderLocation])

  // Real-time rider location tracking
  useEffect(() => {
    if (!showTrackRiderModal || !orderData?.riderId) return

    const subscription = supabase
      .channel('rider_location_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rider_location',
          filter: `rider_id=eq.${orderData.riderId}`
        },
        async (payload: any) => {
          console.log('Rider location updated:', payload)
          if (payload.new) {
            const newRiderLoc = {
              latitude: Number(payload.new.latitude),
              longitude: Number(payload.new.longitude),
              updated_at: payload.new.updated_at
            }
            setRiderLocation(newRiderLoc)

            // Update rider to store route (only update state, map will re-render)
            // The map will be redrawn by the main useEffect when riderLocation changes
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [showTrackRiderModal, orderData?.riderId])

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );

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

  const steps = orderData ? getProgressSteps() : []

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
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

        <main className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {!orderData ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
              <Link
                to="/customer-interface/order"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Orders
              </Link>
            </div>
          ) : (
            /* Main Content Card */
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-6 sm:px-8 py-6 sm:py-8 border-b border-orange-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link
                      to="/customer-interface/order"
                      className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:scale-105"
                    >
                      <ArrowLeft className="w-5 h-5 text-amber-700" />
                    </Link>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          Order {orderData.orderNumber}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${orderData.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          orderData.status === 'Rejected' || orderData.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            orderData.status === 'Refunding' || orderData.status === 'Refund' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                          {orderData.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Placed on {orderData.orderPlacedDate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {orderData.proofOfPaymentUrl && (
                      <button
                        onClick={handleOpenViewReceipt}
                        className="flex items-center gap-2 bg-white border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-all shadow-sm hover:shadow-md"
                      >
                        <Receipt className="w-4 h-4" />
                        View Receipt
                      </button>
                    )}
                    {(orderData.status === 'Refund' || orderData.status === 'Rejected') && orderData.refundData?.response && (
                      <button
                        onClick={handleOpenRefundDetails}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${orderData.status === 'Refund'
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                      >
                        <FileText className="w-4 h-4" />
                        {orderData.status === 'Refund' ? 'Refund' : 'Rejection'} Details
                      </button>
                    )}
                    {orderData.status === 'Rejected' && orderData.rejectionData?.reason && !orderData.refundData?.response && (
                      <button
                        onClick={handleOpenRefundDetails}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                      >
                        <FileText className="w-4 h-4" />
                        Rejection Details
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="px-6 sm:px-8 py-8 sm:py-10 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Progress</h3>
                <div className="flex items-start justify-between relative overflow-x-auto pb-4">
                  {/* Background connector line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 hidden sm:block z-0" style={{ marginLeft: '3rem', marginRight: '3rem' }} />

                  {steps.map((step, index) => {
                    const IconComponent = step.icon
                    const isCompleted = step.completed
                    const isFirst = index === 0
                    // Find the index of the first uncompleted step to determine which one is truly "current"
                    const firstUncompletedIndex = steps.findIndex(s => !s.completed)
                    // Only the first uncompleted step should be marked as current (if any exists)
                    const isCurrent = !isCompleted && index === firstUncompletedIndex
                    // Check if the previous step is completed (for connector line coloring)
                    const prevStepCompleted = index > 0 && steps[index - 1]?.completed

                    return (
                      <div key={step.key} className="flex flex-col items-center flex-1 min-w-[100px] relative">
                        {/* Connector line BEFORE this step (from previous step) */}
                        {!isFirst && (
                          <div className={`hidden sm:block absolute top-6 right-1/2 w-full h-1 transition-colors duration-300 z-0 ${prevStepCompleted ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-transparent'
                            }`} style={{ transform: 'translateX(-50%)' }} />
                        )}

                        {/* Step Circle */}
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-10 ${isCompleted
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-100'
                          : isCurrent
                            ? 'bg-white border-4 border-amber-400 text-amber-500 animate-pulse'
                            : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                          }`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>

                        {/* Step Label & Date */}
                        <div className="text-center mt-3 px-2">
                          <div className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : isCurrent ? 'text-amber-600' : 'text-gray-400'
                            }`}>
                            {step.label}
                          </div>
                          {step.date && (
                            <div className="text-xs text-gray-500 mt-1 max-w-[120px]">
                              {step.date}
                            </div>
                          )}

                          {/* Action Buttons */}
                          {step.key === 'placed' && orderData.status === 'Pending' && (
                            <button
                              onClick={handleRefundClick}
                              className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-xs rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              Cancel Order
                            </button>
                          )}

                          {step.key === 'queuing' && orderData.status === 'Queueing' && (
                            <button
                              onClick={handleRefundClick}
                              className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-xs rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              Request Refund
                            </button>
                          )}

                          {step.key === 'on-delivery' && orderData.status === 'On Delivery' && (
                            <button
                              onClick={handleOpenTrackRider}
                              className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 text-xs rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 mx-auto"
                            >
                              <Navigation className="h-3.5 w-3.5" />
                              Track Rider
                            </button>
                          )}

                          {(step.key === 'order-completed' || step.key === 'ready-pickup') && orderData.status === 'Claim Order' && (
                            <div className="mt-3 flex flex-col gap-2">
                              <button
                                onClick={handleConfirmPickup}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 text-xs rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                              >
                                Confirm Received
                              </button>
                              <button
                                onClick={() => showAlert('Report feature - to be implemented', 'info')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-xs rounded-lg font-semibold transition-all"
                              >
                                Report Issue
                              </button>
                            </div>
                          )}

                          {step.key === 'order-completed' && orderData.status === 'Completed' && (
                            <Link
                              to="/customer-interface/feedback"
                              className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-amber-900 px-4 py-2 text-xs rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Rate Order
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Content */}
              <div className="px-6 sm:px-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Customer & Order Info */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-bold text-gray-900">Customer Info</h3>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-semibold text-gray-900">{orderData.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-semibold text-gray-900">{orderData.customer.phone}</p>
                        </div>
                        {orderData.deliveryOption === 'Delivery' && orderData.customer.address && (
                          <div>
                            <p className="text-sm text-gray-500">Delivery Address</p>
                            <p className="font-semibold text-gray-900 text-sm leading-relaxed">{orderData.customer.address}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-900">Order Details</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Type</span>
                          <span className="font-semibold text-gray-900 text-sm bg-white px-3 py-1 rounded-full">
                            {orderData.deliveryOption}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Payment</span>
                          <span className="font-semibold text-gray-900 text-sm">{orderData.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Schedule</span>
                          <span className="font-semibold text-gray-900 text-sm text-right">
                            {orderData.pickDate}<br />
                            <span className="text-amber-600">{orderData.pickTime}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-5">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
                    </div>
                    <div className="space-y-4">
                      {orderData.items.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                          <div className="flex gap-4">
                            {/* Item image */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Item details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-gray-900 text-base sm:text-lg">
                                  {item.name}
                                </h4>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-gray-500">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                                  <p className="font-bold text-amber-600 text-lg">{formatPrice(item.price)}</p>
                                </div>
                              </div>

                              <div className="mt-2 space-y-1">
                                {item.size && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Size:</span> {item.size}
                                  </p>
                                )}
                                {item.inclusions.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Includes:</span> {item.inclusions.join(', ')}
                                  </p>
                                )}
                                {item.addOns !== 'None' && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">Add-ons:</span> {item.addOns}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Special Instructions */}
                      {orderData.specialInstructions && orderData.specialInstructions !== 'None' && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-blue-900 text-sm">Special Instructions</p>
                              <p className="text-blue-700 text-sm mt-1">{orderData.specialInstructions}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pricing Summary */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(orderData.pricing.subtotal)}
                            </span>
                          </div>
                          {orderData.deliveryOption === 'Delivery' && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Delivery Fee</span>
                              <span className="font-semibold text-gray-900">
                                {formatPrice(orderData.pricing.deliveryFee)}
                              </span>
                            </div>
                          )}
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Total</span>
                              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                                {formatPrice(orderData.pricing.total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End of Main Content Card */}
            </div>
          )}
        </main>

        {/* REFUND MODAL */}
        {showRefundModal && orderData && (
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
                      Are you sure you want to cancel Order {orderData.orderNumber}?
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
                          const value = e.target.value.replace(/\D/g, '');
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
                          const value = e.target.value.replace(/\D/g, '');
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

        {/* View Receipt Modal */}
        {showViewReceiptModal && orderData && orderData.proofOfPaymentUrl && (
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
                  src={orderData.proofOfPaymentUrl}
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

        {/* View Refund Details Modal */}
        {showRefundDetailsModal && orderData && (orderData.refundData || orderData.rejectionData) && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className={`p-4 border-b ${orderData.status === 'Refund' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'} flex items-center justify-between`}>
                <h2 className={`text-xl font-bold ${orderData.status === 'Refund' ? 'text-green-800' : 'text-red-800'}`}>
                  {orderData.status === 'Refund' ? 'Refund Approved' : orderData.status === 'Rejected' ? 'Order Rejected' : 'Refund Rejected'}
                </h2>
                <button
                  onClick={handleCloseRefundDetails}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-auto max-h-[calc(90vh-180px)]">
                {/* Response/Reason Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {orderData.status === 'Rejected' && orderData.rejectionData ? 'Rejection Reason' : 'Staff Response'}
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {orderData.status === 'Rejected' && orderData.rejectionData
                        ? orderData.rejectionData.reason
                        : orderData.refundData?.response}
                    </p>
                  </div>
                </div>

                {/* Proof of Refund Image - Show for approved refunds */}
                {orderData.status === 'Refund' && orderData.refundData?.proofOfRefundUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Proof of Refund</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={orderData.refundData.proofOfRefundUrl}
                        alt="Proof of Refund"
                        className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(orderData.refundData!.proofOfRefundUrl!, '_blank')}
                      />
                      <p className="text-xs text-gray-500 text-center py-2 bg-gray-50">Click image to view full size</p>
                    </div>
                  </div>
                )}

                {/* Proof of Return Payment - Show for rejected orders */}
                {orderData.status === 'Rejected' && orderData.rejectionData?.proofOfRefundUrl && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Proof of Payment Return</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={orderData.rejectionData.proofOfRefundUrl}
                        alt="Proof of Payment Return"
                        className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(orderData.rejectionData!.proofOfRefundUrl!, '_blank')}
                      />
                      <p className="text-xs text-gray-500 text-center py-2 bg-gray-50">Click image to view full size</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleCloseRefundDetails}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Track Rider Modal */}
        {showTrackRiderModal && orderData && orderData.customer.latitude && orderData.customer.longitude && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-amber-800 text-white">
                <div className="flex items-center gap-2">
                  <Navigation className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Track Rider - Order {orderData.orderNumber}</h2>
                </div>
                <button
                  onClick={handleCloseTrackRider}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-700">Store Location</p>
                      <p className="text-gray-600">Angieren's Lutong Bahay</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-700">Delivery Address</p>
                      <p className="text-gray-600">{orderData.customer.address}</p>
                    </div>
                  </div>
                </div>
                {riderLocation && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Rider location updated: {new Date(riderLocation.updated_at).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              <div id="track-rider-map" className="h-[500px] w-full relative"></div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <span>Store</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                      <span>Rider</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                      <span>Destination</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseTrackRider}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <CustomerFooter />

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}

        {/* Alert Modal */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={closeAlert}
          message={alertModal.message}
          type={alertModal.type}
          title={alertModal.title}
        />
      </div>
    </ProtectedRoute>
  )
}