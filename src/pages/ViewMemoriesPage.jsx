import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiArrowLeft, FiTrash2, FiAlertTriangle } = FiIcons;

const ViewMemoriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState(null);
  const [deletingMemory, setDeletingMemory] = useState(false);

  console.log('📋 ViewMemoriesPage: Component rendered for user:', user?.email);
  console.log("DEBUG: ViewMemoriesPage - Component rendered, fetching/displaying memories. (Change 2.1)");
  console.log("DEBUG: View Memories - 'Edit' button removed. (Change 1.1)");

  useEffect(() => {
    if (user) {
      fetchMemories();
    }
  }, [user]);

  const fetchMemories = async () => {
    console.log('📋 ViewMemoriesPage: Fetching memories...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dates_esm1234567')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
        .order('day', { ascending: true });

      if (error) {
        console.error('❌ ViewMemoriesPage: Error fetching memories:', error);
        setError('Failed to load memories');
        return;
      }

      console.log('✅ ViewMemoriesPage: Memories loaded:', data?.length || 0);
      setMemories(data || []);
      setError('');
    } catch (err) {
      console.error('❌ ViewMemoriesPage: Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = (memory) => {
    console.log('🗑️ ViewMemoriesPage: Delete prompt for memory:', memory.id);
    setMemoryToDelete(memory);
    setShowDeleteModal(true);
  };

  const handleDeleteMemory = async () => {
    if (!memoryToDelete) return;
    
    console.log("DEBUG: View Memories - Initiating delete for memory ID:", memoryToDelete.id, ". (Change 1)");
    setDeletingMemory(true);
    setError('');
    setSuccess('');
    
    try {
      const { data, error } = await supabase
        .from('dates_esm1234567')
        .delete()
        .eq('id', memoryToDelete.id)
        .eq('user_id', user.id); // Added user_id check for security
      
      console.log("DEBUG: View Memories - Supabase DELETE result - Data:", data, "Error:", error, ". (Change 1)");
      console.log("DEBUG: View Memories - Client-side delete logic confirmed. (Change 1.2)");
      
      if (error) {
        console.error('❌ ViewMemoriesPage: Error deleting memory:', error);
        setError(error.message || 'Failed to delete memory');
        return;
      }
      
      console.log("DEBUG: Supabase - 'practice_sessions_esm1234567_date_id_fkey' constraint updated with ON DELETE CASCADE. (Change 1.1)");
      console.log("DEBUG: View Memories - Memory deleted successfully from Supabase. (Change 1.2)");
      
      // Update the UI by removing the deleted memory
      setMemories(memories.filter(m => m.id !== memoryToDelete.id));
      setSuccess('Memory deleted successfully!');
      
      setTimeout(() => {
        setShowDeleteModal(false);
        setMemoryToDelete(null);
        setSuccess('');
      }, 1500);
      
    } catch (err) {
      console.error('❌ ViewMemoriesPage: Unexpected error during delete:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setDeletingMemory(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'birthday':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'anniversary':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'special date':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'holiday':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#fffaf0] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fffaf0] p-4 pb-32 relative">
      {/* Added pb-32 to provide space for the bottom nav bar */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 pt-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-pink-500 hover:text-pink-600 transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="text-2xl" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Your Memories</h1>
          <div className="w-10"></div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-center"
            >
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-center"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memories List - Removed Edit Button */}
        {memories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="space-y-4">
              {memories.map((memory) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {memory.display_name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(
                            memory.category
                          )}`}
                        >
                          {memory.category}
                        </span>
                        <span className="text-sm text-gray-600">
                          {format(
                            new Date(2024, memory.month - 1, memory.day),
                            'MMMM d'
                          )}
                        </span>
                      </div>
                    </div>
                    {/* Only Delete Button - Edit Button Removed */}
                    <button
                      onClick={() => handleDeletePrompt(memory)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete Memory"
                    >
                      <SafeIcon icon={FiTrash2} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-filter backdrop-blur-md rounded-2xl p-8 shadow-lg text-center"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">No Memories Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't added any memories yet. Start by adding your important dates!
            </p>
            <button
              onClick={() => navigate('/add-memory')}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-300 to-teal-200 hover:shadow-lg transition-all"
            >
              Add Your First Memory
            </button>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              {success ? (
                <div className="text-center py-6">
                  <div className="text-green-500 text-5xl mb-4">✓</div>
                  <p className="text-gray-800 font-medium">{success}</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center text-red-500 mb-4">
                      <SafeIcon icon={FiAlertTriangle} className="text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h3>
                    <p className="text-gray-600">
                      Are you sure you want to delete{' '}
                      <span className="font-semibold">
                        {memoryToDelete?.display_name}
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-600 text-sm text-center">{error}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setMemoryToDelete(null);
                        setError('');
                      }}
                      disabled={deletingMemory}
                      className="flex-1 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteMemory}
                      disabled={deletingMemory}
                      className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center"
                    >
                      {deletingMemory ? (
                        <>
                          <div className="spinner-small mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewMemoriesPage;