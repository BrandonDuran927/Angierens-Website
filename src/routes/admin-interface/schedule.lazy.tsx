import { createLazyFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard, LucideCalendar, ShoppingCart, TrendingUp, MessageSquare, Users, Menu as MenuIcon, RefreshCw, LogOut, Bell, ChevronLeft, ChevronRight, Clock, Truck, X
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'

export const Route = createLazyFileRoute('/admin-interface/schedule')({
    component: RouteComponent,
})

interface DayData {
    date: number
    orders: number
    isAvailable: boolean
    isToday?: boolean
    isSelected?: boolean
    isPastMonth?: boolean
    isFutureMonth?: boolean
    scheduleId?: string
    maxOrders?: number
}

interface StaffMember {
    id: string
    name: string
    time: string
    color: string
}

interface TimeSlot {
    hour: string
    period: string
    isAvailable: boolean
}

interface Order {
    order_id: string
    customer_uid: string
    schedule_id: string
    order_status: string
    created_at: string
    users: {
        first_name: string
        last_name: string
    } | null
    schedule: {
        schedule_time: string
    } | null
}

interface ScheduleData {
    schedule_id: string
    schedule_date: string
    schedule_time: string
    max_orders: number
    is_available: boolean
    order_count: number
}

function RouteComponent() {
    const { user, signOut } = useUser()
    const navigate = useNavigate();

    // Alert Modal State
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        message: string;
        type: AlertType;
        title?: string;
    }>({ isOpen: false, message: '', type: 'info' })

    const showAlert = (message: string, type: AlertType, title?: string) => {
        setAlertModal({ isOpen: true, message, type, title })
    }

    const closeAlert = () => {
        setAlertModal(prev => ({ ...prev, isOpen: false }))
    }

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const location = useLocation()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date().getDate())
    const [selectedMonth, setSelectedMonth] = useState(`${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`)
    const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])
    const [ordersForSelectedDate, setOrdersForSelectedDate] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)

    const sidebarItems = [
        {
            icon: LayoutDashboard,
            label: 'Dashboard',
            route: '/admin-interface/'
        },
        {
            icon: ShoppingCart,
            label: 'Orders',
            route: '/admin-interface/orders'
        },
        {
            icon: TrendingUp,
            label: 'Sales',
            route: '/admin-interface/sales'
        },
        {
            icon: MessageSquare,
            label: 'Reviews',
            route: '/admin-interface/reviews'
        },
        {
            icon: Users,
            label: 'Employee',
            route: '/admin-interface/employee'
        },
        {
            icon: MenuIcon,
            label: 'Menu',
            route: '/admin-interface/menu'
        },
        {
            icon: RefreshCw,
            label: 'Refund',
            route: '/admin-interface/refund'
        },
        {
            icon: LucideCalendar,
            label: 'Schedule',
            route: '/admin-interface/schedule'
        }
    ]


    const colors = [
        'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400',
        'bg-pink-400', 'bg-indigo-400', 'bg-yellow-400', 'bg-teal-400'
    ]

    // Helper function to check if a date is in the past
    const isDateInPast = (year: number, month: number, day: number): boolean => {
        const selectedDateTime = new Date(year, month, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDateTime.setHours(0, 0, 0, 0)
        return selectedDateTime < today
    }

    // Fetch schedule data from Supabase
    const fetchScheduleData = async (year: number, month: number) => {
        try {
            setLoading(true)
            const firstDay = new Date(year, month, 1)
            const lastDay = new Date(year, month + 1, 0)

            const startDate = firstDay.toISOString().split('T')[0]
            const endDate = lastDay.toISOString().split('T')[0]

            // Fetch schedules for the month
            const { data: schedules, error: scheduleError } = await supabase
                .from('schedule')
                .select('*')
                .gte('schedule_date', startDate)
                .lte('schedule_date', endDate)

            if (scheduleError) throw scheduleError

            // Fetch ALL orders that match the schedule_ids (don't filter by created_at)
            const scheduleIds = schedules?.map(s => s.schedule_id) || []

            let orderCounts: Record<string, number> = {}

            if (scheduleIds.length > 0) {
                const { data: orders, error: orderError } = await supabase
                    .from('order')
                    .select('schedule_id')
                    .in('schedule_id', scheduleIds)

                if (orderError) throw orderError

                // Count orders per schedule
                orderCounts = orders.reduce((acc: Record<string, number>, order) => {
                    acc[order.schedule_id] = (acc[order.schedule_id] || 0) + 1
                    return acc
                }, {})
            }

            // Combine schedule data with order counts
            const enrichedSchedules = schedules?.map(schedule => ({
                ...schedule,
                order_count: orderCounts[schedule.schedule_id] || 0
            })) || []

            setScheduleData(enrichedSchedules)
        } catch (error) {
            console.error('Error fetching schedule data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch orders for selected date
    const fetchOrdersForDate = async (year: number, month: number, day: number) => {
        try {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

            const { data: schedules, error: scheduleError } = await supabase
                .from('schedule')
                .select('schedule_id')
                .eq('schedule_date', dateStr)

            if (scheduleError) throw scheduleError

            if (schedules && schedules.length > 0) {
                const scheduleIds = schedules.map(s => s.schedule_id)
                setSelectedScheduleId(schedules[0].schedule_id)

                const { data: orders, error: orderError } = await supabase
                    .from('order')
                    .select(`
                    order_id,
                    customer_uid,
                    schedule_id,
                    order_status,
                    created_at,
                    users!order_customer_uid_fkey (
                        first_name,
                        last_name
                    ),
                    schedule!order_schedule_id_fkey (
                        schedule_time
                    )
                `)
                    .in('schedule_id', scheduleIds)

                if (orderError) throw orderError

                // Transform the data to match the Order interface
                const transformedOrders: Order[] = (orders || []).map(order => ({
                    order_id: order.order_id,
                    customer_uid: order.customer_uid,
                    schedule_id: order.schedule_id,
                    order_status: order.order_status,
                    created_at: order.created_at,
                    users: Array.isArray(order.users) ? order.users[0] || null : order.users,
                    schedule: Array.isArray(order.schedule) ? order.schedule[0] || null : order.schedule
                }))

                console.log('Fetched Orders:', transformedOrders)

                setOrdersForSelectedDate(transformedOrders)
            } else {
                setOrdersForSelectedDate([])
                setSelectedScheduleId(null)
            }
        } catch (error) {
            console.error('Error fetching orders for date:', error)
            setOrdersForSelectedDate([])
        }
    }

    useEffect(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        fetchScheduleData(year, month)
    }, [currentDate])

    useEffect(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        fetchOrdersForDate(year, month, selectedDate)
    }, [selectedDate, currentDate])

    const generateTimeSlots = (): TimeSlot[] => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`

        // Get all schedules for the selected date
        const schedulesForDate = scheduleData.filter(s => s.schedule_date === dateStr)

        if (schedulesForDate.length === 0) {
            return []
        }

        // Map schedules to time slots
        const slots: TimeSlot[] = schedulesForDate.map(schedule => {
            // Parse the time (assuming format like "14:00:00" or "09:00:00")
            const timeParts = schedule.schedule_time.split(':')
            let hour = parseInt(timeParts[0])
            const minute = timeParts[1] || '00'

            const period = hour < 12 ? 'AM' : 'PM'
            const displayHour = hour === 0 ? 12 : (hour <= 12 ? hour : hour - 12)

            return {
                hour: `${displayHour}:${minute}`,
                period,
                isAvailable: schedule.is_available
            }
        })

        // Sort by time
        return slots.sort((a, b) => {
            const timeA = a.period === 'AM' ? parseInt(a.hour) : parseInt(a.hour) + 12
            const timeB = b.period === 'AM' ? parseInt(b.hour) : parseInt(b.hour) + 12
            return timeA - timeB
        })
    }

    const timeSlots = generateTimeSlots()

    const generateCalendarData = (): DayData[] => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const calendarData: DayData[] = []

        // Previous month days
        const prevMonth = new Date(year, month - 1, 0)
        const prevMonthDays = prevMonth.getDate()
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            calendarData.push({
                date: prevMonthDays - i,
                orders: 0,
                isAvailable: false,
                isPastMonth: true
            })
        }

        // Current month days - get data from Supabase
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

            // Get all schedules for this date (there might be multiple time slots)
            const schedulesForDay = scheduleData.filter(s => s.schedule_date === dateStr)

            // Sum up all orders from all schedules for this date
            const totalOrders = schedulesForDay.reduce((sum, schedule) => sum + (schedule.order_count || 0), 0)

            // Get the first schedule for availability and max orders (or defaults)
            const firstSchedule = schedulesForDay[0]

            const today = new Date()
            const isToday = day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()

            calendarData.push({
                date: day,
                orders: totalOrders,
                isAvailable: firstSchedule?.is_available || false,
                isToday: isToday,
                isSelected: day === selectedDate,
                scheduleId: firstSchedule?.schedule_id,
                maxOrders: firstSchedule?.max_orders || 30
            })
        }

        // Next month days to fill the grid
        const totalCells = 42 // 6 weeks * 7 days
        const remainingCells = totalCells - calendarData.length
        for (let day = 1; day <= remainingCells; day++) {
            calendarData.push({
                date: day,
                orders: 0,
                isAvailable: false,
                isFutureMonth: true
            })
        }

        return calendarData
    }

    const calendarData = generateCalendarData()

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1)
        } else {
            newDate.setMonth(newDate.getMonth() + 1)
        }
        setCurrentDate(newDate)
        setSelectedMonth(`${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}`)
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

    // Get selected day data
    const selectedDayData = calendarData.find(day =>
        day.date === selectedDate && !day.isPastMonth && !day.isFutureMonth
    )

    // Convert orders to staff member format for display
    const customerOrders: StaffMember[] = ordersForSelectedDate.map((order, index) => {
        const time = order.schedule?.schedule_time
            ? new Date(`2000-01-01T${order.schedule.schedule_time}`).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            : 'N/A'

        return {
            id: order.order_id,
            name: `${order.users?.first_name || 'Unknown'} ${order.users?.last_name || 'Customer'}`,
            time: time,
            color: colors[index % colors.length]
        }
    })

    // Sample notifications
    const notifications = [
        {
            id: 1,
            title: 'Staff updated schedule availability',
            time: '2 minutes ago',
            icon: 'calendar',
        },
        {
            id: 2,
            title: 'Order limit reached for today',
            time: '15 minutes ago',
            icon: 'check',
        },
        {
            id: 3,
            title: 'Schedule conflict detected',
            time: '30 minutes ago',
            icon: 'clock',
        },
    ]

    const notificationCount = notifications.length

    const getNotificationIcon = (icon: string) => {
        switch (icon) {
            case 'calendar':
                return <LucideCalendar className="h-5 w-5" />
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    return (
        <ProtectedRoute allowedRoles={['owner']}>

            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex overflow-x-hidden">
                {/* Sidebar - Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                {/* Sidebar */}
                <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                    {/* Logo */}
                    <div className="p-6 border-b border-amber-600">
                        <div className="flex justify-center items-center gap-3">
                            <img src="/angierens-logo.png" alt="Logo" className="w-50 h-50 object-contain" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-2">
                        {sidebarItems.map((item, index) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.route ||
                                (location.pathname === '/admin-interface' && item.route === '/admin-interface/') ||
                                (location.pathname === '/admin-interface/' && item.route === '/admin-interface/')

                            return (
                                <Link
                                    key={index}
                                    to={item.route}
                                    onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile when link is clicked
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${isActive
                                        ? 'bg-amber-800 text-yellow-300 shadow-md'
                                        : 'text-amber-900 hover:bg-amber-400 hover:text-amber-800'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium text-xl">{item.label}</span>
                                </Link>
                            )
                        })}
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

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Bar */}
                    <header className="bg-amber-800 text-white p-4 shadow-md">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 text-white hover:bg-amber-700 rounded-lg"
                                >
                                    <MenuIcon className="h-6 w-6" />
                                </button>
                                <div>
                                    <h2 className="text-xl lg:text-2xl font-bold">SCHEDULE</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-4">
                                <span className="text-amber-200 text-xs lg:text-sm hidden sm:inline">Date: {getCurrentDate()}</span>
                                <span className="text-amber-200 text-xs lg:text-sm hidden sm:inline">Time: {getCurrentTime()}</span>
                                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <div className='relative'>
                                        <button
                                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                            className="relative p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                                        >
                                            <Bell className="h-6 w-6" />
                                            {notificationCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{notificationCount}</span>}
                                        </button>
                                        {/* Notification Dropdown */}
                                        {isNotificationOpen && (
                                            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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

                    {/* Schedule Content */}
                    <div className="flex-1 p-3 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {loading ? (
                                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                        <p className="text-gray-700 font-medium">Processing...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-400 rounded-2xl p-4 md:p-8 shadow-xl">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                                        {/* Calendar Section */}
                                        <div className="lg:col-span-2 space-y-3 md:space-y-6">
                                            {/* Current Date Display */}
                                            <div className="text-lg md:text-xl font-semibold text-gray-800">
                                                {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>

                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between border-b-2 border-gray-800 pb-3 md:pb-4">
                                                <div className="text-lg md:text-xl font-bold text-gray-800">
                                                    {selectedMonth}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigateMonth('prev')}
                                                        className="p-2 hover:bg-yellow-300 rounded-full transition-colors"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigateMonth('next')}
                                                        className="p-2 hover:bg-yellow-300 rounded-full transition-colors"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Calendar Grid */}
                                            <div className="grid grid-cols-7 gap-1 md:gap-2">
                                                {/* Day Headers */}
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                    <div key={day} className="text-center font-semibold text-gray-800 p-1 md:p-2 text-xs md:text-base">
                                                        {day}
                                                    </div>
                                                ))}

                                                {/* Calendar Days */}
                                                {calendarData.map((day, index) => {
                                                    const isPastDate = !day.isPastMonth && !day.isFutureMonth && isDateInPast(currentDate.getFullYear(), currentDate.getMonth(), day.date)

                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={() => !day.isPastMonth && !day.isFutureMonth && setSelectedDate(day.date)}
                                                            className={`
                                                        relative p-1.5 md:p-3 rounded-lg text-center border-2 transition-all duration-200 active:scale-95 md:hover:scale-105 min-h-[60px] md:min-h-[80px] flex flex-col justify-center gap-0.5 md:gap-1 cursor-pointer
                                                        ${day.isPastMonth || day.isFutureMonth
                                                                    ? 'text-gray-400 border-transparent bg-white/30'
                                                                    : isPastDate
                                                                        ? 'bg-gray-100 border-gray-300 text-gray-500 opacity-60'
                                                                        : day.isSelected
                                                                            ? 'bg-amber-600 text-white border-amber-700 shadow-lg'
                                                                            : day.isToday
                                                                                ? 'bg-white border-amber-600 text-gray-800 shadow-md'
                                                                                : 'bg-white border-gray-300 text-gray-800 hover:border-amber-400'
                                                                }
                                                    `}
                                                        >
                                                            <span className="font-semibold text-sm md:text-lg">{day.date}</span>
                                                            {!day.isPastMonth && !day.isFutureMonth && (
                                                                <>
                                                                    {day.isAvailable ? (
                                                                        <span className="text-[10px] md:text-xs text-blue-600 font-medium leading-tight">
                                                                            {day.orders}/{day.maxOrders}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] md:text-xs font-medium leading-tight">
                                                                            N/A
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Right Sidebar - View Only */}
                                        <div className="space-y-4 md:space-y-6">
                                            {/* Selected Date Info */}
                                            <div className="bg-green-50 rounded-lg p-4 md:p-6 border border-green-200 shadow-sm">
                                                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Selected Date</h3>
                                                <div className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                                                    {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
                                                </div>
                                                <div className="text-base md:text-lg text-gray-700 mb-4">
                                                    {ordersForSelectedDate.length} Orders
                                                </div>                                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                                    <h4 className="font-semibold text-gray-800 text-sm md:text-base">Customer Orders</h4>
                                                    {customerOrders.length > 0 ? (
                                                        customerOrders.map(member => (
                                                            <div key={member.id} className="flex items-center gap-3">
                                                                <div className={`w-3 h-8 ${member.color} rounded`}></div>
                                                                <div>
                                                                    <div className="font-medium text-gray-800 text-sm md:text-base">{member.name}</div>
                                                                    <div className="text-xs md:text-sm text-gray-600">{member.time}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-gray-500 text-center py-4">
                                                            No orders for this date
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Availability Status (Read-only) */}
                                            <div className="bg-green-50 rounded-lg p-4 md:p-6 border border-green-200 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base md:text-lg font-semibold text-gray-800">Current Status</h3>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 ${selectedDayData?.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                                                        <span className={`${selectedDayData?.isAvailable ? 'text-green-700' : 'text-red-700'} font-medium text-sm md:text-base`}>
                                                            {selectedDayData?.isAvailable ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Limit Display (Read-only) */}
                                            <div className="bg-blue-50 rounded-lg p-4 md:p-6 border border-blue-200 shadow-sm">
                                                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Order Limit</h3>
                                                <div className="text-xl md:text-2xl font-bold text-blue-700">
                                                    {selectedDayData?.maxOrders || 30} orders/day
                                                </div>
                                                <div className="text-xs md:text-sm text-blue-600 mt-2">
                                                    Current: {ordersForSelectedDate.length} orders
                                                </div>
                                            </div>

                                            {/* Time Slots (Read-only) */}
                                            <div className="bg-purple-50 rounded-lg p-4 md:p-6 border border-purple-200 shadow-sm">
                                                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Time Availability</h3>
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                    {timeSlots.map((slot, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                            <span className="text-xs md:text-sm font-medium text-gray-700">
                                                                {slot.hour} {slot.period}
                                                            </span>
                                                            <div className={`
                                                            px-2 md:px-3 py-1 rounded-full text-xs font-medium
                                                            ${slot.isAvailable
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }
                                                        `}>
                                                                {slot.isAvailable ? 'Available' : 'Unavailable'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

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