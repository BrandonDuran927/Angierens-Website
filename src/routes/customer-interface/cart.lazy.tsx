import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Plus, Minus, Edit2, Trash2, Bell, Heart, X, MessageSquare, Star, Menu, Package, Tag, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { AlertModal, type AlertType } from '@/components/AlertModal'
import { CustomerFooter } from '@/components/CustomerFooter'

export const Route = createLazyFileRoute('/customer-interface/cart')({
    component: RouteComponent,
})

interface CartItem {
    cart_item_id: string
    menu_id: string
    name: string
    addOns: Array<{ id: string; name: string; quantity: number; price: number }>
    price: number
    quantity: number
    image: string
    description?: string
    inclusions?: string[]
    size?: string | null
}
interface AddOnOption {
    add_on: string
    name: string
    price: number
}

interface Notification {
    id: string
    type: 'order' | 'feedback'
    title: string
    time: string
    icon: 'heart' | 'message' | 'star'
    read: boolean
}

function RouteComponent() {
    const { user, signOut } = useUser()
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Navigated to /customer-interface/cart")
        console.log("Current logged-in user:", user)
    }, [user])

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [addOns, setAddOns] = useState<Record<string, number>>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [addOnOptions, setAddOnOptions] = useState<AddOnOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartId, setCartId] = useState<string | null>(null);
    const [isCheckoutAddOnsModalOpen, setIsCheckoutAddOnsModalOpen] = useState(false);
    const [checkoutAddOns, setCheckoutAddOns] = useState<Record<string, number>>({});
    const [isVisible, setIsVisible] = useState(false)
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

    // Trigger entrance animation
    useEffect(() => {
        setIsVisible(true)
    }, [])

    // Navigation items with their corresponding routes
    const navigationItems = [
        { name: 'HOME', route: '/', active: false, showWhenLoggedOut: true },
        { name: 'MENU', route: '/customer-interface/', active: false, showWhenLoggedOut: true },
        { name: 'ORDER', route: '/customer-interface/order', active: false, showWhenLoggedOut: false },
        { name: 'REVIEW', route: '/customer-interface/feedback', active: false, showWhenLoggedOut: false },
        { name: 'MY INFO', route: '/customer-interface/my-info', active: false, showWhenLoggedOut: false }
    ].filter(item => user || item.showWhenLoggedOut);

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

    // Fetch add-on options from Supabase
    useEffect(() => {
        async function fetchAddOnOptions() {
            try {
                const { data, error } = await supabase
                    .from('add_on')
                    .select('*')

                if (error) throw error;

                if (data) {
                    setAddOnOptions(data);
                }
            } catch (error) {
                console.error('Error fetching add-on options:', error);
            }
        }

        fetchAddOnOptions();
    }, []);

    // Fetch cart items from Supabase
    useEffect(() => {
        async function fetchCartItems() {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // First, get or create cart for the user
                let { data: cartData, error: cartError } = await supabase
                    .from('cart')
                    .select('cart_id')
                    .eq('customer_uid', user.id)
                    .single();

                if (cartError && cartError.code !== 'PGRST116') {
                    throw cartError;
                }

                // If no cart exists, create one
                if (!cartData) {
                    const { data: newCart, error: createError } = await supabase
                        .from('cart')
                        .insert([
                            {
                                customer_uid: user.id,
                                created_at: new Date().toISOString()
                            }
                        ])
                        .select('cart_id')
                        .single();

                    if (createError) throw createError;
                    cartData = newCart;
                }

                setCartId(cartData.cart_id);

                // Fetch cart items with menu details
                const { data: cartItemsData, error: itemsError } = await supabase
                    .from('cart_item')
                    .select(`
                        cart_item_id,
                        quantity,
                        price,
                        size,
                        menu_id,
                        menu:menu_id (
                            name,
                            description,
                            image_url,
                            inclusion,
                            price
                        )
                    `)
                    .eq('cart_id', cartData.cart_id);

                if (itemsError) throw itemsError;

                if (cartItemsData) {
                    // For each cart item, fetch its add-ons
                    const itemsWithAddOns = await Promise.all(
                        cartItemsData.map(async (item: any) => {
                            const { data: addOnsData, error: addOnsError } = await supabase
                                .from('cart_item_add_on')
                                .select(`
                                    quantity,
                                    price,
                                    add_on_id,
                                    add_on:add_on_id (
                                        add_on,
                                        name,
                                        price
                                    )
                                `)
                                .eq('cart_item_id', item.cart_item_id);

                            if (addOnsError) {
                                console.error('Error fetching add-ons:', addOnsError);
                            }

                            const addOnsFormatted = addOnsData?.map((ao: any) => ({
                                id: ao.add_on.add_on,
                                name: ao.add_on.name,
                                quantity: ao.quantity,
                                price: ao.add_on.price
                            })) || [];

                            // Parse inclusions if it's a string
                            let inclusions: string[] = [];
                            if (item.menu.inclusion) {
                                try {
                                    inclusions = typeof item.menu.inclusion === 'string'
                                        ? JSON.parse(item.menu.inclusion)
                                        : item.menu.inclusion;
                                } catch (e) {
                                    inclusions = [item.menu.inclusion];
                                }
                            }

                            return {
                                cart_item_id: item.cart_item_id,
                                menu_id: item.menu_id,
                                name: item.menu.name,
                                addOns: addOnsFormatted,
                                price: parseFloat(item.price) || 0,
                                quantity: parseInt(item.quantity) || 1,
                                image: item.menu.image_url || '/public/menu-page img/pancit malabonbon.png',
                                description: item.menu.description,
                                inclusions: inclusions,
                                size: item.size || null
                            };
                        })
                    );

                    console.log('Fetched cart items:', itemsWithAddOns);

                    setCartItems(itemsWithAddOns);
                    setCartCount(itemsWithAddOns.length);
                }
            } catch (error) {
                console.error('Error fetching cart items:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCartItems();
    }, [user]);

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

    const updateQuantity = async (cart_item_id: string, newQuantity: number) => {
        if (newQuantity === 0) {
            await removeItem(cart_item_id);
            return;
        }

        try {
            const { error } = await supabase
                .from('cart_item')
                .update({ quantity: newQuantity })
                .eq('cart_item_id', cart_item_id);

            if (error) throw error;

            setCartItems(cartItems.map(item =>
                item.cart_item_id === cart_item_id ? { ...item, quantity: newQuantity } : item
            ));
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    const removeItem = async (cart_item_id: string) => {
        try {
            // First delete associated add-ons
            await supabase
                .from('cart_item_add_on')
                .delete()
                .eq('cart_item_id', cart_item_id);

            // Then delete the cart item
            const { error } = await supabase
                .from('cart_item')
                .delete()
                .eq('cart_item_id', cart_item_id);

            if (error) throw error;

            const updatedItems = cartItems.filter(item => item.cart_item_id !== cart_item_id);
            setCartItems(updatedItems);
            setCartCount(updatedItems.length);
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cart_item_id);
                return newSet;
            });
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const itemUnitPrice = item.price || 0;
            const addOnsTotal = item.addOns.reduce((addOnSum, addOn) => {
                const addOnPrice = addOn.price || 0;
                return addOnSum + (addOnPrice * addOn.quantity);
            }, 0);

            return total + (itemUnitPrice * item.quantity) + addOnsTotal;
        }, 0);
    }

    const formatPrice = (price: number) => {
        return `₱${price.toLocaleString()}`
    }

    const toggleItemSelection = (cart_item_id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cart_item_id)) {
                newSet.delete(cart_item_id);
            } else {
                newSet.add(cart_item_id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === cartItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(cartItems.map(item => item.cart_item_id)));
        }
    };

    const calculateSelectedTotal = () => {
        return cartItems.reduce((total, item) => {
            if (!selectedItems.has(item.cart_item_id)) return total;

            const itemUnitPrice = item.price || 0;
            const addOnsTotal = item.addOns.reduce((addOnSum, addOn) => {
                const addOnPrice = addOn.price || 0;
                return addOnSum + (addOnPrice * addOn.quantity);
            }, 0);

            return total + (itemUnitPrice * item.quantity) + addOnsTotal;
        }, 0);
    };
    const openEditModal = (item: CartItem) => {
        setSelectedItem(item);
        setOrderQuantity(item.quantity);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedItem(null);
        setOrderQuantity(1);
    };

    // calculateEditTotal is no longer needed since we removed add-ons from edit modal

    const updateCartItem = async () => {
        if (!selectedItem) return;

        try {
            // Update cart item quantity only
            const { error: updateError } = await supabase
                .from('cart_item')
                .update({ quantity: orderQuantity })
                .eq('cart_item_id', selectedItem.cart_item_id);

            if (updateError) throw updateError;

            // Update local state (keep existing add-ons unchanged)
            setCartItems(cartItems.map(item =>
                item.cart_item_id === selectedItem.cart_item_id
                    ? {
                        ...item,
                        quantity: orderQuantity
                    }
                    : item
            ));

            closeEditModal();
        } catch (error) {
            console.error('Error updating cart item:', error);
        }
    };

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

    const formatAddOnsDisplay = (addOns: Array<{ name: string; quantity: number }>) => {
        if (addOns.length === 0) return 'No add-ons';
        return addOns.map(addOn => `${addOn.name} (${addOn.quantity})`).join(', ');
    };

    const openCheckoutAddOnsModal = async () => {
        // Check if any selected items are unavailable
        const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cart_item_id));

        if (selectedCartItems.length === 0) {
            showAlert('Please select at least one item to proceed.', 'warning');
            return;
        }

        try {
            // Fetch menu availability for all selected items
            const menuIds = selectedCartItems.map(item => item.menu_id);
            const { data: menuData, error } = await supabase
                .from('menu')
                .select('menu_id, name, is_available')
                .in('menu_id', menuIds);

            if (error) throw error;

            // Check for unavailable items
            const unavailableItems = menuData?.filter(menu => !menu.is_available) || [];

            if (unavailableItems.length > 0) {
                const unavailableNames = unavailableItems.map(item => item.name).join(', ');
                showAlert(`The following menu item(s) are currently unavailable and cannot be ordered:\n\n${unavailableNames}\n\nPlease remove them from your selection to proceed.`, 'warning');
                return;
            }

            // If all items are available, proceed with the modal
            setCheckoutAddOns({});
            setIsCheckoutAddOnsModalOpen(true);
        } catch (error) {
            console.error('Error checking menu availability:', error);
            showAlert('An error occurred while checking menu availability. Please try again.', 'error');
        }
    };

    const closeCheckoutAddOnsModal = () => {
        setIsCheckoutAddOnsModalOpen(false);
        setCheckoutAddOns({});
    };

    const updateCheckoutAddOnQuantity = (addOnId: string, quantity: number) => {
        setCheckoutAddOns(prev => {
            const newAddOns = { ...prev };
            if (quantity <= 0) {
                delete newAddOns[addOnId];
            } else {
                newAddOns[addOnId] = quantity;
            }
            return newAddOns;
        });
    };

    const calculateCheckoutTotal = () => {
        return cartItems.reduce((total, item) => {
            if (!selectedItems.has(item.cart_item_id)) return total;

            const itemUnitPrice = item.price || 0;
            const addOnsTotal = item.addOns.reduce((addOnSum, addOn) => {
                const addOnPrice = addOn.price || 0;
                return addOnSum + (addOnPrice * addOn.quantity);
            }, 0);

            return total + (itemUnitPrice * item.quantity) + addOnsTotal;
        }, 0);
    };

    const proceedToPayment = async () => {
        try {
            // Double-check menu availability before proceeding to payment
            const selectedCartItems = cartItems.filter(item => selectedItems.has(item.cart_item_id));
            const menuIds = selectedCartItems.map(item => item.menu_id);

            const { data: menuData, error: menuError } = await supabase
                .from('menu')
                .select('menu_id, name, is_available')
                .in('menu_id', menuIds);

            if (menuError) throw menuError;

            // Check for unavailable items
            const unavailableItems = menuData?.filter(menu => !menu.is_available) || [];

            if (unavailableItems.length > 0) {
                const unavailableNames = unavailableItems.map(item => item.name).join(', ');
                showAlert(`The following menu item(s) are currently unavailable:\n\n${unavailableNames}\n\nPlease remove them from your cart to proceed.`, 'warning');
                closeCheckoutAddOnsModal();
                return;
            }

            // Apply add-ons only to the FIRST selected item (not duplicated across all items)
            // This means the add-ons are for the entire order, not per individual item
            if (selectedCartItems.length > 0 && Object.keys(checkoutAddOns).length > 0) {
                const firstItem = selectedCartItems[0];

                // Delete existing add-ons from the first item only
                await supabase
                    .from('cart_item_add_on')
                    .delete()
                    .eq('cart_item_id', firstItem.cart_item_id);

                // Insert new add-ons to the first item only
                const addOnsToInsert = Object.entries(checkoutAddOns)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([addOnId, quantity]) => {
                        const addOn = addOnOptions.find(option => option.add_on === addOnId);
                        return {
                            cart_item_id: firstItem.cart_item_id,
                            add_on_id: addOnId,
                            quantity: quantity,
                            price: addOn ? Number(addOn.price) : 0
                        };
                    });

                if (addOnsToInsert.length > 0) {
                    await supabase
                        .from('cart_item_add_on')
                        .insert(addOnsToInsert);
                }
            }

            // Navigate to payment
            const selectedIds = Array.from(selectedItems).join(',');
            navigate({
                to: '/customer-interface/payment',
                search: { items: selectedIds }
            });
        } catch (error) {
            console.error('Error updating add-ons:', error);
        }
    };

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

    return (
        <ProtectedRoute allowedRoles={['customer']}>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
                                            className="relative p-2 sm:p-2.5 text-amber-700 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-all duration-300 hover:scale-110"
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

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section - Enhanced */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-2xl shadow-lg">
                                    <ShoppingCart className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Shopping Cart</h1>
                                    <p className="text-gray-600 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
                                </div>
                            </div>

                            {cartItems.length > 0 && (
                                <button
                                    onClick={toggleSelectAll}
                                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-yellow-400 text-gray-800 rounded-xl font-semibold hover:bg-yellow-50 transition-all shadow-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 rounded border-2 border-yellow-400 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                                    />
                                    Select All
                                </button>
                            )}
                        </div>

                        {/* Mobile Select All */}
                        {cartItems.length > 0 && (
                            <button
                                onClick={toggleSelectAll}
                                className="sm:hidden w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-yellow-400 text-gray-800 rounded-xl font-semibold hover:bg-yellow-50 transition-all shadow-sm mb-4"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-5 h-5 rounded border-2 border-yellow-400 text-yellow-400 focus:ring-2 focus:ring-yellow-400"
                                />
                                Select All Items
                            </button>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60] backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent"></div>
                                <p className="text-gray-700 font-semibold text-lg">Loading...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items */}
                            <div className="space-y-4 mb-8">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl shadow-lg border-2 border-dashed border-gray-300">
                                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Package className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
                                        <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
                                        <Link to="/customer-interface">
                                            <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                                                Browse Menu
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    cartItems.map((item, index) => (
                                        <div
                                            key={item.cart_item_id}
                                            className="cart-item-animate bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-yellow-400 overflow-hidden"
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            <div className="p-5 sm:p-6">
                                                {/* Desktop Layout */}
                                                <div className="hidden lg:flex items-center gap-6">
                                                    {/* Selection Checkbox */}
                                                    <div className="flex-shrink-0">
                                                        <button
                                                            onClick={() => toggleItemSelection(item.cart_item_id)}
                                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${selectedItems.has(item.cart_item_id)
                                                                ? 'bg-yellow-400 border-yellow-400'
                                                                : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                                                                }`}
                                                        >
                                                            {selectedItems.has(item.cart_item_id) && (
                                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Product Image */}
                                                    <div className="flex-shrink-0">
                                                        <div className="relative group">
                                                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-2xl group-hover:scale-105 transition-transform duration-300"></div>
                                                            <img
                                                                src={getImageUrl(item.image)}
                                                                alt={item.name}
                                                                className="relative w-28 h-28 object-cover rounded-2xl border-4 border-white shadow-lg"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                                            {item.name}
                                                        </h3>
                                                        {item.size && (
                                                            <p className="text-sm text-amber-700 font-semibold mb-2">
                                                                Size: {item.size}
                                                            </p>
                                                        )}
                                                        {item.addOns.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {item.addOns.map((addOn, idx) => (
                                                                    <span key={idx} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                                                                        <Tag className="w-3 h-3" />
                                                                        {addOn.name} ({addOn.quantity}) - ₱{(addOn.price * addOn.quantity).toLocaleString()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                                            {formatPrice(Number(item.price))}
                                                        </div>
                                                    </div>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                                                        <button
                                                            onClick={() => {
                                                                if (item.quantity > 1) {
                                                                    updateQuantity(item.cart_item_id, item.quantity - 1);
                                                                }
                                                            }}
                                                            disabled={item.quantity <= 1}
                                                            className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md transform
            ${item.quantity > 1
                                                                    ? "bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 hover:shadow-lg hover:scale-105"
                                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                                                }
        `}
                                                        >
                                                            <Minus className={`w-5 h-5 ${item.quantity > 1 ? "text-white" : "text-gray-500"}`} />
                                                        </button>

                                                        <span className="w-12 text-center font-bold text-xl text-gray-800">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                            className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                                        >
                                                            <Plus className="w-5 h-5 text-white" />
                                                        </button>
                                                    </div>
                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-3 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-200"
                                                            title="Edit item"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeItem(item.cart_item_id)}
                                                            className="p-3 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Mobile/Tablet Layout */}
                                                <div className="lg:hidden">
                                                    {/* Top Row */}
                                                    <div className="flex items-start gap-3 mb-4">
                                                        {/* Selection Checkbox */}
                                                        <div className="flex-shrink-0 mt-1">
                                                            <button
                                                                onClick={() => toggleItemSelection(item.cart_item_id)}
                                                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${selectedItems.has(item.cart_item_id)
                                                                    ? 'bg-yellow-400 border-yellow-400'
                                                                    : 'border-gray-300 hover:border-yellow-400'
                                                                    }`}
                                                            >
                                                                {selectedItems.has(item.cart_item_id) && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Product Image */}
                                                        <div className="flex-shrink-0">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-xl"></div>
                                                                <img
                                                                    src={getImageUrl(item.image)}
                                                                    alt={item.name}
                                                                    className="relative w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-3 border-white shadow-md"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                                {item.name}
                                                            </h3>
                                                            {item.size && (
                                                                <p className="text-xs text-amber-700 font-semibold mb-1">
                                                                    Size: {item.size}
                                                                </p>
                                                            )}
                                                            {item.addOns.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    {item.addOns.slice(0, 2).map((addOn, idx) => (
                                                                        <span key={idx} className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                                                                            <Tag className="w-2.5 h-2.5" />
                                                                            {addOn.name} - ₱{(addOn.price * addOn.quantity).toLocaleString()}
                                                                        </span>
                                                                    ))}
                                                                    {item.addOns.length > 2 && (
                                                                        <span className="text-[10px] text-gray-500">+{item.addOns.length - 2} more</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                                                {formatPrice(Number(item.price))}
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons - Mobile */}
                                                        <div className="flex flex-col gap-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => openEditModal(item)}
                                                                className="p-2 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => removeItem(item.cart_item_id)}
                                                                className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Bottom Row - Quantity Controls */}
                                                    <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100 bg-gray-50 rounded-xl p-3">
                                                        <span className="text-sm font-semibold text-gray-600">Quantity:</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                                                            className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-lg flex items-center justify-center transition-all shadow-md"
                                                        >
                                                            <Minus className="w-4 h-4 text-white" />
                                                        </button>
                                                        <span className="w-10 text-center font-bold text-lg text-gray-800">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                                                            className="w-9 h-9 bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 rounded-lg flex items-center justify-center transition-all shadow-md"
                                                        >
                                                            <Plus className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Cart Summary - Enhanced Sticky Bottom Bar */}
                            {cartItems.length > 0 && (
                                <div className="sticky bottom-0 left-0 right-0 bg-white border-t-4 border-yellow-400 shadow-2xl rounded-t-3xl p-6 mt-8 z-30">
                                    <div className="max-w-6xl mx-auto">
                                        <div className="flex flex-col lg:flex-row items-center gap-4 lg:justify-between">
                                            {/* Total Section */}
                                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 px-6 py-4 rounded-2xl border-2 border-yellow-400 shadow-lg w-full sm:w-auto">
                                                    <div className="text-sm text-gray-600 mb-1">Selected Items: {selectedItems.size}</div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-semibold text-gray-700">Total:</span>
                                                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                                            {formatPrice(calculateSelectedTotal())}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Checkout Button */}
                                            <button
                                                disabled={selectedItems.size === 0}
                                                onClick={() => {
                                                    if (selectedItems.size > 0) {
                                                        openCheckoutAddOnsModal();
                                                    }
                                                }}
                                                className={`w-full lg:w-auto font-bold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-xl transform ${selectedItems.size === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white hover:shadow-2xl hover:scale-105'
                                                    }`}
                                            >
                                                <span>Proceed to Checkout</span>
                                                <ArrowRight className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Edit Modal - Enhanced */}
                {isEditModalOpen && selectedItem && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 lg:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-2 rounded-xl">
                                                <Edit2 className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{selectedItem.name}</h2>
                                        </div>
                                        <p className="text-xl font-semibold text-yellow-600 mb-2">{formatPrice(selectedItem.price)}</p>
                                        <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                                    </div>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all ml-4"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {selectedItem.inclusions && selectedItem.inclusions.length > 0 && (
                                    <div className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-2xl border-2 border-yellow-200">
                                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-yellow-600" />
                                            Inclusions:
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedItem.inclusions.map((inclusion: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                    <p className="text-gray-700 text-sm">{inclusion}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity selector */}
                                <div className="flex items-center gap-4 mb-6 bg-gray-50 p-5 rounded-2xl">
                                    <span className="text-gray-800 font-bold text-lg">Quantity:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Minus className="h-5 w-5 text-white" />
                                        </button>
                                        <span className="text-2xl font-bold w-16 text-center text-gray-900">{orderQuantity}</span>
                                        <button
                                            onClick={() => setOrderQuantity(orderQuantity + 1)}
                                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Plus className="h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info message about add-ons */}
                                <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Tag className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-800">
                                            <strong>Note:</strong> Add-ons can be selected for your entire order during checkout.
                                        </p>
                                    </div>
                                </div>

                                {/* Total and Update Cart */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-gray-200">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                            {formatPrice(selectedItem.price * orderQuantity)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={updateCartItem}
                                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        Update Cart
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* Checkout Add-ons Modal - Enhanced */}
                {isCheckoutAddOnsModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 lg:p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-2 rounded-xl">
                                                <Tag className="w-6 h-6 text-white" />
                                            </div>
                                            Customize Your Order
                                        </h2>
                                        <p className="text-gray-600">Add some extras to make your meal even better!</p>
                                    </div>
                                    <button
                                        onClick={closeCheckoutAddOnsModal}
                                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Selected Items Summary */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-5 mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-yellow-600" />
                                        Your Selected Items ({selectedItems.size})
                                    </h3>
                                    <div className="space-y-3">
                                        {cartItems
                                            .filter(item => selectedItems.has(item.cart_item_id))
                                            .map((item) => (
                                                <div key={item.cart_item_id} className="flex items-center gap-4 bg-white p-3 rounded-xl">
                                                    <img
                                                        src={getImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatPrice(Number(item.price))}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Add-ons Section */}
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-yellow-600" />
                                        Add-ons for Your Order
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">These add-ons will be applied to your entire order</p>
                                    {addOnOptions.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">No add-ons available</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {addOnOptions.map((addOn) => (
                                                <div key={addOn.add_on} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-yellow-400">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex-1">
                                                            <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-lg text-sm font-bold mb-2">
                                                                {addOn.name}
                                                            </span>
                                                            <p className="text-sm font-bold text-gray-900">₱{Number(addOn.price).toLocaleString()} each</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-3 bg-white rounded-lg p-2">
                                                        <button
                                                            onClick={() => updateCheckoutAddOnQuantity(addOn.add_on, (checkoutAddOns[addOn.add_on] || 0) - 1)}
                                                            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                        >
                                                            <Minus className="h-5 w-5 text-gray-700" />
                                                        </button>
                                                        <span className="w-12 text-center font-bold text-lg text-gray-900">
                                                            {checkoutAddOns[addOn.add_on] || 0}
                                                        </span>
                                                        <button
                                                            onClick={() => updateCheckoutAddOnQuantity(addOn.add_on, (checkoutAddOns[addOn.add_on] || 0) + 1)}
                                                            className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 flex items-center justify-center transition-all shadow-sm"
                                                        >
                                                            <Plus className="h-5 w-5 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Total and Buttons */}
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 border-t-2 border-gray-300">
                                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 px-6 py-4 rounded-2xl border-2 border-yellow-400 w-full lg:w-auto">
                                        <div className="text-sm text-gray-600 mb-1">Grand Total</div>
                                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                            ₱{(calculateCheckoutTotal() + Object.entries(checkoutAddOns).reduce((sum, [addOnId, qty]) => {
                                                const addOn = addOnOptions.find(a => a.add_on === addOnId);
                                                return sum + (addOn ? Number(addOn.price) * qty : 0);
                                            }, 0)).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 w-full lg:w-auto">
                                        <button
                                            onClick={closeCheckoutAddOnsModal}
                                            className="flex-1 lg:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-2xl font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={proceedToPayment}
                                            className="flex-1 lg:flex-none bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                                        >
                                            Proceed to Payment
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <CustomerFooter />

                {/* Alert Modal */}
                <AlertModal
                    isOpen={alertModal.isOpen}
                    onClose={closeAlert}
                    title={alertModal.title}
                    message={alertModal.message}
                    type={alertModal.type}
                />
            </div>
        </ProtectedRoute >
    )
}