import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiRotateCcw, FiX, FiCheck } = FiIcons;

const Flashcard = ({ memory, onAnswer }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardFlip = () => {
    console.log('DEBUG: Flashcard - Correct/Incorrect buttons visibility confirmed after flip. (Change 2)');
    setIsFlipped(true);
  };

  const handleAnswer = (correct) => {
    onAnswer(correct);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Increased max-width for better full-screen display */}
      {/* Flashcard - Front Card */}
      <motion.div
        className="bg-gradient-to-r from-pink-300 to-teal-200 text-white p-8 min-h-64 cursor-pointer rounded-2xl shadow-lg mb-8"
        style={{ boxShadow: '0 10px 30px rgba(244,114,182,0.2)' }}
        onClick={!isFlipped ? handleCardFlip : undefined}
        whileHover={!isFlipped ? { scale: 1.02 } : {}}
        whileTap={!isFlipped ? { scale: 0.98 } : {}}
      >
        <div className="text-center">
          <div className="text-5xl mb-6">💝</div>
          <h2 className="text-2xl font-bold mb-6">{memory?.display_name}</h2>
          {!isFlipped && (
            <div className="flex items-center justify-center text-sm opacity-80 mt-2">
              <SafeIcon icon={FiRotateCcw} className="mr-2" />
              Tap to reveal date
            </div>
          )}
          {/* Show date directly on the same card after tap */}
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6"
            >
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-3xl font-bold mb-2">
                {format(new Date(2024, (memory?.month || 1) - 1, memory?.day || 1), 'MM/dd')}
              </h3>
              <p className="text-xl opacity-90">
                {format(new Date(2024, (memory?.month || 1) - 1, memory?.day || 1), 'MMMM d')}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Answer Buttons - Only show after flip */}
      {isFlipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(false)}
            className="flex-1 bg-red-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center"
            style={{ boxShadow: '0 6px 15px rgba(239,68,68,0.2)' }}
          >
            <SafeIcon icon={FiX} className="mr-2 text-xl" />
            Incorrect
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(true)}
            className="flex-1 bg-green-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center"
            style={{ boxShadow: '0 6px 15px rgba(34,197,94,0.2)' }}
          >
            <SafeIcon icon={FiCheck} className="mr-2 text-xl" />
            Correct
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Flashcard;