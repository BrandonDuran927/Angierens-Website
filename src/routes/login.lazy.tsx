import { Search, ShoppingCart, Bell, ChevronDown, X, Plus, Minus, Heart, MessageSquare, Star, Menu } from 'lucide-react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'
import { useNavigate } from '@tanstack/react-router';
import { useUser } from '@/context/UserContext';

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
  const { setUser } = useUser();

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
    { name: 'HOME', route: '/', active: false },
    { name: 'MENU', route: '/customer-interface/', active: false },
    { name: 'ORDER', route: '/customer-interface/order', active: false },
    { name: 'REVIEW', route: '/customer-interface/feedback', active: false },
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964B00]"></div>
        <p className="text-gray-700 font-medium">Processing...</p>
      </div>
    </div>
  );

  async function signInWithEmail() {
    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      if (error.message === "Email not confirmed") {
        alert("Please verify your email address before logging in.");
      } else {
        alert(error.message || "Credentials are not valid. Please try again.");
      }
      console.log("Error:", error);
      return;
    }

    setUser(data.user)
    console.log("Sign-in successful:", data);

    setTimeout(() => {
      navigate({ to: "/" });
    }, 300);
  }

  async function sendPasswordResetEmail() {
    if (!emailToReset) {
      alert("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToReset)) {
      alert("Please enter a valid email address format.");
      return;
    }

    setIsLoading(true);

    const redirectUrl = window.location.origin + window.location.pathname;

    const { data, error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
      redirectTo: redirectUrl,
    });

    setIsLoading(false);

    if (error) {
      alert("Error sending reset email. Please make sure the email is valid.");
      console.error("Reset error:", error);
    } else {
      alert("Password reset email sent! Please check your inbox.");
      handleCloseModal();
    }
  }

  async function updatePassword() {
    if (!newPassword || !confirmPassword) {
      alert("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsLoading(false);

    if (error) {
      alert("Error updating password. Please try again.");
      console.error("Update password error:", error);
    } else {
      alert("Password updated successfully! You can now log in with your new password.");
      handleCloseResetModal();
      setIsResettingPassword(false);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  return (
    <div className="min-h-screen min-w-[320px] bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col">

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

            {/* Hamburger Menu Button - Show on tablet and mobile */}
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

              {/* Sign Up Button */}
              <Link to="/signup">
                <button className="bg-[#964B00] text-yellow-400 font-semibold py-1 sm:py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm md:text-base rounded-full shadow-md border-2 border-yellow-400 hover:bg-yellow-400 hover:text-[#964B00] transition-colors whitespace-nowrap">
                  SIGN UP
                </button>
              </Link>
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
      <div className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          {/* LOGIN Header */}
          <div className="flex justify-center mb-4">
            <h1 className="text-3xl font-bold text-yellow-500 bg-[#964B00] py-2 px-8 text-center rounded shadow">
              LOGIN
            </h1>
          </div>

          {/* Form container */}
          <div className="bg-white border border-yellow-400 shadow-md rounded-xl px-8 py-10">
            <form className="flex flex-col gap-5">
              {/* Email Input */}
              <div className="flex items-center border border-gray-400 rounded-full px-4 py-2 shadow-sm">
                <input
                  type="email"
                  placeholder="Type Email Address"
                  className="w-full outline-none bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="flex items-center border border-gray-400 rounded-full px-4 py-2 shadow-sm">
                <input
                  type="password"
                  placeholder="Type your password"
                  className="w-full outline-none bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Remember / Forgot */}
              <div className="flex justify-between text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotClick}
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                onClick={signInWithEmail}
                type="button"
                className="bg-[#964B00] text-white font-semibold py-2 rounded-full shadow-md hover:bg-[#7b3f00] text-center"
              >
                LOGIN
              </button>

              {/* Account link */}
              <p className="text-sm text-center">
                No Account?{' '}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Let's Create your Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="contact" className="py-8" style={{ backgroundColor: '#F9ECD9' }}>
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
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Home</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Menu</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3 text-gray-800">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-800">FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a></li>
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

      {/* Forgot Password Modal - Request Reset Email */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#964B00] mb-2">Forgot Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <input
              type="email"
              placeholder="Your email"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={emailToReset}
              onChange={(e) => setEmailToReset(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={sendPasswordResetEmail}
                className="px-4 py-2 bg-[#964B00] text-white rounded hover:bg-[#7b3f00]"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal - Set New Password */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#964B00] mb-2">Set New Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your new password below.
            </p>

            {/* New Password Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseResetModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                className="px-4 py-2 bg-[#964B00] text-white rounded hover:bg-[#7b3f00]"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && <LoadingSpinner />}
    </div>
  );
}