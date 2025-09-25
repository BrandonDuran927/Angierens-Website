import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createLazyFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {

  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleForgotClick = () => setShowForgotModal(true);
  const handleCloseModal = () => setShowForgotModal(false);

  return (
    <div className="min-h-screen flex flex-col mt-50">
      {/* Modal Overlay */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#964B00] mb-2">Forgot Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter the email address you registered
            </p>
            <input
              type="email"
              placeholder="Your email"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // handleSubmitHere()
                  handleCloseModal();
                }}
                className="px-4 py-2 bg-[#964B00] text-white rounded hover:bg-[#7b3f00]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow flex items-center justify-center pb-30">
        <div className="w-full max-w-md">
          {/* LOGIN Header - now outside the form box */}
          <div className="flex justify-center mb-4">
            <h1 className="text-3xl font-bold text-yellow-500 bg-[#964B00] py-2 text-center rounded shadow w-50">
              LOGIN
            </h1>
          </div>

          {/* Form container */}
          <div className="bg-white border border-yellow-400 shadow-md rounded-xl px-8 py-10">
            <form className="flex flex-col gap-5">
              {/* Email Input */}
              <div className="flex items-center border border-gray-400 rounded-full px-4 py-2 shadow-sm">
                <span className="mr-2">📧</span>
                <input
                  type="email"
                  placeholder="Type Email Address"
                  className="w-full outline-none bg-transparent"
                />
              </div>

              {/* Password Input */}
              <div className="flex items-center border border-gray-400 rounded-full px-4 py-2 shadow-sm">
                <span className="mr-2">🔒</span>
                <input
                  type="password"
                  placeholder="Type your password"
                  className="w-full outline-none bg-transparent"
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
                  className="hover:underline text-sky-600"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="bg-[#964B00] text-white font-semibold py-2 rounded-full shadow-md hover:bg-[#7b3f00]"
              >
                LOGIN
              </button>

              {/* Account link */}
              <p className="text-sm text-center">
                No Account?{' '}
                <a href="#" className="text-sky-500 hover:underline">
                  Let's Create your Account
                </a>
              </p>

              {/* Divider */}
              <div className="flex items-center my-4">
                <hr className="flex-grow border-gray-300" />
                <span className="mx-4 text-gray-400 text-sm">Login with</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              {/* Social Buttons */}
              <div className="flex justify-center gap-6 text-3xl">
                <button type="button">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google"
                    className="w-8 h-8"
                  />
                </button>
                <button type="button">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                    alt="Facebook"
                    className="w-8 h-8"
                  />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer id="contact" className="py-8 mt-16" style={{ backgroundColor: '#F9ECD9' }}>
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
    </div>
  );
}