import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu, CheckCircle2, AlertCircle, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'

interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

export const Route = createLazyFileRoute('/signup')({
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showTCModal, setShowTCModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { setUser, user, signOut } = useUser();

  // Track if user is an existing employee adding customer role
  const [existingEmployeeData, setExistingEmployeeData] = useState<{
    user_uid: string;
    user_role: string;
  } | null>(null);



  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
    country: '',
    postalCode: '',
    province: '',
    provinceCode: '',
    city: '',
    cityCode: '',
    barangay: '',
    barangayCode: '',
    address_line: '',
    phone_number: '',
    otherContact: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [validationMessage, setValidationMessage] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    console.log("Navigated to /customer-interface/cart")
    console.log("Current logged-in user:", user)
  }, [user])


  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);
  const ALLOWED_REGIONS = {
    'NCR': '130000000',
    'Region III': '030000000'
  };

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );


  useEffect(() => {
    fetch('https://psgc.gitlab.io/api/regions/')
      .then(res => res.json())
      .then(data => {
        const allowedRegions = data.filter((region: any) =>
          Object.values(ALLOWED_REGIONS).includes(region.code)
        );
        setProvinces(allowedRegions);
      })
      .catch(error => console.error('Error fetching regions:', error));
  }, []);

  useEffect(() => {
    if (form.provinceCode) {
      fetch(`https://psgc.gitlab.io/api/regions/${form.provinceCode}/cities-municipalities/`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(error => console.error('Error fetching cities:', error));
    } else {
      setCities([]);
    }
  }, [form.provinceCode]);

  useEffect(() => {
    if (form.cityCode) {
      fetch(`https://psgc.gitlab.io/api/cities-municipalities/${form.cityCode}/barangays`)
        .then(res => res.json())
        .then(data => setBarangays(data))
        .catch(error => console.error('Error fetching barangays:', error));
    } else {
      setBarangays([]);
    }
  }, [form.cityCode]);

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

  // Geocode address to get coordinates
  const geocodeAddress = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const fullAddress = `${form.address_line}, ${form.barangay}, ${form.city}, ${form.province}, Philippines ${form.postalCode}`;

      // Use production backend URL, fallback to localhost for local dev
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await fetch(
        `${backendUrl}/api/geocode?address=${encodeURIComponent(fullAddress)}`
      );

      if (!response.ok) {
        console.error('Geocoding failed:', await response.text());
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log('Geocoded location:', location);

        // Validate distance from store (100 km limit)
        const STORE_LOCATION = { lat: 14.818589037203248, lng: 121.05753223366108 };
        const MAX_DELIVERY_DISTANCE_KM = 100;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (location.lat - STORE_LOCATION.lat) * Math.PI / 180;
        const dLon = (location.lng - STORE_LOCATION.lng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(STORE_LOCATION.lat * Math.PI / 180) * Math.cos(location.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        console.log(`Address distance from store: ${distance.toFixed(2)} km`);

        if (distance > MAX_DELIVERY_DISTANCE_KM) {
          setValidationMessage({
            type: 'error',
            message: `Your delivery address is ${distance.toFixed(1)} km away from our store. We only deliver within ${MAX_DELIVERY_DISTANCE_KM} km. Please provide an address closer to our location.`
          });
          return null;
        }

        return { lat: location.lat, lng: location.lng };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  useEffect(() => {
    async function checkUserAndRedirect() {
      if (user) {
        // Fetch the user's role from your "users" table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_role")
          .eq("user_uid", user.id)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user role:", userError);
          return;
        }

        console.log("User role:", userData.user_role);

        // Redirect based on role
        switch (userData.user_role) {
          case "owner":
            navigate({ to: "/admin-interface" });
            break;
          case "staff":
            navigate({ to: "/staff" });
            break;
          case "chef":
            navigate({ to: "/chef-interface" });
            break;
          case "customer":
          default:
            navigate({ to: "/customer-interface" });
            break;
        }
      }
    }

    checkUserAndRedirect();
  }, [user, navigate]);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const { name, value } = target

    if (name === 'provinceCode') {
      const selectedProvince = provinces.find(p => p.code === value);
      setForm(prev => ({
        ...prev,
        provinceCode: value,
        province: selectedProvince?.name || '',
        cityCode: '',
        city: '',
        barangay: ''
      }));
      // Clear province error
      if (errors.province) {
        setErrors(prev => ({ ...prev, province: '' }));
      }
      if (validationMessage) {
        setValidationMessage(null);
      }
      return;
    }

    if (name === 'cityCode') {
      const selectedCity = cities.find(c => c.code === value);
      setForm(prev => ({
        ...prev,
        cityCode: value,
        city: selectedCity?.name || '',
        barangay: ''
      }));
      // Clear city error
      if (errors.city) {
        setErrors(prev => ({ ...prev, city: '' }));
      }
      if (validationMessage) {
        setValidationMessage(null);
      }
      return;
    }

    if (name === 'barangay') {
      const selectedBarangay = barangays.find(b => b.code === value)
      setForm(prev => ({
        ...prev,
        barangayCode: value,
        barangay: selectedBarangay?.name || ''
      }))
      // Clear barangay error
      if (errors.barangay) {
        setErrors(prev => ({ ...prev, barangay: '' }));
      }
      return
    }

    setForm(prev => ({
      ...prev,
      [name]: target.type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear validation message when user makes changes
    if (validationMessage) {
      setValidationMessage(null);
    }
  }

  // Format phone number to ensure +63 prefix (handles legacy formats)
  const formatPhoneNumber = (number: string): string => {
    const cleaned = number.replace(/\s+/g, '')

    // Phone numbers should already be in +63 format from the new input
    if (cleaned.startsWith('+63')) {
      return cleaned
    }

    // Handle legacy 09xxxxxxxxx format just in case
    if (cleaned.startsWith('0')) {
      return '+63' + cleaned.substring(1)
    }

    // Handle raw 9xxxxxxxxx format
    if (cleaned.startsWith('9') && cleaned.length === 10) {
      return '+63' + cleaned
    }

    return cleaned
  }

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);

    // Clear birth date error when user makes changes
    if (errors.birthDate) {
      setErrors(prev => ({ ...prev, birthDate: '' }));
    }
    if (validationMessage) {
      setValidationMessage(null);
    }

    const { birthMonth, birthDay, birthYear } = updatedForm;

    if (birthMonth && birthDay && birthYear) {
      const month = parseInt(birthMonth);
      const day = parseInt(birthDay);
      const year = parseInt(birthYear);

      // Validate the date is valid
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day > daysInMonth) {
        setErrors(prev => ({ ...prev, birthDate: `Day must be between 1 and ${daysInMonth} for the selected month` }));
        return;
      }

      const birthDate = new Date(year, month - 1, day);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      if (age < 18) {
        setErrors(prev => ({ ...prev, birthDate: 'You must be at least 18 years old to sign up' }));
        setForm({
          ...updatedForm,
          birthMonth: "",
          birthDay: "",
          birthYear: "",
        });
      }
    }
  };

  const validateForm = async () => {
    const newErrors: { [key: string]: string } = {};

    // Sanitize and trim text inputs
    const trimmedFirstName = form.firstName.trim();
    const trimmedMiddleName = form.middleName.trim();
    const trimmedLastName = form.lastName.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const trimmedAddressLine = form.address_line.trim();
    const trimmedOtherContact = form.otherContact.trim();
    const trimmedPostalCode = form.postalCode.trim();

    // First Name validation
    if (!trimmedFirstName) {
      newErrors.firstName = 'First name is required';
    } else if (trimmedFirstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (trimmedFirstName.length > 100) {
      newErrors.firstName = 'First name must not exceed 100 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedFirstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Middle Name validation (optional but if provided, validate)
    if (trimmedMiddleName) {
      if (trimmedMiddleName.length > 100) {
        newErrors.middleName = 'Middle name must not exceed 100 characters';
      } else if (!/^[a-zA-ZÀ-ÿ\s'-]*$/.test(trimmedMiddleName)) {
        newErrors.middleName = 'Middle name can only contain letters, spaces, hyphens, and apostrophes';
      }
    }

    // Last Name validation
    if (!trimmedLastName) {
      newErrors.lastName = 'Last name is required';
    } else if (trimmedLastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (trimmedLastName.length > 100) {
      newErrors.lastName = 'Last name must not exceed 100 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedLastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Birth Date validation
    if (!form.birthMonth || !form.birthDay || !form.birthYear) {
      newErrors.birthDate = 'Complete date of birth is required';
    } else {
      const month = parseInt(form.birthMonth);
      const day = parseInt(form.birthDay);
      const year = parseInt(form.birthYear);

      // Validate month
      if (month < 1 || month > 12) {
        newErrors.birthDate = 'Please select a valid month';
      }

      // Validate day based on month
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        newErrors.birthDate = `Day must be between 1 and ${daysInMonth} for the selected month`;
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 120 || year > currentYear) {
        newErrors.birthDate = 'Please enter a valid birth year';
      }

      // Validate age (must be 18+)
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      if (age < 18) {
        newErrors.birthDate = 'You must be at least 18 years old to create an account';
      }
      if (age > 120) {
        newErrors.birthDate = 'Please enter a valid birth date';
      }
    }

    // Gender validation
    const validGenders = ['Male', 'Female', 'Other'];
    if (!form.gender) {
      newErrors.gender = 'Please select your gender';
    } else if (!validGenders.includes(form.gender)) {
      newErrors.gender = 'Please select a valid gender option';
    }

    // Postal Code validation
    if (!trimmedPostalCode) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4}$/.test(trimmedPostalCode)) {
      newErrors.postalCode = 'Postal code must be exactly 4 digits';
    }

    // Region/Province validation
    if (!form.provinceCode) {
      newErrors.province = 'Please select a region';
    }

    // City validation
    if (!form.cityCode) {
      newErrors.city = 'Please select a city/municipality';
    }

    // Barangay validation
    if (!form.barangayCode) {
      newErrors.barangay = 'Please select a barangay';
    }

    // Address Line validation
    if (!trimmedAddressLine) {
      newErrors.address_line = 'Complete address is required';
    } else if (trimmedAddressLine.length < 5) {
      newErrors.address_line = 'Please provide a more complete address';
    } else if (trimmedAddressLine.length > 255) {
      newErrors.address_line = 'Address must not exceed 255 characters';
    }

    // Phone Number validation - now expects +63 format
    const cleanedPhone = form.phone_number.replace(/\s+/g, '');
    const phoneRegex = /^\+63[9]\d{9}$/;  // Must be +63 followed by 9 and 9 more digits
    if (!cleanedPhone) {
      newErrors.phone_number = 'Mobile number is required';
    } else if (!phoneRegex.test(cleanedPhone)) {
      newErrors.phone_number = 'Please enter a valid Philippine mobile number starting with 9';
    }

    // Other Contact validation (optional but if provided, validate)
    if (trimmedOtherContact) {
      if (trimmedOtherContact.length > 50) {
        newErrors.otherContact = 'Alternate contact must not exceed 50 characters';
      }
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (trimmedEmail.length > 255) {
      newErrors.email = 'Email must not exceed 255 characters';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (form.password.length > 72) {
      newErrors.password = 'Password must not exceed 72 characters';
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
    }

    // Confirm Password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms Agreement validation
    if (!form.agree) {
      newErrors.agree = 'You must agree to the Terms and Conditions and Privacy Policy';
    }

    // If there are validation errors, set them and return false
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Show first error message
      const firstError = Object.values(newErrors)[0];
      setValidationMessage({ type: 'error', message: firstError });
      return false;
    }

    // Check if email is already registered and determine registration flow
    try {
      const { data: existingUser, error } = await supabase
        .rpc('check_email_for_signup', { p_email: trimmedEmail });

      if (error) {
        console.error('Error checking email:', error);
        setValidationMessage({ type: 'error', message: 'An error occurred while validating your email. Please try again.' });
        return false;
      }

      if (existingUser && existingUser.length > 0) {
        const userRecord = existingUser[0];

        // Check if user already has customer role
        if (userRecord.has_customer_role) {
          setErrors({ email: 'You already have a customer account' });
          setValidationMessage({
            type: 'error',
            message: 'This email already has a customer account. Please sign in instead or use a different email address.'
          });
          return false;
        }

        // User exists but is an employee (staff/owner/chef) without customer role
        // Allow them to add customer role
        console.log('Existing employee detected, will add customer role:', userRecord.user_role);
        setExistingEmployeeData({
          user_uid: userRecord.user_uid,
          user_role: userRecord.user_role
        });
        setValidationMessage({
          type: 'success',
          message: `Welcome! We found your employee account. Completing this registration will add customer access to your existing account.`
        });
      } else {
        // New user - clear any existing employee data
        setExistingEmployeeData(null);
      }
    } catch (err) {
      console.error('Error during email check:', err);
      setValidationMessage({ type: 'error', message: 'A network error occurred. Please check your connection and try again.' });
      return false;
    }

    // Update form with sanitized values
    setForm(prev => ({
      ...prev,
      firstName: trimmedFirstName,
      middleName: trimmedMiddleName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      address_line: trimmedAddressLine,
      otherContact: trimmedOtherContact,
      postalCode: trimmedPostalCode,
    }));

    setErrors({});
    setValidationMessage(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true);
    const isValid = await validateForm();
    setIsLoading(false);

    if (!isValid) {
      return;
    }

    // Show OTP modal and automatically send OTP
    setShowOtpModal(true);
    // Send OTP after modal is shown
    setTimeout(() => {
      sendOtp();
    }, 100);
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setSentCode('')
    setOtpCode('')
    setOtpSent(false)
    setOtpError('')
  }

  const sendOtp = async () => {
    const formattedPhone = formatPhoneNumber(form.phone_number)

    // MOCK IMPLEMENTATION - Generate a fake OTP for testing
    const mockOtp = '123456'; // In production, this comes from Twilio
    setSentCode(mockOtp);
    console.log('MOCK OTP (for testing only):', mockOtp);

    setOtpSent(true)
    setValidationMessage({ type: 'success', message: `OTP sent to ${formattedPhone}` })

    // PRODUCTION IMPLEMENTATION (commented out to save credits):
    // try {
    //   setIsSendingOtp(true)
    //   setOtpError('')

    //   // Format phone number to E.164 format
    //   const formattedPhone = formatPhoneNumber(form.phone_number)

    //   const { data, error } = await supabase.functions.invoke('send-otp', {
    //     body: { phoneNumber: formattedPhone }
    //   })

    //   if (error) {
    //     console.error('Error sending OTP:', error)
    //     setOtpError('Failed to send OTP. Please try again.')
    //     return
    //   }

    //   if (data.status === 'pending') {
    //     setOtpSent(true)
    //     setValidationMessage({ type: 'success', message: `OTP sent to ${formattedPhone}` })
    //   } else {
    //     setOtpError(data.message || 'Failed to send OTP. Please check your phone number.')
    //   }
    // } catch (err) {
    //   console.error('Error in sendOtp:', err)
    //   setOtpError('An error occurred while sending OTP. Please try again.')
    // } finally {
    //   setIsSendingOtp(false)
    // }
  }

  const verifyOtp = async () => {
    // MOCK IMPLEMENTATION - Validate against the mock OTP
    try {
      setIsLoading(true);
      setOtpError('');

      // Validate OTP code
      if (!otpCode || otpCode.length !== 6) {
        setOtpError('Please enter a valid 6-digit OTP code');
        setIsLoading(false);
        return;
      }

      // Check against mock OTP (in production, Twilio handles this)
      if (otpCode !== sentCode) {
        setOtpError('Invalid OTP code. Please try again. (Hint: Use 123456 for testing)');
        setIsLoading(false);
        return;
      }

      // OTP verified successfully, proceed with user registration
      await signUpNewUser();
      closeOtpModal();
      // Navigate to login with success message and pre-filled email
      navigate({ to: `/login?signup=success&email=${encodeURIComponent(form.email.trim().toLowerCase())}` });
    } catch (error) {
      console.error('Error verifying OTP or signing up:', error);
      setOtpError('An error occurred. Please try again.');
      setIsLoading(false);
    }

    // PRODUCTION IMPLEMENTATION (commented out to save credits):
    // try {
    //   setIsLoading(true);
    //   setOtpError('');

    //   // Validate OTP code
    //   if (!otpCode || otpCode.length !== 6) {
    //     setOtpError('Please enter a valid 6-digit OTP code');
    //     setIsLoading(false);
    //     return;
    //   }

    //   // Format phone number to E.164 format
    //   const formattedPhone = formatPhoneNumber(form.phone_number);

    //   // Verify OTP with Twilio via Supabase Edge Function
    //   const { data, error } = await supabase.functions.invoke('verify-otp', {
    //     body: {
    //       phoneNumber: formattedPhone,
    //       otpCode: otpCode
    //     }
    //   });

    //   if (error) {
    //     console.error('Error verifying OTP:', error);
    //     setOtpError('Failed to verify OTP. Please try again.');
    //     setIsLoading(false);
    //     return;
    //   }

    //   // Check if verification was successful
    //   if (data.status === 'approved') {
    //     // OTP verified successfully, proceed with user registration
    //     await signUpNewUser();
    //     closeOtpModal();
    //     navigate({ to: `/login?signup=success&email=${encodeURIComponent(form.email.trim().toLowerCase())}` });
    //   } else {
    //     setOtpError(data.message || 'Invalid OTP code. Please try again.');
    //     setIsLoading(false);
    //   }
    // } catch (error) {
    //   console.error('Error verifying OTP or signing up:', error);
    //   setOtpError('An error occurred. Please try again.');
    //   setIsLoading(false);
    // }
  }

  async function signUpNewUser() {
    setIsLoading(true)

    try {
      // Prepare sanitized data
      const sanitizedFirstName = form.firstName.trim().substring(0, 100);
      const sanitizedMiddleName = form.middleName.trim().substring(0, 100) || null;
      const sanitizedLastName = form.lastName.trim().substring(0, 100);
      const sanitizedEmail = form.email.trim().toLowerCase();
      const sanitizedPhone = form.phone_number.replace(/\s+/g, '');
      const sanitizedAddressLine = form.address_line.trim().substring(0, 255);
      const sanitizedOtherContact = form.otherContact.trim().substring(0, 50) || null;
      const sanitizedPostalCode = form.postalCode.trim();

      // Format birth date with proper padding
      const birthMonth = form.birthMonth.padStart(2, '0');
      const birthDay = form.birthDay.padStart(2, '0');
      const formattedBirthDate = `${form.birthYear}-${birthMonth}-${birthDay}`;

      let userId: string;

      // Check if this is an existing employee adding customer role
      if (existingEmployeeData) {
        // Use database function to add customer role (bypasses RLS)
        const { data: newRole, error: updateError } = await supabase.rpc('add_customer_role_to_employee', {
          p_user_uid: existingEmployeeData.user_uid,
          p_phone_number: sanitizedPhone,
          p_other_contact: sanitizedOtherContact
        });

        if (updateError) {
          console.error('Error updating user role:', updateError);
          setValidationMessage({ type: 'error', message: `Failed to update your account: ${updateError.message}` });
          throw updateError;
        }

        userId = existingEmployeeData.user_uid;
        console.log('Successfully updated user role to:', newRole);

      } else {
        // New user - create auth account and user record
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/login?verified=true`,
          },
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            setValidationMessage({ type: 'error', message: 'This email is already registered. Please use a different email or sign in.' });
          } else {
            setValidationMessage({ type: 'error', message: `Authentication error: ${authError.message}` });
          }
          throw authError;
        }

        const userAuthId = authData?.user?.id
        if (!userAuthId) {
          setValidationMessage({ type: 'error', message: 'Registration failed. Please try again.' });
          throw new Error("Auth signup failed, no user ID returned.");
        }

        await supabase.auth.signOut();

        const { data, error: userError } = await supabase.rpc('create_user_profile', {
          p_user_uid: userAuthId,
          p_first_name: sanitizedFirstName,
          p_middle_name: sanitizedMiddleName,
          p_last_name: sanitizedLastName,
          p_email: sanitizedEmail,
          p_phone_number: sanitizedPhone,
          p_birth_date: formattedBirthDate,
          p_gender: form.gender,
          p_other_contact: sanitizedOtherContact
        });

        if (userError) {
          console.error("Error inserting user:", userError);
          setValidationMessage({ type: 'error', message: `Failed to create user profile: ${userError.message}` });
          throw userError;
        }

        userId = userAuthId; // Function returns the UUID
      }

      // Geocode the address to get coordinates
      const coordinates = await geocodeAddress();

      if (!coordinates) {
        console.warn('Could not geocode address, using default coordinates');
        setValidationMessage({
          type: 'error',
          message: 'Unable to verify your address location. Please check that your address is complete and accurate.'
        });
        throw new Error('Geocoding failed');
      }

      // Insert address for the user (works for both new and existing users)
      const { error: addressError } = await supabase.from("address").insert([
        {
          address_type: "Primary",
          address_line: sanitizedAddressLine,
          region: form.province,
          city: form.city,
          barangay: form.barangay,
          postal_code: sanitizedPostalCode,
          customer_id: userId,
          latitude: coordinates.lat,
          longitude: coordinates.lng
        },
      ])

      if (addressError) {
        console.error("Error inserting address:", addressError);
        setValidationMessage({ type: 'error', message: `Failed to save address: ${addressError.message}` });
        throw addressError;
      }

      // Different success messages based on registration type
      if (existingEmployeeData) {
        setValidationMessage({
          type: 'success',
          message: 'Customer access added successfully! You can now use your existing login credentials to access the customer portal.'
        });
        console.log("Customer role added to existing employee!", { userId });
      } else {
        setValidationMessage({
          type: 'success',
          message: 'Account created successfully! Please check your email to verify your account.'
        });
        console.log("User registration successful!", { userId });
      }
    } catch (error) {
      console.error("Error during registration:", error)
      throw error;
    } finally {
      setIsLoading(false)
      // Clear existing employee data after registration attempt
      setExistingEmployeeData(null);
    }
  }

  const isStep1Complete = () => {
    return form.firstName && form.lastName && form.birthMonth && form.birthDay && form.birthYear && form.gender;
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    // First Name validation
    const trimmedFirstName = form.firstName.trim();
    if (!trimmedFirstName) {
      newErrors.firstName = 'First name is required';
    } else if (trimmedFirstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedFirstName)) {
      newErrors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Middle Name validation (if provided)
    const trimmedMiddleName = form.middleName.trim();
    if (trimmedMiddleName && !/^[a-zA-ZÀ-ÿ\s'-]*$/.test(trimmedMiddleName)) {
      newErrors.middleName = 'Middle name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Last Name validation
    const trimmedLastName = form.lastName.trim();
    if (!trimmedLastName) {
      newErrors.lastName = 'Last name is required';
    } else if (trimmedLastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedLastName)) {
      newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Birth Date validation
    if (!form.birthMonth || !form.birthDay || !form.birthYear) {
      newErrors.birthDate = 'Complete date of birth is required';
    } else {
      const month = parseInt(form.birthMonth);
      const day = parseInt(form.birthDay);
      const year = parseInt(form.birthYear);

      // Validate month
      if (month < 1 || month > 12) {
        newErrors.birthDate = 'Please select a valid month';
      }

      // Validate day based on month
      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) {
        newErrors.birthDate = `Day must be between 1 and ${daysInMonth} for the selected month`;
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 120 || year > currentYear) {
        newErrors.birthDate = 'Please enter a valid birth year';
      }

      // Validate age (must be 18+)
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
      if (age < 18) {
        newErrors.birthDate = 'You must be at least 18 years old to create an account';
      }
    }

    // Gender validation
    if (!form.gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      setValidationMessage({ type: 'error', message: firstError });
      return false;
    }

    setErrors({});
    setValidationMessage(null);
    return true;
  };

  const isStep2Complete = () => {
    return form.postalCode && form.provinceCode && form.cityCode && form.barangayCode && form.address_line && form.phone_number;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    // Postal Code validation
    const trimmedPostalCode = form.postalCode.trim();
    if (!trimmedPostalCode) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4}$/.test(trimmedPostalCode)) {
      newErrors.postalCode = 'Postal code must be exactly 4 digits';
    }

    // Region/Province validation
    if (!form.provinceCode) {
      newErrors.province = 'Please select a region';
    }

    // City validation
    if (!form.cityCode) {
      newErrors.city = 'Please select a city/municipality';
    }

    // Barangay validation
    if (!form.barangayCode) {
      newErrors.barangay = 'Please select a barangay';
    }

    // Address Line validation
    const trimmedAddressLine = form.address_line.trim();
    if (!trimmedAddressLine) {
      newErrors.address_line = 'Complete address is required';
    } else if (trimmedAddressLine.length < 5) {
      newErrors.address_line = 'Please provide a more complete address';
    }

    // Phone Number validation - now expects +63 format
    const cleanedPhone = form.phone_number.replace(/\s+/g, '');
    const phoneRegex = /^\+63[9]\d{9}$/;  // Must be +63 followed by 9 and 9 more digits
    if (!cleanedPhone) {
      newErrors.phone_number = 'Mobile number is required';
    } else if (!phoneRegex.test(cleanedPhone)) {
      newErrors.phone_number = 'Please enter a valid Philippine mobile number starting with 9';
    }

    // Other Contact validation (optional)
    const trimmedOtherContact = form.otherContact.trim();
    if (trimmedOtherContact && trimmedOtherContact.length > 50) {
      newErrors.otherContact = 'Alternate contact must not exceed 50 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      setValidationMessage({ type: 'error', message: firstError });
      return false;
    }

    setErrors({});
    setValidationMessage(null);
    return true;
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
    <div className="min-h-screen min-w-[320px] bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">
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

                <Link to="/login">
                  <button className="btn-primary text-amber-900 font-semibold py-2 px-3 sm:px-5 text-xs sm:text-sm rounded-full shadow-md whitespace-nowrap hover:scale-105">
                    <span className="hidden sm:inline">SIGN IN</span>
                    <span className="sm:hidden">IN</span>
                  </button>
                </Link>
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

      {isNotificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationOpen(false)}
        />
      )}

      <div className="flex-grow pb-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#964B00] mb-3">Create Your Account</h1>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                Join Angieren's Lutong Bahay and enjoy authentic Filipino home-cooked meals delivered to your doorstep.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 1 ? 'bg-[#964B00] text-yellow-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {isStep1Complete() ? <CheckCircle2 className="h-6 w-6" /> : '1'}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Personal Info</span>
              </div>
              <div className={`h-1 flex-1 mx-2 transition-all ${isStep1Complete() ? 'bg-[#964B00]' : 'bg-gray-200'}`}></div>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 2 ? 'bg-[#964B00] text-yellow-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {isStep2Complete() ? <CheckCircle2 className="h-6 w-6" /> : '2'}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Address</span>
              </div>
              <div className={`h-1 flex-1 mx-2 transition-all ${isStep2Complete() ? 'bg-[#964B00]' : 'bg-gray-200'}`}></div>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 3 ? 'bg-[#964B00] text-yellow-400' : 'bg-gray-200 text-gray-500'
                  }`}>
                  3
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Account</span>
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Please ensure all information is accurate. Angieren's Team will not be liable for any errors in the information provided.
                </p>
              </div>
            </div>

            {/* Validation Message Banner */}
            {validationMessage && (
              <div className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${validationMessage.type === 'error'
                ? 'bg-red-50 border-red-500 text-red-800'
                : 'bg-green-50 border-green-500 text-green-800'
                }`}>
                {validationMessage.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{validationMessage.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setValidationMessage(null)}
                  className={`p-1 rounded hover:bg-opacity-20 ${validationMessage.type === 'error' ? 'hover:bg-red-500' : 'hover:bg-green-500'
                    }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#964B00] text-yellow-400 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        maxLength={100}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        placeholder='Juan'
                        required
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middleName"
                        value={form.middleName}
                        onChange={handleChange}
                        maxLength={100}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.middleName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        placeholder='Santos'
                      />
                      {errors.middleName && (
                        <p className="text-red-500 text-xs mt-1">{errors.middleName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        maxLength={100}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        placeholder='Dela Cruz'
                        required
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Date of Birth <span className="text-red-500">*</span></h3>
                    {errors.birthDate && (
                      <p className="text-red-500 text-xs mb-2">{errors.birthDate}</p>
                    )}
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <select
                          name="birthMonth"
                          value={form.birthMonth}
                          onChange={handleBirthChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-[#964B00] focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                          required
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i + 1}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          name="birthDay"
                          value={form.birthDay}
                          onChange={handleBirthChange}
                          min="1"
                          max="31"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-[#964B00] focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                          placeholder='Day'
                          required
                        />
                      </div>

                      <div>
                        <select
                          name="birthYear"
                          value={form.birthYear}
                          onChange={handleBirthChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-[#964B00] focus:ring-2 focus:ring-amber-200 transition-all outline-none"
                          required>
                          <option value="">Year</option>
                          {Array.from({ length: 100 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.gender ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                            }`}
                          required
                        >
                          <option value="">Sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="bg-gradient-to-r from-[#964B00] to-amber-700 hover:from-amber-700 hover:to-[#964B00] text-yellow-400 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Next: Address →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Address Information */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#964B00] text-yellow-400 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Address</h2>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value="Philippines"
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed"
                        disabled={true}
                      >
                        <option value="Philippines">Philippines</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        maxLength={4}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.postalCode ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        placeholder='1234'
                        required
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Region <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="provinceCode"
                        value={form.provinceCode}
                        onChange={handleChange}
                        required
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.province ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                      >
                        <option value="">Select Region</option>
                        {provinces.map((region) => (
                          <option key={region.code} value={region.code}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="text-red-500 text-xs mt-1">{errors.province}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City/Municipality <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="cityCode"
                        value={form.cityCode}
                        onChange={handleChange}
                        required
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        disabled={!form.provinceCode}
                      >
                        <option value="">
                          {form.provinceCode ? 'Select City/Municipality' : 'Select region first'}
                        </option>
                        {cities.map((city) => (
                          <option key={city.code} value={city.code}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Barangay <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="barangay"
                        value={form.barangayCode}
                        onChange={handleChange}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none disabled:bg-gray-50 disabled:cursor-not-allowed ${errors.barangay ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        required
                        disabled={!form.cityCode}
                      >
                        <option value="">
                          {form.cityCode ? 'Select your barangay' : 'Select city first'}
                        </option>
                        {barangays.map((barangay) => (
                          <option key={barangay.code} value={barangay.code}>
                            {barangay.name}
                          </option>
                        ))}
                      </select>
                      {errors.barangay && (
                        <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Complete Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address_line"
                        value={form.address_line}
                        onChange={handleChange}
                        maxLength={255}
                        placeholder="House/Unit/Floor No., Building Name, Street Name"
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.address_line ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        required
                      />
                      {errors.address_line && (
                        <p className="text-red-500 text-xs mt-1">{errors.address_line}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        💡 Your address will be automatically verified for accurate delivery service.
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-4 py-3 bg-amber-100 border-2 border-r-0 border-gray-200 rounded-l-lg text-amber-800 font-semibold text-sm">
                            +63
                          </span>
                          <input
                            type="text"
                            name="phone_number"
                            value={form.phone_number.startsWith('+63') ? form.phone_number.slice(3) : form.phone_number.startsWith('0') ? form.phone_number.slice(1) : form.phone_number}
                            onChange={(e) => {
                              // Only allow digits and limit to 10 characters (9xxxxxxxxx)
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setForm(prev => ({ ...prev, phone_number: value ? `+63${value}` : '' }));
                              if (errors.phone_number) {
                                setErrors(prev => ({ ...prev, phone_number: '' }));
                              }
                              if (validationMessage) {
                                setValidationMessage(null);
                              }
                            }}
                            maxLength={10}
                            placeholder="9xxxxxxxxx"
                            className={`flex-1 border-2 rounded-r-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.phone_number ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                              }`}
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter your 10-digit mobile number</p>
                        {errors.phone_number && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alternate Contact
                        </label>
                        <input
                          type="text"
                          name="otherContact"
                          value={form.otherContact}
                          onChange={handleChange}
                          maxLength={50}
                          placeholder="8-xxxxxxx (Optional)"
                          className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.otherContact ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                            }`}
                        />
                        {errors.otherContact && (
                          <p className="text-red-500 text-xs mt-1">{errors.otherContact}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) {
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="bg-gradient-to-r from-[#964B00] to-amber-700 hover:from-amber-700 hover:to-[#964B00] text-yellow-400 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Next: Account Setup →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Account Setup */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#964B00] text-yellow-400 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Account Setup</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      maxLength={255}
                      className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                        }`}
                      placeholder='your.email@example.com'
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        maxLength={72}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        placeholder='••••••••'
                        required
                      />
                      {errors.password ? (
                        <p className="text-red-500 text-xs mt-2">{errors.password}</p>
                      ) : (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          Must include: 8+ characters, uppercase, lowercase, number, special character (@$!%*?&)
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        maxLength={72}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-200 transition-all outline-none ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#964B00]'
                          }`}
                        placeholder='••••••••'
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-5">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={form.agree}
                        onChange={handleChange}
                        className={`mt-1 w-5 h-5 rounded border-2 text-[#964B00] focus:ring-2 focus:ring-amber-200 cursor-pointer ${errors.agree ? 'border-red-500' : 'border-gray-300'
                          }`}
                        required
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I confirm that I am at least 18 years old and agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowTCModal(true)
                          }}
                          className="text-[#964B00] font-semibold underline hover:text-amber-700 transition-colors"
                        >
                          Terms and Conditions
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowPrivacyModal(true)
                          }}
                          className="text-[#964B00] font-semibold underline hover:text-amber-700 transition-colors"
                        >
                          Privacy Policy
                        </button>
                        {' '}of Angieren's Lutong Bahay.
                      </span>
                    </label>
                    {errors.agree && (
                      <p className="text-red-500 text-xs mt-2 ml-8">{errors.agree}</p>
                    )}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {/* Submit Section */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#964B00] font-semibold hover:underline">
                      Sign in here
                    </Link>
                  </p>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#964B00] to-amber-700 hover:from-amber-700 hover:to-[#964B00] text-yellow-400 font-bold px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    SUBMIT
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="contact" className="bg-gradient-to-br from-amber-900 via-amber-950 to-black text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[url('/angierens-logo.png')] bg-cover bg-center rounded-full" />
                <h3 className="text-xl font-bold">Angieren's</h3>
              </div>
              <p className="text-amber-200/80 text-sm leading-relaxed">
                Authentic Filipino home-cooked meals delivered to your doorstep. Taste the tradition, feel the love.
              </p>
              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Home</Link></li>
                <li><Link to="/customer-interface" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Menu</Link></li>
                <li><a href="#about" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />About Us</a></li>
                <li><a href="#contact" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />FAQ</Link></li>
                <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Help Center</Link></li>
                <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Terms & Conditions</Link></li>
                <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact Us</h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-amber-200/60 text-xs mb-1">Email</p>
                    <p className="text-amber-100">info@angierens.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-amber-200/60 text-xs mb-1">Phone</p>
                    <p className="text-amber-100">+63 912 345 6789</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-amber-200/60 text-xs mb-1">Location</p>
                    <p className="text-amber-100">Bulacan, Philippines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-10 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-amber-200/60 text-sm">
                © 2024 Angieren's Lutong Bahay. All rights reserved.
              </p>
              <p className="text-amber-200/40 text-xs">
                Made with 💛 in Bulacan, Philippines
              </p>
            </div>
          </div>
        </div>
      </footer>
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-[#964B00]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Number</h2>
              <p className="text-gray-600 text-sm">
                {otpSent
                  ? `Code sent to ${formatPhoneNumber(form.phone_number)}`
                  : 'We will send a 6-digit code to your phone'}
              </p>
            </div>

            {otpError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            {!otpSent ? (
              <button
                onClick={sendOtp}
                disabled={isSendingOtp}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#964B00] to-amber-700 text-yellow-400 rounded-xl hover:from-amber-700 hover:to-[#964B00] transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Enter OTP Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#964B00] focus:ring-2 focus:ring-amber-200 transition-all outline-none text-center text-2xl tracking-[0.5em] font-bold"
                    placeholder="000000"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && otpCode.length === 6 && verifyOtp()}
                  />
                </div>

                <div className="text-center mb-6">
                  <button
                    onClick={sendOtp}
                    disabled={isSendingOtp}
                    className="text-[#964B00] text-sm font-semibold hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? 'Sending...' : "Didn't receive the code? Resend"}
                  </button>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeOtpModal}
                disabled={isLoading}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              {otpSent && (
                <button
                  onClick={verifyOtp}
                  disabled={isLoading || otpCode.length !== 6}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#964B00] to-amber-700 text-yellow-400 rounded-xl hover:from-amber-700 hover:to-[#964B00] transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {showTCModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Terms and Conditions</h2>
                <button
                  onClick={() => setShowTCModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6 text-gray-700">
                <section>
                  <h3 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p>By accessing and using Angieren's Lutong Bahay online ordering system, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">2. Service Description</h3>
                  <p>Angieren's Lutong Bahay provides an online ordering platform for authentic Filipino home-cooked meals with delivery and pick-up options. We reserve the right to modify or discontinue the service at any time without notice.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">3. User Account</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must be at least 18 years old to create an account</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You agree to provide accurate and complete information during registration</li>
                    <li>You are responsible for all activities that occur under your account</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Orders and Payment</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>All orders are subject to availability and confirmation</li>
                    <li>Prices are subject to change without notice</li>
                    <li>Payment must be made through authorized payment methods (GCash)</li>
                    <li>Proof of payment must be uploaded for order confirmation</li>
                    <li>Orders cannot be cancelled once the chef has started preparing the food</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Delivery</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Delivery is available within Metro Manila (NCR) only</li>
                    <li>Delivery times are estimates and may vary due to traffic or other factors</li>
                    <li>You must provide accurate address information</li>
                    <li>Additional delivery charges may apply based on location</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">6. Cancellations and Refunds</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Cancellation requests must be submitted before the order is accepted by staff</li>
                    <li>Refunds are processed at our discretion based on the circumstances</li>
                    <li>Refund processing time may take 3-5 business days</li>
                    <li>No refunds will be issued for orders that have been prepared or delivered</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">7. Food Safety and Quality</h3>
                  <p>While we strive to maintain the highest standards of food safety and quality, we are not liable for any adverse reactions or allergies. Customers are responsible for informing us of any dietary restrictions or allergies.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">8. Intellectual Property</h3>
                  <p>All content on this platform, including text, graphics, logos, and images, is the property of Angieren's Lutong Bahay and is protected by copyright laws.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">9. Limitation of Liability</h3>
                  <p>Angieren's Lutong Bahay shall not be liable for any indirect, incidental, or consequential damages arising from the use of our service.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">10. Contact Information</h3>
                  <p>For questions regarding these Terms and Conditions, please contact us at:</p>
                  <p className="mt-2">Email: info@angierens.com<br />Phone: +63 912 345 6789</p>
                </section>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setShowTCModal(false)}
                className="w-full bg-[#964B00] text-yellow-400 py-3 rounded-lg font-semibold hover:bg-[#7a3d00] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6 text-gray-700">
                <p className="text-sm text-gray-600">Last Updated: October 26, 2025</p>

                <section>
                  <h3 className="text-lg font-semibold mb-2">1. Information We Collect</h3>
                  <p className="mb-2">We collect the following types of information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth, gender</li>
                    <li><strong>Address Information:</strong> Address including barangay, city, and postal code</li>
                    <li><strong>Order Information:</strong> Order history, preferences, and payment details</li>
                    <li><strong>Usage Information:</strong> How you interact with our platform</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">2. How We Use Your Information</h3>
                  <p className="mb-2">We use your information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Processing and fulfilling your orders</li>
                    <li>Communicating with you about your orders</li>
                    <li>Providing customer support</li>
                    <li>Sending order updates and notifications</li>
                    <li>Improving our services and user experience</li>
                    <li>Preventing fraud and ensuring platform security</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">3. Information Sharing</h3>
                  <p className="mb-2">We may share your information with:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Delivery Riders:</strong> Name, phone number, and address to facilitate delivery</li>
                    <li><strong>Kitchen Staff:</strong> Order details to prepare your food</li>
                    <li><strong>Payment Processors:</strong> Payment information for transaction processing</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                  </ul>
                  <p className="mt-2">We do not sell your personal information to third parties.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">4. Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">5. Data Retention</h3>
                  <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Order history may be retained for accounting and legal purposes.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">6. Your Rights</h3>
                  <p className="mb-2">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Object to processing of your data</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">7. Cookies and Tracking</h3>
                  <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">8. Children's Privacy</h3>
                  <p>Our service is not intended for individuals under 18 years of age.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">9. Changes to Privacy Policy</h3>
                  <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">10. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
                  <p className="mt-2">
                    Email: info@angierens.com<br />
                    Phone: +63 912 345 6789<br />
                    Address: Metro Manila, Philippines
                  </p>
                </section>

                <section className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Your Consent</h3>
                  <p>By using our service, you consent to the collection and use of your information as described in this Privacy Policy.</p>
                </section>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full bg-[#964B00] text-yellow-400 py-3 rounded-lg font-semibold hover:bg-[#7a3d00] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner />}
    </div>
  )
}
