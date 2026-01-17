import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu, Facebook, Instagram, Mail, Phone, MapPin, ArrowRight, Eye, EyeOff, Lock, User, KeyRound, CheckCircle2, Sparkles, ShieldCheck, Users, ChefHat, ShoppingBag } from 'lucide-react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from '@tanstack/react-router';
import { useUser } from '@/context/UserContext';
import { AlertModal, type AlertType } from '@/components/AlertModal'


interface Notification {
  id: string
  type: 'order' | 'feedback'
  title: string
  time: string
  icon: 'heart' | 'message' | 'star'
  read: boolean
}

export const Route = createLazyFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { setUser, user } = useUser();

  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailToReset, setEmailToReset] = useState("");

  // For password reset flow
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Role selection modal state
  const [showRoleSelectionModal, setShowRoleSelectionModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Email verification modal state (shown after signup)
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState<string>("");

  // Email verified modal state (shown after clicking verification link)
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

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

  // Role configuration with icons, colors, and paths
  const roleConfig: Record<string, { path: string; icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
    owner: {
      path: '/admin-interface',
      icon: <ShieldCheck className="w-8 h-8" />,
      label: 'Owner Dashboard',
      color: 'text-purple-600',
      bgColor: 'from-purple-500 to-purple-700'
    },
    staff: {
      path: '/staff',
      icon: <Users className="w-8 h-8" />,
      label: 'Staff Portal',
      color: 'text-blue-600',
      bgColor: 'from-blue-500 to-blue-700'
    },
    chef: {
      path: '/chef-interface',
      icon: <ChefHat className="w-8 h-8" />,
      label: 'Chef Kitchen',
      color: 'text-orange-600',
      bgColor: 'from-orange-500 to-orange-700'
    },
    customer: {
      path: '/customer-interface',
      icon: <ShoppingBag className="w-8 h-8" />,
      label: 'Customer Menu',
      color: 'text-green-600',
      bgColor: 'from-green-500 to-green-700'
    }
  };

  // Function to parse user roles (handles both array and comma-separated string)
  const parseUserRoles = (userRole: string | string[]): string[] => {
    if (Array.isArray(userRole)) {
      return userRole.map(r => r.trim().toLowerCase()).filter(r => r);
    }
    if (typeof userRole === 'string') {
      return userRole.split(',').map(r => r.trim().toLowerCase()).filter(r => r);
    }
    return [];
  };

  // Handle role selection
  const handleRoleSelection = (role: string) => {
    const config = roleConfig[role];
    if (config) {
      setShowRoleSelectionModal(false);
      navigate({ to: config.path });
    }
  };

  const handleForgotClick = () => setShowForgotModal(true);
  const handleCloseModal = () => {
    setShowForgotModal(false);
    setEmailToReset("");
  };
  const handleCloseResetModal = () => {
    setShowResetPasswordModal(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Check if user just signed up (coming from signup page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const signupSuccess = urlParams.get('signup');
    const emailParam = urlParams.get('email');

    if (signupSuccess === 'success') {
      setShowEmailVerificationModal(true);
      if (emailParam) {
        setSignupEmail(decodeURIComponent(emailParam));
        setEmail(decodeURIComponent(emailParam)); // Pre-fill the email field
      }
      // Clean up URL without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Handle email verification redirect (user clicked link in email)
  useEffect(() => {
    const handleEmailVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const verified = urlParams.get('verified');
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      // Check if this is an email confirmation callback
      if (verified === 'true' || (accessToken && type === 'signup')) {
        // Get current session to check if user was auto-logged in
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // User was auto-logged in by Supabase - sign them out for security
          const userEmail = session.user.email;
          await supabase.auth.signOut();

          // Show verification success modal
          setShowVerifiedModal(true);
          if (userEmail) {
            setVerifiedEmail(userEmail);
            setEmail(userEmail); // Pre-fill the email field
          }
        } else {
          // No session, just show success modal
          setShowVerifiedModal(true);
        }

        // Clean up URL without refreshing (remove both query and hash)
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    handleEmailVerification();
  }, []);

  // Check if user is coming from password reset email
  useEffect(() => {
    // Check for the hash fragment that Supabase adds
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      setIsResettingPassword(true);
      setShowResetPasswordModal(true);
    }
  }, []);

  useEffect(() => {
    async function checkUserAndRedirect() {
      // Check URL params first - if verified=true, don't redirect (let the verification handler deal with it)
      const urlParams = new URLSearchParams(window.location.search);
      const verified = urlParams.get('verified');
      const signupSuccess = urlParams.get('signup');

      if (verified === 'true' || signupSuccess === 'success') {
        // Let the verification useEffect handle this
        return;
      }

      // Don't redirect if user is resetting password, role selection modal is open, or showing verification modals
      if (isResettingPassword || showRoleSelectionModal || showEmailVerificationModal || showVerifiedModal) {
        return;
      }

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

        // Parse roles and check for multiple roles
        const roles = parseUserRoles(userData.user_role);
        console.log("Parsed roles:", roles);

        if (roles.length > 1) {
          // Multiple roles - show selection modal
          setAvailableRoles(roles);
          setShowRoleSelectionModal(true);
        } else if (roles.length === 1) {
          // Single role - redirect directly
          const config = roleConfig[roles[0]];
          if (config) {
            navigate({ to: config.path });
          } else {
            navigate({ to: "/customer-interface" });
          }
        } else {
          // No valid role found - default to customer
          navigate({ to: "/customer-interface" });
        }
      }
    }

    checkUserAndRedirect();
  }, [user, navigate, isResettingPassword, showRoleSelectionModal, showEmailVerificationModal, showVerifiedModal]);




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

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-amber-200"></div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-amber-600 animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-amber-900 font-semibold text-lg">Please wait...</p>
          <p className="text-amber-600/70 text-sm mt-1">Authenticating your account</p>
        </div>
      </div>
    </div>
  );

  async function signInWithEmail() {
    if (!email || !password) {
      showAlert('Please fill in both fields.', 'warning')
      return;
    }

    setIsLoading(true);

    console.log("Attempting to sign in with email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("Sign-in response data:", data);

    setIsLoading(false);

    if (error) {
      if (error.message === "Email not confirmed") {
        showAlert('Please verify your email address before logging in.', 'warning')
      } else {
        showAlert(error.message || 'Credentials are not valid. Please try again.', 'error')
      }
      console.log("Error:", error);
      return;
    }

    const loggedInUser = data.user;
    setUser(loggedInUser);
    console.log("Sign-in successful:", loggedInUser);

    // ✅ Fetch the user's role from your "users" table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_role")
      .eq("user_uid", loggedInUser.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user role:", userError);
      showAlert('Error fetching user. Please contact support.', 'error')
      return;
    }

    console.log("User role:", userData.user_role);

    // Parse roles and check for multiple roles
    const roles = parseUserRoles(userData.user_role);

    if (roles.length > 1) {
      // Multiple roles - show selection modal
      setAvailableRoles(roles);
      setShowRoleSelectionModal(true);
    } else if (roles.length === 1) {
      // Single role - redirect directly
      const config = roleConfig[roles[0]];
      if (config) {
        navigate({ to: config.path });
      } else {
        navigate({ to: "/customer-interface" });
      }
    } else {
      // No valid role found - default to customer
      navigate({ to: "/customer-interface" });
    }
  }


  async function sendPasswordResetEmail() {
    if (!emailToReset) {
      showAlert('Please enter your email address.', 'warning')
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToReset)) {
      showAlert('Please enter a valid email address format.', 'warning')
      return;
    }

    setIsLoading(true);

    const redirectUrl = window.location.origin + window.location.pathname;

    const { data, error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
      redirectTo: redirectUrl,
    });

    setIsLoading(false);

    if (error) {
      showAlert('Error sending reset email. Please make sure the email is valid.', 'error')
      console.error("Reset error:", error);
    } else {
      showAlert('Password reset email sent! Please check your inbox.', 'success')
      handleCloseModal();
    }
  }

  async function updatePassword() {
    if (!newPassword || !confirmPassword) {
      showAlert('Please fill in both password fields.', 'warning')
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match!', 'warning')
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Password must be at least 6 characters long.', 'warning')
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsLoading(false);

    if (error) {
      showAlert('Error updating password. Please try again.', 'error')
      console.error("Update password error:", error);
    } else {
      showAlert('Password updated successfully! You can now log in with your new password.', 'success')

      // Sign out the user to force manual login
      await supabase.auth.signOut();
      setUser(null);

      handleCloseResetModal();
      setIsResettingPassword(false);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

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

                <Link to="/signup">
                  <button className="btn-primary text-amber-900 font-semibold py-2 px-3 sm:px-5 text-xs sm:text-sm rounded-full shadow-md whitespace-nowrap hover:scale-105">
                    <span className="hidden sm:inline">SIGN UP</span>
                    <span className="sm:hidden">UP</span>
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

      {/* Main Content - Login Form */}
      <div className="flex-grow flex items-center justify-center py-8 sm:py-12 px-4">
        <div className={`w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          {/* Left Side - Branding/Welcome (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-1 text-center p-8">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-[url('/angierens-logo.png')] bg-cover bg-center rounded-full shadow-2xl animate-float" />
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-amber-900" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gradient mb-3">Welcome Back!</h2>
            <p className="text-amber-800/70 text-lg max-w-xs leading-relaxed">
              Sign in to continue your journey with authentic Filipino home-cooked meals.
            </p>
            <div className="mt-8 flex items-center gap-3 text-amber-700">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm">Secure & Fast Login</span>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md lg:flex-1">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-[url('/angierens-logo.png')] bg-cover bg-center rounded-full shadow-xl mb-3" />
              <h2 className="text-xl font-bold text-amber-900">Welcome Back!</h2>
            </div>

            {/* Form container */}
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 sm:p-10 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-orange-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-2">Sign In</h1>
                  <p className="text-amber-700/70 text-sm">Enter your credentials to access your account</p>
                </div>

                <form
                  className="flex flex-col gap-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    signInWithEmail();
                  }}
                >
                  {/* Email Input */}
                  <div className="group">
                    <label className="block text-sm font-medium text-amber-800 mb-2 ml-1">Email Address</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-amber-600 group-focus-within:text-amber-800 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all duration-300 text-amber-900 placeholder:text-amber-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label className="block text-sm font-medium text-amber-800 mb-2 ml-1">Password</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-amber-600 group-focus-within:text-amber-800 transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all duration-300 text-amber-900 placeholder:text-amber-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-amber-500 hover:text-amber-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember / Forgot */}
                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative">
                        <input type="checkbox" className="peer sr-only" />
                        <div className="w-5 h-5 border-2 border-amber-300 rounded-md peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all" />
                        <CheckCircle2 className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-amber-700 group-hover:text-amber-900 transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotClick}
                      className="text-amber-600 hover:text-amber-800 font-medium transition-colors hover:underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="group relative mt-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  </button>

                  {/* Divider */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-amber-500">or</span>
                    </div>
                  </div>

                  {/* Account link */}
                  <p className="text-sm text-center text-amber-700">
                    Don't have an account?{' '}
                    <Link
                      to="/signup"
                      className="text-amber-600 hover:text-amber-800 font-semibold transition-colors hover:underline underline-offset-2"
                    >
                      Create Account
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
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
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Support</h4>
              <ul className="space-y-3 text-sm">
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

      {/* Forgot Password Modal - Request Reset Email */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl mb-4">
                <KeyRound className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Forgot Password?</h2>
              <p className="text-amber-700/70 text-sm">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-amber-800 mb-2 ml-1">Email Address</label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-amber-600">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all duration-300 text-amber-900 placeholder:text-amber-400"
                  value={emailToReset}
                  onChange={(e) => setEmailToReset(e.target.value)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 bg-amber-100 text-amber-800 font-semibold rounded-xl hover:bg-amber-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={sendPasswordResetEmail}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Link
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal - Set New Password */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Set New Password</h2>
              <p className="text-amber-700/70 text-sm">
                Create a strong password for your account
              </p>
            </div>

            {/* New Password Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-amber-800 mb-2 ml-1">
                New Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-amber-600">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full pl-12 pr-12 py-3.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all duration-300 text-amber-900 placeholder:text-amber-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 text-amber-500 hover:text-amber-700 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-amber-800 mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-amber-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full pl-12 pr-12 py-3.5 bg-amber-50/50 border-2 border-amber-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition-all duration-300 text-amber-900 placeholder:text-amber-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-amber-500 hover:text-amber-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mb-6 p-4 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-700 font-medium mb-2">Password must:</p>
              <ul className="text-xs text-amber-600 space-y-1">
                <li className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-amber-300'}`} />
                  Be at least 6 characters long
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCloseResetModal}
                className="flex-1 px-6 py-3 bg-amber-100 text-amber-800 font-semibold rounded-xl hover:bg-amber-200 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Update Password
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleCloseResetModal}
              className="absolute top-4 right-4 p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Role Selection Modal */}
      {showRoleSelectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg transform animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mb-4">
                <Users className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Choose Your Portal</h2>
              <p className="text-amber-700/70 text-sm">
                You have access to multiple roles. Select which portal you'd like to access.
              </p>
            </div>

            {/* Role Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {availableRoles.map((role) => {
                const config = roleConfig[role];
                if (!config) return null;

                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelection(role)}
                    className="group relative p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-amber-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${config.bgColor} rounded-xl mb-3 text-white shadow-md group-hover:scale-110 transition-transform`}>
                      {config.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 capitalize">{role}</h3>
                    <p className="text-gray-500 text-sm">{config.label}</p>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-amber-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Email Verified Success Modal (after clicking verification link) */}
      {showVerifiedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Email Verified!</h2>
              <p className="text-amber-700/70 text-sm leading-relaxed">
                Your email has been successfully verified.
              </p>
              {verifiedEmail && (
                <p className="text-amber-900 font-semibold mt-2 bg-amber-50 py-2 px-4 rounded-lg inline-block">
                  {verifiedEmail}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Security Notice</p>
                  <p>For your security, please sign in with your password to access your account.</p>
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => setShowVerifiedModal(false)}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-5 h-5" />
              Continue to Sign In
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowVerifiedModal(false)}
              className="absolute top-4 right-4 p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Email Verification Success Modal */}
      {showEmailVerificationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mb-4">
                <Mail className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Check Your Email!</h2>
              <p className="text-amber-700/70 text-sm leading-relaxed">
                We've sent a verification link to:
              </p>
              {signupEmail && (
                <p className="text-amber-900 font-semibold mt-2 bg-amber-50 py-2 px-4 rounded-lg inline-block">
                  {signupEmail}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Next Steps:
              </h4>
              <ol className="text-sm text-amber-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>Open your email inbox</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>Click the verification link from Angieren's</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-amber-200 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Return here and sign in with your credentials</span>
                </li>
              </ol>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 text-center mb-6">
              Didn't receive the email? Check your spam folder or contact support.
            </p>

            {/* Button */}
            <button
              onClick={() => setShowEmailVerificationModal(false)}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Got it, I'll check my email
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowEmailVerificationModal(false)}
              className="absolute top-4 right-4 p-2 text-amber-400 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner />}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        message={alertModal.message}
        type={alertModal.type}
        title={alertModal.title}
      />
    </div>
  );
}