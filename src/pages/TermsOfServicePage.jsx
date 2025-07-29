import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft } = FiIcons;

const TermsOfServicePage = () => {
  console.log('📋 TermsOfServicePage: Component rendered');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8 pt-4"
        >
          <Link
            to="/profile"
            className="p-2 text-purple-600 hover:text-purple-700 transition-colors mr-4"
          >
            <SafeIcon icon={FiArrowLeft} className="text-2xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Terms of Service</h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg"
        >
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-500 mb-6">Last Updated: 2025</p>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to Essential Memories</h2>
            
            <p className="text-gray-700 mb-4">
              These Terms of Service ("Terms") govern your use of Essential Memories ("Service") operated by us.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h3>
            <p className="text-gray-700 mb-4">
              By accessing and using Essential Memories, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. Use License</h3>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily use Essential Memories for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose</li>
              <li>attempt to reverse engineer any software contained in the Service</li>
              <li>remove any copyright or other proprietary notations</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. User Data</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of any data, information, or material you provide to Essential Memories. We will protect your data according to our Privacy Policy.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Privacy</h3>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Prohibited Uses</h3>
            <p className="text-gray-700 mb-4">
              You may not use our Service:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>for any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>to violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>to infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Service Availability</h3>
            <p className="text-gray-700 mb-4">
              We strive to provide reliable service, but cannot guarantee uninterrupted availability. We reserve the right to modify or discontinue the Service at any time.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Limitation of Liability</h3>
            <p className="text-gray-700 mb-4">
              In no event shall Essential Memories, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Changes to Terms</h3>
            <p className="text-gray-700 mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">9. Contact Information</h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us through the app.
            </p>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                Essential Memories - Never miss what truly matters
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;