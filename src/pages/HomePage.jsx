import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {format} from 'date-fns';
import {useAuth} from '../contexts/AuthContext';
import {supabase} from '../lib/supabase';
import QOTDModal from '../components/QOTDModal';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiPlus, FiTarget, FiCalendar, FiTrendingUp, FiAward, FiExternalLink, FiCreditCard, FiRefreshCw} = FiIcons;

const HomePage = () => {
  const {user, refreshPremiumStatus} = useAuth();
  const [memories, setMemories] = useState([]);
  const [upcomingMemories, setUpcomingMemories] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQOTD, setShowQOTD] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  console.log('🏠 HomePage: Component rendered for user:', user?.email);
  console.log("DEBUG: 'Welcome back' message completely removed. (Change 4)");
  console.log("DEBUG: Stats cards given soft background gradients. (Change 6)");
  console.log("DEBUG: Changed 'Question of the Day' to 'Streak Challenge'");
  console.log("DEBUG: 'Check out other apps' button added to dashboard. (Change 1)");
  console.log("DEBUG: Pricing button added to homepage for Stripe integration");
  console.log("DEBUG: User is_premium status:", user?.is_premium);

  useEffect(() => {
    if (user) {
      fetchMemories();
      fetchStreakData();
    }
  }, [user]);

  const fetchMemories = async () => {
    console.log('🏠 HomePage: Fetching memories...');
    setLoading(true);
    try {
      const {data, error} = await supabase
        .from('dates_esm1234567')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ HomePage: Error fetching memories:', error);
        throw error;
      }

      console.log('✅ HomePage: Memories loaded:', data?.length || 0);
      setMemories(data || []);
      setMemoryCount(data?.length || 0);

      // Calculate upcoming memories in chronological order
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      const upcoming = (data || [])
        .map(memory => {
          // Calculate days until this memory from today
          const memoryDate = new Date(2024, memory.month - 1, memory.day);
          const todayDate = new Date(2024, currentMonth - 1, currentDay);
          let daysUntil = Math.ceil((memoryDate - todayDate) / (1000 * 60 * 60 * 24));

          // If the date has passed this year, calculate for next year
          if (daysUntil < 0) {
            const nextYearMemory = new Date(2025, memory.month - 1, memory.day);
            daysUntil = Math.ceil((nextYearMemory - todayDate) / (1000 * 60 * 60 * 24));
          }

          return {...memory, daysUntil};
        })
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5); // Show next 5 upcoming memories

      console.log('🏠 HomePage: Upcoming memories calculated:', upcoming.length);
      setUpcomingMemories(upcoming);
    } catch (error) {
      console.error('❌ HomePage: Error in fetchMemories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakData = async () => {
    console.log('🏠 HomePage: Fetching streak data...');
    try {
      const {data, error} = await supabase
        .from('streak_data_esm1234567')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ HomePage: Error fetching streak data:', error);
        return;
      }

      console.log('✅ HomePage: Streak data loaded:', data);
      setStreakData(data);
    } catch (err) {
      console.error('❌ HomePage: Unexpected error fetching streak:', err);
    }
  };

  const handleQOTDClick = () => {
    console.log('🎯 HomePage: Streak Challenge clicked');
    setShowQOTD(true);
  };

  const handleCheckOutOtherAppsClick = () => {
    window.open('https://ask4appco.com', '_blank', 'noopener,noreferrer');
  };

  const handlePricingClick = () => {
    window.open('/pricing', '_blank');
  };

  const handleRefreshPremiumStatus = async () => {
    setRefreshing(true);
    try {
      await refreshPremiumStatus();
      console.log("DEBUG: Premium status manually refreshed. New status:", user?.is_premium);
    } catch (err) {
      console.error("Error refreshing premium status:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate free trial status - Change 2.3 
  const FREE_MEMORY_LIMIT = 3;
  const isFreeTrial = memoryCount < FREE_MEMORY_LIMIT && !user?.is_premium;
  const remainingMemories = Math.max(0, FREE_MEMORY_LIMIT - memoryCount);
  console.log("DEBUG: Free trial status calculated - isFreeTrial:", isFreeTrial, "remainingMemories:", remainingMemories, "is_premium:", user?.is_premium, "(Change 2.3)");

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💝</div>
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Essential Memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100">
      <div className="px-4 py-8 w-full">
        {/* Header with matching gradient */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{background: 'linear-gradient(to right, #ec4899, #60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', display: 'inline-block'}}>
            Essential Memories
          </h1>
          <p className="text-gray-600">Never miss what truly matters</p>
        </div>

        {/* Premium Status / Free Trial Status Message */}
        {user?.is_premium ? (
          <motion.div
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            className="max-w-xl mx-auto mb-6"
          >
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center">
                <p className="text-teal-600 text-sm font-medium">
                  💎 Premium Status: Unlimited memories
                </p>
                <button 
                  onClick={handleRefreshPremiumStatus}
                  className="ml-2 p-1 text-teal-500 hover:text-teal-600 rounded-full hover:bg-teal-50"
                  title="Refresh premium status"
                  disabled={refreshing}
                >
                  <SafeIcon 
                    icon={FiRefreshCw} 
                    className={`text-sm ${refreshing ? 'animate-spin' : ''}`} 
                  />
                </button>
              </div>
            </div>
          </motion.div>
        ) : isFreeTrial ? (
          <motion.div
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            className="max-w-xl mx-auto mb-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-blue-600 text-sm font-medium">
                💝 Free Trial: {remainingMemories} of {FREE_MEMORY_LIMIT} memories remaining
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            className="max-w-xl mx-auto mb-6"
          >
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 text-center">
              <p className="text-yellow-600 text-sm font-medium">
                ⚠️ Free trial limit reached. Please upgrade for unlimited memories.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats Cards - VERY LIGHT PINK GRADIENT and REDUCED WIDTH */}
        <div className="max-w-xl mx-auto grid grid-cols-3 gap-3 mb-6">
          {/* Total Memories */}
          <motion.div
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 0.1}}
            className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 shadow-lg text-center border border-pink-200"
            style={{boxShadow: '0 8px 20px rgba(244,114,182,0.1)'}}
          >
            <div className="text-3xl text-pink-500 mb-2">📚</div>
            <div className="text-2xl font-bold text-gray-800">{memoryCount}</div>
            <div className="text-sm text-gray-600">Total Memories</div>
          </motion.div>

          {/* Current Streak */}
          <motion.div
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 0.2}}
            className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 shadow-lg text-center border border-pink-200"
            style={{boxShadow: '0 8px 20px rgba(244,114,182,0.1)'}}
          >
            <div className="text-3xl text-pink-500 mb-2">🔥</div>
            <div className="text-2xl font-bold text-gray-800">
              {streakData?.qotd_current_streak || 0}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </motion.div>

          {/* Best Streak */}
          <motion.div
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 0.3}}
            className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 shadow-lg text-center border border-pink-200"
            style={{boxShadow: '0 8px 20px rgba(244,114,182,0.1)'}}
          >
            <div className="text-3xl text-pink-500 mb-2">🏆</div>
            <div className="text-2xl font-bold text-gray-800">
              {streakData?.qotd_all_time_high || 0}
            </div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </motion.div>
        </div>

        {/* Quick Actions - UPDATED GRADIENTS */}
        <div className="max-w-xl mx-auto grid grid-cols-2 gap-4 mb-6">
          {/* Streak Challenge - SOFT LIGHT PINK TO LIGHT BLUE GRADIENT */}
          <motion.button
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.4}}
            onClick={handleQOTDClick}
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            className="bg-gradient-to-r from-pink-200 to-blue-200 text-white p-6 rounded-2xl shadow-lg"
            style={{boxShadow: '0 8px 20px rgba(168,85,247,0.2)'}}
          >
            <SafeIcon icon={FiTarget} className="text-3xl mb-3 mx-auto block" />
            <div className="font-bold text-lg">Streak Challenge</div>
            <div className="text-sm opacity-90">Test your memory!</div>
          </motion.button>

          {/* Practice Mode - SOFT LIGHT BLUE TO LIGHT PINK GRADIENT AND CENTERED TEXT */}
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: 0.5}}
          >
            <Link
              to="/practice"
              className="block bg-gradient-to-r from-blue-200 to-pink-200 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center"
              style={{boxShadow: '0 8px 20px rgba(20,184,166,0.2)'}}
            >
              <SafeIcon icon={FiTrendingUp} className="text-3xl mb-3" />
              <div className="font-bold text-lg">Practice Mode</div>
              <div className="text-sm opacity-90 text-center">Flashcard training</div>
            </Link>
          </motion.div>
        </div>

        {/* Upcoming Memories Section - SLIGHTLY DARKER PINK GRADIENT */}
        <div className="w-full max-w-xl mx-auto">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.6}}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
            style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{background: 'linear-gradient(to right, #ec4899, #60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', display: 'inline-block'}}
            >
              Upcoming Memories
            </h2>
            <div className="space-y-3">
              {upcomingMemories.map((memory) => (
                <motion.div
                  key={memory.id}
                  whileHover={{scale: 1.02, y: -2}}
                  className="upcoming-memory-item-darkened p-4 rounded-xl text-white"
                  style={{
                    background: 'linear-gradient(to right, #FFE0F0, #FFADC2)',
                    boxShadow: '0 4px 12px rgba(255,192,203,0.2)',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">{memory.display_name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {format(new Date(2024, memory.month - 1, memory.day), 'MMM d')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {upcomingMemories.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-gray-600">No upcoming memories</p>
                  <Link
                    to="/add-memory"
                    className="inline-block mt-3 text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Add your first memory →
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* NEW: Check out other apps button */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.7}}
            className="w-full mb-6"
          >
            <motion.button
              onClick={handleCheckOutOtherAppsClick}
              whileHover={{scale: 1.02, y: -2}}
              whileTap={{scale: 0.98}}
              className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg flex items-center justify-center"
              style={{boxShadow: '0 8px 20px rgba(129,140,248,0.2)'}}
            >
              <span className="mr-2">Check out all my other apps on ask4appco.com</span>
              <SafeIcon icon={FiExternalLink} className="text-lg" />
            </motion.button>
          </motion.div>

          {/* NEW: Pricing button - Only show if not premium */}
          {!user?.is_premium && (
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.8}}
              className="w-full mb-6"
            >
              <Link to="/pricing" className="block w-full">
                <motion.div
                  whileHover={{scale: 1.02, y: -2}}
                  whileTap={{scale: 0.98}}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white py-4 px-6 rounded-2xl font-semibold shadow-lg flex items-center justify-center"
                  style={{boxShadow: '0 8px 20px rgba(34,197,94,0.2)'}}
                >
                  <SafeIcon icon={FiCreditCard} className="text-lg mr-2" />
                  <span>Upgrade to Unlimited</span>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Quick Add Button */}
        <motion.div
          initial={{opacity: 0, scale: 0.8}}
          animate={{opacity: 1, scale: 1}}
          transition={{delay: 0.9}}
          className="fixed bottom-20 right-4 z-40"
        >
          <Link
            to="/add-memory"
            className="bg-gradient-to-r from-pink-500 to-teal-400 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
            style={{boxShadow: '0 8px 25px rgba(244,114,182,0.3)'}}
          >
            <SafeIcon icon={FiPlus} className="text-2xl" />
          </Link>
        </motion.div>
      </div>

      {/* QOTD Modal (renamed to Streak Challenge) */}
      <QOTDModal isOpen={showQOTD} onClose={() => setShowQOTD(false)} user={user} />
    </div>
  );
};

console.log("DEBUG: Premium status display added to homepage");
export default HomePage;