import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Flashcard from '../components/Flashcard';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiTarget, FiTrendingUp, FiRefreshCw } = FiIcons;

const PracticePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [currentSession, setCurrentSession] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('🎯 PracticePage: Component rendered for user:', user?.email);
  console.log('📏 PracticePage: Updated for full-width expansion');
  console.log("DEBUG: Flashcard page content lifted to clear bottom nav bar. (Fix 1)");
  console.log("DEBUG: Updated page title with consistent gradient");

  useEffect(() => {
    if (user) {
      fetchMemoriesAndStartSession();
    }
  }, [user]);

  const fetchMemoriesAndStartSession = async () => {
    console.log("DEBUG: Flashcard session length set to 10 cards. (Change 1.1)");
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('dates_esm1234567')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ PracticePage: Error fetching memories:', error);
        return;
      }

      const memoriesList = data || [];
      setMemories(memoriesList);
      console.log('✅ PracticePage: Memories loaded:', memoriesList.length);
      
      if (memoriesList.length === 0) {
        console.log('🎯 PracticePage: No memories found');
        return;
      }

      // Create session with 10 memories (or all if less than 10) - CHANGED FROM 5 TO 10
      const sessionSize = Math.min(10, memoriesList.length);
      console.log("DEBUG: Flashcard selection logic confirmed for 10 cards. (Change 1.3)");
      
      const shuffled = [...memoriesList].sort(() => 0.5 - Math.random());
      const sessionMemories = shuffled.slice(0, sessionSize);
      
      setCurrentSession(sessionMemories);
      setCurrentCardIndex(0);
      setSessionResults([]);
      setSessionComplete(false);
      
      console.log('🎯 PracticePage: Session started with', sessionSize, 'cards (max 10)');
    } catch (err) {
      console.error('❌ PracticePage: Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (correct) => {
    console.log('🎯 PracticePage: Answer recorded:', correct);
    
    const currentMemory = currentSession[currentCardIndex];
    const result = {
      memory: currentMemory,
      correct: correct,
      timestamp: new Date()
    };
    
    const newResults = [...sessionResults, result];
    setSessionResults(newResults);

    // Record practice session in database
    try {
      await supabase
        .from('practice_sessions_esm1234567')
        .insert([{
          user_id: user.id,
          date_id: currentMemory.id,
          correct: correct,
          session_type: 'Flashcard Practice'
        }]);
    } catch (err) {
      console.error('❌ PracticePage: Error recording practice:', err);
    }

    // Move to next card or complete session
    if (currentCardIndex + 1 < currentSession.length) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      console.log('🎯 PracticePage: Session complete');
      setSessionComplete(true);
    }
  };

  const calculateScore = () => {
    const correct = sessionResults.filter(r => r.correct).length;
    const total = sessionResults.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    
    console.log("DEBUG: Flashcard session summary display updated for 10 cards. (Change 1.2)");
    console.log(`🎯 PracticePage: Final score - ${correct}/${total} (${percentage}%)`);
    
    return { correct, total, percentage };
  };

  const startNewSession = () => {
    console.log('🎯 PracticePage: Starting new session');
    fetchMemoriesAndStartSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Memories Yet</h2>
          <p className="text-gray-600 mb-6">
            Add some memories first to start practicing!
          </p>
          <button
            onClick={() => navigate('/add-memory')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Add Your First Memory
          </button>
        </motion.div>
      </div>
    );
  }

  if (sessionComplete) {
    const score = calculateScore();
    
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Complete!</h2>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <SafeIcon icon={FiTarget} className="text-3xl text-purple-600 mr-3" />
              <div>
                <p className="text-3xl font-bold text-gray-800">{score.correct}/{score.total}</p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <SafeIcon icon={FiTrendingUp} className="text-2xl text-green-600 mr-2" />
              <p className="text-2xl font-bold text-green-600">{score.percentage}%</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startNewSession}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center"
            >
              <SafeIcon icon={FiRefreshCw} className="mr-2" />
              Practice Again
            </motion.button>
            
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 pb-32">
      {/* Added pb-32 (128px) to provide ample space for the bottom navigation bar */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 pt-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="text-2xl" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold essential-memories-title">Practice Mode</h1>
            <p className="text-sm text-gray-600">
              Card {currentCardIndex + 1} of {currentSession.length}
            </p>
          </div>
          <div className="w-10"></div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="bg-white/50 rounded-full h-2 mb-8"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentCardIndex + 1) / currentSession.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
          />
        </motion.div>

        {/* Flashcard */}
        <AnimatePresence mode="wait">
          {currentSession[currentCardIndex] && (
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Flashcard
                memory={currentSession[currentCardIndex]}
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PracticePage;