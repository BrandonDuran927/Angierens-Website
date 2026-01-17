import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { ShoppingCart, Bell, ChevronDown, ArrowLeft, X, Menu, Calendar, Heart, Star, MessageSquare, Upload, Check, Trash2, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AlertModal, type AlertType } from '@/components/AlertModal'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabaseClient'
import { useSearch } from '@tanstack/react-router'
import { loadGoogleMapsScript } from '@/utils/loadGoogleMaps'
import { CustomerFooter } from '@/components/CustomerFooter'

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
    size: string | null
    menu: {
        name: string
        description: string
        image_url: string
        price: string
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
    const [notificationCount, setNotificationCount] = useState(0);
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
    const mapRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const STORE_LOCATION = { lat: 14.818589037203248, lng: 121.05753223366108 };
    const MAX_DELIVERY_DISTANCE_KM = 100;
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
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [isVisible, setIsVisible] = useState(false)

    // Trigger entrance animation
    useEffect(() => {
        setIsVisible(true)
    }, [])

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

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
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


    // Validate if location is within delivery range
    const validateLocationDistance = (lat: number, lng: number): { valid: boolean; distance: number } => {
        const distance = calculateDistance(
            STORE_LOCATION.lat,
            STORE_LOCATION.lng,
            lat,
            lng
        );
        return {
            valid: distance <= MAX_DELIVERY_DISTANCE_KM,
            distance: distance
        };
    };

    const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
        try {
            // Validate distance first
            const validation = validateLocationDistance(lat, lng);
            if (!validation.valid) {
                setLocationError(
                    `This location is ${validation.distance.toFixed(1)} km away from our store. ` +
                    `We only deliver within ${MAX_DELIVERY_DISTANCE_KM} km. Please select a closer location.`
                );
                return;
            }

            setLocationError(null);

            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const geocodeUrl = `${backendUrl}/api/geocode?address=${encodeURIComponent(`${lat},${lng}`)}`;

            console.log('Calling geocode API:', geocodeUrl);

            // Format coordinates as "lat,lng" for reverse geocoding
            const response = await fetch(geocodeUrl);

            console.log('Geocode response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Geocode error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.results && data.results[0]) {
                const addressComponents = data.results[0].address_components;
                const formattedAddress = data.results[0].formatted_address;

                // Extract address components
                let street = '';
                let barangay = '';
                let city = '';
                let region = '';
                let postalCode = '';

                addressComponents.forEach((component: any) => {
                    if (component.types.includes('route') || component.types.includes('street_address')) {
                        street = component.long_name;
                    }
                    if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
                        barangay = component.long_name;
                    }
                    if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        region = component.long_name;
                    }
                    if (component.types.includes('postal_code')) {
                        postalCode = component.long_name;
                    }
                });

                setNewAddressForm({
                    ...newAddressForm,
                    address_line: street || formattedAddress.split(',')[0],
                    region: region || 'Metro Manila',
                    city: city || '',
                    barangay: barangay || '',
                    postal_code: postalCode || '0000'
                });
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setLocationError('Failed to fetch address. Please enter manually.');
        }
    };

    // Initialize Google Map
    useEffect(() => {
        if (!isAddAddressModalOpen) return;

        const initMap = async () => {
            try {
                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (!apiKey) {
                    console.error('Google Maps API key not found in environment');
                    setLocationError('Map configuration error. Please contact support.');
                    return;
                }
                await loadGoogleMapsScript(apiKey);
                setIsMapLoaded(true);
            } catch (error) {
                console.error('Error loading Google Maps:', error);
                setLocationError('Failed to load map. Please try again.');
            }
        };

        initMap();
    }, [isAddAddressModalOpen]);

    // Setup map after Google Maps loads
    useEffect(() => {
        if (!isMapLoaded || !isAddAddressModalOpen) return;

        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        // Initialize map
        const map = new google.maps.Map(mapElement, {
            center: selectedLocation,
            zoom: 15,
            mapTypeControl: false,
        });

        mapRef.current = map;

        // Initialize marker
        const marker = new google.maps.Marker({
            position: selectedLocation,
            map: map,
            draggable: true,
            title: 'Delivery Location'
        });

        markerRef.current = marker;

        // Handle marker drag
        marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
                const lat = position.lat();
                const lng = position.lng();
                setSelectedLocation({ lat, lng });
                fetchAddressFromCoordinates(lat, lng);
            }
        });

        // Handle map click
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setSelectedLocation({ lat, lng });
                marker.setPosition({ lat, lng });
                fetchAddressFromCoordinates(lat, lng);
            }
        });

        return () => {
            if (markerRef.current) {
                google.maps.event.clearInstanceListeners(markerRef.current);
            }
            if (mapRef.current) {
                google.maps.event.clearInstanceListeners(mapRef.current);
            }
        };
    }, [isMapLoaded, isAddAddressModalOpen]);


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
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // Check if this is a direct order from "Order Now"
                const searchParams = search as any;
                if (searchParams.directOrder === 'true') {
                    const directOrderData = sessionStorage.getItem('directOrder');
                    if (directOrderData) {
                        const orderDetails = JSON.parse(directOrderData);

                        // Format to match CartItem structure
                        const formattedItem: CartItem = {
                            cart_item_id: 'direct-order', // Temporary ID for direct orders
                            menu_id: orderDetails.menu_id,
                            quantity: orderDetails.quantity,
                            price: orderDetails.price,
                            size: orderDetails.size || null,
                            menu: {
                                name: orderDetails.name,
                                description: orderDetails.description,
                                image_url: orderDetails.image_url,
                                price: String(orderDetails.price)
                            },
                            cart_item_add_on: orderDetails.addOns.map((addOn: any) => ({
                                add_on_id: addOn.add_on_id,
                                quantity: addOn.quantity,
                                price: addOn.price,
                                add_on: {
                                    name: addOn.name,
                                    price: addOn.price
                                }
                            }))
                        };

                        setSelectedCartItems([formattedItem]);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading direct order:', error);
                setIsLoading(false);
                return;
            }

            // Regular cart checkout flow
            try {
                if (!search.items) {
                    setIsLoading(false);
                    return;
                }

                const itemIds = search.items.split(',');

                // Fetch the selected items from Supabase with menu and add-ons
                const { data, error } = await supabase
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
                                size: row.size || null,
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

        // Check if the selected date is today
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const isToday = today.getTime() === selectedDay.getTime();

        const timesForDate = schedules
            .filter(s => {
                if (s.schedule_date !== dateString) return false;

                // If it's today, filter out times that are too close (within 1 hour)
                if (isToday) {
                    const [hours, minutes] = s.schedule_time.split(':');
                    const scheduleHour = parseInt(hours);
                    const scheduleMinute = parseInt(minutes);

                    // Create schedule time in minutes from midnight
                    const scheduleTimeInMinutes = scheduleHour * 60 + scheduleMinute;

                    // Create current time in minutes from midnight, plus 60 minutes buffer
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const currentTimeInMinutes = currentHour * 60 + currentMinute;
                    const minimumAllowedTime = currentTimeInMinutes + 60; // 1 hour buffer

                    // Filter out if schedule time is less than current time + 1 hour
                    if (scheduleTimeInMinutes < minimumAllowedTime) {
                        return false;
                    }
                }

                return true;
            })
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
        const itemUnitPrice = Number(item.price);
        const itemTotal = itemUnitPrice * item.quantity;

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
                showAlert('Please select an image file', 'warning');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showAlert('File size must be less than 5MB', 'warning');
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
            showAlert('Please select a receipt image', 'warning');
            return;
        }

        if (isSubmittingOrder) {
            return;
        }

        setIsSubmittingOrder(true);


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
            showAlert('Failed to upload receipt. Please try again.', 'error');
            setIsSubmittingOrder(false); // Re-enable on error
        }
    };

    const handleUploadProofOfPayment = async () => {
        if (!proofOfPaymentFile) {
            showAlert('Please take a photo of your payment', 'warning');
            return;
        }

        if (isSubmittingOrder) {
            return;
        }

        setIsSubmittingOrder(true);

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
            showAlert('Failed to upload photo. Please try again.', 'error');
            setIsSubmittingOrder(false); // Re-enable on error
        }
    };

    const handlePlaceOrder = async (receiptUrl?: string) => {
        if (!user) {
            showAlert('Please log in to place an order', 'warning');
            return;
        }

        if (selectedCartItems.length === 0) {
            showAlert('No items in order', 'warning');
            return;
        }

        // Check if delivery address is required
        if (deliveryOption === 'Delivery' && !selectedAddressId) {
            showAlert('Please select a delivery address', 'warning');
            return;
        }

        try {
            if (!selectedDate || isDateDisabled(selectedDate)) {
                showAlert('Please select a valid date for your order', 'warning');
                setIsSubmittingOrder(false);
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
                showAlert('Selected schedule is no longer available. Please choose another time.', 'warning');
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
                    total_price: total - deliveryFee,
                    additional_information: additionalInformation,
                    schedule_id: matchingSchedule.schedule_id,
                    payment_id: paymentData.payment_id,
                    delivery_id: deliveryId
                })
                .select()
                .single();

            if (orderError) throw orderError;

            for (const item of selectedCartItems) {
                const itemUnitPrice = Number(item.price);
                const itemSubtotal = itemUnitPrice * item.quantity;

                const { data: orderItemData, error: orderItemError } = await supabase
                    .from('order_item')
                    .insert({
                        order_id: orderData.order_id,
                        menu_id: item.menu_id,
                        quantity: item.quantity,
                        subtotal_price: itemSubtotal,
                        size: item.size || null
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

                // 7. Remove item from cart ONLY if it's not a direct order
                // Direct orders don't create cart items, so skip deletion
                if (item.cart_item_id !== 'direct-order') {
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
            }

            // Clear session storage for direct orders
            sessionStorage.removeItem('directOrder');

            showAlert('Order placed successfully!', 'success');
            navigate({ to: '/customer-interface/order' });
        } catch (error) {
            console.error('Error placing order:', error);
            showAlert('Failed to place order. Please try again.', 'error');
            setIsSubmittingOrder(false); // Re-enable button on error
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        updateAvailableTimes(date);
        setIsCalendarDropdownOpen(false);
    };

    const handleDeleteAddress = async (addressId: string, addressType: string) => {
        // Prevent deletion of primary addresses
        if (addressType === 'Primary') {
            showAlert('Cannot delete primary address. Please change it to secondary first in your profile.', 'warning');
            return;
        }

        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('address')
                .delete()
                .eq('address_id', addressId);

            if (error) throw error;

            // Update local state
            const updatedAddresses = addresses.filter(addr => addr.address_id !== addressId);
            setAddresses(updatedAddresses);

            // If deleted address was selected, select the first available address
            if (selectedAddressId === addressId) {
                if (updatedAddresses.length > 0) {
                    setSelectedAddress(updatedAddresses[0]);
                    setSelectedAddressId(updatedAddresses[0].address_id);
                } else {
                    setSelectedAddress(null);
                    setSelectedAddressId(null);
                }
            }

            showAlert('Address deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting address:', error);
            showAlert('Failed to delete address. Please try again.', 'error');
        }
    };

    const handleSaveNewAddress = async () => {
        if (!user) return;

        // Validate required fields
        if (!newAddressForm.address_line || !newAddressForm.city || !newAddressForm.barangay) {
            showAlert('Please fill in all required fields', 'warning');
            return;
        }

        // Validate distance before saving
        const validation = validateLocationDistance(selectedLocation.lat, selectedLocation.lng);
        if (!validation.valid) {
            showAlert(
                `This location is ${validation.distance.toFixed(1)} km away from our store. ` +
                `We only deliver within ${MAX_DELIVERY_DISTANCE_KM} km. Please select a closer location.`,
                'warning'
            );
            return;
        }

        try {
            const { data, error } = await supabase
                .from('address')
                .insert({
                    customer_id: user.id,
                    address_type: 'Secondary',
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

            showAlert('Address added successfully!', 'success');
        } catch (error) {
            console.error('Error saving address:', error);
            showAlert('Failed to save address. Please try again.', 'error');
        }

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

    return (
        <ProtectedRoute allowedRoles={['customer']}>
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
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
                                                <div className="flex gap-3">
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
                                                                    {formatPrice(Number(item.price))} each
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-sm text-gray-600 mb-1">×{item.quantity}</p>
                                                                <p className="font-semibold text-gray-800">
                                                                    {formatPrice(Number(item.price) * item.quantity)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Shared Add-ons Section - Display separately */}
                                        {selectedCartItems.some(item => item.cart_item_add_on && item.cart_item_add_on.length > 0) && (
                                            <div className="mt-4 pt-4 border-t-2 border-amber-200 bg-amber-50/50 rounded-lg p-4">
                                                <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                                                    <span className="text-amber-600">+</span>
                                                    Add-ons for Your Order
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedCartItems
                                                        .filter(item => item.cart_item_add_on && item.cart_item_add_on.length > 0)
                                                        .flatMap(item => item.cart_item_add_on)
                                                        .map((addOn, index) => (
                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                <div className="flex-1">
                                                                    <p className="text-gray-700 font-medium">{addOn.add_on.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatPrice(addOn.price)} each
                                                                    </p>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <span className="text-gray-500 text-xs mr-2">×{addOn.quantity}</span>
                                                                    <span className="text-gray-700 font-semibold">
                                                                        {formatPrice(addOn.price * addOn.quantity)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                                <p className="text-xs text-amber-700 mt-3 italic">
                                                    * These add-ons apply to your entire order
                                                </p>
                                            </div>
                                        )}
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
                                    </div>
                                </div>

                                {/* Upload Receipt Button - Only show for GCash */}
                                {paymentMethod === 'GCash' && (
                                    <button
                                        onClick={() => setIsUploadReceiptModalOpen(true)}
                                        disabled={isLoading}
                                        className={`w-full font-bold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2 ${isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Calculating delivery fee...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Upload Payment Receipt
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Upload Proof of Payment Button - Only show for onsite payment */}
                                {paymentMethod === 'onsite' && (
                                    <button
                                        onClick={() => setIsUploadReceiptModalOpen(true)}
                                        disabled={isLoading}
                                        className={`w-full font-bold py-4 px-6 rounded-2xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2 ${isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Calculating delivery fee...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Upload Proof of Payment
                                            </>
                                        )}
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
                                                            // Reset the file input
                                                            const fileInput = document.getElementById('receipt-upload') as HTMLInputElement;
                                                            if (fileInput) fileInput.value = '';
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
                                                        showAlert('Please select a delivery address', 'warning');
                                                        return;
                                                    }
                                                    handleUploadReceipt();
                                                }}
                                                disabled={!receiptFile || isSubmittingOrder}
                                                className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${receiptFile && !isSubmittingOrder
                                                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSubmittingOrder ? 'Processing...' : 'Submit & Place Order'}
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
                                                            // Reset the file input
                                                            const fileInput = document.getElementById('proof-upload') as HTMLInputElement;
                                                            if (fileInput) fileInput.value = '';
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
                                                        showAlert('Please select a delivery address', 'warning');
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
                                            className={`p-4 border-2 rounded-lg transition-colors ${selectedAddressId === addr.address_id
                                                ? 'border-yellow-400 bg-yellow-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div
                                                    onClick={() => {
                                                        setSelectedAddress(addr);
                                                        setSelectedAddressId(addr.address_id);
                                                        setIsEditAddressModalOpen(false);
                                                    }}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <p className="font-medium text-gray-800">{addr.address_type}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{addr.address_line}</p>
                                                    <p className="text-sm text-gray-600">{addr.barangay}, {addr.city}</p>
                                                    <p className="text-sm text-gray-600">{addr.region} {addr.postal_code}</p>
                                                </div>
                                                {addr.address_type === 'Secondary' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAddress(addr.address_id, addr.address_type);
                                                        }}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                        title="Delete address"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
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

                            {/* Use Current Location Button */}
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                const lat = position.coords.latitude;
                                                const lng = position.coords.longitude;

                                                // Validate distance
                                                const validation = validateLocationDistance(lat, lng);
                                                if (!validation.valid) {
                                                    setLocationError(
                                                        `Your current location is ${validation.distance.toFixed(1)} km away from our store. ` +
                                                        `We only deliver within ${MAX_DELIVERY_DISTANCE_KM} km. Please select a closer location.`
                                                    );
                                                    return;
                                                }

                                                setLocationError(null);
                                                setSelectedLocation({ lat, lng });

                                                // Update map and marker
                                                if (mapRef.current && markerRef.current) {
                                                    mapRef.current.setCenter({ lat, lng });
                                                    markerRef.current.setPosition({ lat, lng });
                                                }

                                                // Fetch address from coordinates
                                                fetchAddressFromCoordinates(lat, lng);
                                            },
                                            (error) => {
                                                console.error('Geolocation error:', error);
                                                let errorMessage = 'Unable to get your location. ';
                                                if (error.code === error.PERMISSION_DENIED) {
                                                    errorMessage += 'Please enable location permissions in your browser.';
                                                } else if (error.code === error.POSITION_UNAVAILABLE) {
                                                    errorMessage += 'Location information is unavailable.';
                                                } else if (error.code === error.TIMEOUT) {
                                                    errorMessage += 'Location request timed out.';
                                                }
                                                setLocationError(errorMessage);
                                            },
                                            {
                                                enableHighAccuracy: true,
                                                timeout: 10000,
                                                maximumAge: 0
                                            }
                                        );
                                    } else {
                                        setLocationError('Geolocation is not supported by your browser.');
                                    }
                                }}
                                className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Use My Current Location
                            </button>

                            {/* Distance Limit Warning */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-blue-800">
                                    📍 Maximum delivery distance: <strong>{MAX_DELIVERY_DISTANCE_KM} km</strong> from our store
                                </p>
                            </div>

                            {/* Location Error Message */}
                            {locationError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-red-800">{locationError}</p>
                                </div>
                            )}

                            {/* Map Picker */}
                            <div className="w-full h-64 rounded-lg overflow-hidden mb-4 border-2 border-gray-300">
                                <div id="google-map" style={{ height: "100%", width: "100%" }}></div>
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
        </ProtectedRoute>
    );
}