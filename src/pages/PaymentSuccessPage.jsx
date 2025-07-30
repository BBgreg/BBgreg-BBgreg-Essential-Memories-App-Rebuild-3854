import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiHome } = FiIcons;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);

  // Extract the session_id from the URL if available
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  console.log("DEBUG: PaymentSuccessPage - Session ID:", sessionId);

  useEffect(() => {
    const verifyPaymentAndUpdateStatus = async () => {
      try {
        setLoading(true);
        console.log("DEBUG: Payment Success - Verifying payment session");
        
        if (!sessionId) {
          console.error("ERROR: No session ID provided");
          setError("Invalid payment session. Please contact support if you've completed payment.");
          setLoading(false);
          return;
        }
        
        // Skip direct database updates for session IDs that don't come from Stripe
        // Real Stripe session IDs start with 'cs_'
        if (!sessionId.startsWith('cs_')) {
          console.error("ERROR: Invalid session ID format:", sessionId);
          setError("Invalid payment session. Please contact support if you've completed payment.");
          setLoading(false);
          return;
        }
        
        // Verify the session with Stripe through our Edge Function
        const { data: verificationData, error: verificationError } = await supabase.functions.invoke(
          'verify-checkout-session',
          { body: { sessionId: sessionId, userId: user?.id } }
        );
        
        if (verificationError || !verificationData?.verified) {
          console.error("ERROR: Session verification failed:", verificationError || "Invalid response");
          setError("Payment verification failed. Please contact support.");
          setLoading(false);
          return;
        }
        
        setSessionVerified(true);
        console.log("DEBUG: Payment session verified successfully");
        
        if (user?.id) {
          // Only update the premium status if the session is verified
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
            
          if (updateError) {
            console.error("ERROR: Failed to update premium status:", updateError);
            setError("There was a problem updating your account status. Please contact support.");
            setLoading(false);
            return;
          }
          
          console.log("DEBUG: Premium status successfully set to true");
          setSuccess(true);
          
          // Refresh premium status to update the UI
          await refreshPremiumStatus();
          console.log("DEBUG: Premium status refreshed in context");
        } else {
          console.error("ERROR: No user ID available for premium update");
          setError("User authentication issue. Please try logging in again.");
        }
      } catch (err) {
        console.error("DEBUG: Error updating premium status:", err);
        setError("There was an issue confirming your subscription. Please contact support.");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      verifyPaymentAndUpdateStatus();
    } else {
      setLoading(false);
      setError("Please log in to complete your subscription activation.");
    }
  }, [refreshPremiumStatus, user?.id, sessionId]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
      >
        {sessionVerified ? (
          <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiCheck} className="text-green-500 text-5xl" />
          </div>
        ) : (
          <div className="h-24 w-24 mx-auto mb-6 flex items-center justify-center">
            <div className="text-6xl">💳</div>
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {sessionVerified ? "Thank You for Your Purchase!" : "Processing Your Payment"}
        </h2>
        
        {loading ? (
          <div className="mb-6">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment and activating premium features...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-600 font-medium">
                ✅ Your premium access has been activated successfully!
              </p>
            </div>
            <p className="text-gray-600">
              You now have unlimited access to all features. Enjoy your premium experience!
            </p>
          </div>
        )}
        
        <motion.button
          onClick={() => navigate('/home')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-pink-500 to-teal-400 text-white py-3 px-8 rounded-xl font-semibold flex items-center justify-center mx-auto"
          style={{ boxShadow: '0 4px 15px rgba(244,114,182,0.2)' }}
        >
          <SafeIcon icon={FiHome} className="mr-2" />
          Go to Homepage
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;