import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { X, ArrowRight, Facebook, Mail, Phone, MapPin } from 'lucide-react'

export function CustomerFooter() {
  const [showTCModal, setShowTCModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  return (
    <>
      {/* FOOTER */}
      <footer id="contact" className="bg-gradient-to-br from-amber-900 via-amber-950 to-black text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[url('/angierens-logo.png')] bg-cover bg-center rounded-full" />
                <h3 className="text-xl font-bold">Angieren's Lutong Bahay</h3>
              </div>
              <p className="text-amber-200/80 text-sm leading-relaxed">
                Authentic Filipino home-cooked meals delivered to your doorstep. Taste the tradition, feel the love.
              </p>
              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                <a href="https://www.facebook.com/karen.basagre" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400 hover:text-amber-900 rounded-full flex items-center justify-center transition-all duration-300">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Home</Link></li>
                <li><Link to="/customer-interface" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />Menu</Link></li>
                <li><Link to="/" hash="about" className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2"><ArrowRight className="h-4 w-4" />About Us</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-yellow-400">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => setShowTCModal(true)} className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2 cursor-pointer"><ArrowRight className="h-4 w-4" />Terms & Conditions</button></li>
                <li><button onClick={() => setShowPrivacyModal(true)} className="text-amber-200/80 hover:text-yellow-400 transition-colors flex items-center gap-2 cursor-pointer"><ArrowRight className="h-4 w-4" />Privacy Policy</button></li>
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
                    <li>Delivery is available within NCR and Central Luzon only</li>
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
                  <p>All content on this platform, including text, graphics, logos, and images, is the property of Angieren's Lutong Bahay.</p>
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

                <section className="bg-amber-50 p-4 rounded-lg mb-10">
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
    </>
  )
}
