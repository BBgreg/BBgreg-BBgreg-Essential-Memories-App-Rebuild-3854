import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCheck, FiHome } = FiIcons;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract the session_id from the URL if available
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  
  console.log("DEBUG: PaymentSuccessPage - Session ID:", sessionId);

  useEffect(() => {
    const updatePremiumStatus = async () => {
      try {
        setLoading(true);
        console.log("DEBUG: Payment Success - Refreshing premium status");
        
        // Wait a moment for the webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh premium status multiple times with delays
        // This helps in case the webhook processing takes a moment
        for (let i = 0; i < 3; i++) {
          const result = await refreshPremiumStatus();
          console.log(`DEBUG: Premium status refresh attempt ${i+1}:`, result);
          
          // If we successfully get premium status, break the loop
          if (result?.data?.is_premium) {
            console.log("DEBUG: Premium status confirmed!");
            break;
          }
          
          // Wait before trying again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (err) {
        console.error("DEBUG: Error updating premium status:", err);
        setError("There was an issue confirming your subscription. Please contact support if premium features are not available.");
      } finally {
        setLoading(false);
      }
    };
    
    updatePremiumStatus();
  }, [refreshPremiumStatus, sessionId]);

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
          <p className="text-gray-600 mb-6">
            Your premium subscription has been activated! You now have unlimited access to all features.
          </p>
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