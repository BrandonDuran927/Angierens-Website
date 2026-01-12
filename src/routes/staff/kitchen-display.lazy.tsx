import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
    Package,
    Truck,
    Calendar,
    Settings,
    User,
    DollarSign,
    Star,
    LogOut,
    Menu,
    Clock,
    ChefHat,
    Flame,
    CheckCircle,
    Bell,
    RefreshCw,
    Maximize,
    Minimize,
    AlertCircle,
    X,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'

export const Route = createLazyFileRoute('/staff/kitchen-display')({
    component: KitchenDisplay,
})

interface KitchenOrder {
    order_id: string
    order_number: number
    order_status: string
    order_type: string
    created_at: string
    status_updated_at: string | null
    additional_information: string | null
    customer_name: string
    items: {
        name: string
        quantity: number
        inclusions: string[]
        addOns: string[]
    }[]
}

type UserProfile = {
    user_uid: string
    first_name: string
    last_name: string
    phone_number: string
    user_role: string
    is_active: boolean
    email: string
}

function KitchenDisplay() {
    const navigate = useNavigate()
    const { user, signOut } = useUser()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [orders, setOrders] = useState<KitchenOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(15) // seconds
    const [soundEnabled, setSoundEnabled] = useState(true)
    // Local state for tracking checked items in Cooking status (Order ID -> Check Key -> Boolean)
    const [checkedState, setCheckedState] = useState<Record<string, Record<string, boolean>>>({})

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

    // Helper to toggle check for any key (item index or specific sub-item key)
    const handleCheckToggle = (orderId: string, key: string) => {
        setCheckedState(prev => {
            const orderChecks = prev[orderId] || {}
            return {
                ...prev,
                [orderId]: {
                    ...orderChecks,
                    [key]: !orderChecks[key]
                }
            }
        })
    }

    // Helper to toggle main item and all its inclusions/add-ons
    const handleMainItemToggle = (orderId: string, mainKey: string, item: { inclusions: string[], addOns: string[] }) => {
        setCheckedState(prev => {
            const orderChecks = prev[orderId] || {}
            const isMainChecked = !!orderChecks[mainKey]
            const newStatus = !isMainChecked

            const newOrderChecks = { ...orderChecks }
            
            // Toggle main item
            newOrderChecks[mainKey] = newStatus

            // Toggle all inclusions
            item.inclusions.forEach((_, idx) => {
                newOrderChecks[`${mainKey}-inc-${idx}`] = newStatus
            })

            // Toggle all add-ons
            item.addOns.forEach((_, idx) => {
                newOrderChecks[`${mainKey}-ao-${idx}`] = newStatus
            })

            return {
                ...prev,
                [orderId]: newOrderChecks
            }
        })
    }

    // Helper to update order status
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('order')
                .update({
                    order_status: newStatus,
                    status_updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId)

            if (error) throw error

            fetchKitchenOrders()
        } catch (error) {
            console.error('Error updating status:', error)
            showAlert('Failed to update status', 'error')
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

    async function handleLogout() {
        await signOut()
        navigate({ to: '/login' })
    }

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('user_uid', user.id)
                .single()
            if (!error && data) {
                setProfile(data)
            }
        }
        fetchProfile()
    }, [user])

    // Fetch kitchen orders
    const fetchKitchenOrders = useCallback(async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('order')
                .select(`
                    order_id,
                    order_number,
                    order_status,
                    order_type,
                    created_at,
                    status_updated_at,
                    additional_information,
                    customer:users!customer_uid(first_name, last_name),
                    order_item(
                        quantity,
                        menu:menu(name, inclusion),
                        order_item_add_on(
                            quantity,
                            add_on:add_on(name)
                        )
                    )
                `)
                .in('order_status', ['Queueing', 'Preparing', 'Cooking', 'Ready'])
                .order('created_at', { ascending: true })

            if (error) throw error

            const transformedOrders: KitchenOrder[] = (data || []).map((order: any) => ({
                order_id: order.order_id,
                order_number: order.order_number,
                order_status: order.order_status,
                order_type: order.order_type,
                created_at: order.created_at,
                status_updated_at: order.status_updated_at,
                additional_information: order.additional_information,
                customer_name: order.customer
                    ? `${order.customer.first_name} ${order.customer.last_name}`
                    : 'Unknown',
                items: order.order_item?.map((item: any) => ({
                    name: item.menu?.name || 'Unknown Item',
                    quantity: item.quantity,
                    inclusions: item.menu?.inclusion
                        ? item.menu.inclusion.split(',').map((i: string) => i.trim())
                        : [],
                    addOns: item.order_item_add_on?.map((ao: any) =>
                        `${ao.add_on?.name || 'Add-on'} x${ao.quantity}`
                    ) || []
                })) || []
            }))

            setOrders(transformedOrders)
            setLastRefresh(new Date())
        } catch (error) {
            console.error('Error fetching kitchen orders:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchKitchenOrders()
    }, [fetchKitchenOrders])

    // Auto-refresh interval
    useEffect(() => {
        const interval = setInterval(() => {
            fetchKitchenOrders()
        }, autoRefreshInterval * 1000)

        return () => clearInterval(interval)
    }, [autoRefreshInterval, fetchKitchenOrders])

    // Real-time subscription for order changes
    useEffect(() => {
        const subscription = supabase
            .channel('kitchen-orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'order',
                    filter: 'order_status=in.(Queueing,Preparing,Cooking,Ready)'
                },
                (payload) => {
                    console.log('Order change:', payload)
                    fetchKitchenOrders()
                    // Play sound for new orders if enabled
                    if (soundEnabled && payload.eventType === 'INSERT') {
                        playNotificationSound()
                    }
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchKitchenOrders, soundEnabled])

    const playNotificationSound = () => {
        // Simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
        } catch (e) {
            console.log('Could not play notification sound')
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const getTimeElapsed = (dateString: string) => {
        const now = new Date()
        const orderTime = new Date(dateString)
        const diffMs = now.getTime() - orderTime.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins} min ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`
        return `${Math.floor(diffHours / 24)}d ago`
    }

    const getUrgencyColor = (dateString: string) => {
        const now = new Date()
        const orderTime = new Date(dateString)
        const diffMins = Math.floor((now.getTime() - orderTime.getTime()) / 60000)

        if (diffMins < 10) return 'border-green-500 bg-green-50'
        if (diffMins < 20) return 'border-yellow-500 bg-yellow-50'
        if (diffMins < 30) return 'border-orange-500 bg-orange-50'
        return 'border-red-500 bg-red-50 animate-pulse'
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Queueing':
                return <Clock className="w-6 h-6 text-purple-600" />
            case 'Preparing':
                return <ChefHat className="w-6 h-6 text-orange-600" />
            case 'Cooking':
                return <Flame className="w-6 h-6 text-red-600" />
            case 'Ready':
                return <CheckCircle className="w-6 h-6 text-green-600" />
            default:
                return <Clock className="w-6 h-6 text-gray-600" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Queueing':
                return 'bg-purple-100 text-purple-800 border-purple-300'
            case 'Preparing':
                return 'bg-orange-100 text-orange-800 border-orange-300'
            case 'Cooking':
                return 'bg-red-100 text-red-800 border-red-300'
            case 'Ready':
                return 'bg-green-100 text-green-800 border-green-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    // Group orders by status
    const queueingOrders = orders.filter(o => o.order_status === 'Queueing')
    const preparingOrders = orders.filter(o => o.order_status === 'Preparing')
    const cookingOrders = orders.filter(o => o.order_status === 'Cooking')
    const readyOrders = orders.filter(o => o.order_status === 'Ready')

    const OrderCard = ({ order }: { order: KitchenOrder }) => {
        const isCooking = order.order_status === 'Cooking'
        const orderChecks = checkedState[order.order_id] || {}

        // Check if all items AND their includes/add-ons are checked
        const allItemsChecked = order.items.length > 0 && order.items.every((item, idx) => {
            const mainKey = `item-${idx}`
            const isMainChecked = !!orderChecks[mainKey]

            const areIncludesChecked = item.inclusions.every((_, incIdx) =>
                !!orderChecks[`${mainKey}-inc-${incIdx}`]
            )

            // Assuming add-ons should also be checked if they exist
            const areAddonsChecked = item.addOns.every((_, aoIdx) =>
                !!orderChecks[`${mainKey}-ao-${aoIdx}`]
            )

            return isMainChecked && areIncludesChecked && areAddonsChecked
        })

        return (
            <div className={`rounded-2xl border-4 p-4 shadow-lg transition-all ${getUrgencyColor(order.created_at)}`}>
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-gray-900">
                            #{String(order.order_number).padStart(2, '0')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(order.order_status)}
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.order_type === 'Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {order.order_type}
                        </span>
                    </div>
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{getTimeElapsed(order.created_at)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{order.customer_name}</span>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                    {order.items.map((item, idx) => {
                        const mainKey = `item-${idx}`
                        const isMainChecked = !!orderChecks[mainKey]

                        return (
                            <div
                                key={idx}
                                className={`bg-white rounded-lg p-3 border transition-colors ${isCooking && isMainChecked ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox for Main Item */}
                                    {isCooking && (
                                        <div className="mt-1 flex-shrink-0 cursor-pointer" onClick={() => handleMainItemToggle(order.order_id, mainKey, item)}>
                                            <div className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-colors ${isMainChecked
                                                ? 'bg-green-500 border-green-600 text-white'
                                                : 'bg-white border-gray-300 hover:border-green-400'
                                                }`}>
                                                {isMainChecked && <CheckCircle className="w-6 h-6" />}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-amber-600">{item.quantity}x</span>
                                            <span className={`text-lg font-semibold ${isCooking && isMainChecked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                                {item.name}
                                            </span>
                                        </div>

                                        {/* Includes with Checkboxes */}
                                        {item.inclusions.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-sm font-medium text-amber-800 block mb-1">Includes:</span>
                                                <div className="space-y-1 ml-1">
                                                    {item.inclusions.map((inc, i) => {
                                                        const incKey = `${mainKey}-inc-${i}`
                                                        const isIncChecked = !!orderChecks[incKey]

                                                        return (
                                                            <div
                                                                key={i}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    if (isCooking) handleCheckToggle(order.order_id, incKey)
                                                                }}
                                                            >
                                                                {isCooking ? (
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isIncChecked
                                                                        ? 'bg-green-500 border-green-600 text-white'
                                                                        : 'bg-white border-gray-300'
                                                                        }`}>
                                                                        {isIncChecked && <CheckCircle className="w-3.5 h-3.5" />}
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                                )}
                                                                <span className={`text-sm ${isCooking && isIncChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                                    {inc}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add-ons with Checkboxes */}
                                        {item.addOns.length > 0 && (
                                            <div className="mt-2">
                                                <span className="text-sm font-medium text-amber-700 block mb-1">Add-ons:</span>
                                                <div className="space-y-1 ml-1">
                                                    {item.addOns.map((addon, i) => {
                                                        const aoKey = `${mainKey}-ao-${i}`
                                                        const isAoChecked = !!orderChecks[aoKey]
                                                        const addonText = addon.replace('Add-on', '').trim() || addon

                                                        return (
                                                            <div
                                                                key={i}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    if (isCooking) handleCheckToggle(order.order_id, aoKey)
                                                                }}
                                                            >
                                                                {isCooking ? (
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${isAoChecked
                                                                        ? 'bg-green-500 border-green-600 text-white'
                                                                        : 'bg-white border-gray-300'
                                                                        }`}>
                                                                        {isAoChecked && <CheckCircle className="w-3.5 h-3.5" />}
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                                                )}
                                                                <span className={`text-sm ${isCooking && isAoChecked ? 'text-gray-400 line-through' : 'text-amber-900'}`}>
                                                                    {addonText}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Special Instructions */}
                {order.additional_information && order.additional_information !== 'None' && (
                    <div className="mt-3 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-yellow-800">Special Instructions:</p>
                                <p className="text-sm text-yellow-700">{order.additional_information}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions for Cooking Orders */}
                {isCooking && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (allItemsChecked) {
                                    updateOrderStatus(order.order_id, 'Ready')
                                }
                            }}
                            disabled={!allItemsChecked}
                            className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${allItemsChecked
                                ? 'bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-[1.02]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle className="w-6 h-6" />
                            {allItemsChecked ? 'Mark as Ready' : 'Check All Items First'}
                        </button>
                    </div>
                )}
            </div>
        )
    }

    const OrderColumn = ({ title, orders, icon, bgColor }: {
        title: string
        orders: KitchenOrder[]
        icon: React.ReactNode
        bgColor: string
    }) => (
        <div className={`flex flex-col h-full rounded-2xl ${bgColor} p-4`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                </div>
                <span className="bg-white px-3 py-1 rounded-full text-lg font-bold shadow">
                    {orders.length}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {orders.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500">
                        No orders
                    </div>
                ) : (
                    orders.map(order => (
                        <OrderCard key={order.order_id} order={order} />
                    ))
                )}
            </div>
        </div>
    )

    return (
        <ProtectedRoute allowedRoles={['staff']}>
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
                                className="lg:hidden p-2 hover:bg-amber-700 rounded-lg"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b-2 border-amber-600">
                        <h3 className="font-bold text-lg text-amber-900">
                            {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
                        </h3>
                        <p className="text-sm text-amber-800">{profile?.phone_number || ''}</p>
                        <p className="text-sm text-amber-800">{profile?.email || ''}</p>
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
                                    <h1 className="text-xl lg:text-3xl font-bold">KITCHEN DISPLAY</h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-6">
                                <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Date: {getCurrentDate()}</span>
                                <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">Time: {getCurrentTime()}</span>

                                {/* Kitchen Display Controls */}
                                <div className="flex items-center gap-2">
                                    {/* Refresh Button */}
                                    <button
                                        onClick={fetchKitchenOrders}
                                        disabled={loading}
                                        className="p-2 bg-yellow-400 text-amber-900 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
                                        title="Refresh Orders"
                                    >
                                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                                    </button>

                                    {/* Sound Toggle */}
                                    <button
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className={`p-2 rounded-lg transition-colors ${soundEnabled
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-400 text-white hover:bg-gray-500'
                                            }`}
                                        title={soundEnabled ? 'Sound On' : 'Sound Off'}
                                    >
                                        <Bell className="h-5 w-5" />
                                    </button>

                                    {/* Fullscreen Toggle */}
                                    <button
                                        onClick={toggleFullscreen}
                                        className="p-2 bg-yellow-400 text-amber-900 rounded-lg hover:bg-yellow-300 transition-colors"
                                        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                                    >
                                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                                    </button>

                                    {/* Auto-refresh selector */}
                                    <select
                                        value={autoRefreshInterval}
                                        onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                                        className="hidden sm:block px-3 py-2 bg-yellow-400 text-amber-900 border-0 rounded-lg text-sm font-semibold"
                                    >
                                        <option value={10}>10s</option>
                                        <option value={15}>15s</option>
                                        <option value={30}>30s</option>
                                        <option value={60}>60s</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Orders Grid */}
                    <div className="flex-1 p-4 overflow-hidden">
                        {loading && orders.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <RefreshCw className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg">Loading orders...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-full">
                                <OrderColumn
                                    title="In Queue"
                                    orders={queueingOrders}
                                    icon={<Clock className="w-6 h-6 text-purple-600" />}
                                    bgColor="bg-purple-50"
                                />
                                <OrderColumn
                                    title="Preparing"
                                    orders={preparingOrders}
                                    icon={<ChefHat className="w-6 h-6 text-orange-600" />}
                                    bgColor="bg-orange-50"
                                />
                                <OrderColumn
                                    title="Cooking"
                                    orders={cookingOrders}
                                    icon={<Flame className="w-6 h-6 text-red-600" />}
                                    bgColor="bg-red-50"
                                />
                                <OrderColumn
                                    title="Ready"
                                    orders={readyOrders}
                                    icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                                    bgColor="bg-green-50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer Stats */}
                    <footer className="bg-white border-t border-gray-200 px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span className="text-gray-600">Queue: <strong>{queueingOrders.length}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                    <span className="text-gray-600">Preparing: <strong>{preparingOrders.length}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-gray-600">Cooking: <strong>{cookingOrders.length}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-gray-600">Ready: <strong>{readyOrders.length}</strong></span>
                                </div>
                            </div>
                            <div className="text-gray-500">
                                Total Active Orders: <strong className="text-amber-600">{orders.length}</strong>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Custom Scrollbar Styles */}
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(0, 0, 0, 0.05);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(0, 0, 0, 0.3);
                    }
                `}</style>

                {/* Alert Modal */}
                <AlertModal
                    isOpen={alertModal.isOpen}
                    onClose={closeAlert}
                    title={alertModal.title}
                    message={alertModal.message}
                    type={alertModal.type}
                />
            </div>
        </ProtectedRoute>
    )
}