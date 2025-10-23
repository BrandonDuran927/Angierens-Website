import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'


export const Route = createLazyFileRoute('/signup')({
  component: Signup,
})

function Signup() {
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpCode, setOtpCode] = useState('')

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
    city: '',
    barangay: '',
    address: '',
    mobile: '',
    otherContact: '',
    email: '',
    password: '',
    confirmPassword: '',
    agree: false,
  })

  async function signUpNewUser() {
    const { data, error } = await supabase.auth.signUp({
      email: 'duranbrandon927@gmail.com',
      password: 'EPIC4_GROUP',
      options: {
        emailRedirectTo: 'https://example.com/welcome',
      },
    })

    if (error) console.error('Error signing up:', error)
    else console.log('Sign-up successful:', data)
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target
    const { name, value } = target

    setForm(prev => ({
      ...prev,
      [name]: target.type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }))
  }





  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    signUpNewUser()

    console.log('Form submitted:', form)

    // setShowOtpModal(true)
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setOtpCode('')
  }

  const verifyOtp = () => {
    if (otpCode === '123456') {
      alert('OTP verified successfully!')
      closeOtpModal()
    } else {
      alert('Invalid OTP, please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <form onSubmit={handleSubmit} className="bg-white max-w-5xl mx-auto px-4 py-6 space-y-10 my-10">
          <p className="text-m text-gray-600">
            Please confirm that the information you input is correct. The Angieren's Team will not be liable if the information does not match.
          </p>
          <hr />
          {/* FIRST STEP */}
          <section>
            <h2 className="text-xl font-bold pb-1 mb-4">FIRST STEP</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Middle Name</label>
                <input type="text" name="middleName" value={form.middleName} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold">Month *</label>
                <select name="birthMonth" value={form.birthMonth} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Day *</label>
                <input type="number" name="birthDay" value={form.birthDay} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Year *</label>
                <select name="birthYear" value={form.birthYear} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your year</option>
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECOND STEP */}
          <section>
            <h2 className="text-xl font-bold pb-1 mb-4">SECOND STEP</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Country *</label>
                <select name="country" value={form.country} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your country</option>
                  <option value="Philippines">Philippines</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Postal Code *</label>
                <input type="text" name="postalCode" value={form.postalCode} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Province *</label>
                <select name="province" value={form.province} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your province</option>
                  <option value="Metro Manila">Metro Manila</option>
                  <option value="Cebu">Cebu</option>
                  <option value="Davao">Davao</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">City *</label>
                <select name="city" value={form.city} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your city</option>
                  <option value="Quezon City">Quezon City</option>
                  <option value="Cebu City">Cebu City</option>
                  <option value="Davao City">Davao City</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Barangay *</label>
                <select name="barangay" value={form.barangay} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required>
                  <option value="">Select your barangay</option>
                  <option value="Barangay 1">Barangay 1</option>
                  <option value="Barangay 2">Barangay 2</option>
                  <option value="Barangay 3">Barangay 3</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold">Address *</label>
                <input type="text" name="address" value={form.address} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Mobile Number *</label>
                <input type="text" name="mobile" value={form.mobile} onChange={handleChange}
                  placeholder="ex. 09xxxxxxxxx"
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Other Contact Number (Mobile/Landline)</label>
                <input type="text" name="otherContact" value={form.otherContact} onChange={handleChange}
                  placeholder="ex. 8-xxxxxxx"
                  className="w-full border rounded px-3 py-2" />
              </div>
            </div>
          </section>

          {/* THIRD STEP */}
          <section>
            <h2 className="text-xl font-bold pb-1 mb-4">THIRD STEP</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Email Address *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div></div>

              <div>
                <label className="block text-sm font-semibold">Password *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-semibold">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  className="w-full border rounded px-3 py-2" required />
              </div>
            </div>

            <div className="mt-4">
              <label className="inline-flex items-start space-x-2">
                <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange}
                  className="mt-1" required />
                <span className="text-sm text-gray-700">
                  I am at least 18 years old and have read and agreed to the{' '}
                  <a href="#" className="text-blue-600 underline">Terms and Conditions</a> and{' '}
                  <a href="#" className="text-blue-600 underline">Privacy Policy</a> of Angieren's Lutong Bahay.
                </span>
              </label>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="pt-6">
            <button type="submit" className="bg-amber-100 hover:bg-amber-200 border border-black px-6 py-2 rounded text-black font-semibold">
              REGISTER
            </button>
          </div>
        </form>
      </div>

      {/* FOOTER */}
      <footer className="py-8 mt-16" style={{ backgroundColor: '#F9ECD9' }}>
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

      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter OTP Code</h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification code to your current mobile number. Please enter it below to continue.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">OTP Code</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
              />
            </div>
            <div className="text-center mb-4">
              <button className="text-[#964B00] text-sm hover:underline">
                Resend OTP
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeOtpModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={verifyOtp}
                className="px-4 py-2 bg-[#964B00] text-yellow-400 rounded-md hover:bg-[#7a3d00] transition-colors"
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}