import { createLazyFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import {
    LayoutDashboard, LucideCalendar, ShoppingCart, TrendingUp, MessageSquare, Users, Menu as MenuIcon, RefreshCw, LogOut, Bell, ChevronLeft, ChevronRight, Clock, Truck, X
} from 'lucide-react'

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
    const location = useLocation()
    const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 17)) // May 17, 2025
    const [selectedDate, setSelectedDate] = useState(16)
    const [selectedMonth, setSelectedMonth] = useState('May 2025')
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

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

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Generate time slots from 9AM to 5PM (view-only)
    const generateTimeSlots = (): TimeSlot[] => {
        const slots: TimeSlot[] = []
        for (let hour = 9; hour <= 17; hour++) {
            const period = hour < 12 ? 'AM' : 'PM'
            const displayHour = hour <= 12 ? hour : hour - 12
            slots.push({
                hour: `${displayHour}:00`,
                period,
                isAvailable: Math.random() > 0.3 // Random availability for demo
            })
        }
        return slots
    }

    const timeSlots = generateTimeSlots()

    const staff: StaffMember[] = [
        { id: '1', name: 'Caadiang', time: '12 PM', color: 'bg-red-400' },
        { id: '2', name: 'Brandon', time: '2 PM', color: 'bg-blue-400' },
        { id: '3', name: 'Prince', time: '3 PM', color: 'bg-green-400' },
        { id: '4', name: 'Maria', time: '4 PM', color: 'bg-purple-400' },
        { id: '5', name: 'John', time: '5 PM', color: 'bg-pink-400' },
        { id: '6', name: 'Sarah', time: '6 PM', color: 'bg-indigo-400' },
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg">
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
                        const isActive = location.pathname === item.route

                        return (
                            <Link
                                key={index}
                                to={item.route}
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
                <div className='border-t border-amber-600 mt-auto'>
                    <div className='w-auto mx-4'>
                        <button className="w-full flex items-center gap-3 px-4 py-3 mt-5 bg-gray-200 opacity-75 text-gray-950 rounded-lg hover:bg-amber-700 hover:text-white transition-colors">
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-amber-800 text-white p-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl lg:text-3xl font-bold">SCHEDULE OVERVIEW</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-6">
                            <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">
                                Date: {getCurrentDate()}
                            </span>
                            <span className="text-amber-200 text-xs lg:text-lg font-semibold hidden sm:inline">
                                Time: {getCurrentTime()}
                            </span>
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

                {/* Schedule Content */}
                <div className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-yellow-400 rounded-2xl p-8 shadow-xl">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Calendar Section */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Current Date Display */}
                                    <div className="text-xl font-semibold text-gray-800">
                                        Saturday, May 24
                                    </div>

                                    {/* Month Navigation */}
                                    <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                                        <div className="text-xl font-bold text-gray-800">
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
                                    <div className="grid grid-cols-7 gap-2">
                                        {/* Day Headers */}
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center font-semibold text-gray-800 p-2">
                                                {day}
                                            </div>
                                        ))}

                                        {/* Calendar Days */}
                                        {calendarData.map((day, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedDate(day.date)}
                                                className={`
                                                    relative p-3 rounded-lg text-center border-2 transition-all duration-200 hover:scale-105 min-h-[80px] flex flex-col justify-between cursor-pointer
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
                                                <span className="font-semibold text-lg">{day.date}</span>
                                                {!day.isPastMonth && !day.isFutureMonth && (
                                                    <>
                                                        {day.isAvailable ? (
                                                            <span className="text-xs text-blue-600 font-medium">
                                                                {day.orders}/30 orders
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-red-500 font-medium">
                                                                Unavailable
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Sidebar - View Only */}
                                <div className="space-y-6">
                                    {/* Selected Date Info */}
                                    <div className="bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Selected Date</h3>
                                        <div className="text-2xl font-bold text-gray-800 mb-4">
                                            May {selectedDate}, 2025
                                        </div>
                                        <div className="text-lg text-gray-700 mb-4">25 Orders</div>

                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                            <h4 className="font-semibold text-gray-800">Customer Orders</h4>
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

                                    {/* Availability Status (Read-only) */}
                                    <div className="bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-gray-800">Current Status</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-green-700 font-medium">Available</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Limit Display (Read-only) */}
                                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Limit</h3>
                                        <div className="text-2xl font-bold text-blue-700">30 orders/day</div>
                                        <div className="text-sm text-blue-600 mt-2">Current: 25 orders</div>
                                    </div>

                                    {/* Time Slots (Read-only) */}
                                    <div className="bg-purple-50 rounded-lg p-6 border border-purple-200 shadow-sm">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Availability</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {timeSlots.map((slot, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {slot.hour} {slot.period}
                                                    </span>
                                                    <div className={`
                                                        px-3 py-1 rounded-full text-xs font-medium
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
                    </div>
                </div>
            </div>
        </div>
    )
}