import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Bell, ChevronDown, ArrowLeft, Edit2, X, Menu, Calendar, Heart, Star, MessageSquare, Upload, Check } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { useSearch } from '@tanstack/react-router'
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { DirectionsModal } from '@/components/DirectionsModal'



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
    const [isUploadReceiptModalOpen, setIsUploadReceiptModalOpen] = useState(false);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [proofOfPaymentFile, setProofOfPaymentFile] = useState<File | null>(null);
    const [proofOfPaymentPreview, setProofOfPaymentPreview] = useState<string | null>(null);
    const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState({
        lat: 14.706297,
        lng: 121.045708,
    });
    const pickupInfo = {
        name: "Angieren's Lutong Bahay",
        street: "R395+F22, Kaypian Rd",
        city: "San Jose del Monte, Bulacan",
        mapsLink: "https://maps.google.com/?q=R395+F22,+Kaypian+Rd,+SJDM,+Bulacan"
    };
    const [showDirectionsModal, setShowDirectionsModal] = useState(false);
    const [totalDistance, setTotalDistance] = useState(0);
    const [routeOrigin, setRouteOrigin] = useState<{ lat: number; lng: number } | null>(null);
    const [routeDestination, setRouteDestination] = useState<{ lat: number; lng: number } | null>(null);

    const handleShowDirections = (originLat: number, originLng: number, destLat: number, destLng: number) => {
        setRouteOrigin({ lat: originLat, lng: originLng });
        setRouteDestination({ lat: destLat, lng: destLng });
        setShowDirectionsModal(true);
    };

    useEffect(() => {
        async function updateDeliveryFee() {
            if (deliveryOption === 'Delivery' && selectedAddress?.latitude && selectedAddress?.longitude) {
                const roadDistance = await calculateRoadDistance(
                    14.818589037203248,
                    121.05753223366108,
                    selectedAddress.latitude,
                    selectedAddress.longitude
                );
                const fee = calculateDeliveryFee(roadDistance);
                setTotalDistance(roadDistance)
                setCalculatedDeliveryFee(fee);
            } else {
                setCalculatedDeliveryFee(0);
            }
        }

        updateDeliveryFee();
    }, [selectedAddress, deliveryOption]);

    // Haversine formula to calculate distance between two coordinates in kilometers
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    };

    // Calculate delivery fee based on Lalamove pricing model
    const calculateDeliveryFee = (distance: number): number => {

        const baseFare = 49;
        let deliveryFee = 0;

        if (distance <= 5) {
            deliveryFee = baseFare + (distance * 6);
        } else {
            // After 5 km: ₱49 base + (5km * ₱6) + remaining km * ₱5
            const first5km = 5 * 6;
            const remainingKm = (distance - 5) * 5;
            deliveryFee = baseFare + first5km + remainingKm;
        }

        console.log(`Calculated delivery fee: ${deliveryFee}`)

        return deliveryFee;
    };

    const calculateRoadDistance = async (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): Promise<number> => {
        setIsLoading(true)

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

            const response = await fetch(
                `${backendUrl}/api/directions?origin=${lat1},${lon1}&destination=${lat2},${lon2}`
            );

            console.log(`origin=${lat1},${lon1} destination=${lat2},${lon2}`)

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();

            if (data.status === "OK" && data.routes?.length > 0) {
                console.log("Available routes:");
                data.routes.forEach((route: any, index: number) => {
                    const distKm = route.legs[0].distance.value / 1000;
                    const duration = route.legs[0].duration.text;
                    console.log(`  Route ${index + 1}: ${distKm.toFixed(2)} km (${duration})`);
                });

                const distanceInMeters = data.routes[0].legs[0].distance.value;
                const distanceInKm = distanceInMeters / 1000;
                const duration = data.routes[0].legs[0].duration.text;

                console.log(`Selected: ${distanceInKm.toFixed(2)} km (${duration})`);
                console.log('============================');

                setIsLoading(false)
                return distanceInKm;
            } else {
                setIsLoading(false)

                console.error("Directions API returned unexpected response:", data);
                throw new Error(`Directions API error: ${data.status || 'Unknown error'}`);
            }


        } catch (error) {
            console.error("Error calling backend API:", error);

            // Fallback to estimation
            const straightLine = calculateDistance(lat1, lon1, lat2, lon2);
            const estimated = straightLine * 2.10;
            console.log(`📏 Fallback estimation: ${estimated.toFixed(2)} km`);

            setIsLoading(false)


            return estimated;
        }
    };


    function LocationPicker() {
        useMapEvents({
            click(e) {
                setSelectedLocation({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                });
                fetchAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
            },
        });

        return null;
    }

    const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;

                // Map OSM address components to your form
                setNewAddressForm({
                    ...newAddressForm,
                    address_line: `${addr.house_number || ''} ${addr.road || addr.street || ''}`.trim() ||
                        addr.neighbourhood || addr.suburb || '',
                    region: addr.region || addr.state || 'Metro Manila',
                    city: addr.city || addr.town || addr.municipality || addr.county || '',
                    barangay: addr.suburb || addr.village || addr.neighbourhood || '',
                    postal_code: addr.postcode || '0000'
                });
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };


    // Navigation items with their corresponding routes
    const navigationItems = [
        { name: 'HOME', route: '/customer-interface/home', active: false },
        { name: 'MENU', route: '/customer-interface/', active: false },
        { name: 'ORDER', route: '/customer-interface/order', active: false },
        { name: 'FEEDBACK', route: '/customer-interface/feedback', active: false },
        { name: 'MY INFO', route: '/customer-interface/my-info', active: false },
    ];

    const markerIcon = L.icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });


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

    const deliveryFee = calculatedDeliveryFee;

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

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, isReceipt: boolean = true) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            if (isReceipt) {
                setReceiptFile(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setReceiptPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setProofOfPaymentFile(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setProofOfPaymentPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleUploadReceipt = async () => {
        if (!receiptFile) {
            alert('Please select a receipt image');
            return;
        }

        try {
            // Upload to Supabase storage
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
            const filePath = `receipts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-receipts')
                .upload(filePath, receiptFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-receipts')
                .getPublicUrl(filePath);

            // Close modal and proceed with order
            setIsUploadReceiptModalOpen(false);
            handlePlaceOrder(publicUrl);
        } catch (error) {
            console.error('Error uploading receipt:', error);
            alert('Failed to upload receipt. Please try again.');
        }
    };

    const handleUploadProofOfPayment = async () => {
        if (!proofOfPaymentFile) {
            alert('Please take a photo of your payment');
            return;
        }

        try {
            // Upload to Supabase storage
            const fileExt = proofOfPaymentFile.name.split('.').pop();
            const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
            const filePath = `proof-of-payment/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('payment-receipts')
                .upload(filePath, proofOfPaymentFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('payment-receipts')
                .getPublicUrl(filePath);

            // Close modal and proceed with order
            setIsUploadReceiptModalOpen(false);
            handlePlaceOrder(publicUrl);
        } catch (error) {
            console.error('Error uploading proof of payment:', error);
            alert('Failed to upload photo. Please try again.');
        }
    };

    const handlePlaceOrder = async (receiptUrl?: string) => {
        if (!user) {
            alert('Please log in to place an order');
            return;
        }

        if (selectedCartItems.length === 0) {
            alert('No items in order');
            return;
        }

        // Check if delivery address is required
        if (deliveryOption === 'Delivery' && !selectedAddressId) {
            alert('Please select a delivery address');
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
                    is_paid: false,
                    proof_of_payment_url: receiptUrl || null
                })
                .select()
                .single();

            if (paymentError) throw paymentError;

            // 3. Create delivery entry if delivery option is selected
            let deliveryId = null;
            if (deliveryOption === 'Delivery') {
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
                    postal_code: newAddressForm.postal_code || '0000',
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lng
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
                address_type: 'Primary',
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

        const newAddress = {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
        };

        setAutocompleteInput('');
        setIsAddAddressModalOpen(false);

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
        <ProtectedRoute allowedRoles={['customer']}>
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
                        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
                            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
                                <p className="text-gray-700 font-medium">Processing...</p>
                            </div>
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
                                        {deliveryOption === 'Pick-up' ? 'Pick-up Address' : 'Delivery Address'}
                                    </h2>
                                    {deliveryOption === 'Pick-up' ? (
                                        <div className="text-gray-600">
                                            <p className="font-medium">{pickupInfo.name}</p>
                                            <p>{pickupInfo.street}</p>
                                            <p>{pickupInfo.city}</p>
                                            <a
                                                href={pickupInfo.mapsLink}
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
                                                <p>{selectedAddress.address_line}</p>
                                                <p>{selectedAddress.barangay}, {selectedAddress.city}</p>
                                                <p>{selectedAddress.region} {selectedAddress.postal_code}</p>
                                            </div>

                                            <div className="mt-2 text-sm text-gray-500">
                                                Distance: {totalDistance.toFixed(2)} km from Angieren's Lutong Bahay
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

                                {/* Combined Delivery Options, Date, and Time Selection */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Schedule</h2>

                                    <div className="space-y-6">
                                        {/* Delivery Options */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Options</label>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => setDeliveryOption('Delivery')}
                                                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${deliveryOption === 'Delivery'
                                                        ? 'bg-yellow-400 text-black shadow-md'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Delivery
                                                </button>
                                                <button
                                                    onClick={() => setDeliveryOption('Pick-up')}
                                                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${deliveryOption === 'Pick-up'
                                                        ? 'bg-yellow-400 text-black shadow-md'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Pick-up
                                                </button>
                                            </div>
                                        </div>

                                        {/* Date Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Select Date</label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-between hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-5 h-5 text-gray-600" />
                                                        {formatDate(selectedDate)}
                                                    </div>
                                                    <ChevronDown className={`w-5 h-5 transition-transform ${isCalendarDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isCalendarDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-20 p-4">
                                                        {/* Calendar Header */}
                                                        <div className="flex items-center justify-between mb-4">
                                                            <button
                                                                onClick={() => navigateMonth('prev')}
                                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                <ChevronDown className="w-5 h-5 rotate-90" />
                                                            </button>
                                                            <h3 className="font-semibold text-gray-800">
                                                                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                            </h3>
                                                            <button
                                                                onClick={() => navigateMonth('next')}
                                                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                <ChevronDown className="w-5 h-5 -rotate-90" />
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

                                        {/* Time Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Select Time</label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-between hover:bg-gray-100 transition-colors"
                                                >
                                                    {selectedTime}
                                                    <ChevronDown className={`w-5 h-5 transition-transform ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
                                                </button>

                                                {isTimeDropdownOpen && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                                                        {availableTimes.length > 0 ? (
                                                            availableTimes.map((time) => (
                                                                <button
                                                                    key={time}
                                                                    onClick={() => {
                                                                        setSelectedTime(time);
                                                                        setIsTimeDropdownOpen(false);
                                                                    }}
                                                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors text-gray-700"
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

                                    {/* Items List with max height and scroll */}
                                    <div className="max-h-96 overflow-y-auto mb-4">
                                        {selectedCartItems.map((item) => (
                                            <div key={item.cart_item_id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                                                {/* Main Menu Item with Image */}
                                                <div className="flex gap-3 mb-2">
                                                    {/* Item Image */}
                                                    {item.menu.image_url && (
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={getImageUrl(item.menu.image_url)}
                                                                alt={item.menu.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Item Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-800 line-clamp-2">{item.menu.name}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">
                                                                    {formatPrice(item.menu.price)} each
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-sm text-gray-600 mb-1">×{item.quantity}</p>
                                                                <p className="font-semibold text-gray-800">
                                                                    {formatPrice(item.menu.price * item.quantity)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Add-ons */}
                                                {item.cart_item_add_on && item.cart_item_add_on.length > 0 && (
                                                    <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1.5 mt-2">
                                                        {item.cart_item_add_on.map((addOn, index) => (
                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                <div className="flex-1">
                                                                    <p className="text-gray-600">
                                                                        <span className="text-amber-600">+</span> {addOn.add_on.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">
                                                                        {formatPrice(addOn.price)} each
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <span className="text-gray-500 text-xs mr-2">×{addOn.quantity}</span>
                                                                    <span className="text-gray-700 font-medium">
                                                                        {formatPrice(addOn.price * addOn.quantity)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Summary Totals */}
                                    <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span className="flex items-center gap-1">
                                                Delivery fee
                                                {deliveryOption === 'Pick-up' && (
                                                    <span className="text-xs text-green-600 font-medium">(Free)</span>
                                                )}
                                            </span>
                                            <span className="font-medium">{formatPrice(deliveryFee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-gray-300">
                                            <span className="text-gray-800">Total</span>
                                            <span className="text-amber-600">{formatPrice(total)}</span>
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

                                {/* Upload Receipt Button - Only show for GCash */}
                                {paymentMethod === 'GCash' && (
                                    <button
                                        onClick={() => setIsUploadReceiptModalOpen(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Upload Payment Receipt
                                    </button>
                                )}

                                {/* Upload Proof of Payment Button - Only show for onsite payment */}
                                {paymentMethod === 'onsite' && (
                                    <button
                                        onClick={() => setIsUploadReceiptModalOpen(true)}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Upload Proof of Payment
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Receipt Modal */}
                {isUploadReceiptModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {paymentMethod === 'GCash' ? 'Upload Payment Receipt' : 'Upload Proof of Payment'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsUploadReceiptModalOpen(false);
                                        setReceiptFile(null);
                                        setReceiptPreview(null);
                                        setProofOfPaymentFile(null);
                                        setProofOfPaymentPreview(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-2"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {paymentMethod === 'GCash' ? (
                                    <>
                                        {/* GCash Instructions */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">i</span>
                                                Payment Instructions
                                            </h3>
                                            <div className="space-y-4">
                                                {/* Step 1: QR Code */}
                                                <div>
                                                    <p className="font-medium text-blue-900 mb-2">Step 1: Send payment to this GCash account</p>

                                                    <div className="bg-white rounded-lg p-4 flex flex-col items-center">

                                                        {/* QR Code */}
                                                        <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                                                            <img
                                                                src="/qr-code.png"
                                                                alt="GCash QR Code"
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>

                                                        {/* Download Button */}
                                                        <a
                                                            href="/qr-code.png"
                                                            download="GCash-QR-Code.png"
                                                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                                        >
                                                            Download QR Code
                                                        </a>

                                                        <p className="text-sm text-gray-600 font-medium mt-3">
                                                            Total Amount: {formatPrice(total)}
                                                        </p>

                                                    </div>
                                                </div>


                                                {/* Step 2: Receipt Example */}
                                                <div>
                                                    <p className="font-medium text-blue-900 mb-2">Step 2: Take a screenshot of your receipt</p>
                                                    <p className="text-sm text-blue-800 mb-3">Your receipt should look like this for easy verification:</p>

                                                    <div className="bg-white rounded-lg p-4 flex flex-col items-center border-2 border-dashed border-blue-300">

                                                        {/* Receipt Example */}
                                                        <div className="w-full max-w-xs h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                                                            <img
                                                                src="/receipt-sample.jpg"
                                                                alt="GCash Receipt Example"
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>

                                                        {/* Download Button */}
                                                        <a
                                                            href="/receipt-sample.jpg"
                                                            download="GCash-Receipt-Example.jpg"
                                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                                                        >
                                                            Download Receipt Example
                                                        </a>
                                                    </div>
                                                </div>


                                                {/* Step 3: Upload */}
                                                <div>
                                                    <p className="font-medium text-blue-900 mb-2">Step 3: Upload your receipt</p>
                                                    <p className="text-sm text-blue-800">Please ensure the receipt is clear and all details are visible.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Section for GCash */}
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
                                                <input
                                                    type="file"
                                                    id="receipt-upload"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileSelect(e, true)}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="receipt-upload"
                                                    className="cursor-pointer flex flex-col items-center"
                                                >
                                                    {receiptPreview ? (
                                                        <div className="relative">
                                                            <img
                                                                src={receiptPreview}
                                                                alt="Receipt preview"
                                                                className="max-h-64 rounded-lg"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                                            <p className="text-gray-600 font-medium mb-1">Click to upload receipt</p>
                                                            <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>

                                            {receiptFile && (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="w-5 h-5 text-green-600" />
                                                        <span className="text-sm text-green-800 font-medium">{receiptFile.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setReceiptFile(null);
                                                            setReceiptPreview(null);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons for GCash */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setIsUploadReceiptModalOpen(false);
                                                    setReceiptFile(null);
                                                    setReceiptPreview(null);
                                                }}
                                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (deliveryOption === 'Delivery' && !selectedAddressId) {
                                                        alert('Please select a delivery address');
                                                        return;
                                                    }
                                                    handleUploadReceipt();
                                                }}
                                                disabled={!receiptFile}
                                                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${receiptFile
                                                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                Submit & Place Order
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* On-Site Payment Instructions */}
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                                                <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">i</span>
                                                Proof of Payment Instructions
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="font-medium text-orange-900 mb-2">Step 1: Pay the staff member</p>
                                                    <p className="text-sm text-orange-800">Hand over the payment amount to our staff during pickup or upon delivery.</p>
                                                    <div className="bg-white rounded-lg p-4 mt-3 text-center">
                                                        <p className="text-sm text-gray-600 font-medium">Total Amount: {formatPrice(total)}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-orange-900 mb-2">Step 2: Take a photo as proof</p>
                                                    <p className="text-sm text-orange-800 mb-3">After paying, take a photo showing:</p>
                                                    <ul className="text-sm text-orange-800 list-disc list-inside space-y-1 ml-2">
                                                        <li>You handing over the money, or</li>
                                                        <li>The receipt/acknowledgment from staff, or</li>
                                                        <li>Any proof that payment was made</li>
                                                    </ul>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-orange-900 mb-2">Step 3: Upload the photo</p>
                                                    <p className="text-sm text-orange-800">This helps us verify and track your payment for record-keeping purposes.</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Section for On-Site Payment */}
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                                                <input
                                                    type="file"
                                                    id="proof-upload"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => handleFileSelect(e, false)}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="proof-upload"
                                                    className="cursor-pointer flex flex-col items-center"
                                                >
                                                    {proofOfPaymentPreview ? (
                                                        <div className="relative">
                                                            <img
                                                                src={proofOfPaymentPreview}
                                                                alt="Proof of payment preview"
                                                                className="max-h-64 rounded-lg"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                                                                <Check className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                                            <p className="text-gray-600 font-medium mb-1">Click to take/upload photo</p>
                                                            <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>

                                            {proofOfPaymentFile && (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="w-5 h-5 text-green-600" />
                                                        <span className="text-sm text-green-800 font-medium">{proofOfPaymentFile.name}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setProofOfPaymentFile(null);
                                                            setProofOfPaymentPreview(null);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons for On-Site Payment */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => {
                                                    setIsUploadReceiptModalOpen(false);
                                                    setProofOfPaymentFile(null);
                                                    setProofOfPaymentPreview(null);
                                                }}
                                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (deliveryOption === 'Delivery' && !selectedAddressId) {
                                                        alert('Please select a delivery address');
                                                        return;
                                                    }
                                                    handleUploadProofOfPayment();
                                                }}
                                                disabled={!proofOfPaymentFile}
                                                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${proofOfPaymentFile
                                                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                Submit & Place Order
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

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

                {/* Add New Address Modal */}
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

                            {/* Instructions */}
                            <p className="text-sm text-gray-600 mb-4">
                                Click or drag the marker on the map to select your location. Address details will be automatically filled.
                            </p>

                            {/* Map Picker */}
                            <div className="w-full h-64 rounded-lg overflow-hidden mb-4 border-2 border-gray-300">
                                <MapContainer
                                    center={[selectedLocation.lat, selectedLocation.lng]}
                                    zoom={16}
                                    style={{ height: "100%", width: "100%" }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="© OpenStreetMap"
                                    />

                                    <Marker
                                        position={[selectedLocation.lat, selectedLocation.lng]}
                                        icon={markerIcon}
                                        draggable={true}
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const marker = e.target;
                                                const { lat, lng } = marker.getLatLng();
                                                setSelectedLocation({ lat, lng });
                                                fetchAddressFromCoordinates(lat, lng);
                                            },
                                        }}
                                    />

                                    <LocationPicker />
                                </MapContainer>
                            </div>

                            <p className="text-xs text-gray-500 mb-4">
                                Selected Location: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </p>

                            {/* Address Form Fields */}
                            <div className="space-y-4">
                                {/* Street Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.address_line}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, address_line: e.target.value })}
                                        placeholder="e.g., 123 Main Street"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Barangay */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Barangay <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.barangay}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, barangay: e.target.value })}
                                        placeholder="e.g., Barangay San Jose"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City/Municipality <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newAddressForm.city}
                                        onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                                        placeholder="e.g., San Jose del Monte"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    />
                                </div>

                                {/* Region */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                                {/* Postal Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setIsAddAddressModalOpen(false);
                                        // Reset form
                                        setNewAddressForm({
                                            address_type: 'Secondary',
                                            address_line: '',
                                            region: '',
                                            city: '',
                                            barangay: '',
                                            postal_code: ''
                                        });
                                        setSelectedLocation({
                                            lat: 14.706297,
                                            lng: 121.045708,
                                        });
                                    }}
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