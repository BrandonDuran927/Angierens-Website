import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
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
    X,
    UserPlus,
    MapPin,
    LucideCalendar,
    MenuIcon
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useUser } from '@/context/UserContext'

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
    type: string
    name: string
    email: string
    phone: string
    dateHired: string
    assignedOrders: string[]
}

interface EmployeeDetails {
    phone: string
    email: string
    dateHired: string
    recentDeliveries: {
        order: string
        date: string
        time: string
        customerName: string
        status: string
        address: string
    }[]
}

interface FormData {
    first_name: string
    middle_name: string
    last_name: string
    email: string
    password: string
    phoneNumber: string
    employeeType: string
    vehicleInfo: string
    profilePhoto: File | null
}

function RouteComponent() {
    const navigate = useNavigate()
    const { user, signOut } = useUser()

    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('All')
    const location = useLocation()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [employees, setEmployees] = useState<Employee[]>([])
    const [employeeDetails, setEmployeeDetails] = useState<Record<string, EmployeeDetails>>({})
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        middle_name: '',
        last_name: '',
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

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }

    // Fetch employees from Supabase
    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            // Fetch all users with role 'rider' or 'staff'
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .in('user_role', ['rider', 'staff', 'chef'])
                .eq('is_active', true)

            if (usersError) throw usersError

            const roleMap: Record<string, string> = {
                rider: 'rider',
                chef: 'chef',
                staff: 'staff'
            };

            // Transform data to match Employee interface
            const employeesData: Employee[] = (usersData || []).map((user: any) => ({
                id: user.user_uid,
                type: roleMap[user.user_role] ?? 'staff',
                name: `${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`.trim(),
                email: user.email,
                phone: user.phone_number,
                dateHired: user.date_hired || 'N/A',
                assignedOrders: []
            }))

            setEmployees(employeesData)

            // Fetch delivery details for each rider
            const detailsMap: Record<string, EmployeeDetails> = {}
            for (const employee of employeesData) {
                if (employee.type === 'rider') {
                    const deliveries = await fetchEmployeeDeliveries(employee.id)
                    detailsMap[employee.id] = {
                        phone: employee.phone,
                        email: employee.email,
                        dateHired: employee.dateHired,
                        recentDeliveries: deliveries
                    }
                } else {
                    detailsMap[employee.id] = {
                        phone: employee.phone,
                        email: employee.email,
                        dateHired: employee.dateHired,
                        recentDeliveries: []
                    }
                }
            }

            setEmployeeDetails(detailsMap)
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEmployeeDeliveries = async (riderId: string) => {
        try {
            // Get today's date range
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const { data: deliveriesData, error } = await supabase
                .from('delivery')
                .select(`
                    delivery_id,
                    delivery_time,
                        address!inner(
                        barangay,
                        address_line,
                        city
                        ),
                        order!inner(
                        order_number,
                        order_status,
                        customer:users!order_customer_uid_fkey(
                            first_name,
                            last_name
                        )
                        )
                    `)
                .eq('rider_id', riderId)
                .order('delivery_time', { ascending: false })


            if (error) throw error

            console.log('Fetched deliveries for rider', riderId, deliveriesData)

            // Transform to delivery format
            return (deliveriesData || []).map((delivery: any) => {
                const deliveryTime = new Date(delivery.delivery_time)

                // ✅ order is an array — get the first one
                const order = delivery.order?.[0]
                const customer = order?.customer
                const address = delivery.address

                return {
                    order: `#${order?.order_number || 'N/A'}`,
                    date: deliveryTime.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                    time: deliveryTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    customerName: customer
                        ? `${customer.first_name} ${customer.last_name}`
                        : 'N/A',
                    status: order?.order_status || 'N/A',
                    address: address
                        ? `${address.address_line}, ${address.barangay}, ${address.city}`
                        : 'N/A',
                }
            })

        } catch (error) {
            console.error('Error fetching deliveries:', error)
            return []
        }
    }

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

    const handleViewEmployee = (employee: Employee) => {
        setSelectedEmployee(employee)
        setIsViewModalOpen(true)
    }

    const handleDeleteEmployee = async (employeeId: string) => {
        try {
            if (!confirm('Are you sure you want to delete this employee? This will set them as inactive.')) {
                return
            }

            const { error } = await supabase
                .from('users')
                .update({ is_active: false })
                .eq('user_uid', employeeId)

            if (error) throw error

            console.log('Employee deactivated:', employeeId)

            await fetchEmployees()

            setIsViewModalOpen(false)
            setSelectedEmployee(null)
        } catch (error) {
            console.error('Error deactivating employee:', error)
            alert('Failed to deactivate employee. Please try again.')
            setLoading(false)
        }
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

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterType === 'All' ||
            (filterType === 'rider' && employee.type === 'rider') ||
            (filterType === 'staff' && employee.type === 'staff') ||
            (filterType === 'chef' && employee.type === 'chef')
        return matchesSearch && matchesFilter
    })

    const handleFormChange = (field: keyof FormData, value: string | File | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCreateAccount = async () => {
        setLoading(true)
        try {
            // Check if email already exists in users table
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('email')
                .eq('email', formData.email.trim().toLowerCase())
                .maybeSingle()

            if (checkError) throw checkError

            if (existingUser) {
                alert('This email is already registered. Please use a different email address.')
                setLoading(false)
                return
            }

            // Attempt to sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                },
            })

            if (authError) {
                // Check if it's a duplicate email error
                if (authError.message.toLowerCase().includes('already registered') ||
                    authError.message.toLowerCase().includes('already exists')) {
                    alert('This email is already registered in the system. Please use a different email address.')
                    setLoading(false)
                    return
                }
                throw authError
            }

            const userAuthId = authData?.user?.id
            if (!userAuthId) throw new Error("Auth signup failed, no user ID returned.")

            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        user_uid: userAuthId,
                        first_name: formData.first_name,
                        middle_name: formData.middle_name || '',
                        last_name: formData.last_name,
                        email: formData.email.trim().toLowerCase(),
                        phone_number: formData.phoneNumber,
                        user_role: formData.employeeType.toLowerCase(),
                        is_active: true,
                    }
                ])
                .select()


            if (error) throw error

            console.log('Account created successfully:', data)

            // Refresh the employee list
            await fetchEmployees()

            alert('Employee account created successfully!')
            setIsCreateModalOpen(false)
            setLoading(false)
            // Reset form
            setFormData({
                first_name: '',
                middle_name: '',
                last_name: '',
                email: '',
                password: '',
                phoneNumber: '',
                employeeType: 'Rider',
                vehicleInfo: '',
                profilePhoto: null
            })
        } catch (error: any) {
            console.error('Error creating account:', error)
            alert(error.message || 'Failed to create account. Please try again.')
            setLoading(false)
        }
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

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    // Mock data for available orders (you'll need to implement real data fetching)
    const availableOrders = [
        {
            id: '#3204',
            priority: 'High',
            total: '₱450.00',
            orderTime: '2:30 PM',
            customerName: 'John Doe',
            address: '123 Main St, BGC',
            items: ['Adobo', 'Rice'],
            estimatedTime: '30 mins'
        }
    ]

    const LoadingSpinner = () => (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                <p className="text-gray-700 font-medium">Processing...</p>
            </div>
        </div>
    );

    return (
        <ProtectedRoute>
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
                            <div className="flex items-center gap-3">
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 text-white hover:bg-amber-700 rounded-lg"
                                >
                                    <MenuIcon className="h-6 w-6" />
                                </button>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">EMPLOYEE</h2>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                <span className="hidden sm:inline text-amber-200 text-xs lg:text-sm">Date: May 16, 2025</span>
                                <span className="hidden sm:inline text-amber-200 text-xs lg:text-sm">Time: 11:00 AM</span>
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                            className="relative p-2 text-[#7a3d00] hover:bg-yellow-400 rounded-full"
                                        >
                                            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                                            {notificationCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {notificationCount}
                                                </span>
                                            )}
                                        </button>
                                        {/* Notification Dropdown */}
                                        {isNotificationOpen && (
                                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                                <div className="p-4 border-b border-gray-200">
                                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
                                                </div>

                                                <div className="max-h-80 overflow-y-auto">
                                                    {notifications.map((notification, index) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                                                                    {getNotificationIcon(notification.icon)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm text-gray-800 leading-relaxed">
                                                                        {notification.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="p-3 sm:p-4 border-t border-gray-200">
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="w-full bg-yellow-400 text-black py-2 px-3 sm:px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
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

                    {/* Orders Content */}
                    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                        {/* Filter and Create Employee Section */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border-2 border-yellow-400">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm sm:text-lg font-medium text-gray-700">Filter:</span>
                                        <div className="relative">
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="appearance-none bg-yellow-400 text-black px-3 py-2 pr-8 rounded-lg font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                                            >
                                                <option value="All">All</option>
                                                <option value="rider">Rider</option>
                                                <option value="staff">Staff</option>
                                                <option value="chef">Chef</option>
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
                                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm sm:text-base"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Employee
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                                    <input
                                        type="text"
                                        placeholder="Search a name"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent w-full sm:w-64 text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            {/* Employee Table */}
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <LoadingSpinner />
                                ) : filteredEmployees.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">No employees found</p>
                                    </div>
                                ) : (
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="bg-amber-800 text-white text-sm sm:text-base">
                                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-medium">TYPE</th>
                                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-medium">NAME</th>
                                                <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-medium">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-sm sm:text-base">
                                            {filteredEmployees.map((employee) => (
                                                <tr
                                                    key={employee.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-800 font-medium">
                                                        {employee.type.charAt(0).toUpperCase() + employee.type.slice(1).toLowerCase()}
                                                    </td>

                                                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-800 font-medium">
                                                        {employee.name
                                                            .toLowerCase()
                                                            .split(' ')
                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                            .join(' ')}
                                                    </td>

                                                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                        <div
                                                            className="flex justify-center cursor-pointer bg-yellow-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-yellow-600 text-sm sm:text-base"
                                                            onClick={() => handleViewEmployee(employee)}
                                                        >
                                                            VIEW
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
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
                                <div className="space-y-4">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-black font-medium mb-2">First Name:</label>
                                        <input
                                            type="text"
                                            placeholder="Enter first name"
                                            value={formData.first_name}
                                            onChange={(e) => handleFormChange('first_name', e.target.value)}
                                            className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                        />
                                    </div>

                                    {/* Middle Name */}
                                    <div>
                                        <label className="block text-black font-medium mb-2">Middle Name (optional):</label>
                                        <input
                                            type="text"
                                            placeholder="Enter middle name"
                                            value={formData.middle_name}
                                            onChange={(e) => handleFormChange('middle_name', e.target.value)}
                                            className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-black font-medium mb-2">Last Name:</label>
                                        <input
                                            type="text"
                                            placeholder="Enter last name"
                                            value={formData.last_name}
                                            onChange={(e) => handleFormChange('last_name', e.target.value)}
                                            className="bg-white w-full px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-amber-600"
                                        />
                                    </div>
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
                                            <option value="rider">Rider</option>
                                            <option value="staff">Staff</option>
                                            <option value="chef">Chef</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-[650px] max-w-[90vw] max-h-[90vh] overflow-hidden shadow-2xl">
                            {/* Close Button */}
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {/* Employee Header */}
                            <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold mb-1">
                                            {selectedEmployee.name
                                                .toLowerCase()
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ')}
                                        </h2>
                                        <div className="inline-block bg-yellow-400 text-amber-900 px-3 py-1 rounded-full text-sm font-semibold">
                                            {selectedEmployee.type.charAt(0).toUpperCase() + selectedEmployee.type.slice(1).toLowerCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Employee Details */}
                            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                                {/* Contact Information Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-amber-700 rounded"></div>
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                                <p className="text-gray-800 font-medium">
                                                    {employeeDetails[selectedEmployee.id]?.phone || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                                <p className="text-gray-800 font-medium break-all">
                                                    {employeeDetails[selectedEmployee.id]?.email || 'Not provided'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information (if you want to add more later) */}
                                {/* You can add more sections here like employment date, status, etc. */}
                            </div>

                            {/* Action Buttons */}
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between gap-4">
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="flex-1 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-md"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Employee
                                </button>
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
                                    Current Orders: {selectedEmployeeForAssign.assignedOrders.join(', ') || 'None'}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6">
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
                                    src="/tmp-map.png" // Use your actual map image
                                    alt="Delivery Route Map"
                                    className="w-full h-96 object-cover"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}