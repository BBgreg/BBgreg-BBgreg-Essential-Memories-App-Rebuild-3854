import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiChevronLeft, FiChevronRight, FiX } = FiIcons;

const CalendarPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [memories, setMemories] = useState([]);
  const [selectedDateMemories, setSelectedDateMemories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('📅 CalendarPage: Component rendered for user:', user?.email);
  console.log('🎨 CalendarPage: Applying refined aesthetics to match screenshots');
  console.log('📏 CalendarPage: Updated for full-width expansion');
  console.log("DEBUG: Top empty space reduced on Calendar page. (Change 1)");
  console.log("DEBUG: 'Random colors thing' removed from Calendar page. (Change 2)");
  console.log("DEBUG: Updated page title with consistent gradient");

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const fetchMemories = async () => {
    console.log('📅 CalendarPage: Fetching memories...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dates_esm1234567')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ CalendarPage: Error fetching memories:', error);
        return;
      }

      console.log('✅ CalendarPage: Memories loaded:', data?.length || 0);
      setMemories(data || []);
    } catch (err) {
      console.error('❌ CalendarPage: Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'birthday':
        return 'bg-yellow-200 border-yellow-400';
      case 'anniversary':
        return 'bg-red-200 border-red-400';
      case 'special date':
        return 'bg-purple-200 border-purple-400';
      case 'holiday':
        return 'bg-green-200 border-green-400';
      default:
        return 'bg-blue-200 border-blue-400';
    }
  };

  const getCategoryGradient = (category) => {
    switch (category.toLowerCase()) {
      case 'birthday':
        return 'from-yellow-400/20 to-orange-500/20';
      case 'anniversary':
        return 'from-red-400/20 to-pink-500/20';
      case 'special date':
        return 'from-purple-400/20 to-indigo-500/20';
      case 'holiday':
        return 'from-green-400/20 to-emerald-500/20';
      default:
        return 'from-blue-400/20 to-cyan-500/20';
    }
  };

  // Get memories for the current month
  const getCurrentMonthMemories = () => {
    const month = currentDate.getMonth() + 1;
    const monthMemories = memories
      .filter(memory => memory.month === month)
      .sort((a, b) => a.day - b.day);

    console.log("DEBUG: Calendar - List of memories for the month rendered. (Change 2.2)");
    console.log(`📅 CalendarPage: Found ${monthMemories.length} memories for month ${month}`);
    return monthMemories;
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
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

  const getMemoriesForDate = (day) => {
    if (!day) return [];
    const month = currentDate.getMonth() + 1;
    return memories.filter(memory => memory.month === month && memory.day === day);
  };

  const handleDateClick = (day) => {
    const memoriesForDay = getMemoriesForDate(day);
    if (memoriesForDay.length > 0) {
      setSelectedDateMemories(memoriesForDay);
      setShowModal(true);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = generateCalendarDays();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 relative">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header - REDUCED TOP PADDING */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-2"
        >
          <h1 className="text-2xl font-bold essential-memories-title">Calendar</h1>
        </motion.div>

        {/* Month Navigation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-lg mb-6"
          style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiChevronLeft} className="text-xl" />
            </button>

            <h2 className="text-xl font-bold text-gray-800">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
            >
              <SafeIcon icon={FiChevronRight} className="text-xl" />
            </button>
          </div>
        </motion.div>

        {/* Calendar Grid with FULL COLOR BOXES */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-lg mb-6"
          style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}
        >
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days with FULL COLOR BACKGROUNDS */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const memoriesForDay = getMemoriesForDate(day);
              const hasMemories = memoriesForDay.length > 0;
              const primaryMemory = memoriesForDay[0];

              if (hasMemories) {
                console.log("DEBUG: Calendar - Date boxes are now full-color coded. (Change 2.1)");
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => day && handleDateClick(day)}
                  whileHover={day && hasMemories ? { scale: 1.05 } : {}}
                  whileTap={day && hasMemories ? { scale: 0.95 } : {}}
                  className={`
                    aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 relative
                    ${day
                      ? hasMemories
                        ? `${getCategoryColor(primaryMemory.category)} shadow-sm hover:shadow-md`
                        : 'hover:bg-pink-50 text-gray-600 bg-white border border-gray-100'
                      : ''
                    }
                    ${hasMemories ? 'cursor-pointer' : day ? 'cursor-default' : ''}
                  `}
                  style={day ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' } : {}}
                  disabled={!day}
                >
                  {day && (
                    <span className={hasMemories ? 'text-gray-800 font-bold' : 'text-gray-600'}>
                      {day}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Color Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-lg mb-6"
          style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
              <span className="text-gray-600">Birthday</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
              <span className="text-gray-600">Anniversary</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-200 rounded mr-2"></div>
              <span className="text-gray-600">Special Date</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
              <span className="text-gray-600">Holiday</span>
            </div>
          </div>
        </motion.div>

        {/* NEW: Memory List for Current Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-20"
          style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)' }}
        >
          <h3 className="text-lg font-semibold essential-memories-title mb-4">Memories This Month</h3>
          <div className="space-y-3">
            {getCurrentMonthMemories().map((memory) => (
              <div
                key={memory.id}
                className={`p-4 rounded-xl bg-gradient-to-r ${getCategoryGradient(
                  memory.category
                )} border ${getCategoryColor(memory.category).split(' ')[1]}`}
                style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{memory.display_name}</h4>
                    <p className="text-sm text-gray-600">{memory.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {`${String(memory.month).padStart(2, '0')}/${String(memory.day).padStart(2, '0')}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {getCurrentMonthMemories().length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No memories added for this month yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Date Details Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {format(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        selectedDateMemories[0]?.day || 1
                      ),
                      'MMMM d'
                    )}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="text-xl" />
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedDateMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryGradient(memory.category)}`}
                      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}
                    >
                      <h4 className="font-semibold text-gray-800">{memory.display_name}</h4>
                      <p className="text-sm text-gray-600">{memory.category}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarPage;