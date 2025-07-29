import React, {useState, useEffect, useRef} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {format} from 'date-fns';
import {supabase} from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiX, FiCheck, FiXCircle, FiCheckCircle} = FiIcons;

const QOTDModal = ({isOpen, onClose, user}) => {
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [allMemoriesPracticed, setAllMemoriesPracticed] = useState(false);
  const inputRef = useRef(null);

  console.log('🎯 QOTDModal: Component rendered for user:', user?.email);
  console.log('🎨 QOTDModal: Applying refined aesthetics to match screenshots');
  console.log('🔄 QOTDModal: Changed "Question of the Day" to "Streak Challenge"');
  console.log('🔄 QOTDModal: Removed "Done" button after user answers');
  console.log('DEBUG: QOTDModal still functions with free trial limit - Change 2.3');

  useEffect(() => {
    if (isOpen && user) {
      selectRandomMemory();
    }
  }, [isOpen, user]);

  const selectRandomMemory = async () => {
    console.log('🎯 DEBUG: Streak Challenge - Selecting random memory');
    setLoading(true);
    setError('');
    setIsSubmitted(false);
    setUserAnswer('');
    setSelectedMemory(null);
    setAllMemoriesPracticed(false);

    try {
      // First, check which memories have been practiced today
      const today = new Date().toISOString().split('T')[0];

      // Get all user memories
      const {data: allMemories, error: memoriesError} = await supabase
        .from('dates_esm1234567')
        .select('*')
        .eq('user_id', user.id);

      if (memoriesError) {
        console.error('❌ QOTDModal: Error fetching memories:', memoriesError);
        setError('Failed to load memories');
        setLoading(false);
        return;
      }

      if (!allMemories || allMemories.length === 0) {
        console.log('🎯 QOTDModal: No memories found');
        setError('You need to add memories first');
        setLoading(false);
        return;
      }

      // Get today's practiced memories
      const {data: practicedToday, error: practicedError} = await supabase
        .from('practice_sessions_esm1234567')
        .select('date_id')
        .eq('user_id', user.id)
        .eq('session_type', 'Streak Challenge')
        .gte('timestamp', `${today}T00:00:00`)
        .lte('timestamp', `${today}T23:59:59`);

      if (practicedError) {
        console.error('❌ QOTDModal: Error fetching practiced memories:', practicedError);
      }

      // Filter out already practiced memories
      const practicedIds = (practicedToday || []).map(item => item.date_id);
      const availableMemories = allMemories.filter(memory => !practicedIds.includes(memory.id));

      if (availableMemories.length === 0) {
        console.log('🎯 QOTDModal: All memories practiced today');
        setAllMemoriesPracticed(true);
        setLoading(false);
        return;
      }

      // Select a random memory from available ones
      const randomIndex = Math.floor(Math.random() * availableMemories.length);
      const memory = availableMemories[randomIndex];

      console.log('✅ DEBUG: Streak Challenge opened. Randomly selected memory:', memory.display_name, memory.month, memory.day);
      setSelectedMemory(memory);
    } catch (err) {
      console.error('❌ QOTDModal: Error in selectRandomMemory:', err);
      setError('Failed to select a question');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Allow only numbers and a single slash
    value = value.replace(/[^\d/]/g, '');
    
    // Format as MM/DD
    if (value.length === 2 && !value.includes('/') && userAnswer.length < 2) {
      value += '/';
    }
    
    // Limit total length to 5 (MM/DD)
    if (value.length <= 5) {
      setUserAnswer(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 DEBUG: Streak Challenge - Submitting answer');
    
    if (!selectedMemory) return;

    // Validate input format (MM/DD)
    const formatRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
    if (!formatRegex.test(userAnswer)) {
      setError('Please enter a valid date in MM/DD format');
      return;
    }

    setIsSubmitted(true);

    // Compare answer
    const correctAnswer = `${String(selectedMemory.month).padStart(2, '0')}/${String(selectedMemory.day).padStart(2, '0')}`;
    const isAnswerCorrect = userAnswer === correctAnswer;

    console.log('🎯 DEBUG: Streak Challenge - Answer submitted. User:', userAnswer, 'Correct:', correctAnswer, 'Result:', isAnswerCorrect);
    setIsCorrect(isAnswerCorrect);

    // Record practice session
    try {
      await supabase
        .from('practice_sessions_esm1234567')
        .insert([{
          user_id: user.id,
          date_id: selectedMemory.id,
          correct: isAnswerCorrect,
          session_type: 'Streak Challenge'
        }]);

      // Update streak
      await updateQOTDStreak(isAnswerCorrect);
    } catch (err) {
      console.error('❌ QOTDModal: Error recording practice:', err);
    }
  };

  const updateQOTDStreak = async (correct) => {
    console.log('🎯 DEBUG: Streak Challenge - Updating streak');
    try {
      // Get current streak data
      const {data: streakData, error: fetchError} = await supabase
        .from('streak_data_esm1234567')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ QOTDModal: Error fetching streak:', fetchError);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      let currentStreak = streakData?.qotd_current_streak || 0;
      let allTimeHigh = streakData?.qotd_all_time_high || 0;

      if (correct) {
        // Correct answer
        currentStreak += 1;
        console.log('🎯 DEBUG: Streak Challenge - Correct. New current streak:', currentStreak);
        if (currentStreak > allTimeHigh) {
          allTimeHigh = currentStreak;
        }
      } else {
        // Incorrect answer
        currentStreak = 0;
        console.log('🎯 DEBUG: Streak Challenge - Incorrect. Streak reset to 0.');
      }

      // Update streak data
      const updateData = {
        qotd_current_streak: currentStreak,
        qotd_all_time_high: allTimeHigh,
        last_qotd_date: today
      };

      if (streakData) {
        // Update existing record
        await supabase
          .from('streak_data_esm1234567')
          .update(updateData)
          .eq('user_id', user.id);
      } else {
        // Create new record
        await supabase
          .from('streak_data_esm1234567')
          .insert([{
            user_id: user.id,
            ...updateData
          }]);
      }

      console.log('✅ DEBUG: Streak Challenge - Streaks persisted to DB. Last date updated.');
      setStreakUpdated(true);
    } catch (err) {
      console.error('❌ QOTDModal: Error updating streak:', err);
    }
  };

  // Focus on input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current && !loading && selectedMemory) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [isOpen, loading, selectedMemory]);

  if (!isOpen) return null;

  // Confetti elements for background
  const renderConfetti = () => {
    const confetti = [];
    const colors = ['#FFC0CB', '#FFD700', '#87CEFA', '#98FB98', '#DDA0DD'];
    
    for (let i = 0; i < 10; i++) {
      const size = Math.random() * 8 + 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const animationDuration = Math.random() * 10 + 10;
      const delay = Math.random() * 5;
      
      confetti.push(
        <div
          key={i}
          className="confetti"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            animation: `float ${animationDuration}s ease-in infinite`,
            animationDelay: `${delay}s`
          }}
        />
      );
    }
    return confetti;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{scale: 0.8, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          exit={{scale: 0.8, opacity: 0}}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-sm w-full"
          style={{boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}
        >
          {/* Confetti background */}
          <div className="confetti-container" style={{
            position: 'absolute',
            borderRadius: '1rem',
            overflow: 'hidden'
          }}>
            {renderConfetti()}
          </div>

          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="text-xl" />
            </button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold essential-memories-title">Streak Challenge</h2>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Loading question...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-gray-700 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 to-teal-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                style={{boxShadow: '0 4px 15px rgba(244,114,182,0.2)'}}
              >
                Close
              </button>
            </div>
          ) : allMemoriesPracticed ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">All Done For Today!</h3>
              <p className="text-gray-600 mb-6">
                You've practiced all your memories today. Come back tomorrow!
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 to-teal-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                style={{boxShadow: '0 4px 15px rgba(244,114,182,0.2)'}}
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              {selectedMemory && (
                <>
                  {/* Question */}
                  <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-5 text-white mb-6">
                    <h3 className="text-lg font-semibold mb-2">When is...</h3>
                    <p className="text-2xl font-bold">{selectedMemory.display_name}?</p>
                  </div>

                  {/* Input form */}
                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Enter Date (MM/DD)
                        </label>
                        <input
                          ref={inputRef}
                          type="text"
                          value={userAnswer}
                          onChange={handleInputChange}
                          placeholder="MM/DD"
                          className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 text-center text-xl font-bold"
                          maxLength={5}
                          style={{boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}}
                        />
                        {error && (
                          <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-teal-400 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                        style={{boxShadow: '0 4px 15px rgba(244,114,182,0.2)'}}
                      >
                        Check Answer
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      {/* Result */}
                      <div className={`p-5 rounded-xl text-center ${
                        isCorrect ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        <div className="text-4xl mb-3">
                          {isCorrect ? (
                            <SafeIcon icon={FiCheckCircle} className="text-green-500 mx-auto" />
                          ) : (
                            <SafeIcon icon={FiXCircle} className="text-red-500 mx-auto" />
                          )}
                        </div>
                        <h3 className={`text-xl font-bold ${
                          isCorrect ? 'text-green-600' : 'text-red-600'
                        } mb-2`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </h3>
                        {!isCorrect && (
                          <p className="text-gray-600">
                            {selectedMemory.display_name} is{' '}
                            <span className="font-bold">
                              {format(
                                new Date(2024, selectedMemory.month - 1, selectedMemory.day),
                                'MM/dd'
                              )}
                            </span>
                          </p>
                        )}
                      </div>

                      {streakUpdated && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                          <p className="text-yellow-800 text-sm">
                            🔥 Your streak has been updated!
                          </p>
                        </div>
                      )}

                      {/* REMOVED "Done" button */}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QOTDModal;