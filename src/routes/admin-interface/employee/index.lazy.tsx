import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
    LayoutDashboard,
    ShoppingCart,
    TrendingUp,
    MessageSquare,
    Users,
    Menu,
    RefreshCw,
    LogOut,
    Bell,
    Heart,
    Star,
    Search,
    Plus,
    Eye,
    UserPlus,
    MapPin,
    LucideCalendar
} from 'lucide-react'

export const Route = createLazyFileRoute('/admin-interface/employee/')({
    component: RouteComponent,
})

interface Notification {
    id: string
    type: 'order' | 'feedback'
    title: string
    time: string
    icon: 'heart' | 'message' | 'star'
    read: boolean
}

interface Employee {
    id: string
    type: 'Rider'
    name: string
    status: 'On Deliver' | 'Waiting' | 'Returning' | 'Pick-up'
    currentTask: string
    assignedOrders: string[]
}

interface FormData {
    fullName: string
    email: string
    password: string
    phoneNumber: string
    employeeType: string
    vehicleInfo: string
    profilePhoto: File | null
}

function RouteComponent() {
    const navigate = useNavigate()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('All')
    const location = useLocation()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        employeeType: 'Rider',
        vehicleInfo: '',
        profilePhoto: null
    })
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [selectedEmployeeForAssign, setSelectedEmployeeForAssign] = useState<Employee | null>(null)
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
    const [selectedEmployeeForTrack, setSelectedEmployeeForTrack] = useState<Employee | null>(null)

    const handleEmployeeClick = (employeeId: string) => {
        navigate({ to: `/admin-interface/employee/${employeeId}` })
    }

    const handleTrackEmployee = (employee: Employee) => {
        setSelectedEmployeeForTrack(employee)
        setIsTrackModalOpen(true)
    }

    const availableOrders = [
        {
            id: '#022',
            customerName: 'Maria Santos',
            address: '789 Pine St, Makati City',
            items: ['Adobo Rice Bowl', 'Lumpia Shanghai (6pcs)'],
            total: '₱285.00',
            orderTime: '11:45 AM',
            priority: 'Normal',
            estimatedTime: '25 mins'
        },
        {
            id: '#023',
            customerName: 'Robert Cruz',
            address: '321 Elm Ave, Pasig City',
            items: ['Sinigang na Baboy', 'Garlic Rice'],
            total: '₱320.00',
            orderTime: '11:50 AM',
            priority: 'High',
            estimatedTime: '30 mins'
        },
        {
            id: '#024',
            customerName: 'Lisa Garcia',
            address: '654 Maple Rd, Taguig City',
            items: ['Bicol Express', 'Plain Rice', 'Iced Tea'],
            total: '₱245.00',
            orderTime: '11:55 AM',
            priority: 'Normal',
            estimatedTime: '20 mins'
        },
        {
            id: '#025',
            customerName: 'Carlos Reyes',
            address: '987 Oak Blvd, Mandaluyong City',
            items: ['Lechon Kawali', 'Pancit Canton', 'Softdrinks'],
            total: '₱395.00',
            orderTime: '12:00 PM',
            priority: 'High',
            estimatedTime: '35 mins'
        }
    ]

    const [selectedOrders, setSelectedOrders] = useState<string[]>([])

    const handleAssignEmployee = (employee: Employee) => {
        setSelectedEmployeeForAssign(employee)
        setSelectedOrders([])
        setIsAssignModalOpen(true)
    }

    const handleOrderSelection = (orderId: string) => {
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                return prev.filter(id => id !== orderId)
            } else {
                return [...prev, orderId]
            }
        })
    }

    const handleConfirmAssignment = () => {
        if (selectedEmployeeForAssign && selectedOrders.length > 0) {
            console.log('Assigning orders:', selectedOrders, 'to employee:', selectedEmployeeForAssign.name)
            // Add your assignment logic here
            setIsAssignModalOpen(false)
            setSelectedEmployeeForAssign(null)
            setSelectedOrders([])
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'Normal':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const employeeDetails = {
        '1': { // Penny's details
            phone: '0912 332 1123',
            email: 'Sugmiboy@gmail.com',
            vehicle: 'ADV 150, 043230',
            rating: 5,
            recentDeliveries: [
                {
                    order: '#01',
                    date: '2025-05-16',
                    time: '10:30 AM',
                    customerName: 'John Doe',
                    status: 'Delivered',
                    address: '123 Main St, Quezon City'
                },
                {
                    order: '#03',
                    date: '2025-05-16',
                    time: '09:15 AM',
                    customerName: 'Jane Smith',
                    status: 'Delivered',
                    address: '456 Oak Ave, Manila'
                }
            ]
        },
        '2': { // Lenny's details
            phone: '0912 555 7890',
            email: 'lenny.rider@gmail.com',
            vehicle: 'NMAX 155, 987654',
            rating: 4,
            recentDeliveries: []
        },
        // Add more employee details as needed
        '3': {
            phone: '0912 777 4444',
            email: 'marky.rider@gmail.com',
            vehicle: 'PCX 160, 112233',
            rating: 5,
            recentDeliveries: []
        },
        '4': {
            phone: '0912 888 9999',
            email: 'morphy.rider@gmail.com',
            vehicle: 'Aerox 155, 445566',
            rating: 4,
            recentDeliveries: []
        },
        '5': {
            phone: '0912 333 2222',
            email: 'jeremy.rider@gmail.com',
            vehicle: 'Click 160, 778899',
            rating: 5,
            recentDeliveries: []
        }
    }

    const handleViewEmployee = (employee: Employee) => {
        setSelectedEmployee(employee)
        setIsViewModalOpen(true)
    }

    const handleDeleteEmployee = (employeeId: string) => {
        // Add your delete logic here
        console.log('Deleting employee:', employeeId)
        setIsViewModalOpen(false)
        setSelectedEmployee(null)
    }

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`h-5 w-5 ${index < rating ? `text-yellow-400 fill-current` : `text-gray-300`}`}
            />
        ))
    }

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
            icon: Menu,
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

    const notificationCount = 1

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'order',
            title: "We are now preparing your food (#6). Thank you for trusting Angieren\\'s Lutong Bahay.",
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

    const [employees] = useState<Employee[]>([
        {
            id: '1',
            type: 'Rider',
            name: 'Penny',
            status: 'On Deliver',
            currentTask: 'Going to Customer Location',
            assignedOrders: ['#06', '#12', '#017']
        },
        {
            id: '2',
            type: 'Rider',
            name: 'Lenny',
            status: 'Waiting',
            currentTask: 'Waiting for Customer Order',
            assignedOrders: ['#08', '#13', '#018']
        },
        {
            id: '3',
            type: 'Rider',
            name: 'Marky',
            status: 'Returning',
            currentTask: 'Going back to Angieren',
            assignedOrders: ['#09', '#14', '#019']
        },
        {
            id: '4',
            type: 'Rider',
            name: 'Morphy',
            status: 'Pick-up',
            currentTask: 'Waiting for customer to Receive',
            assignedOrders: ['#10', '#15', '#020']
        },
        {
            id: '5',
            type: 'Rider',
            name: 'Jeremy',
            status: 'Pick-up',
            currentTask: 'Waiting for customer to Receive',
            assignedOrders: ['#011', '#16', '#021']
        }
    ])

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Deliver':
                return 'bg-orange-500'
            case 'Waiting':
                return 'bg-yellow-500'
            case 'Returning':
                return 'bg-blue-500'
            case 'Pick-up':
                return 'bg-yellow-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getStatusCounts = () => {
        const counts = {
            available: employees.filter(emp => emp.status === 'Waiting' || emp.status === 'Pick-up').length,
            onDelivery: employees.filter(emp => emp.status === 'On Deliver').length,
            waitingPickup: employees.filter(emp => emp.status === 'Pick-up').length,
            awaiting: employees.filter(emp => emp.status === 'Waiting').length
        }
        return counts
    }

    const statusCounts = getStatusCounts()

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterType === 'All' ||
            (filterType === 'Riders' && employee.type === 'Rider') ||
            (filterType === 'Staff' && employee.type !== 'Rider')
        return matchesSearch && matchesFilter
    })

    const handleFormChange = (field: keyof FormData, value: string | File | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }


    const handleCreateAccount = () => {
        // Add your account creation logic here
        console.log('Creating account:', formData)
        setIsCreateModalOpen(false)
        // Reset form
        setFormData({
            fullName: '',
            email: '',
            password: '',
            phoneNumber: '',
            employeeType: 'Rider',
            vehicleInfo: '',
            profilePhoto: null
        })
    }

    const generateTemporaryPassword = () => {
        const tempPassword = Math.random().toString(36).slice(-8)
        handleFormChange('password', tempPassword)
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            handleFormChange('profilePhoto', file)
        }
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
                        const isActive = location.pathname === item.route ||
                            (location.pathname === '/admin-interface/employee' && item.route === '/admin-interface/employee')

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
                <div className='border-t border-amber-600'>
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
                {/* Top Bar */}
                <header className="bg-amber-800 text-white p-4 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">EMPLOYEE MANAGEMENT</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-amber-200">Date: May 16, 2025</span>
                            <span className="text-amber-200">Time: 11:00 AM</span>
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

                {/* Employee Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Status Cards Row */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Available Riders</h3>
                            <p className="text-3xl font-bold text-gray-800">{statusCounts.available}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">On Delivery Riders</h3>
                            <p className="text-3xl font-bold text-gray-800">{statusCounts.onDelivery}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Waiting for Pick-up</h3>
                            <p className="text-3xl font-bold text-gray-800">{statusCounts.waitingPickup}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Awaiting Riders</h3>
                            <p className="text-3xl font-bold text-gray-800">{statusCounts.awaiting}</p>
                        </div>
                    </div>

                    {/* Filter and Create Employee Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-medium text-gray-700">Filter Employee Type:</span>
                                    <div className="relative">
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="appearance-none bg-yellow-400 text-black px-4 py-2 pr-8 rounded-lg font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            <option value="All">All</option>
                                            <option value="Riders">Riders</option>
                                            <option value="Staff">Staff</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Employee Account
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search a name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent w-64"
                                />
                            </div>
                        </div>

                        {/* Employee Table */}
                        <div className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-amber-800 text-white">
                                        <th className="px-6 py-4 text-left font-medium">EMPLOYEE TYPE</th>
                                        <th className="px-6 py-4 text-left font-medium">NAME</th>
                                        <th className="px-6 py-4 text-left font-medium">STATUS</th>
                                        <th className="px-6 py-4 text-left font-medium">CURRENT TASK</th>
                                        <th className="px-6 py-4 text-left font-medium">ASSIGNED ORDERS</th>
                                        <th className="px-6 py-4 text-left font-medium">ACTION BUTTONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        // onClick={() => handleEmployeeClick(employee.id)}
                                        >
                                            <td className="px-6 py-4 text-gray-800 font-medium">{employee.type}</td>
                                            <td className="px-6 py-4 text-gray-800 font-medium">{employee.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(employee.status)}`}></div>
                                                    <span className="text-gray-800">{employee.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-800">{employee.currentTask}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {employee.assignedOrders.map((order, orderIndex) => (
                                                        <span key={orderIndex} className="text-gray-800">{order}{orderIndex < employee.assignedOrders.length - 1 ? ", " : ""}</span>
                                                    ))}
                                                </div>
                                                <button className="text-amber-600 hover:text-amber-800 text-sm mt-1 underline">
                                                    see orders
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <Link
                                                        to="/admin-interface/employee/$employeeId"
                                                        params={{ employeeId: employee.id.toString() }}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium inline-block text-center"
                                                    >
                                                        VIEW
                                                    </Link>
                                                    <button
                                                        onClick={() => handleAssignEmployee(employee)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium"
                                                    >
                                                        ASSIGN
                                                    </button>
                                                    <button
                                                        onClick={() => handleTrackEmployee(employee)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium"
                                                    >
                                                        TRACK
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            {/* Employee Creation Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-yellow-400 rounded-xl p-8 w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-black mb-6">Employee Account Creation</h2>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-black font-medium mb-2">Full Name:</label>
                                <input
                                    type="text"
                                    placeholder="Type the full name of the employee..."
                                    value={formData.fullName}
                                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                                    className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                />
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-black font-medium mb-2">Email Address:</label>
                                <input
                                    type="email"
                                    placeholder="Type the working email address..."
                                    value={formData.email}
                                    onChange={(e) => handleFormChange('email', e.target.value)}
                                    className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-black font-medium mb-2">Password:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type the password..."
                                        value={formData.password}
                                        onChange={(e) => handleFormChange('password', e.target.value)}
                                        className="bg-white flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateTemporaryPassword}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium whitespace-nowrap"
                                    >
                                        Generate temporary
                                    </button>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-black font-medium mb-2">Phone Number:</label>
                                <input
                                    type="tel"
                                    placeholder="Type the working phone number..."
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleFormChange('phoneNumber', e.target.value)}
                                    className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                />
                            </div>

                            {/* Employee Type */}
                            <div>
                                <label className="block text-black font-medium mb-2">Employee Type / Role:</label>
                                <div className="relative">
                                    <select
                                        value={formData.employeeType}
                                        onChange={(e) => handleFormChange('employeeType', e.target.value)}
                                        className="w-full px-4 py-3 pr-10 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600 appearance-none bg-white"
                                    >
                                        <option value="Rider">Rider</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div>
                                <label className="block text-black font-medium mb-2">Vehicle info:</label>
                                <input
                                    type="text"
                                    placeholder="Type here the vehicle of the rider..."
                                    value={formData.vehicleInfo}
                                    onChange={(e) => handleFormChange('vehicleInfo', e.target.value)}
                                    className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                />
                            </div>

                            {/* Upload Profile Photo */}
                            <div>
                                <label className="block text-black font-medium mb-2">Upload Profile Photo:</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="profilePhoto"
                                    />
                                    <label
                                        htmlFor="profilePhoto"
                                        className="w-full bg-white px-4 py-3 rounded-lg border-0 cursor-pointer flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span className="text-gray-600">
                                            {formData.profilePhoto ? formData.profilePhoto.name : "Upload file from your computer"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 bg-red-400 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                >
                                    Cancel Creation
                                </button>
                                <button
                                    onClick={handleCreateAccount}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                                >
                                    Create Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee View Modal */}
            {isViewModalOpen && selectedEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-yellow-400 rounded-xl w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                        {/* Employee Header */}
                        <div className="bg-amber-800 text-white p-6 rounded-t-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
                                    <img
                                        src={`/api/placeholder/64/64`}
                                        alt={selectedEmployee.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedEmployee.status)}`}></div>
                                        <span className="text-amber-200">{selectedEmployee.status}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderStars(employeeDetails[selectedEmployee.id as keyof typeof employeeDetails]?.rating || 0)}
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <p className="text-amber-200">
                                    {employeeDetails[selectedEmployee.id as keyof typeof employeeDetails]?.phone || 'N/A'}
                                </p>
                                <p className="text-amber-200">
                                    {employeeDetails[selectedEmployee.id as keyof typeof employeeDetails]?.email || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Employee Details */}
                        <div className="p-6 space-y-4">
                            {/* Status and Orders */}
                            <div className="space-y-3">
                                <div className="bg-white bg-opacity-80 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Current Status:</span>
                                        <span className="font-bold text-gray-800">{selectedEmployee.currentTask}</span>
                                    </div>
                                </div>

                                <div className="bg-white bg-opacity-80 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Assigned Orders:</span>
                                        <span className="font-bold text-gray-800">{selectedEmployee.assignedOrders.join(", ")}</span>
                                    </div>
                                </div>

                                <div className="bg-white bg-opacity-80 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Vehicle Info:</span>
                                        <span className="font-bold text-gray-800">
                                            {employeeDetails[selectedEmployee.id as keyof typeof employeeDetails]?.vehicle || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Deliveries */}
                            <div className="bg-white bg-opacity-80 rounded-lg p-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">RECENT DELIVERIES TODAY</h3>

                                {employeeDetails[selectedEmployee.id as keyof typeof employeeDetails]?.recentDeliveries.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b-2 border-gray-400">
                                                    <th className="text-left py-2 px-2 font-bold text-gray-700">ORDER</th>
                                                    <th className="text-left py-2 px-2 font-bold text-gray-700">DATE</th>
                                                    <th className="text-left py-2 px-2 font-bold text-gray-700">TIME</th>
                                                    <th className="text-left py-2 px-2 font-bold text-gray-700">CUSTOMER NAME</th>
                                                    <th className="text-left py-2 px-2 font-bold text-gray-700">DELIVERY STATUS</th>
                                                    <th className="text-left py-2 px-2 font-bold text-gray-700">DELIVERY ADDRESS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employeeDetails[selectedEmployee.id as keyof typeof employeeDetails]?.recentDeliveries.map((delivery, index) => (
                                                    <tr key={index} className="border-b border-gray-300">
                                                        <td className="py-2 px-2 text-gray-700">{delivery.order}</td>
                                                        <td className="py-2 px-2 text-gray-700">{delivery.date}</td>
                                                        <td className="py-2 px-2 text-gray-700">{delivery.time}</td>
                                                        <td className="py-2 px-2 text-gray-700">{delivery.customerName}</td>
                                                        <td className="py-2 px-2 text-gray-700">{delivery.status}</td>
                                                        <td className="py-2 px-2 text-gray-700">{delivery.address}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No deliveries today</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Delete Employee
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Employee Assign Modal */}
            {isAssignModalOpen && selectedEmployeeForAssign && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="bg-amber-800 text-white p-6 rounded-t-xl">
                            <h2 className="text-2xl font-bold">Assign Orders to {selectedEmployeeForAssign.name}</h2>
                            <p className="text-amber-200 mt-2">
                                Current Status: {selectedEmployeeForAssign.status} |
                                Current Orders: {selectedEmployeeForAssign.assignedOrders.join(', ')}
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Employee Status Card */}
                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">Employee Status</h3>
                                        <p className="text-gray-600">Current Task: {selectedEmployeeForAssign.currentTask}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedEmployeeForAssign.status)}`}></div>
                                        <span className="font-medium">{selectedEmployeeForAssign.status}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Available Orders */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Available Orders ({availableOrders.length})</h3>
                                <p className="text-sm text-gray-600 mb-4">Select orders to assign to this employee:</p>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {availableOrders.map((order) => (
                                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id={`order-${order.id}`}
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => handleOrderSelection(order.id)}
                                                    className="mt-1 h-4 w-4 text-yellow-400 border-gray-300 rounded focus:ring-yellow-400"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="font-bold text-gray-800">{order.id}</h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                                                                {order.priority}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg text-gray-800">{order.total}</p>
                                                            <p className="text-xs text-gray-500">{order.orderTime}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-gray-600"><strong>Customer:</strong> {order.customerName}</p>
                                                            <p className="text-gray-600"><strong>Address:</strong> {order.address}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600"><strong>Items:</strong> {order.items.join(", ")}</p>
                                                            <p className="text-gray-600"><strong>Est. Time:</strong> {order.estimatedTime}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Orders Summary */}
                            {selectedOrders.length > 0 && (
                                <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-6">
                                    <h4 className="font-bold text-green-800 mb-2">
                                        Selected Orders ({selectedOrders.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedOrders.map((orderId) => (
                                            <span key={orderId} className="bg-green-200 text-green-800 px-2 py-1 rounded-lg text-sm font-medium">
                                                {orderId}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-green-700 mt-2">
                                        Total selected: {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-between gap-4 pt-4">
                                <button
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAssignment}
                                    disabled={selectedOrders.length === 0}
                                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${selectedOrders.length === 0
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-yellow-400 hover:bg-yellow-500 text-black'
                                        }`}
                                >
                                    Assign {selectedOrders.length} Order{selectedOrders.length !== 1 ? 's' : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Track Modal */}
            {isTrackModalOpen && selectedEmployeeForTrack && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-yellow-400 text-black p-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="/model.png" // Add rider avatar
                                        alt={selectedEmployeeForTrack.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-medium opacity-80">Rider</p>
                                        <h2 className="text-xl font-bold">{selectedEmployeeForTrack.name}</h2>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm opacity-80">Estimated Delivery Time</p>
                                    <p className="text-2xl font-bold">5:37PM</p>
                                </div>
                                <button
                                    onClick={() => setIsTrackModalOpen(false)}
                                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-black">
                                        {'★'.repeat(5)}
                                    </div>
                                    <span className="text-sm opacity-80">(32 ratings)</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold">TRACK ORDER: {selectedEmployeeForTrack.assignedOrders[0] || "3204"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Map Section - Full Width */}
                        <div className="relative">
                            <img
                                src="/public/tmp-map.png" // Use your actual map image
                                alt="Delivery Route Map"
                                className="w-full h-96 object-cover"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}