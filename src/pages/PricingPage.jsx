import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiCheck, FiExternalLink, FiLoader } = FiIcons;

const PricingPage = () => {
  const navigate = useNavigate();
  const { user, refreshPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  console.log("DEBUG: PricingPage - User:", user?.email, "is_premium:", user?.is_premium);

  // Check premium status on page load
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        setCheckingStatus(true);
        try {
          await refreshPremiumStatus();
        } catch (err) {
          console.error("Error checking premium status:", err);
        } finally {
          setCheckingStatus(false);
        }
      }
    };
    checkPremiumStatus();
  }, [user, refreshPremiumStatus]);

  // Payment plans from provided Stripe data
  const pricingPlans = [
    {
      name: "Unlimited Memories",
      amount: 2.97,
      priceId: "price_1Rq48ZIa1WstuQNeqItRhuTN",
      currency: "usd",
      interval: "month"
    }
  ];

  const handlePlanClick = async (priceId) => {
    if (!user) {
      setError("Please log in to upgrade");
      return;
    }

    if (user.is_premium) {
      setSuccess("You already have premium access!");
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log("DEBUG: Creating checkout session for user:", user.id);
      console.log("DEBUG: Using price ID:", priceId);

      // Call our Edge Function to create a Stripe checkout session
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            userId: user.id,
            priceId: priceId,
            customerEmail: user.email
          }
        }
      );

      if (functionError) {
        console.error("DEBUG: Error creating checkout session:", functionError);
        setError(`Failed to create checkout session: ${functionError.message}`);
        return;
      }

      if (!data?.url) {
        console.error("DEBUG: No checkout URL returned:", data);
        setError("Failed to create checkout session - no URL returned");
        return;
      }

      console.log("DEBUG: Checkout session created successfully:", data.id);
      console.log("DEBUG: Redirecting to:", data.url);

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("DEBUG: Unexpected error creating checkout session:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 pb-32 relative">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8 pt-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-pink-500 hover:text-pink-600 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold essential-memories-title ml-2">Pricing</h1>
        </motion.div>

        {/* Premium Status */}
        {checkingStatus ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center"
          >
            <div className="flex items-center justify-center">
              <SafeIcon icon={FiLoader} className="animate-spin mr-2 text-blue-500" />
              <p className="text-blue-600">Checking subscription status...</p>
            </div>
          </motion.div>
        ) : user?.is_premium ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center"
          >
            <p className="text-green-600 font-medium">
              💎 You have premium access! Enjoy unlimited memories.
            </p>
          </motion.div>
        ) : null}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-center"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-center"
          >
            <p className="text-green-600 text-sm">{success}</p>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="space-y-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.priceId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-200"
              style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-pink-500">${plan.amount}</span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited memories storage</span>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited practice sessions</span>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced streak tracking</span>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiCheck} className="text-green-500 mr-3" />
                  <span className="text-gray-700">Cancel anytime</span>
                </div>
              </div>

              {/* Subscribe Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlanClick(plan.priceId)}
                disabled={loading || user?.is_premium}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  user?.is_premium
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-teal-400 text-white hover:shadow-lg'
                }`}
                style={!user?.is_premium ? { boxShadow: '0 4px 15px rgba(244,114,182,0.2)' } : {}}
              >
                {loading ? (
                  <>
                    <div className="spinner-small mr-2"></div>
                    <span>Creating checkout...</span>
                  </>
                ) : user?.is_premium ? (
                  'You Already Have Premium'
                ) : (
                  <>
                    <span className="mr-2">Subscribe Now</span>
                    <SafeIcon icon={FiExternalLink} className="text-lg" />
                  </>
                )}
              </motion.button>
              <p className="text-center text-sm text-gray-500 mt-4">
                Secure payment powered by Stripe
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-lg"
          style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Why Choose Premium?</h3>
          <div className="space-y-3 text-gray-600">
            <p>• Store unlimited important dates and memories</p>
            <p>• Access advanced practice modes and streak challenges</p>
            <p>• Get priority customer support</p>
            <p>• Help support the development of new features</p>
            <p>• Cancel your subscription anytime with no penalties</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;