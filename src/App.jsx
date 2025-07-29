import React from 'react';
import {HashRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import AddMemoryPage from './pages/AddMemoryPage';
import CalendarPage from './pages/CalendarPage';
import PracticePage from './pages/PracticePage';
import ProfilePage from './pages/ProfilePage';
import ViewMemoriesPage from './pages/ViewMemoriesPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

const AppContent = () => {
  const {user, loading} = useAuth();
  
  console.log('DEBUG: App rendering with loading:', loading, 'user:', user?.email || 'none');
  
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
    // Full-width container with no restrictions
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100">
      <div className="relative w-full">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/home" replace />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/home" replace />} />
          <Route path="/forgot-password" element={!user ? <ForgotPasswordPage /> : <Navigate to="/home" replace />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/add-memory" element={user ? <AddMemoryPage /> : <Navigate to="/login" replace />} />
          <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" replace />} />
          <Route path="/practice" element={user ? <PracticePage /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/view-memories" element={user ? <ViewMemoriesPage /> : <Navigate to="/login" replace />} />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to={user ? "/home" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={user ? "/home" : "/login"} replace />} />
        </Routes>
        
        {/* Bottom Navigation - Only show for authenticated users */}
        {user && <Navbar />}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;