import React, { useState } from 'react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
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
    MenuIcon,
    LucideCalendar,
    Search,
    Eye,
    X,
    Package,
    Truck,
    Calendar,
    Settings,
    User,
    DollarSign,
    Edit,
    Trash2,
    Plus
} from 'lucide-react'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useLocation } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const Route = createLazyFileRoute('/staff/menu')({
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
    image_url: string | null
}

interface AddOn {
    add_on: string
    name: string
    price: number
    quantity?: number
}

function RouteComponent() {
    const location = useLocation()
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

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

    const notificationCount = 1



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
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file (PNG, JPG, JPEG, GIF, or WebP)')
                e.target.value = ''
                return
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024 // 5MB in bytes
            if (file.size > maxSize) {
                alert('Image size must not exceed 5MB. Please choose a smaller image.')
                e.target.value = ''
                return
            }

            // Validate image dimensions
            const img = new Image()
            const objectUrl = URL.createObjectURL(file)

            img.onload = () => {
                URL.revokeObjectURL(objectUrl)

                // Optional: Check minimum dimensions
                if (img.width < 200 || img.height < 200) {
                    alert('Image dimensions must be at least 200x200 pixels')
                    e.target.value = ''
                    return
                }

                // Optional: Check maximum dimensions
                if (img.width > 4000 || img.height > 4000) {
                    alert('Image dimensions must not exceed 4000x4000 pixels')
                    e.target.value = ''
                    return
                }

                // If all validations pass, set the file
                setImageFile(file)
                const reader = new FileReader()
                reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                }
                reader.readAsDataURL(file)
            }

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl)
                alert('Failed to load image. Please select a valid image file.')
                e.target.value = ''
            }

            img.src = objectUrl
        }
    }

    const uploadImage = async (menuName: string): Promise<string | null> => {
        if (!imageFile) return null

        try {
            setUploadingImage(true)

            // Get the file extension from the uploaded file
            const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'png'

            // Create filename: menu name + original extension
            const fileName = `${menuName.toLowerCase().replace(/\s+/g, '-')}.${fileExtension}`

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('menu-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: true // Replace if exists
                })

            if (error) {
                console.error('Supabase upload error:', error)
                throw error
            }

            // Return just the filename, not the full URL
            // We'll construct the full URL when displaying using getImageUrl
            return fileName
        } catch (err: any) {
            console.error('Error uploading image:', err)
            alert(`Failed to upload image: ${err.message || 'Unknown error'}`)
            return null
        } finally {
            setUploadingImage(false)
        }
    }

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

            console.log('Fetched menu items:', data)
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
        // Update this line to use getImageUrl
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

        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Food name is required'
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Food name must be at least 2 characters'
        } else if (formData.name.trim().length > 100) {
            errors.name = 'Food name must not exceed 100 characters'
        }

        // Description validation
        if (!formData.description.trim()) {
            errors.description = 'Description is required'
        } else if (formData.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters'
        } else if (formData.description.trim().length > 500) {
            errors.description = 'Description must not exceed 500 characters'
        }

        // Price validation
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

        // Category validation
        if (formData.category && formData.category.trim().length > 50) {
            errors.category = 'Category must not exceed 50 characters'
        }

        // Size validation
        if (formData.size && formData.size.trim().length > 50) {
            errors.size = 'Size must not exceed 50 characters'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSaveMenuItem = async () => {
        // Validate form
        if (!validateMenuItemForm()) {
            alert('Please fix the errors in the form before saving.')
            return
        }

        try {
            setProcessingAction(true)

            // Sanitize data
            const sanitizedName = formData.name.trim()
            const sanitizedDescription = formData.description.trim()
            const sanitizedCategory = formData.category?.trim() || null
            const sanitizedSize = formData.size?.trim() || null

            // Check for duplicate name (case-insensitive) when adding or editing
            const { data: existingItems, error: checkError } = await supabase
                .from('menu')
                .select('menu_id, name')
                .ilike('name', sanitizedName)

            if (checkError) throw checkError

            // If adding mode, any duplicate is an error
            if (isAddMode && existingItems && existingItems.length > 0) {
                alert(`A menu item with the name "${sanitizedName}" already exists. Please use a different name.`)
                setProcessingAction(false)
                return
            }

            // If editing mode, check if duplicate is different item
            if (isEditMode && selectedMenuItem && existingItems) {
                const duplicates = existingItems.filter(item => item.menu_id !== selectedMenuItem.menu_id)
                if (duplicates.length > 0) {
                    alert(`A menu item with the name "${sanitizedName}" already exists. Please use a different name.`)
                    setProcessingAction(false)
                    return
                }
            }

            // Upload image if there's a new one
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
                inclusion: inclusionsList.length > 0 ? JSON.stringify(inclusionsList) : null,
                is_available: formData.is_available,
                image_url: imageUrl
            }

            if (isAddMode) {
                const { error } = await supabase
                    .from('menu')
                    .insert([menuData])

                if (error) throw error
                alert('Menu item added successfully!')
            } else if (isEditMode && selectedMenuItem) {
                const { error } = await supabase
                    .from('menu')
                    .update(menuData)
                    .eq('menu_id', selectedMenuItem.menu_id)

                if (error) throw error
                alert('Menu item updated successfully!')
            }

            await fetchMenuItems()
            closeMenuDetails()
        } catch (err: any) {
            console.error('Error saving menu item:', err)
            alert(`Failed to save menu item: ${err.message || 'Unknown error'}`)
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

            alert('Menu item deleted successfully!')
            await fetchMenuItems()
            closeMenuDetails()
        } catch (err) {
            console.error('Error deleting menu item:', err)
            alert('Failed to delete menu item')
        } finally {
            setProcessingAction(false)
        }
    }

    // Add-on management functions
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

        // Name validation
        if (!addonFormData.name.trim()) {
            errors.name = 'Add-on name is required'
        } else if (addonFormData.name.trim().length < 2) {
            errors.name = 'Add-on name must be at least 2 characters'
        } else if (addonFormData.name.trim().length > 100) {
            errors.name = 'Add-on name must not exceed 100 characters'
        }

        // Price validation
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
        // Validate form
        if (!validateAddonForm()) {
            alert('Please fix the errors in the form before saving.')
            return
        }

        try {
            setProcessingAction(true)

            const sanitizedName = addonFormData.name.trim()

            // Check for duplicate name (case-insensitive)
            const { data: existingAddons, error: checkError } = await supabase
                .from('add_on')
                .select('add_on, name')
                .ilike('name', sanitizedName)

            if (checkError) throw checkError

            // If adding mode, any duplicate is an error
            if (isAddAddonMode && existingAddons && existingAddons.length > 0) {
                alert(`An add-on with the name "${sanitizedName}" already exists. Please use a different name.`)
                setProcessingAction(false)
                return
            }

            // If editing mode, check if duplicate is different add-on
            if (isEditAddonMode && selectedAddon && existingAddons) {
                const duplicates = existingAddons.filter(addon => addon.add_on !== selectedAddon.add_on)
                if (duplicates.length > 0) {
                    alert(`An add-on with the name "${sanitizedName}" already exists. Please use a different name.`)
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
                alert('Add-on added successfully!')
            } else if (isEditAddonMode && selectedAddon) {
                const { error } = await supabase
                    .from('add_on')
                    .update(addonData)
                    .eq('add_on', selectedAddon.add_on)

                if (error) throw error
                alert('Add-on updated successfully!')
            }

            await fetchAddons()
            setIsAddAddonMode(false)
            setIsEditAddonMode(false)
            setSelectedAddon(null)
            resetAddonForm()
        } catch (err: any) {
            console.error('Error saving add-on:', err)
            alert(`Failed to save add-on: ${err.message || 'Unknown error'}`)
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

            alert('Add-on deleted successfully!')
            await fetchAddons()
        } catch (err) {
            console.error('Error deleting add-on:', err)
            alert('Failed to delete add-on')
        } finally {
            setProcessingAction(false)
        }
    }

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    const parseInclusions = (inclusion: string | null): string[] => {
        if (!inclusion) return []
        try {
            const parsed = JSON.parse(inclusion)
            if (Array.isArray(parsed)) return parsed
        } catch {
            return inclusion.split(/[,;\n]/).map(item => item.trim()).filter(item => item)
        }
        return []
    }

    const filteredMenuItems = menuItems.filter(item => {
        const query = searchQuery.toLowerCase()
        return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query)) ||
            (item.size && item.size.toLowerCase().includes(query))
        )
    })

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

                <div className="flex-1 flex flex-col">
                    {/* Header */}
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
                                    <h1 className="text-xl lg:text-3xl font-bold">MENU</h1>
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

                        {/* Menu Items Table */}
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
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[13%]">
                                                Availability
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[20%]">
                                                Actions
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[10%]">
                                                Image
                                            </th>
                                        </tr>
                                    </thead>
                                    {loading ? (
                                        <tbody>
                                            <tr>
                                                <td colSpan={7} className="text-center py-12">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800"></div>
                                                        <p className="text-gray-700 font-medium">Loading...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    ) : (
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMenuItems.map((item, index) => (
                                                <tr
                                                    key={item.menu_id}
                                                    className={`hover:bg-amber-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div
                                                            className="text-sm font-semibold text-gray-900 max-w-[160px] overflow-hidden text-ellipsis truncate"
                                                            title={item.name}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div
                                                            className="text-sm text-gray-700 max-w-[200px] overflow-hidden text-ellipsis truncate"
                                                            title={item.description}
                                                        >
                                                            {item.description || '-'}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-amber-600">
                                                            ₱{item.price}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.category ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-amber-100 text-amber-800 max-w-[100px] truncate">
                                                                {item.category}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {item.size ? (
                                                            <span className="px-2 py-1 inline-block text-xs font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[80px] truncate">
                                                                {item.size}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">-</span>
                                                        )}
                                                    </td>

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

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                            <img
                                                                src={getImageUrl(item.image_url)}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = '/api/placeholder/300/200'
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    )}
                                </table>
                            </div>
                        </div>
                    </main>
                </div>

                {/* Menu Item Details Modal - View/Edit/Add */}
                {showMenuDetails && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500">
                                <h2 className="text-2xl font-bold text-amber-900">
                                    {isAddMode ? 'Add New Menu Item' : isEditMode ? 'Edit Menu Item' : 'Menu Item Details'}
                                </h2>
                            </div>

                            {/* Details Content */}
                            <div className="p-6 space-y-4">
                                {/* Food Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Food Name:</label>
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter food name"
                                            />
                                            {formErrors.name && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description:</label>
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${formErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                rows={3}
                                                placeholder="Enter description"
                                            />
                                            {formErrors.description && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price:</label>
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${formErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="0.00"
                                            />
                                            {formErrors.price && (
                                                <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 font-bold text-xl">
                                            ₱{selectedMenuItem?.price}
                                        </div>
                                    )}
                                </div>

                                {/* Category, Size, and Quantity in a Grid */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
                                        {isEditMode || isAddMode ? (
                                            <>
                                                <input
                                                    type="text"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${formErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Category"
                                                />
                                                {formErrors.category && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
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
                                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${formErrors.size ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="S, M, L"
                                                />
                                                {formErrors.size && (
                                                    <p className="mt-1 text-sm text-red-600">{formErrors.size}</p>
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
                                            {/* Add-on Dropdown Selection */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Select from Add-ons:</label>
                                                <select
                                                    value=""
                                                    onChange={(e) => {
                                                        const selectedAddonId = e.target.value
                                                        const selectedAddon = addons.find(a => a.add_on === selectedAddonId)
                                                        if (selectedAddon && !inclusionsList.includes(selectedAddon.name)) {
                                                            setInclusionsList([...inclusionsList, selectedAddon.name])
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition-all"
                                                >
                                                    <option value="">Choose an add-on...</option>
                                                    {addons.map((addon) => (
                                                        <option key={addon.add_on} value={addon.add_on}>
                                                            {addon.name} (₱{Number(addon.price).toFixed(2)})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Manual Custom Input */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Or add custom inclusion:</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={inclusionInput}
                                                        onChange={(e) => setInclusionInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddInclusion()}
                                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition-all"
                                                        placeholder="Type custom inclusion..."
                                                    />
                                                    <button
                                                        onClick={handleAddInclusion}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
                                                    >
                                                        <Plus className="h-5 w-5" />
                                                        Add
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Selected Inclusions List */}
                                            {inclusionsList.length > 0 && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">Selected inclusions:</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {inclusionsList.map((inclusion, idx) => {
                                                            const addon = addons.find(a => a.name === inclusion)
                                                            return (
                                                                <span
                                                                    key={idx}
                                                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${addon
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                        }`}
                                                                >
                                                                    {inclusion}
                                                                    {addon && `(₱${Number(addon.price).toFixed(2)})`}
                                                                    {!addon && ' (Custom)'}
                                                                    <button
                                                                        onClick={() => handleRemoveInclusion(idx)}
                                                                        className="hover:text-red-600 transition-colors"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {selectedMenuItem?.inclusion ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {parseInclusions(selectedMenuItem.inclusion).map((inclusion, idx) => {
                                                        const addon = addons.find(a => a.name === inclusion)
                                                        return (
                                                            <span
                                                                key={idx}
                                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${addon
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-green-100 text-green-800'
                                                                    }`}
                                                            >
                                                                {inclusion}
                                                                {addon && `(₱${Number(addon.price).toFixed(2)})`}
                                                                {!addon && ' (Custom)'}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400">
                                                    No inclusions
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Availability Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Availability:</label>
                                    {isEditMode || isAddMode ? (
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={formData.is_available === true}
                                                    onChange={() => setFormData({ ...formData, is_available: true })}
                                                    className="w-5 h-5 text-green-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Available</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={formData.is_available === false}
                                                    onChange={() => setFormData({ ...formData, is_available: false })}
                                                    className="w-5 h-5 text-red-600"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Unavailable</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className={`w-full px-4 py-3 border-2 rounded-lg font-semibold text-center ${selectedMenuItem?.is_available
                                            ? 'bg-green-50 border-green-300 text-green-800'
                                            : 'bg-red-50 border-red-300 text-red-800'
                                            }`}>
                                            {selectedMenuItem?.is_available ? '✓ Available' : '✗ Unavailable'}
                                        </div>
                                    )}
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Menu Image:</label>
                                    {isEditMode || isAddMode ? (
                                        <div className="space-y-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                            {imagePreview && (
                                                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/api/placeholder/300/200'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Image will be saved as: {formData.name ? `${formData.name.toLowerCase().replace(/\s+/g, '-')}.png` : 'menu-name.png'}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedMenuItem?.image_url ? (
                                                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img
                                                        src={getImageUrl(selectedMenuItem.image_url)}
                                                        alt={selectedMenuItem.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/api/placeholder/300/200'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-400 text-center">
                                                    No image uploaded
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 space-y-3">
                                    {isEditMode || isAddMode ? (
                                        <>
                                            <button
                                                onClick={handleSaveMenuItem}
                                                disabled={processingAction || uploadingImage}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {uploadingImage ? 'Uploading Image...' : processingAction ? 'Saving...' : isAddMode ? 'Add Menu Item' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (isAddMode) {
                                                        closeMenuDetails()
                                                    } else {
                                                        setIsEditMode(false)
                                                        setFormData({
                                                            name: selectedMenuItem?.name || '',
                                                            description: selectedMenuItem?.description || '',
                                                            price: selectedMenuItem?.price.toString() || '',
                                                            category: selectedMenuItem?.category || '',
                                                            size: selectedMenuItem?.size || '',
                                                            inclusion: '',
                                                            is_available: selectedMenuItem?.is_available || true
                                                        })
                                                        setInclusionsList(parseInclusions(selectedMenuItem?.inclusion || null))
                                                    }
                                                }}
                                                disabled={processingAction}
                                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditMode(true)}
                                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit className="h-5 w-5" />
                                                Edit Menu Item
                                            </button>
                                            <button
                                                onClick={closeMenuDetails}
                                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                                            >
                                                Close
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manage Add-ons Modal */}
                {showAddonsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-400 to-amber-500">
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
                            <div className="p-6">
                                {/* Add New Add-on Button */}
                                {!isAddAddonMode && !isEditAddonMode && (
                                    <button
                                        onClick={openAddAddon}
                                        className="mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Add New Add-on
                                    </button>
                                )}

                                {/* Add/Edit Add-on Form */}
                                {(isAddAddonMode || isEditAddonMode) && (
                                    <div className="mb-6 bg-gray-50 p-6 rounded-lg border-2 border-amber-200">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                                            {isAddAddonMode ? 'Add New Add-on' : 'Edit Add-on'}
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Name:</label>
                                                <input
                                                    type="text"
                                                    value={addonFormData.name}
                                                    onChange={(e) => setAddonFormData({ ...addonFormData, name: e.target.value })}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${addonFormErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Enter add-on name"
                                                />
                                                {addonFormErrors.name && (
                                                    <p className="mt-1 text-sm text-red-600">{addonFormErrors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price:</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={addonFormData.price}
                                                    onChange={(e) => setAddonFormData({ ...addonFormData, price: e.target.value })}
                                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-amber-500 transition-all ${addonFormErrors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    placeholder="0.00"
                                                />
                                                {addonFormErrors.price && (
                                                    <p className="mt-1 text-sm text-red-600">{addonFormErrors.price}</p>
                                                )}
                                            </div>
                                            {/* <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (optional):</label>
                                            <input
                                                type="number"
                                                value={addonFormData.quantity}
                                                onChange={(e) => setAddonFormData({ ...addonFormData, quantity: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition-all"
                                                placeholder="Enter quantity"
                                            />
                                        </div> */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleSaveAddon}
                                                    disabled={processingAction}
                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                >
                                                    {processingAction ? 'Saving...' : isAddAddonMode ? 'Add Add-on' : 'Save Changes'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddAddonMode(false)
                                                        setIsEditAddonMode(false)
                                                        setSelectedAddon(null)
                                                        resetAddonForm()
                                                    }}
                                                    disabled={processingAction}
                                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                                        <table className="w-full table-fixed">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-amber-800 to-amber-800">
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[35%]">
                                                        Name
                                                    </th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-yellow-400 uppercase tracking-wider w-[20%]">
                                                        Price
                                                    </th>

                                                    <th className="px-6 py-4 text-center text-sm font-bold text-yellow-400 uppercase tracking-wider w-[25%]">
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
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className="text-sm font-semibold text-gray-900 max-w-[200px] overflow-hidden text-ellipsis truncate"
                                                                title={addon.name}
                                                            >
                                                                {addon.name}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-amber-600">
                                                                ₱{Number(addon.price).toFixed(2)}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => openEditAddon(addon)}
                                                                    className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAddon(addon.add_on)}
                                                                    className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
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
                            <div className="p-6 border-t border-gray-200">
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
            </div>
        </ProtectedRoute>
    )
}