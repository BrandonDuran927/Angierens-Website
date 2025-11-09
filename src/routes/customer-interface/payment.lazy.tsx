import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Bell, ChevronDown, ArrowLeft, Edit2, X, Menu, Calendar, Heart, Star, MessageSquare } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { useSearch } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/customer-interface/payment')({
    component: RouteComponent
})

interface Notification {
    id: string
    type: 'order' | 'feedback'
    title: string
    time: string
    icon: 'heart' | 'message' | 'star'
    read: boolean
}

interface AddressFormData {
    address_type: string;
    address_line: string;
    region: string;
    city: string;
    barangay: string;
    postal_code: string;
}

interface CartItem {
    cart_item_id: string
    menu_id: string
    quantity: number
    price: number
    menu: {
        name: string
        description: string
        image_url: string
        price: number
    }
    cart_item_add_on: Array<{
        add_on_id: string
        quantity: number
        price: number
        add_on: {
            name: string
            price: number
        }
    }>
}

function RouteComponent() {
    const { user, signOut } = useUser()
    const navigate = useNavigate();
    const search = useSearch({ from: '/customer-interface/payment' });

    useEffect(() => {
        console.log("Navigated to /customer-interface/payment")
        console.log("Current logged-in user:", user)
    }, [user])

    async function handleLogout() {
        await signOut();
        navigate({ to: "/login" });
    }

    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
    const [newAddressForm, setNewAddressForm] = useState<AddressFormData>({
        address_type: 'Secondary',
        address_line: '',
        region: '',
        city: '',
        barangay: '',
        postal_code: ''
    });
    const [autocompleteInput, setAutocompleteInput] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(3);
    const [deliveryOption, setDeliveryOption] = useState('Delivery');
    const [fulfillmentType, setFulfillmentType] = useState('scheduled');
    const [selectedTime, setSelectedTime] = useState('2:00 PM');
    const [paymentMethod, setPaymentMethod] = useState('GCash');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
    const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [additionalInformation, setAdditionalInformation] = useState('')
    const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    // Navigation items with their corresponding routes
    const navigationItems = [
        { name: 'HOME', route: '/customer-interface/home', active: false },
        { name: 'MENU', route: '/customer-interface/', active: false },
        { name: 'ORDER', route: '/customer-interface/order', active: false },
        { name: 'FEEDBACK', route: '/customer-interface/feedback', active: false },
        { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
    ];

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

    // Fetch selected cart items from Supabase
    useEffect(() => {
        async function fetchSelectedItems() {
            if (!search.items || !user) {
                setIsLoading(false);
                return;
            }

            try {
                const itemIds = search.items.split(',');

                // Fetch the selected items from Supabase with menu and add-ons
                const { data, error } = await supabase
                    .from('cart_item')
                    .select(`
                        cart_item_id,
                        quantity,
                        price,
                        menu_id,
                        menu:menu_id (
                            name,
                            description,
                            image_url,
                            price
                        ),
                        cart_item_add_on (
                            add_on_id,
                            quantity,
                            price,
                            add_on:add_on_id (
                                name,
                                price
                            )
                        )
                    `)
                    .in('cart_item_id', itemIds);

                if (error) {
                    console.error('Error fetching cart items:', error);
                } else if (data) {
                    // inside your fetchSelectedItems() after you get `data`
                    if (data) {
                        const rows = data as any[]; // supabase returns unknown-shaped rows
                        const formatted: CartItem[] = rows.map(row => {
                            // supabase sometimes returns related rows as arrays (e.g. menu: [{...}]) or as an object.
                            const menuObj = Array.isArray(row.menu) ? row.menu[0] ?? null : row.menu ?? null;

                            const cart_item_add_on = (row.cart_item_add_on ?? []).map((a: any) => {
                                const addOnObj = Array.isArray(a.add_on) ? a.add_on[0] ?? null : a.add_on ?? null;
                                return {
                                    add_on_id: a.add_on_id,
                                    quantity: a.quantity,
                                    price: a.price,
                                    add_on: addOnObj ? { name: addOnObj.name, price: addOnObj.price } : null
                                };
                            });

                            return {
                                cart_item_id: row.cart_item_id,
                                menu_id: row.menu_id,
                                quantity: row.quantity,
                                price: row.price,
                                menu: menuObj ? {
                                    name: menuObj.name,
                                    description: menuObj.description,
                                    image_url: menuObj.image_url,
                                    price: menuObj.price
                                } : null,
                                cart_item_add_on
                            } as CartItem;
                        });

                        setSelectedCartItems(formatted);
                    }

                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSelectedItems();
    }, [search.items, user]);

    // Fetch cart count - FIXED: Need to join with cart table to filter by customer
    useEffect(() => {
        async function fetchCartCount() {
            if (!user) return;

            // First get the user's cart_id
            const { data: cartData, error: cartError } = await supabase
                .from('cart')
                .select('cart_id')
                .eq('customer_uid', user.id)
                .single();

            if (cartError || !cartData) {
                console.error('Error fetching cart:', cartError);
                return;
            }

            // Then count items in that cart
            const { data, error } = await supabase
                .from('cart_item')
                .select('cart_item_id', { count: 'exact' })
                .eq('cart_id', cartData.cart_id);

            if (!error && data) {
                setCartCount(data.length);
            }
        }

        fetchCartCount();
    }, [user]);

    // Fetch available schedules from Supabase
    useEffect(() => {
        async function fetchSchedules() {
            try {
                const { data, error } = await supabase
                    .from('schedule')
                    .select('*')
                    .eq('is_available', true)
                    .gte('schedule_date', new Date().toISOString().split('T')[0])
                    .order('schedule_date', { ascending: true })
                    .order('schedule_time', { ascending: true });

                if (error) {
                    console.error('Error fetching schedules:', error);
                    return;
                }

                console.log('Fetched schedules:', data);

                if (data) {
                    setAvailableSchedules(data);

                    const uniqueDates = [...new Set(data.map(s => s.schedule_date))];
                    setAvailableDates(uniqueDates.map(dateString => {
                        const [year, month, day] = dateString.split('-');
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    }));

                    // If a date is already selected, update available times for that date
                    if (selectedDate) {
                        updateAvailableTimes(selectedDate, data);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchSchedules();
    }, []);

    // Fetch customer addresses
    useEffect(() => {
        async function fetchAddresses() {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('address')
                    .select('*')
                    .eq('customer_id', user.id);

                if (error) {
                    console.error('Error fetching addresses:', error);
                    return;
                }

                if (data && data.length > 0) {
                    setAddresses(data);
                    // Set first address as default
                    setSelectedAddress(data[0]);
                    setSelectedAddressId(data[0].address_id);
                } else {
                    // No addresses found, prompt user to add one
                    console.log('No addresses found for user');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        fetchAddresses();
    }, [user]);

    const updateAvailableTimes = (date: Date, schedules = availableSchedules) => {
        // Format date as YYYY-MM-DD in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        const timesForDate = schedules
            .filter(s => s.schedule_date === dateString)
            .map(s => {
                // Convert time format from HH:MM:SS to h:MM AM/PM
                const [hours, minutes] = s.schedule_time.split(':');
                const hour = parseInt(hours);
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${displayHour}:${minutes} ${period}`;
            });

        setAvailableTimes(timesForDate);

        if (timesForDate.length > 0 && !timesForDate.includes(selectedTime)) {
            setSelectedTime(timesForDate[0]);
        }
    };

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

    const deliveryFee = deliveryOption === 'delivery' ? 75 : 0;
    const subtotal = selectedCartItems.reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        const addOnsTotal = item.cart_item_add_on?.reduce((sum, addOn) => sum + (addOn.price * addOn.quantity), 0) || 0;
        return total + itemTotal + addOnsTotal;
    }, 0);
    const total = subtotal + deliveryFee;

    const timeOptions = [
        '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
        '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'
    ];

    const formatPrice = (price: number) => {
        return `₱ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const generateCalendarDays = () => {
        const currentMonth = selectedDate.getMonth();
        const currentYear = selectedDate.getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        const currentDate = new Date(startDate);

        for (let i = 0; i < 42; i++) {
            days.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return days;
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if date is in the past
        if (date < today) return true;

        // Check if date is in available schedules using local date comparison
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return !availableDates.some(d =>
            d.getFullYear() === year &&
            d.getMonth() === month &&
            d.getDate() === day
        );
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedDate(newDate);
    };

    const handlePlaceOrder = async () => {
        if (!user) {
            alert('Please log in to place an order');
            return;
        }

        if (selectedCartItems.length === 0) {
            alert('No items in order');
            return;
        }

        try {
            if (!selectedDate || isDateDisabled(selectedDate)) {
                alert('Please select a valid date for your order');
                return;
            }

            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            const [hours, minutes] = selectedTime.split(':');
            const period = selectedTime.includes('PM') ? 'PM' : 'AM';
            let hour = parseInt(hours);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            const timeString = `${hour.toString().padStart(2, '0')}:${minutes.split(' ')[0]}:00`;

            const matchingSchedule = availableSchedules.find(
                s => s.schedule_date === dateString && s.schedule_time === timeString
            );

            if (!matchingSchedule) {
                alert('Selected schedule is no longer available. Please choose another time.');
                return;
            }

            // 2. Create payment entry
            const { data: paymentData, error: paymentError } = await supabase
                .from('payment')
                .insert({
                    payment_method: paymentMethod,
                    amount_paid: total,
                    payment_date: new Date().toISOString(),
                    is_paid: false
                })
                .select()
                .single();

            if (paymentError) throw paymentError;

            // 3. Create delivery entry if delivery option is selected
            let deliveryId = null;
            if (deliveryOption === 'delivery') {
                if (!selectedAddressId) {
                    alert('Please select a delivery address');
                    return;
                }

                // Note: rider_id should be assigned by admin/system later
                // For now, we'll need to handle this - you may want to make rider_id nullable
                // or assign a default/placeholder rider
                const { data: deliveryData, error: deliveryError } = await supabase
                    .from('delivery')
                    .insert({
                        address_id: selectedAddressId,
                        delivery_fee: deliveryFee,
                        rider_id: null // Will be assigned by admin later
                    })
                    .select()
                    .single();

                if (deliveryError) {
                    console.error('Delivery error:', deliveryError);
                    throw deliveryError;
                }
                deliveryId = deliveryData.delivery_id;
            }

            // 4. Create order
            const { data: orderData, error: orderError } = await supabase
                .from('order')
                .insert({
                    customer_uid: user.id,
                    order_status: 'Pending',
                    order_type: deliveryOption,
                    total_price: total,
                    additional_information: additionalInformation,
                    schedule_id: matchingSchedule.schedule_id,
                    payment_id: paymentData.payment_id,
                    delivery_id: deliveryId
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 5. Create order items - FIXED: Calculate price correctly
            for (const item of selectedCartItems) {
                const itemSubtotal = item.price * item.quantity;

                const { data: orderItemData, error: orderItemError } = await supabase
                    .from('order_item')
                    .insert({
                        order_id: orderData.order_id,
                        menu_id: item.menu_id,
                        quantity: item.quantity,
                        subtotal_price: itemSubtotal // Changed from subtotal_price to price
                    })
                    .select()
                    .single();

                if (orderItemError) throw orderItemError;

                // 6. Create order item add-ons - FIXED: Use 'price' instead of 'subtotal_price'
                if (item.cart_item_add_on && item.cart_item_add_on.length > 0) {
                    for (const addOn of item.cart_item_add_on) {
                        const { error: addOnError } = await supabase
                            .from('order_item_add_on')
                            .insert({
                                order_item_id: orderItemData.order_item_id,
                                add_on_id: addOn.add_on_id,
                                quantity: addOn.quantity,
                                subtotal_price: addOn.price * addOn.quantity // Changed from subtotal_price to price
                            });

                        if (addOnError) throw addOnError;
                    }
                }

                // 7. Remove item from cart - delete add-ons first
                // Delete cart item add-ons first (foreign key constraint)
                if (item.cart_item_add_on && item.cart_item_add_on.length > 0) {
                    const { error: deleteAddOnsError } = await supabase
                        .from('cart_item_add_on')
                        .delete()
                        .eq('cart_item_id', item.cart_item_id);

                    if (deleteAddOnsError) throw deleteAddOnsError;
                }

                // Then delete the cart item
                const { error: deleteError } = await supabase
                    .from('cart_item')
                    .delete()
                    .eq('cart_item_id', item.cart_item_id);

                if (deleteError) throw deleteError;
            }

            alert('Order placed successfully!');
            navigate({ to: '/customer-interface/order' });
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        updateAvailableTimes(date);
        setIsCalendarDropdownOpen(false);
    };

    const handleSaveNewAddress = async () => {
        if (!user) return;

        // Validate required fields
        if (!newAddressForm.address_line || !newAddressForm.city || !newAddressForm.barangay) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('address')
                .insert({
                    customer_id: user.id,
                    address_type: newAddressForm.address_type,
                    address_line: newAddressForm.address_line,
                    region: newAddressForm.region || 'Metro Manila',
                    city: newAddressForm.city,
                    barangay: newAddressForm.barangay,
                    postal_code: newAddressForm.postal_code || '0000'
                })
                .select()
                .single();

            if (error) throw error;

            // Add to addresses list and select it
            setAddresses([...addresses, data]);
            setSelectedAddress(data);
            setSelectedAddressId(data.address_id);

            // Reset form and close modal
            setNewAddressForm({
                address_type: 'Home',
                address_line: '',
                region: '',
                city: '',
                barangay: '',
                postal_code: ''
            });
            setAutocompleteInput('');
            setIsAddAddressModalOpen(false);

            alert('Address added successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address. Please try again.');
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
  `;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
                <style dangerouslySetInnerHTML={{ __html: customStyles }} />

                {/* Customer Header */}
                <header className="w-auto mx-2 sm:mx-4 md:mx-10 my-3 border-b-8 border-amber-800">
                    <div className="flex items-center justify-between p-2 sm:p-4 mb-5 relative">
                        {/* Logo */}
                        <div
                            className="flex-shrink-0 bg-cover bg-center dynamic-logo"
                            style={logoStyle}
                        />

                        {/* Main Content Container */}
                        <div className="flex items-center justify-end w-full pl-[150px] sm:pl-[160px] lg:pl-[180px] gap-2 sm:gap-4">
                            {/* Desktop Navigation */}
                            <nav className="hidden lg:flex xl:gap-10 bg-[#964B00] py-2 px-6 xl:px-10 rounded-lg">
                                {navigationItems.map(item => (
                                    <Link
                                        key={item.name}
                                        to={item.route}
                                        className={`px-3 xl:px-4 py-2 rounded-xl text-base xl:text-lg font-semibold transition-colors whitespace-nowrap ${item.active
                                            ? 'bg-yellow-400 text-[#964B00]'
                                            : 'text-yellow-400 hover:bg-[#7a3d00]'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-[#964B00] hover:bg-amber-100 rounded-lg bg-yellow-400"
                            >
                                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                            </button>

                            {/* Right Side Controls */}
                            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 bg-[#964B00] py-2 px-2 sm:px-4 md:px-6 rounded-lg">
                                {/* Cart Icon */}
                                <Link
                                    to="/customer-interface/cart"
                                    className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
                                >
                                    <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                        className="relative p-1 sm:p-2 text-yellow-400 hover:bg-[#7a3d00] rounded-full"
                                    >
                                        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                                        {notificationCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                                                {notificationCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {isNotificationOpen && (
                                        <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-hidden">
                                            <div className="p-3 sm:p-4 border-b border-gray-200">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Notifications</h3>
                                            </div>

                                            <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                                                {notifications.map((notification, index) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${index === notifications.length - 1 ? 'border-b-0' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2 sm:gap-3">
                                                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black">
                                                                {getNotificationIcon(notification.icon)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                                                    {notification.time}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="p-3 sm:p-4 border-t border-gray-200">
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2 text-sm"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                    Mark all as read
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Conditional Button */}
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap"
                                    >
                                        <span className="hidden sm:inline">SIGN OUT</span>
                                        <span className="sm:hidden">OUT</span>
                                    </button>
                                ) : (
                                    <Link to="/login">
                                        <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                                            <span className="hidden sm:inline">SIGN IN</span>
                                            <span className="sm:hidden">IN</span>
                                        </button>
                                    </Link>
                                )}
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

                {/* Overlay to close notification dropdown */}
                {isNotificationOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsNotificationOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="max-w-6xl mx-auto pt-5 pb-20 px-4">
                    {/* Header with Back Button */}
                    <div className="flex items-center gap-3 mb-8">
                        <Link to="/customer-interface/cart" className="p-2 hover:bg-white/50 rounded-full">
                            <ArrowLeft className="w-6 h-6 text-gray-800" />
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800">Payment</h1>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-xl text-gray-600">Loading...</p>
                        </div>
                    ) : selectedCartItems.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-xl text-gray-600">No items selected for checkout</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left Column - Payment Details */}
                            <div className="flex-1 space-y-6">
                                {/* Address Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        {deliveryOption === 'pickup' ? 'Pick-up Address' : 'Delivery Address'}
                                    </h2>
                                    {deliveryOption === 'pickup' ? (
                                        <div className="text-gray-600">
                                            <p className="font-medium">Angieren's Lutong Bahay</p>
                                            <p>R395+F22, Kaypian Rd</p>
                                            <p>San Jose del Monte, Bulacan</p>
                                            <a
                                                href="https://maps.google.com/?q=R395+F22,+Kaypian+Rd,+SJDM,+Bulacan"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center gap-1 mt-2"
                                            >
                                                View on Google Maps →
                                            </a>
                                        </div>
                                    ) : selectedAddress ? (
                                        <div>
                                            <div className="text-gray-600 mb-3">
                                                <p className="font-medium">{selectedAddress.address_type}</p>
                                                <p>{selectedAddress.address_line}</p>
                                                <p>{selectedAddress.barangay}, {selectedAddress.city}</p>
                                                <p>{selectedAddress.region} {selectedAddress.postal_code}</p>
                                            </div>

                                            <div className="flex gap-3 mt-3">
                                                {addresses.length > 1 && (
                                                    <button
                                                        onClick={() => setIsEditAddressModalOpen(true)}
                                                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                                    >
                                                        Change Address
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setIsAddAddressModalOpen(true)}
                                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                                >
                                                    + Add New Address
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-600">
                                            <p>No delivery address found.</p>
                                            <button
                                                onClick={() => setIsAddAddressModalOpen(true)}
                                                className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                                            >
                                                + Add Address
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Information */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-gray-600"
                                        placeholder="Add any special instructions..."
                                        value={additionalInformation}
                                        onChange={(e) => setAdditionalInformation(e.target.value)}
                                    />
                                </div>

                                {/* Delivery Options */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Options</h2>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setDeliveryOption('Delivery')}
                                                    className={`px-6 py-2 rounded-full font-medium transition-colors ${deliveryOption === 'Delivery'
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Delivery
                                                </button>
                                                <button
                                                    onClick={() => setDeliveryOption('Pick-up')}
                                                    className={`px-6 py-2 rounded-full font-medium transition-colors ${deliveryOption === 'Pick-up'
                                                        ? 'bg-yellow-400 text-black'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Pick-up
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Date Selection</h2>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                                                    className="w-full px-4 py-3 bg-yellow-400 text-black rounded-lg font-medium flex items-center justify-between hover:bg-yellow-500 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(selectedDate)}
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isCalendarDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isCalendarDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 p-4">
                                                        {/* Calendar Header */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <button
                                                                onClick={() => navigateMonth('prev')}
                                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                <ChevronDown className="w-4 h-4 rotate-90" />
                                                            </button>
                                                            <h3 className="font-semibold text-gray-800">
                                                                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                            </h3>
                                                            <button
                                                                onClick={() => navigateMonth('next')}
                                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                <ChevronDown className="w-4 h-4 -rotate-90" />
                                                            </button>
                                                        </div>

                                                        {/* Calendar Grid */}
                                                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                                <div key={day} className="p-2 font-medium text-gray-500">
                                                                    {day}
                                                                </div>
                                                            ))}
                                                            {generateCalendarDays().map((date, index) => {
                                                                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                                                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                                                const isDisabled = isDateDisabled(date);
                                                                const isToday = date.toDateString() === new Date().toDateString();

                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => !isDisabled && handleDateSelect(date)}
                                                                        disabled={isDisabled}
                                                                        className={`p-2 rounded-lg transition-colors ${isSelected
                                                                            ? 'bg-yellow-400 text-black font-semibold'
                                                                            : isToday
                                                                                ? 'bg-blue-100 text-blue-600 font-medium'
                                                                                : isCurrentMonth
                                                                                    ? isDisabled
                                                                                        ? 'text-gray-300 cursor-not-allowed'
                                                                                        : 'text-gray-700 hover:bg-gray-200'
                                                                                    : 'text-gray-300'
                                                                            }`}
                                                                    >
                                                                        {date.getDate()}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fulfillment and Time */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Schedule</h2>
                                            <p className="text-gray-600">Please select a date and time for your order</p>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pick Time</h2>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                                    className="w-full px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium flex items-center justify-between hover:bg-yellow-500 transition-colors"
                                                >
                                                    {selectedTime}
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isTimeDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                                        {availableTimes.length > 0 ? (
                                                            availableTimes.map((time) => (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => {
                                                                        setSelectedTime(time);
                                                                        setIsTimeDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-center text-gray-500">
                                                                No available times for this date
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="w-full lg:w-96 space-y-6">
                                {/* Order Summary */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Order</h2>

                                    {selectedCartItems.map((item) => (
                                        <div key={item.cart_item_id} className="mb-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{item.menu.name}</p>
                                                    {item.cart_item_add_on && item.cart_item_add_on.length > 0 && (
                                                        <p className="text-sm text-gray-600">
                                                            add-ons: {item.cart_item_add_on.map(addOn =>
                                                                `${addOn.quantity} ${addOn.add_on.name}`
                                                            ).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                                                    <p className="font-semibold">
                                                        {formatPrice(
                                                            (item.price * item.quantity) +
                                                            (item.cart_item_add_on?.reduce((sum, addOn) => sum + (addOn.price * addOn.quantity), 0) || 0)
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="border-t pt-4 space-y-2">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Delivery fee</span>
                                            <span>{formatPrice(deliveryFee)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span>{formatPrice(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h2>

                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="GCash"
                                                name="payment"
                                                value="GCash"
                                                checked={paymentMethod === 'GCash'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 focus:ring-2"
                                            />
                                            <label htmlFor="GCash" className="ml-3 flex items-center gap-2 text-gray-700">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">G</span>
                                                </div>
                                                GCash
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="onsite"
                                                name="payment"
                                                value="onsite"
                                                checked={paymentMethod === 'onsite'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 focus:ring-yellow-400 focus:ring-2"
                                            />
                                            <label htmlFor="onsite" className="ml-3 text-gray-700">
                                                On-Site Payment
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    onClick={handlePlaceOrder}
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                                >
                                    Place Order →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit/Select Address Modal */}
                {isEditAddressModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Select Delivery Address</h2>
                                <button
                                    onClick={() => setIsEditAddressModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {addresses.length > 0 ? (
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.address_id}
                                            onClick={() => {
                                                setSelectedAddress(addr);
                                                setSelectedAddressId(addr.address_id);
                                                setIsEditAddressModalOpen(false);
                                            }}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.address_id
                                                ? 'border-yellow-400 bg-yellow-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-medium text-gray-800">{addr.address_type}</p>
                                            <p className="text-sm text-gray-600 mt-1">{addr.address_line}</p>
                                            <p className="text-sm text-gray-600">{addr.barangay}, {addr.city}</p>
                                            <p className="text-sm text-gray-600">{addr.region} {addr.postal_code}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">You don't have any saved addresses.</p>
                                    <p className="text-sm text-gray-500">Please add an address in your profile settings.</p>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setIsEditAddressModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add New Address Modal with Google Maps */}
                {isAddAddressModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Add New Address</h2>
                                <button
                                    onClick={() => setIsAddAddressModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Manual Address Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address / House No. <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.address_line}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, address_line: e.target.value })}
                                        placeholder="e.g., Blk 30, Lot 15, Queensville"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.barangay}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, barangay: e.target.value })}
                                        placeholder="e.g., Bagumbong"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.city}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                                        placeholder="e.g., Caloocan City"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Region
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.region}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, region: e.target.value })}
                                        placeholder="e.g., Metro Manila"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.postal_code}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, postal_code: e.target.value })}
                                        placeholder="e.g., 1400"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAddAddressModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewAddress}
                                    className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-500"
                                >
                                    Save Address
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <footer id="contact" className="py-8 bottom-0 w-full z-10" style={{ backgroundColor: "#F9ECD9" }}>
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Angieren's Lutong Bahay</h3>
                                <p className="text-gray-600 text-sm">
                                    Authentic Filipino home-cooked meals delivered to your doorstep.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-md font-semibold mb-3 text-gray-800">Quick Links</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link to="/customer-interface/home" className="text-gray-600 hover:text-gray-800">Home</Link></li>
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">Menu</Link></li>
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">About Us</Link></li>
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">Contact</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-md font-semibold mb-3 text-gray-800">Support</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">FAQ</Link></li>
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">Help Center</Link></li>
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">Terms & Conditions</Link></li>
                                    <li><Link to="/" className="text-gray-600 hover:text-gray-800">Privacy Policy</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-md font-semibold mb-3 text-gray-800">Connect With Us</h4>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600">Email: info@angierens.com</p>
                                    <p className="text-gray-600">Phone: +63 912 345 6789</p>
                                    <div className="flex space-x-4 mt-4">
                                        <a href="#" className="text-gray-600 hover:text-gray-800">Facebook</a>
                                        <a href="#" className="text-gray-600 hover:text-gray-800">Instagram</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-400 mt-8 pt-4 text-center text-sm text-gray-600">
                            <p>&copy; 2024 Angieren's Lutong Bahay. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
}