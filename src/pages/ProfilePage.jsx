import React,{useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion,AnimatePresence} from 'framer-motion';
import {useAuth} from '../contexts/AuthContext';
import {supabase} from '../lib/supabase';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiUser,FiMail,FiLogOut,FiFileText,FiShield,FiEdit3,FiCheck,FiX,FiList}=FiIcons;

const ProfilePage=()=> {
  const {user,signOut}=useAuth();
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [signingOut,setSigningOut]=useState(false);
  const [editingDisplayName,setEditingDisplayName]=useState(false);
  const [displayNameValue,setDisplayNameValue]=useState('');
  const [savingDisplayName,setSavingDisplayName]=useState(false);
  const [displayNameError,setDisplayNameError]=useState('');
  const [displayNameSuccess,setDisplayNameSuccess]=useState('');

  console.log('👤 ProfilePage: Component rendered for user:',user?.email);

  useEffect(()=> {
    if (user) {
      fetchProfile();
    }
  },[user]);

  const fetchProfile=async ()=> {
    console.log('👤 ProfilePage: Fetching profile...');
    setLoading(true);
    try {
      const {data,error}=await supabase
        .from('profiles')
        .select('*')
        .eq('id',user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('👤 ProfilePage: Profile not found, creating new profile');
        const {data: newProfile, error: createError} = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            display_name: null
          }])
          .select()
          .single();

        if (createError) {
          console.error('❌ ProfilePage: Error creating profile:', createError);
          // Use user data as fallback
          const fallbackProfile = {
            id: user.id,
            email: user.email,
            display_name: null
          };
          setProfile(fallbackProfile);
          setDisplayNameValue('');
        } else {
          setProfile(newProfile);
          setDisplayNameValue(newProfile.display_name || '');
          console.log('✅ ProfilePage: Profile created successfully:', newProfile);
        }
      } else if (error) {
        console.error('❌ ProfilePage: Error fetching profile:',error);
        // Use user data as fallback
        const fallbackProfile={
          id: user.id,
          email: user.email,
          display_name: null
        };
        setProfile(fallbackProfile);
        setDisplayNameValue('');
      } else {
        setProfile(data);
        setDisplayNameValue(data.display_name || '');
        console.log('✅ ProfilePage: Profile loaded:',data);
      }
    } catch (err) {
      console.error('❌ ProfilePage: Unexpected error:',err);
      // Use user data as fallback
      const fallbackProfile={
        id: user.id,
        email: user.email,
        display_name: null
      };
      setProfile(fallbackProfile);
      setDisplayNameValue('');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDisplayName=()=> {
    setEditingDisplayName(true);
    setDisplayNameError('');
    setDisplayNameSuccess('');
    // Set current value or empty string
    setDisplayNameValue(profile?.display_name || '');
  };

  const handleCancelEditDisplayName=()=> {
    setEditingDisplayName(false);
    setDisplayNameValue(profile?.display_name || '');
    setDisplayNameError('');
    setDisplayNameSuccess('');
  };

  const handleSaveDisplayName=async ()=> {
    console.log('👤 ProfilePage: Saving display name:',displayNameValue);
    if (!displayNameValue.trim()) {
      setDisplayNameError('Display name cannot be empty');
      return;
    }

    if (displayNameValue.trim().length > 50) {
      setDisplayNameError('Display name must be 50 characters or less');
      return;
    }

    setSavingDisplayName(true);
    setDisplayNameError('');
    setDisplayNameSuccess('');

    try {
      // Check if profile exists first
      const {data: existingProfile,error: fetchError}=await supabase
        .from('profiles')
        .select('id')
        .eq('id',user.id)
        .single();

      if (fetchError && fetchError.code==='PGRST116') {
        // Profile doesn't exist,create it
        console.log('👤 ProfilePage: Creating new profile with display name');
        const {data,error: insertError}=await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              display_name: displayNameValue.trim()
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('❌ ProfilePage: Error creating profile:',insertError);
          setDisplayNameError('Failed to save display name');
          return;
        }

        setProfile(data);
        console.log('✅ ProfilePage: Profile created with display name:',data);
      } else if (fetchError) {
        console.error('❌ ProfilePage: Error checking profile:',fetchError);
        setDisplayNameError('Failed to save display name');
        return;
      } else {
        // Profile exists,update it
        console.log('👤 ProfilePage: Updating existing profile display name');
        const {data,error: updateError}=await supabase
          .from('profiles')
          .update({display_name: displayNameValue.trim()})
          .eq('id',user.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ ProfilePage: Error updating display name:',updateError);
          setDisplayNameError('Failed to save display name');
          return;
        }

        setProfile(data);
        console.log('✅ ProfilePage: Display name updated successfully:',data);
      }

      setDisplayNameSuccess('Display name updated!');
      setEditingDisplayName(false);

      // Clear success message after 3 seconds
      setTimeout(()=> {
        setDisplayNameSuccess('');
      },3000);
    } catch (err) {
      console.error('❌ ProfilePage: Unexpected error saving display name:',err);
      setDisplayNameError('An unexpected error occurred');
    } finally {
      setSavingDisplayName(false);
    }
  };

  const handleSignOut=async ()=> {
    console.log('👤 ProfilePage: Signing out...');
    setSigningOut(true);
    try {
      const {error}=await signOut();
      if (error) {
        console.error('❌ ProfilePage: Sign out failed:',error);
        alert('Failed to sign out. Please try again.');
      } else {
        console.log('✅ ProfilePage: Sign out successful');
        // Navigation will be handled by AuthContext
      }
    } catch (err) {
      console.error('❌ ProfilePage: Unexpected error during sign out:',err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Get display name for showing in the UI
  const getDisplayName=()=> {
    return profile?.display_name || 'User';
  };

  // Get initials for avatar
  const getInitials=()=> {
    const displayName=profile?.display_name;
    if (displayName) {
      return displayName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-4 pb-32 relative">
      {/* Added pb-32 (128px) to provide ample space for the bottom navigation bar */}
      <div className="w-full max-w-4xl mx-auto">
        {/* Header - REDUCED TOP PADDING */}
        <motion.div
          initial={{opacity: 0,y: -20}}
          animate={{opacity: 1,y: 0}}
          className="text-center mb-8 pt-2"
        >
          <h1 className="text-2xl font-bold essential-memories-title">Your Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your account</p>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {displayNameSuccess && (
            <motion.div
              initial={{opacity: 0,y: -10}}
              animate={{opacity: 1,y: 0}}
              exit={{opacity: 0,y: -10}}
              className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-center"
            >
              <p className="text-green-600 font-semibold">✅ {displayNameSuccess}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <motion.div
          initial={{opacity: 0,scale: 0.9}}
          animate={{opacity: 1,scale: 1}}
          transition={{delay: 0.1}}
          className="bg-white rounded-3xl p-8 shadow-xl mb-6"
          style={{boxShadow: '0 10px 40px rgba(0,0,0,0.08)'}}
        >
          {/* Profile Picture */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-300 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">{getInitials()}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{getDisplayName()}</h2>
            <div className="flex items-center justify-center text-gray-600">
              <SafeIcon icon={FiMail} className="mr-2" />
              <span>{profile?.email || user?.email}</span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4 mb-6">
            {/* Editable Display Name */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">Display Name</label>
              {editingDisplayName ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={displayNameValue}
                      onChange={(e)=> setDisplayNameValue(e.target.value)}
                      placeholder="Enter your display name"
                      className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
                      style={{boxShadow: '0 4px 12px rgba(0,0,0,0.03)'}}
                      disabled={savingDisplayName}
                      maxLength={50}
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={savingDisplayName}
                      className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {savingDisplayName ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <SafeIcon icon={FiCheck} className="text-lg" />
                      )}
                    </button>
                    <button
                      onClick={handleCancelEditDisplayName}
                      disabled={savingDisplayName}
                      className="p-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <SafeIcon icon={FiX} className="text-lg" />
                    </button>
                  </div>
                  {displayNameError && (
                    <p className="text-red-500 text-sm">{displayNameError}</p>
                  )}
                  <p className="text-gray-400 text-xs">{displayNameValue.length}/50 characters</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-800">{profile?.display_name || 'Not set'}</span>
                  <button
                    onClick={handleEditDisplayName}
                    className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit3} className="text-lg" />
                  </button>
                </div>
              )}
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="text-sm text-gray-500 block mb-1">Email Address</label>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-800">
                {profile?.email || user?.email}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-4 mb-8">
          {/* View Memories */}
          <motion.div
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            transition={{delay: 0.15}}
          >
            <Link
              to="/view-memories"
              className="block bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
              style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SafeIcon icon={FiList} className="text-xl text-pink-500 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-800">View Memories</h3>
                    <p className="text-sm text-gray-500">Manage your saved dates</p>
                  </div>
                </div>
                <SafeIcon icon={FiList} className="text-gray-400" />
              </div>
            </Link>
          </motion.div>

          {/* Terms of Service */}
          <motion.div
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            transition={{delay: 0.2}}
          >
            <Link
              to="/terms"
              className="block bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
              style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SafeIcon icon={FiFileText} className="text-xl text-pink-500 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Terms of Service</h3>
                    <p className="text-sm text-gray-500">Last Updated: 2025</p>
                  </div>
                </div>
                <SafeIcon icon={FiFileText} className="text-gray-400" />
              </div>
            </Link>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{opacity: 0,x: -20}}
            animate={{opacity: 1,x: 0}}
            transition={{delay: 0.3}}
          >
            <Link
              to="/privacy"
              className="block bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
              style={{boxShadow: '0 8px 20px rgba(0,0,0,0.05)'}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <SafeIcon icon={FiShield} className="text-xl text-pink-500 mr-4" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Privacy Policy</h3>
                    <p className="text-sm text-gray-500">Last Updated: 2025</p>
                  </div>
                </div>
                <SafeIcon icon={FiShield} className="text-gray-400" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Sign Out Button */}
        <motion.button
          initial={{opacity: 0,y: 20}}
          animate={{opacity: 1,y: 0}}
          transition={{delay: 0.4}}
          onClick={handleSignOut}
          disabled={signingOut}
          whileHover={signingOut ? {} : {scale: 1.02}}
          whileTap={signingOut ? {} : {scale: 0.98}}
          className="w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 flex items-center justify-center"
          style={{
            background: signingOut ? '#9ca3af' : 'linear-gradient(to right,#f9a8d4,#94e2cd)',
            boxShadow: '0 8px 20px rgba(239,68,68,0.15)'
          }}
        >
          {signingOut ? (
            <>
              <div className="spinner-small mr-2"></div>
              Signing out...
            </>
          ) : (
            <>
              <SafeIcon icon={FiLogOut} className="mr-2 text-xl" />
              Sign Out
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ProfilePage;