import { createLazyFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Bell, Menu, Clock, Truck, Calendar, Settings, X, Package, Star, DollarSign, User, LogOut, LucideCalendar, Save, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createLazyFileRoute('/staff/schedule')({
  component: RouteComponent,
})

// paste the same interfaces here (DayData, StaffMember, TimeSlot, Order, ScheduleData)
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
  scheduleId?: string
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
  const location = useLocation()
  const navigate = useNavigate();
  const { user, signOut } = useUser()

  async function handleLogout() {
    await signOut();
    navigate({ to: "/login" });
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().getDate())
  const [selectedMonth, setSelectedMonth] = useState(`${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`)
  const [isAvailable, setIsAvailable] = useState(true)
  const [orderLimit, setOrderLimit] = useState(30)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])
  const [ordersForSelectedDate, setOrdersForSelectedDate] = useState<Order[]>([])
  const [saving, setSaving] = useState(false)

  const colors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400',
    'bg-pink-400', 'bg-indigo-400', 'bg-yellow-400', 'bg-teal-400'
  ]

  // paste the same fetchScheduleData function here
  const fetchScheduleData = async (year: number, month: number) => {
    try {
      setLoading(true)
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      const startDate = firstDay.toISOString().split('T')[0]
      const endDate = lastDay.toISOString().split('T')[0]

      const { data: schedules, error: scheduleError } = await supabase
        .from('schedule')
        .select('*')
        .gte('schedule_date', startDate)
        .lte('schedule_date', endDate)

      if (scheduleError) throw scheduleError

      const scheduleIds = schedules?.map(s => s.schedule_id) || []

      let orderCounts: Record<string, number> = {}

      if (scheduleIds.length > 0) {
        const { data: orders, error: orderError } = await supabase
          .from('order')
          .select('schedule_id')
          .in('schedule_id', scheduleIds)

        if (orderError) throw orderError

        orderCounts = orders.reduce((acc: Record<string, number>, order) => {
          acc[order.schedule_id] = (acc[order.schedule_id] || 0) + 1
          return acc
        }, {})
      }

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

  // paste the same fetchOrdersForDate function here
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

        const transformedOrders: Order[] = (orders || []).map(order => ({
          order_id: order.order_id,
          customer_uid: order.customer_uid,
          schedule_id: order.schedule_id,
          order_status: order.order_status,
          created_at: order.created_at,
          users: Array.isArray(order.users) ? order.users[0] || null : order.users,
          schedule: Array.isArray(order.schedule) ? order.schedule[0] || null : order.schedule
        }))

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

  // Update availability status for the selected date
  const updateAvailabilityStatus = async (newStatus: boolean) => {
    try {
      setSaving(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`

      // Get all schedules for this date
      const schedulesForDate = scheduleData.filter(s => s.schedule_date === dateStr)

      console.log('Schedules for date:', schedulesForDate)

      if (schedulesForDate.length > 0) {
        // Update all schedules for this date
        const scheduleIds = schedulesForDate.map(s => s.schedule_id)
        const { error } = await supabase
          .from('schedule')
          .update({ is_available: newStatus })
          .in('schedule_id', scheduleIds)

        if (error) throw error

        setIsAvailable(newStatus)
        await fetchScheduleData(year, month)
        alert(`Date marked as ${newStatus ? 'available' : 'unavailable'}`)
      } else {
        alert('No schedules exist for this date. Please add time slots first.')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Failed to update availability')
    } finally {
      setSaving(false)
    }
  }

  // Update order limit for the selected date
  const updateOrderLimit = async (newLimit: number) => {
    try {
      setSaving(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`

      const schedulesForDate = scheduleData.filter(s => s.schedule_date === dateStr)

      if (schedulesForDate.length > 0) {
        const scheduleIds = schedulesForDate.map(s => s.schedule_id)
        const { error } = await supabase
          .from('schedule')
          .update({ max_orders: newLimit })
          .in('schedule_id', scheduleIds)

        if (error) throw error

        setOrderLimit(newLimit)
        await fetchScheduleData(year, month)
        alert(`Order limit updated to ${newLimit}`)
      } else {
        alert('No schedules exist for this date. Please add time slots first.')
      }
    } catch (error) {
      console.error('Error updating order limit:', error)
      alert('Failed to update order limit')
    } finally {
      setSaving(false)
    }
  }

  // Add a new time slot
  const addTimeSlot = async (hour: number) => {
    try {
      setSaving(true)
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
      const timeStr = `${String(hour).padStart(2, '0')}:00:00`

      // Check if this time slot already exists
      const existingSlot = scheduleData.find(
        s => s.schedule_date === dateStr && s.schedule_time === timeStr
      )

      if (existingSlot) {
        alert('This time slot already exists')
        return
      }

      const { error } = await supabase
        .from('schedule')
        .insert({
          schedule_date: dateStr,
          schedule_time: timeStr,
          max_orders: orderLimit,
          is_available: true
        })

      if (error) throw error

      await fetchScheduleData(year, month)
      alert('Time slot added successfully')
    } catch (error) {
      console.error('Error adding time slot:', error)
      alert('Failed to add time slot')
    } finally {
      setSaving(false)
    }
  }

  // Toggle time slot availability
  const toggleTimeSlotAvailability = async (scheduleId: string, currentStatus: boolean) => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('schedule')
        .update({ is_available: !currentStatus })
        .eq('schedule_id', scheduleId)

      if (error) throw error

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      await fetchScheduleData(year, month)
    } catch (error) {
      console.error('Error toggling time slot:', error)
      alert('Failed to update time slot')
    } finally {
      setSaving(false)
    }
  }

  // Delete a time slot
  const deleteTimeSlot = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('schedule_id', scheduleId)

      if (error) throw error

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      await fetchScheduleData(year, month)
      alert('Time slot deleted successfully')
    } catch (error) {
      console.error('Error deleting time slot:', error)
      alert('Failed to delete time slot')
    } finally {
      setSaving(false)
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

    // Update local state based on selected date's data
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
    const scheduleForDay = scheduleData.find(s => s.schedule_date === dateStr)
    if (scheduleForDay) {
      setIsAvailable(scheduleForDay.is_available)
      setOrderLimit(scheduleForDay.max_orders)
    }
  }, [selectedDate, currentDate, scheduleData])

  const generateTimeSlots = (): TimeSlot[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`

    const schedulesForDate = scheduleData.filter(s => s.schedule_date === dateStr)

    if (schedulesForDate.length === 0) {
      return []
    }

    const slots: TimeSlot[] = schedulesForDate.map(schedule => {
      const timeParts = schedule.schedule_time.split(':')
      let hour = parseInt(timeParts[0])
      const minute = timeParts[1] || '00'

      const period = hour < 12 ? 'AM' : 'PM'
      const displayHour = hour === 0 ? 12 : (hour <= 12 ? hour : hour - 12)

      return {
        hour: `${displayHour}:${minute}`,
        period,
        isAvailable: schedule.is_available,
        scheduleId: schedule.schedule_id
      }
    })

    return slots.sort((a, b) => {
      const timeA = a.period === 'AM' ? parseInt(a.hour) : parseInt(a.hour) + 12
      const timeB = b.period === 'AM' ? parseInt(b.hour) : parseInt(b.hour) + 12
      return timeA - timeB
    })
  }

  const timeSlots = generateTimeSlots()

  // paste the same generateCalendarData function here
  const generateCalendarData = (): DayData[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const calendarData: DayData[] = []

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

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const scheduleForDay = scheduleData.find(s => s.schedule_date === dateStr)

      const today = new Date()
      const isToday = day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

      calendarData.push({
        date: day,
        orders: scheduleForDay?.order_count || 0,
        isAvailable: scheduleForDay?.is_available || false,
        isToday: isToday,
        isSelected: day === selectedDate,
        scheduleId: scheduleForDay?.schedule_id,
        maxOrders: scheduleForDay?.max_orders || 30
      })
    }

    const totalCells = 42
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

  // paste the same navigateMonth, getCurrentDate, getCurrentTime functions here
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

  const selectedDayData = calendarData.find(day =>
    day.date === selectedDate && !day.isPastMonth && !day.isFutureMonth
  )

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

  // paste the same notifications array and functions here
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

  return (
    <ProtectedRoute allowedRoles={['staff']}>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
        {/* paste the same Sidebar code here */}
        <div
          className={`
    fixed inset-y-0 left-0 z-50 w-64 bg-yellow-400 transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `}
        >
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

          <div className="px-6 py-4 border-b-2 border-amber-600">
            <h3 className="font-bold text-lg text-amber-900">Jenny Frenzzy</h3>
            <p className="text-sm text-amber-800">+63 912 212 1209</p>
            <p className="text-sm text-amber-800">jennyfrenzzy@gmail.com</p>
          </div>

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

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* paste the same header code here */}
          <header className="bg-amber-800 text-white p-4 shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-white hover:bg-amber-700 rounded-lg"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-3xl font-bold">SCHEDULE</h1>
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

          <div className="flex-1 p-3 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-yellow-400 rounded-2xl p-4 md:p-8 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                  <div className="lg:col-span-2 space-y-3 md:space-y-6">
                    {/* paste the same Current Date Display and Month Navigation */}
                    <div className="text-lg md:text-xl font-semibold text-gray-800">
                      {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

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

                    {/* paste the same Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-gray-800 p-1 md:p-2 text-xs md:text-base">
                          {day}
                        </div>
                      ))}

                      {/* Calendar Days */}
                      {calendarData.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => !day.isPastMonth && !day.isFutureMonth && setSelectedDate(day.date)}
                          className={`
                            relative p-1.5 md:p-3 rounded-lg text-center border-2 transition-all duration-200 active:scale-95 md:hover:scale-105 min-h-[60px] md:min-h-[80px] flex flex-col justify-center gap-0.5 md:gap-1 cursor-pointer
                            ${day.isPastMonth || day.isFutureMonth
                              ? 'text-gray-400 border-transparent bg-white/30'
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
                      ))}
                    </div>
                  </div>

                  {/* Right Sidebar - EDITABLE */}
                  <div className="space-y-4 md:space-y-6">
                    {/* Selected Date Info */}
                    <div className="bg-green-50 rounded-lg p-4 md:p-6 border border-green-200 shadow-sm">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Selected Date</h3>
                      <div className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                        {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
                      </div>
                      <div className="text-base md:text-lg text-gray-700 mb-4">
                        {selectedDayData?.orders || 0} Orders
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
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

                    {/* Availability Status - EDITABLE */}
                    <div className="bg-green-50 rounded-lg p-4 md:p-6 border border-green-200 shadow-sm">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Availability Status</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 ${selectedDayData?.isAvailable ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                          <span className={`${selectedDayData?.isAvailable ? 'text-green-700' : 'text-red-700'} font-medium text-sm md:text-base`}>
                            {selectedDayData?.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateAvailabilityStatus(true)}
                          disabled={saving}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          Set Available
                        </button>
                        <button
                          onClick={() => updateAvailabilityStatus(false)}
                          disabled={saving}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          Set Unavailable
                        </button>
                      </div>
                    </div>

                    {/* Order Limit - EDITABLE */}
                    <div className="bg-blue-50 rounded-lg p-4 md:p-6 border border-blue-200 shadow-sm">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Order Limit</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="number"
                          value={orderLimit}
                          onChange={(e) => setOrderLimit(parseInt(e.target.value) || 0)}
                          min="1"
                          max="100"
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                        />
                        <span className="text-blue-700 font-medium">orders/day</span>
                      </div>
                      <button
                        onClick={() => updateOrderLimit(orderLimit)}
                        disabled={saving}
                        className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Order Limit
                      </button>
                      <div className="text-xs md:text-sm text-blue-600 mt-2">
                        Current: {selectedDayData?.orders || 0} orders
                      </div>
                    </div>

                    {/* Time Slots - EDITABLE */}
                    <div className="bg-purple-50 rounded-lg p-4 md:p-6 border border-purple-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">Time Slots (9AM - 5PM)</h3>
                      </div>

                      {/* Add Time Slot Buttons */}
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => {
                          const timeStr = `${String(hour).padStart(2, '0')}:00:00`
                          const year = currentDate.getFullYear()
                          const month = currentDate.getMonth()
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`
                          const exists = scheduleData.some(s => s.schedule_date === dateStr && s.schedule_time === timeStr)
                          const displayHour = hour > 12 ? hour - 12 : hour
                          const period = hour < 12 ? 'AM' : 'PM'

                          return (
                            <button
                              key={hour}
                              onClick={() => addTimeSlot(hour)}
                              disabled={saving || exists}
                              className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${exists
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-amber-600 text-white hover:bg-amber-700'
                                } disabled:opacity-50`}
                            >
                              {exists ? '✓' : '+'} {displayHour}{period}
                            </button>
                          )
                        })}
                      </div>

                      {/* Existing Time Slots */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                              <span className="text-xs md:text-sm font-medium text-gray-700">
                                {slot.hour} {slot.period}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => slot.scheduleId && toggleTimeSlotAvailability(slot.scheduleId, slot.isAvailable)}
                                  disabled={saving}
                                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium transition-colors ${slot.isAvailable
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    } disabled:opacity-50`}
                                >
                                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                                </button>
                                <button
                                  onClick={() => slot.scheduleId && deleteTimeSlot(slot.scheduleId)}
                                  disabled={saving}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                  title="Delete time slot"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            No time slots available. Add time slots using the buttons above.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}