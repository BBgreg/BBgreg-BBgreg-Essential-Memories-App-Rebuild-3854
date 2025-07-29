import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {useAuth} from '../contexts/AuthContext';
import {supabase} from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiArrowLeft, FiCalendar} = FiIcons;

const AddMemoryPage = () => {
  const navigate = useNavigate();
  const {user, refreshPremiumStatus} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memoryType, setMemoryType] = useState(null);
  const [memoryName, setMemoryName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  console.log('➕ AddMemoryPage: Component rendered for user:', user?.email);
  console.log("DEBUG: Memory type selection changed to light pink gradient instead of white.");
  console.log("DEBUG: Add Date button changed to softer gradient and calendar selection implemented.");
  console.log("DEBUG: User is_premium status:", user?.is_premium);

  const memoryTypes = [
    {id: 'birthday', label: 'Birthday', emoji: '🎂', gradientClass: 'birthday-gradient'},
    {id: 'anniversary', label: 'Anniversary', emoji: '💑', gradientClass: 'anniversary-gradient'},
    {id: 'special-date', label: 'Special Date', emoji: '✨', gradientClass: 'special-date-gradient'},
    {id: 'holiday', label: 'Holiday', emoji: '🎉', gradientClass: 'holiday-gradient'}
  ];

  const handleMemoryTypeSelect = (typeId) => {
    console.log('➕ AddMemoryPage: Memory type selected:', typeId);
    setMemoryType(typeId);
    setError('');
  };

  const handleCalendarClick = () => {
    console.log('➕ AddMemoryPage: Calendar button clicked - showing calendar');
    setShowCalendar(true);
  };

  const handleDateSelect = async (day, month) => {
    console.log('➕ AddMemoryPage: Date selected from calendar:', month, day);
    
    // Pre-Save Validation
    if (!memoryName.trim()) {
      setError('Please enter Memory Name before choosing a date.');
      return;
    }
    
    if (!memoryType) {
      setError('Please select a Type before choosing a date.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Refresh premium status to ensure we have the latest
      await refreshPremiumStatus();
      
      // CRITICAL: Check is_premium status
      if (user?.is_premium) {
        console.log("DEBUG: User is premium. Granting unlimited memory access. (Change 2.3)");
        // Premium users bypass the memory limit check
      } else {
        // User is NOT premium, so check free trial limit
        console.log("DEBUG: User is NOT premium. Checking free trial limit. (Change 2.3)");
        
        const FREE_MEMORY_LIMIT = 3;
        const {count, error: countError} = await supabase
          .from('dates_esm1234567')
          .select('id', {count: 'exact'})
          .eq('user_id', user.id);
          
        if (countError) {
          console.error("DEBUG: Error fetching memory count:", countError.message, "(Change 2.1)");
          setError("Failed to check memory limit. Please try again.");
          setIsSubmitting(false);
          return;
        }
        
        console.log("DEBUG: Current memories for user:", count, "(Change 2.1)");
        
        if (count >= FREE_MEMORY_LIMIT) {
          console.log("DEBUG: Free trial limit reached. Triggering payment pop-up. (Change 2.1)");
          setError("Free trial limit reached. Please upgrade to add more memories!");
          setIsSubmitting(false);
          
          // Redirect to pricing page after a short delay
          setTimeout(() => {
            navigate('/pricing');
          }, 2000);
          return;
        }
      }
      
      // If premium or limit not reached, proceed with memory insertion
      console.log("DEBUG: Proceeding with memory save. User is_premium:", user?.is_premium);
      
      const payload = {
        user_id: user.id,
        name: memoryName.trim(),
        display_name: memoryName.trim(),
        month: month,
        day: day,
        category: memoryTypes.find(type => type.id === memoryType)?.label || 'Special Date'
      };
      
      const {data, error} = await supabase
        .from('dates_esm1234567')
        .insert([payload])
        .select();
        
      if (error) {
        console.error("DEBUG: Error saving memory:", error.message, "(Change 2.1)");
        setError(error.message || 'Failed to save memory');
        return;
      }
      
      console.log("DEBUG: Memory saved successfully:", data, "(Change 2.1)");
      setSuccess('Memory Added Successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      console.error("DEBUG: Unexpected error during memory save:", err.message, "(Change 2.1)");
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (success) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
        <motion.div
          initial={{scale: 0.8, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{success}</h2>
          <p className="text-gray-600 mb-6">
            Your memory has been saved and you'll be redirected shortly.
          </p>
          <div className="spinner mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 pb-32 relative">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          className="flex items-center mb-8 pt-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-pink-500 hover:text-pink-600 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold essential-memories-title ml-2">Add Memory</h1>
        </motion.div>

        {/* Free Trial Message - Change 2.2 */}
        <motion.div
          initial={{opacity: 0, y: -10}}
          animate={{opacity: 1, y: 0}}
          className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-center"
        >
          <p className="text-blue-600 text-sm font-medium">
            {user?.is_premium ? '💎 Premium: Unlimited memories' : '💝 Free trial: 3 free memories, then upgrade'}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-center"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isSubmitting && (
          <motion.div
            initial={{opacity: 0, y: -10}}
            animate={{opacity: 1, y: 0}}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center"
          >
            <div className="flex items-center justify-center">
              <div className="spinner mr-3"></div>
              <p className="text-blue-600 font-medium">Saving Memory...</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-8">
          {/* 1. Memory Name Input */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.1}}
            className="bg-white rounded-2xl p-6 shadow-lg"
            style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Memory Name
            </label>
            <input
              type="text"
              placeholder="Enter memory name"
              value={memoryName}
              onChange={(e) => setMemoryName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
              style={{boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}}
              disabled={isSubmitting}
            />
          </motion.div>

          {/* 2. Memory Type Selection - LIGHT PINK GRADIENT */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.2}}
            className="bg-white rounded-2xl p-6 shadow-lg"
            style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Memory Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {memoryTypes.map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => handleMemoryTypeSelect(type.id)}
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.98}}
                  className={`
                    p-4 rounded-2xl transition-all duration-300 memory-type-button
                    ${memoryType === type.id
                      ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-gray-800 memory-type-selected-light-pink'
                      : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-800'}
                  `}
                  disabled={isSubmitting}
                >
                  <div className="text-2xl mb-1">{type.emoji}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* 3. Date Selection - CALENDAR ONLY WITH SOFT GRADIENT */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3}}
            className="bg-white rounded-2xl p-6 shadow-lg"
            style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
          >
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Select Date
            </label>
            {!showCalendar ? (
              <div className="flex justify-center">
                <motion.button
                  type="button"
                  onClick={handleCalendarClick}
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  className="p-4 bg-gradient-to-r from-pink-300 to-teal-200 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-3"
                  style={{boxShadow: '0 4px 15px rgba(244,114,182,0.2)'}}
                  disabled={isSubmitting}
                >
                  <SafeIcon icon={FiCalendar} className="text-xl" />
                  <span className="font-medium">Add Date</span>
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                className="bg-white rounded-xl border border-gray-200 p-3 shadow-md"
              >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg"
                  >
                    ← Prev
                  </button>
                  <h3 className="font-medium text-gray-800">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg"
                  >
                    Next →
                  </button>
                </div>

                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && handleDateSelect(day, currentMonth.getMonth() + 1)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm
                        ${!day ? '' : 'hover:bg-pink-100 active:bg-pink-200 transition-colors'}
                      `}
                      disabled={!day}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

console.log("DEBUG: Free trial message displays premium status. (Change 2.2)");
console.log("DEBUG: Memory limit check logic updated to use is_premium flag. (Change 2.3)");

export default AddMemoryPage;