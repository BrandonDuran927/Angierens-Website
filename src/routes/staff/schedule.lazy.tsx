import { createLazyFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Bell, Menu, Clock, Truck, Calendar, Settings, X, Package, Star, DollarSign, User, LogOut, Home } from 'lucide-react'
import StaffLayout from '../staff/layout/staff-layout.lazy'

export const Route = createLazyFileRoute('/staff/schedule')({
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

function RouteComponent() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 17)) // May 17, 2025
  const [selectedDate, setSelectedDate] = useState(16)
  const [selectedMonth, setSelectedMonth] = useState('May 2025')
  const [isAvailable, setIsAvailable] = useState(true)
  const [orderLimit, setOrderLimit] = useState(30)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const location = useLocation()

  // Navigation items with their corresponding routes
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

  const currentMonthName = monthNames[currentDate.getMonth()]
  const currentYear = currentDate.getFullYear()

  // Generate time slots from 9AM to 5PM
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour <= 17; hour++) {
      const period = hour < 12 ? 'AM' : 'PM'
      const displayHour = hour <= 12 ? hour : hour - 12
      slots.push({
        hour: `${displayHour}:00`,
        period,
        isAvailable: true
      })
    }
    return slots
  }

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots())

  const toggleTimeSlot = (index: number) => {
    const newTimeSlots = [...timeSlots]
    newTimeSlots[index].isAvailable = !newTimeSlots[index].isAvailable
    setTimeSlots(newTimeSlots)
  }

  const staff: StaffMember[] = [
    { id: '1', name: 'Caadiang', time: '12 PM', color: 'bg-red-400' },
    { id: '2', name: 'Brandon', time: '2 PM', color: 'bg-blue-400' },
    { id: '3', name: 'Prince', time: '3 PM', color: 'bg-green-400' },
    { id: '4', name: 'Prince', time: '3 PM', color: 'bg-green-400' },
    { id: '5', name: 'Prince', time: '3 PM', color: 'bg-green-400' },
    { id: '6', name: 'Prince', time: '3 PM', color: 'bg-green-400' },
  ]

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
        orders: Math.floor(Math.random() * 20) + 10,
        isAvailable: Math.random() > 0.2,
        isPastMonth: true
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isUnavailable = [1, 11, 19, 20, 22].includes(day)
      calendarData.push({
        date: day,
        orders: Math.floor(Math.random() * 30) + 10,
        isAvailable: !isUnavailable,
        isToday: day === 17,
        isSelected: day === selectedDate
      })
    }

    // Next month days to fill the grid
    const totalCells = 42 // 6 weeks * 7 days
    const remainingCells = totalCells - calendarData.length
    for (let day = 1; day <= remainingCells; day++) {
      calendarData.push({
        date: day,
        orders: Math.floor(Math.random() * 15) + 5,
        isAvailable: Math.random() > 0.3,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
      {/* Sidebar - following the uploaded image design */}
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
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <img src="/api/placeholder/40/40" alt="Logo" className="w-8 h-8 rounded-full" />
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
          <button className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-red-100 hover:text-red-600 rounded-lg w-full transition-colors">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
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

        <div className="flex-1 p-3 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-yellow-400 rounded-2xl p-4 md:p-8 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

                <div className="lg:col-span-2 space-y-3 md:space-y-6">
                  {/* Current Date Display */}
                  <div className="text-lg md:text-xl font-semibold text-gray-800">
                    Saturday, May 24
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
                    {calendarData.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.date)}
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
                                {day.orders}/30
                              </span>
                            ) : (
                              <span className="text-[10px] md:text-xs text-red-500 font-medium leading-tight">
                                Full
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Selected Date Info */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Selected Date</h3>
                    <div className="text-2xl font-bold text-gray-800 mb-4">
                      May {selectedDate}, 2025
                    </div>
                    <div className="text-lg text-gray-700 mb-4">25 Orders</div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      <h4 className="font-semibold text-gray-800">Customers</h4>
                      {staff.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className={`w-3 h-8 ${member.color} rounded`}></div>
                          <div>
                            <div className="font-medium text-gray-800">{member.name}</div>
                            <div className="text-sm text-gray-600">{member.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Available</h3>
                      <button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`
                          relative w-16 h-8 rounded-full transition-colors duration-200
                          ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}
                        `}
                      >
                        <div className={`
                          absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 shadow-md
                          ${isAvailable ? 'translate-x-9' : 'translate-x-1'}
                        `} />
                      </button>
                    </div>
                  </div>

                  {/* Order Limit */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Set Limit</h3>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={orderLimit}
                        onChange={(e) => setOrderLimit(Number(e.target.value))}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                        min="1"
                        max="100"
                      />
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        Save
                      </button>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Availability</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <span className="text-sm font-medium text-gray-700">
                            {slot.hour} {slot.period}
                          </span>
                          <button
                            onClick={() => toggleTimeSlot(index)}
                            className={`
                              relative w-12 h-6 rounded-full transition-colors duration-200
                              ${slot.isAvailable ? 'bg-green-500' : 'bg-red-400'}
                            `}
                          >
                            <div className={`
                              absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-md
                              ${slot.isAvailable ? 'translate-x-6' : 'translate-x-0.5'}
                            `} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}