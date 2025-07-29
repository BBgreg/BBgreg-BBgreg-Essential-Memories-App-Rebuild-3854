import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft } = FiIcons;

const PrivacyPolicyPage = () => {
  console.log('🔒 PrivacyPolicyPage: Component rendered');

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
          <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
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
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Privacy Matters</h2>
            
            <p className="text-gray-700 mb-4">
              This Privacy Policy describes how Essential Memories ("we", "our", or "us") collects, uses, and protects your information when you use our Service.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Information We Collect</h3>
            
            <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Email address (for account creation and authentication)</li>
              <li>Memory data (names, dates, categories you add)</li>
              <li>Practice session results</li>
              <li>Streak information</li>
            </ul>

            <h4 className="font-semibold text-gray-800 mb-2">Technical Information</h4>
            <p className="text-gray-700 mb-4">
              We automatically collect certain technical information, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Device information and browser type</li>
              <li>IP address and location data (general)</li>
              <li>Usage patterns and app interactions</li>
              <li>Error logs and performance data</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">2. How We Use Your Information</h3>
            <p className="text-gray-700 mb-4">We use your information to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Provide and maintain the Essential Memories service</li>
              <li>Store and organize your personal memories</li>
              <li>Track your practice progress and streaks</li>
              <li>Send important service communications</li>
              <li>Improve our app functionality and user experience</li>
              <li>Ensure security and prevent fraud</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">3. Data Storage and Security</h3>
            <p className="text-gray-700 mb-4">
              Your data is stored securely using Supabase, which provides enterprise-grade security features including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>End-to-end encryption for data in transit and at rest</li>
              <li>Row Level Security (RLS) policies ensuring data isolation</li>
              <li>Regular security audits and compliance monitoring</li>
              <li>Secure authentication and authorization systems</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">4. Data Sharing</h3>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties. Your memory data is private and belongs to you. We may share anonymized, aggregated data for research purposes only.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Your Rights</h3>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Access all data we have about you</li>
              <li>Correct any inaccurate information</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in a readable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">6. Data Retention</h3>
            <p className="text-gray-700 mb-4">
              We retain your personal data only as long as necessary to provide our services. When you delete your account, we will permanently delete all your personal data within 30 days.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">7. Cookies and Tracking</h3>
            <p className="text-gray-700 mb-4">
              We use essential cookies to maintain your session and provide core functionality. We do not use tracking cookies for advertising purposes.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">8. Children's Privacy</h3>
            <p className="text-gray-700 mb-4">
              Essential Memories is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">9. Changes to This Policy</h3>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">10. Contact Us</h3>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy or how we handle your data, please contact us through the app.
            </p>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                Essential Memories - Your memories, your privacy, always protected
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;