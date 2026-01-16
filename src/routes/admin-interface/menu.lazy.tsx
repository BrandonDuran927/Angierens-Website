import React, { useState, useEffect } from 'react'
import { createLazyFileRoute, Link, useLocation } from '@tanstack/react-router'
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
    LucideCalendar,
    MenuIcon,
    Eye,
    Search,
    Edit,
    Trash2,
    Plus,
    X
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'

export const Route = createLazyFileRoute('/admin-interface/menu')({
    component: RouteComponent,
})

interface Notification {
    id: string
    type: string
    title: string
    time: string
    icon: string
    read: boolean
}

interface MenuItem {
    menu_id: string
    name: string
    description: string
    price: string
    inclusion: string | null
    is_available: boolean
    category: string | null
    size: string | null
    quantity_description: string | null
    image_url: string | null
}

interface AddOn {
    add_on: string
    name: string
    price: number
    quantity?: number // optional
}

function RouteComponent() {
    const { user, signOut } = useUser()
    const navigate = useNavigate();
    const location = useLocation()
    const [searchQuery, setSearchQuery] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

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

    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [addons, setAddons] = useState<AddOn[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [showMenuDetails, setShowMenuDetails] = useState(false)
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isAddMode, setIsAddMode] = useState(false)

    const [showAddonsModal, setShowAddonsModal] = useState(false)
    const [selectedAddon, setSelectedAddon] = useState<AddOn | null>(null)
    const [isEditAddonMode, setIsEditAddonMode] = useState(false)
    const [isAddAddonMode, setIsAddAddonMode] = useState(false)

    // Form states for menu items
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        size: '',
        inclusion: '',
        is_available: true
    })

    // Form states for add-ons
    const [addonFormData, setAddonFormData] = useState({
        name: '',
        price: ''
    })

    const [inclusionInput, setInclusionInput] = useState('')
    const [inclusionsList, setInclusionsList] = useState<string[]>([])

    const [processingAction, setProcessingAction] = useState(false)
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
    const [addonFormErrors, setAddonFormErrors] = useState<{ [key: string]: string }>({})

    // Fetch menu items from Supabase
    useEffect(() => {
        fetchMenuItems()
        fetchAddons()
    }, [])

    const fetchMenuItems = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('menu')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            setMenuItems(data || [])
        } catch (err) {
            console.error('Error fetching menu items:', err)
            setError('Failed to load menu items')
        } finally {
            setLoading(false)
        }
    }

    const fetchAddons = async () => {
        try {
            const { data, error } = await supabase
                .from('add_on')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            setAddons(data || [])
        } catch (err) {
            console.error('Error fetching add-ons:', err)
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

    const getImageUrl = (imageUrl: string | null): string => {
        if (!imageUrl) return '/api/placeholder/300/200'

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl
        }

        const encodedFileName = encodeURIComponent(imageUrl)
        return `https://tvuawpgcpmqhsmwbwypy.supabase.co/storage/v1/object/public/menu-images/${encodedFileName}`
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                showAlert('Please select an image file (PNG, JPG, JPEG, GIF, or WebP)', 'warning')
                e.target.value = ''
                return
            }

            const maxSize = 5 * 1024 * 1024
            if (file.size > maxSize) {
                showAlert('Image size must not exceed 5MB. Please choose a smaller image.', 'warning')
                e.target.value = ''
                return
            }

            const img = new Image()
            const objectUrl = URL.createObjectURL(file)

            img.onload = () => {
                URL.revokeObjectURL(objectUrl)

                if (img.width < 200 || img.height < 200) {
                    showAlert('Image dimensions must be at least 200x200 pixels', 'warning')
                    e.target.value = ''
                    return
                }

                if (img.width > 4000 || img.height > 4000) {
                    showAlert('Image dimensions must not exceed 4000x4000 pixels', 'warning')
                    e.target.value = ''
                    return
                }

                setImageFile(file)
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            }

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                showAlert('Failed to load image. Please select a valid image file.', 'error')
                e.target.value = ''
            }

            img.src = objectUrl
        }
    }

    const uploadImage = async (menuName: string): Promise<string | null> => {
        if (!imageFile) return null

        try {
            setUploadingImage(true)

            const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'png'
            const fileName = `${menuName.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`

            const { error } = await supabase.storage
                .from('menu-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (error) {
                console.error('Supabase upload error:', error)
                throw error
            }

            return fileName
        } catch (err: any) {
            console.error('Error uploading image:', err)
            showAlert(`Failed to upload image: ${err.message || 'Unknown error'}`, 'error')
            return null
        } finally {
            setUploadingImage(false)
        }
    }

    const openMenuDetails = (item: MenuItem) => {
        setSelectedMenuItem(item)
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category || '',
            size: item.size || '',
            inclusion: '',
            is_available: item.is_available
        })
        setInclusionsList(parseInclusions(item.inclusion))
        setImagePreview(item.image_url ? getImageUrl(item.image_url) : null)
        setImageFile(null)
        setFormErrors({})
        setIsEditMode(false)
        setShowMenuDetails(true)
    }

    const closeMenuDetails = () => {
        setShowMenuDetails(false)
        setSelectedMenuItem(null)
        setIsEditMode(false)
        setIsAddMode(false)
        resetForm()
    }

    const openAddMenuItem = () => {
        resetForm()
        setFormErrors({})
        setIsAddMode(true)
        setShowMenuDetails(true)
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            size: '',
            inclusion: '',
            is_available: true
        })
        setInclusionsList([])
        setInclusionInput('')
        setImageFile(null)
        setImagePreview(null)
    }

    const handleAddInclusion = () => {
        if (inclusionInput.trim()) {
            setInclusionsList([...inclusionsList, inclusionInput.trim()])
            setInclusionInput('')
        }
    }

    const handleRemoveInclusion = (index: number) => {
        setInclusionsList(inclusionsList.filter((_, i) => i !== index))
    }

    const validateMenuItemForm = (): boolean => {
        const errors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            errors.name = 'Food name is required'
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Food name must be at least 2 characters'
        } else if (formData.name.trim().length > 100) {
            errors.name = 'Food name must not exceed 100 characters'
        }

        if (!formData.description.trim()) {
            errors.description = 'Description is required'
        } else if (formData.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters'
        } else if (formData.description.trim().length > 500) {
            errors.description = 'Description must not exceed 500 characters'
        }

        if (!formData.price) {
            errors.price = 'Price is required'
        } else {
            const priceValue = parseFloat(formData.price)
            if (isNaN(priceValue) || priceValue <= 0) {
                errors.price = 'Price must be a positive number'
            } else if (priceValue > 100000) {
                errors.price = 'Price must not exceed ₱100,000'
            }
        }

        if (formData.category && formData.category.trim().length > 50) {
            errors.category = 'Category must not exceed 50 characters'
        }

        if (formData.size && formData.size.trim().length > 50) {
            errors.size = 'Size must not exceed 50 characters'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSaveMenuItem = async () => {
        if (!validateMenuItemForm()) {
            showAlert('Please fix the errors in the form before saving.', 'warning')
            return
        }

        try {
            setProcessingAction(true)

            const sanitizedName = formData.name.trim()
            const sanitizedDescription = formData.description.trim()
            const sanitizedCategory = formData.category?.trim() || null
            const sanitizedSize = formData.size?.trim() || null

            const { data: existingItems, error: checkError } = await supabase
                .from('menu')
                .select('menu_id, name')
                .ilike('name', sanitizedName)

            if (checkError) throw checkError

            if (isAddMode && existingItems && existingItems.length > 0) {
                showAlert(`A menu item with the name "${sanitizedName}" already exists. Please use a different name.`, 'warning')
                setProcessingAction(false)
                return
            }

            if (isEditMode && selectedMenuItem && existingItems) {
                const duplicates = existingItems.filter(item => item.menu_id !== selectedMenuItem.menu_id)
                if (duplicates.length > 0) {
                    showAlert(`A menu item with the name "${sanitizedName}" already exists. Please use a different name.`, 'warning')
                    setProcessingAction(false)
                    return
                }
            }

            let imageUrl = selectedMenuItem?.image_url || null
            if (imageFile) {
                const uploadedUrl = await uploadImage(sanitizedName)
                if (uploadedUrl) {
                    imageUrl = uploadedUrl
                }
            }

            const menuData = {
                name: sanitizedName,
                description: sanitizedDescription,
                price: formData.price,
                category: sanitizedCategory,
                size: sanitizedSize,
                inclusion: inclusionsList.length > 0 ? inclusionsList.join(', ') : null,
                is_available: formData.is_available,
                image_url: imageUrl
            }

            if (isAddMode) {
                const { error } = await supabase
                    .from('menu')
                    .insert([menuData])

                if (error) throw error
                showAlert('Menu item added successfully!', 'success')
            } else if (isEditMode && selectedMenuItem) {
                const { error } = await supabase
                    .from('menu')
                    .update(menuData)
                    .eq('menu_id', selectedMenuItem.menu_id)

                if (error) throw error
                showAlert('Menu item updated successfully!', 'success')
            }

            await fetchMenuItems()
            closeMenuDetails()
        } catch (err: any) {
            console.error('Error saving menu item:', err)
            showAlert(`Failed to save menu item: ${err.message || 'Unknown error'}`, 'error')
        } finally {
            setProcessingAction(false)
        }
    }

    const handleDeleteMenuItem = async (menuId: string) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return

        try {
            setProcessingAction(true)
            const { error } = await supabase
                .from('menu')
                .delete()
                .eq('menu_id', menuId)

            if (error) throw error

            showAlert('Menu item deleted successfully!', 'success')
            await fetchMenuItems()
            closeMenuDetails()
        } catch (err) {
            console.error('Error deleting menu item:', err)
            showAlert('Failed to delete menu item', 'error')
        } finally {
            setProcessingAction(false)
        }
    }

    const openAddonsModal = () => {
        setShowAddonsModal(true)
    }

    const closeAddonsModal = () => {
        setShowAddonsModal(false)
        setSelectedAddon(null)
        setIsEditAddonMode(false)
        setIsAddAddonMode(false)
        resetAddonForm()
    }

    const resetAddonForm = () => {
        setAddonFormData({
            name: '',
            price: '',
        })
    }

    const openAddAddon = () => {
        resetAddonForm()
        setAddonFormErrors({})
        setIsAddAddonMode(true)
    }

    const openEditAddon = (addon: AddOn) => {
        setSelectedAddon(addon)
        setAddonFormData({
            name: addon.name,
            price: addon.price.toString()
        })
        setAddonFormErrors({})
        setIsEditAddonMode(true)
    }

    const validateAddonForm = (): boolean => {
        const errors: { [key: string]: string } = {}

        if (!addonFormData.name.trim()) {
            errors.name = 'Add-on name is required'
        } else if (addonFormData.name.trim().length < 2) {
            errors.name = 'Add-on name must be at least 2 characters'
        } else if (addonFormData.name.trim().length > 100) {
            errors.name = 'Add-on name must not exceed 100 characters'
        }

        if (!addonFormData.price) {
            errors.price = 'Price is required'
        } else {
            const priceValue = parseFloat(addonFormData.price)
            if (isNaN(priceValue) || priceValue < 0) {
                errors.price = 'Price must be a non-negative number'
            } else if (priceValue > 10000) {
                errors.price = 'Price must not exceed ₱10,000'
            }
        }

        setAddonFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSaveAddon = async () => {
        if (!validateAddonForm()) {
            showAlert('Please fix the errors in the form before saving.', 'warning')
            return
        }

        try {
            setProcessingAction(true)

            const sanitizedName = addonFormData.name.trim()

            const { data: existingAddons, error: checkError } = await supabase
                .from('add_on')
                .select('add_on, name')
                .ilike('name', sanitizedName)

            if (checkError) throw checkError

            if (isAddAddonMode && existingAddons && existingAddons.length > 0) {
                showAlert(`An add-on with the name "${sanitizedName}" already exists. Please use a different name.`, 'warning')
                setProcessingAction(false)
                return
            }

            if (isEditAddonMode && selectedAddon && existingAddons) {
                const duplicates = existingAddons.filter(addon => addon.add_on !== selectedAddon.add_on)
                if (duplicates.length > 0) {
                    showAlert(`An add-on with the name "${sanitizedName}" already exists. Please use a different name.`, 'warning')
                    setProcessingAction(false)
                    return
                }
            }

            const addonData = {
                name: sanitizedName,
                price: parseFloat(addonFormData.price),
            }

            if (isAddAddonMode) {
                const { error } = await supabase
                    .from('add_on')
                    .insert([addonData])

                if (error) throw error
                showAlert('Add-on added successfully!', 'success')
            } else if (isEditAddonMode && selectedAddon) {
                const { error } = await supabase
                    .from('add_on')
                    .update(addonData)
                    .eq('add_on', selectedAddon.add_on)

                if (error) throw error
                showAlert('Add-on updated successfully!', 'success')
            }

            await fetchAddons()
            setIsAddAddonMode(false)
            setIsEditAddonMode(false)
            setSelectedAddon(null)
            resetAddonForm()
        } catch (err: any) {
            console.error('Error saving add-on:', err)
            showAlert(`Failed to save add-on: ${err.message || 'Unknown error'}`, 'error')
        } finally {
            setProcessingAction(false)
        }
    }

    const handleDeleteAddon = async (addonId: string) => {
        if (!confirm('Are you sure you want to delete this add-on?')) return

        try {
            setProcessingAction(true)
            const { error } = await supabase
                .from('add_on')
                .delete()
                .eq('add_on', addonId)

            if (error) throw error

            showAlert('Add-on deleted successfully!', 'success')
            await fetchAddons()
        } catch (err) {
            console.error('Error deleting add-on:', err)
            showAlert('Failed to delete add-on', 'error')
        } finally {
            setProcessingAction(false)
        }
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    // Parse inclusions string to array
    const parseInclusions = (inclusion: string | null): string[] => {
        if (!inclusion) return []

        if (inclusion.trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(inclusion)
                if (Array.isArray(parsed)) return parsed
            } catch {
            }
        }

        return inclusion.split(',').map(item => item.trim()).filter(item => item)
    }

    // Filter menu items based on search query
    const filteredMenuItems = menuItems.filter(item => {
        const query = searchQuery.toLowerCase()
        return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query)) ||
            (item.size && item.size.toLowerCase().includes(query))
        )
    })

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
                fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-yellow-400 to-amber-500 shadow-lg transform transition-transform duration-300 ease-in-out
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
                                    onClick={() => setIsSidebarOpen(false)}
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
                <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
                    {/* Header */}
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
                                    <h2 className="text-xl lg:text-2xl font-bold">MENU</h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 lg:gap-4">
                                <span className="text-amber-200 text-xs lg:text-sm hidden sm:inline">Date: May 16, 2025</span>
                                <span className="text-amber-200 text-xs lg:text-sm hidden sm:inline">Time: 11:00 AM</span>
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

                    {/* Menu Content */}
                    <main className="flex-1 p-8">
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={openAddMenuItem}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Add Menu Item
                            </button>
                            <button
                                onClick={openAddonsModal}
                                className="bg-yellow-400 hover:bg-yellow-500 text-amber-900 font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                Manage Add-ons
                            </button>
                        </div>

                        {/* Search Filter */}
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search menu items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-all"
                                />
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                    <p className="text-gray-700 font-medium">Processing...</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && filteredMenuItems.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-xl text-gray-600">
                                    {searchQuery ? 'No menu items found matching your search' : 'No menu items found'}
                                </p>
                            </div>
                        )}

                        {/* Menu Items Table */}
                        {!loading && !error && menuItems.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-amber-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full table-fixed">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[15%]">
                                                    Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[20%]">
                                                    Description
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                    Price
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[12%]">
                                                    Category
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                    Size
                                                </th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[13%]">
                                                    Availability
                                                </th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[20%]">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMenuItems.map((item, index) => (
                                                <tr
                                                    key={item.menu_id}
                                                    className={`hover:bg-amber-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                        }`}
                                                >
                                                    {/* Name */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div
                                                            className="text-sm font-semibold text-gray-900 max-w-[160px] overflow-hidden text-ellipsis truncate"
                                                            title={item.name}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    </td>

                                                    {/* Description */}
                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="text-sm text-gray-700 max-w-[200px] overflow-hidden text-ellipsis truncate"
                                                            title={item.description}
                                                        >
                                                            {item.description || '-'}
                                                        </div>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-amber-600 overflow-hidden text-ellipsis truncate">
                                                            {item.price
                                                                .split(",")
                                                                .map((p: string) => `₱${p.trim()}`)
                                                                .join(", ")
                                                            }
                                                        </div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.category ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-amber-100 text-amber-800 max-w-[100px] truncate">
                                                                {item.category}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Size */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.size ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[80px] truncate">
                                                                {item.size}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    {/* Availability */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span
                                                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_available
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            {item.is_available ? 'Available' : 'Unavailable'}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => openMenuDetails(item)}
                                                                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteMenuItem(item.menu_id)}
                                                                className="inline-flex items-center gap-1 bg-red-400 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Menu Item Details Modal - View/Edit/Add */}
                {showMenuDetails && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-amber-900">
                                        {isAddMode ? 'Add New Menu Item' : isEditMode ? 'Edit Menu Item' : 'Menu Item Details'}
                                    </h2>
                                    <button
                                        onClick={closeMenuDetails}
                                        className="text-amber-900 hover:text-amber-700 text-3xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
                                {/* Image Upload */}
                                {(isEditMode || isAddMode) && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Menu Image:</label>
                                        <div className="space-y-3">
                                            {imagePreview && (
                                                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Accepted formats: PNG, JPG, JPEG, GIF, WebP (Max 5MB, 200x200 to 4000x4000 pixels)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* View Image (Read-only) */}
                                {!isEditMode && !isAddMode && selectedMenuItem?.image_url && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Menu Image:</label>
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                            <img
                                                src={getImageUrl(selectedMenuItem.image_url)}
                                                alt={selectedMenuItem.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Food Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Food Name: {(isEditMode || isAddMode) && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.name
                                                    ? 'border-red-300 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-amber-200'
                                                    }`}
                                                placeholder="Enter food name"
                                            />
                                            {formErrors.name && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-semibold">
                                            {selectedMenuItem?.name}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description: {(isEditMode || isAddMode) && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${formErrors.description
                                                    ? 'border-red-300 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-amber-200'
                                                    }`}
                                                rows={3}
                                                placeholder="Enter description"
                                            />
                                            {formErrors.description && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
                                            {selectedMenuItem?.description || '-'}
                                        </div>
                                    )}
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Price (₱): {(isEditMode || isAddMode) && <span className="text-red-500">*</span>}
                                    </label>
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <input
                                                type="text"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.price
                                                    ? 'border-red-300 focus:ring-red-200'
                                                    : 'border-gray-300 focus:ring-amber-200'
                                                    }`}
                                                placeholder="Enter price or prices separated by comma (e.g., 100, 150)"
                                            />
                                            {formErrors.price && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold text-xl">
                                            {selectedMenuItem?.price
                                                .split(",")
                                                .map((p: string) => `₱${p.trim()}`)
                                                .join(", ")
                                            }
                                        </div>
                                    )}
                                </div>

                                {/* Category and Size */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
                                        {isEditMode || isAddMode ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.category
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-amber-200'
                                                        }`}
                                                    placeholder="e.g., Main Dish, Dessert"
                                                />
                                                {formErrors.category && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                                                {selectedMenuItem?.category || '-'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Size:</label>
                                        {isEditMode || isAddMode ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={formData.size}
                                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${formErrors.size
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-amber-200'
                                                        }`}
                                                    placeholder="e.g., Small, Medium, Large"
                                                />
                                                {formErrors.size && (
                                                    <p className="text-red-500 text-sm mt-1">{formErrors.size}</p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                                                {selectedMenuItem?.size || '-'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Inclusions */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Inclusions:</label>
                                    {isEditMode || isAddMode ? (
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={inclusionInput}
                                                    onChange={(e) => setInclusionInput(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddInclusion()
                                                        }
                                                    }}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200"
                                                    placeholder="Add inclusion (press Enter)"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddInclusion}
                                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {inclusionsList.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {inclusionsList.map((inclusion, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                                        >
                                                            {inclusion}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveInclusion(idx)}
                                                                className="hover:bg-blue-200 rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        selectedMenuItem?.inclusion ? (
                                            <div className="flex flex-wrap gap-2">
                                                {parseInclusions(selectedMenuItem.inclusion).map((inclusion, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                                    >
                                                        {inclusion}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400">
                                                No inclusions
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Availability */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Availability:</label>
                                    {isEditMode || isAddMode ? (
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_available}
                                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Mark as available
                                            </span>
                                        </label>
                                    ) : (
                                        <div className={`w-full px-4 py-3 border-2 rounded-lg font-semibold text-center ${selectedMenuItem?.is_available
                                            ? 'bg-green-50 border-green-300 text-green-800'
                                            : 'bg-red-50 border-red-300 text-red-800'
                                            }`}>
                                            {selectedMenuItem?.is_available ? '✓ Available' : '✗ Unavailable'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                {isEditMode || isAddMode ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveMenuItem}
                                            disabled={processingAction}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processingAction ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={closeMenuDetails}
                                            disabled={processingAction}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsEditMode(true)}
                                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit className="h-5 w-5" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={closeMenuDetails}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Add-ons Modal */}
                {showAddonsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-amber-900">Manage Add-ons</h2>
                                    <button
                                        onClick={closeAddonsModal}
                                        className="text-amber-900 hover:text-amber-700 text-3xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Add New Add-on Button */}
                                <div className="mb-6">
                                    <button
                                        onClick={openAddAddon}
                                        disabled={isAddAddonMode || isEditAddonMode}
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Add New Add-on
                                    </button>
                                </div>

                                {/* Add/Edit Form */}
                                {(isAddAddonMode || isEditAddonMode) && (
                                    <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                        <h3 className="text-lg font-bold text-blue-900 mb-4">
                                            {isAddAddonMode ? 'Add New Add-on' : 'Edit Add-on'}
                                        </h3>
                                        <div className="space-y-4">
                                            {/* Add-on Name */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Add-on Name: <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={addonFormData.name}
                                                    onChange={(e) => setAddonFormData({ ...addonFormData, name: e.target.value })}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${addonFormErrors.name
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-blue-200'
                                                        }`}
                                                    placeholder="Enter add-on name"
                                                />
                                                {addonFormErrors.name && (
                                                    <p className="text-red-500 text-sm mt-1">{addonFormErrors.name}</p>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Price (₱): <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={addonFormData.price}
                                                    onChange={(e) => setAddonFormData({ ...addonFormData, price: e.target.value })}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${addonFormErrors.price
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-300 focus:ring-blue-200'
                                                        }`}
                                                    placeholder="Enter price"
                                                />
                                                {addonFormErrors.price && (
                                                    <p className="text-red-500 text-sm mt-1">{addonFormErrors.price}</p>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={handleSaveAddon}
                                                    disabled={processingAction}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingAction ? 'Saving...' : 'Save Add-on'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddAddonMode(false)
                                                        setIsEditAddonMode(false)
                                                        setSelectedAddon(null)
                                                        resetAddonForm()
                                                    }}
                                                    disabled={processingAction}
                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Add-ons List */}
                                {addons.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600">
                                        <MenuIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                        <p className="text-xl">No add-ons available</p>
                                        <p className="text-sm text-gray-500 mt-2">Click "Add New Add-on" to create one</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider">
                                                        Price
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {addons.map((addon, index) => (
                                                    <tr
                                                        key={addon.add_on}
                                                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                            }`}
                                                    >
                                                        {/* Name */}
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {addon.name}
                                                            </div>
                                                        </td>

                                                        {/* Price */}
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-amber-600">
                                                                ₱{Number(addon.price).toFixed(2)}
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => openEditAddon(addon)}
                                                                    disabled={isAddAddonMode || isEditAddonMode}
                                                                    className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAddon(addon.add_on)}
                                                                    disabled={isAddAddonMode || isEditAddonMode || processingAction}
                                                                    className="inline-flex items-center gap-1 bg-red-400 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                <button
                                    onClick={closeAddonsModal}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing Overlay */}
                {processingAction && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                            <p className="text-gray-700 font-medium">Processing...</p>
                        </div>
                    </div>
                )}

                {/* Alert Modal */}
                <AlertModal
                    isOpen={alertModal.isOpen}
                    onClose={closeAlert}
                    message={alertModal.message}
                    type={alertModal.type}
                    title={alertModal.title}
                />            </div>
        </ProtectedRoute>
    )
}