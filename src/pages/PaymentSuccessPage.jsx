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

  // Extract the session_id from the URL if available
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  console.log("DEBUG: PaymentSuccessPage - Session ID:", sessionId);

  useEffect(() => {
    const updatePremiumStatus = async () => {
      try {
        setLoading(true);
        console.log("DEBUG: Payment Success - Updating premium status");
        
        if (user?.id) {
          console.log("DEBUG: Manually updating premium status for user:", user.id);
          
          // Direct database update
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
            
          if (updateError) {
            console.error("ERROR: Failed to update premium status:", updateError);
            setError("There was a problem updating your account status. Please contact support.");
          } else {
            console.log("DEBUG: Premium status successfully set to true");
            setSuccess(true);
          }
        } else {
          console.error("ERROR: No user ID available for premium update");
          setError("User authentication issue. Please try logging in again.");
        }
        
        // Wait a moment for the update to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh premium status to update the UI
        await refreshPremiumStatus();
        console.log("DEBUG: Premium status refreshed in context");
        
      } catch (err) {
        console.error("DEBUG: Error updating premium status:", err);
        setError("There was an issue confirming your subscription. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    updatePremiumStatus();
  }, [refreshPremiumStatus, user?.id, sessionId]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
      >
        <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiCheck} className="text-green-500 text-5xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You for Your Purchase!</h2>
        
        {loading ? (
          <div className="mb-6">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Activating your premium features...</p>
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