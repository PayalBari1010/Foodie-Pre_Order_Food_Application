
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import RoleSelection from '@/components/RoleSelection';
import AuthForm from '@/components/auth/AuthForm';
import CustomerDashboard from '@/components/customer/CustomerDashboard';
import OwnerDashboard from '@/components/owner/OwnerDashboard';

const Index = () => {
  // App state machine
  const [appState, setAppState] = useState<'splash' | 'role-selection' | 'auth' | 'dashboard'>('splash');
  const [userRole, setUserRole] = useState<'customer' | 'owner' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Simulate splash screen and then show role selection
  useEffect(() => {
    if (appState === 'splash') {
      const timer = setTimeout(() => {
        setAppState('role-selection');
      }, 3000); // 3 seconds for splash screen
      
      return () => clearTimeout(timer);
    }
  }, [appState]);
  
  const handleSplashComplete = () => {
    setAppState('role-selection');
  };
  
  const handleRoleSelection = (role: 'customer' | 'owner') => {
    setUserRole(role);
    setAppState('auth');
  };
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setAppState('dashboard');
  };
  
  const handleRoleChange = () => {
    setUserRole(userRole === 'customer' ? 'owner' : 'customer');
  };

  return (
    <AnimatePresence mode="wait">
      {appState === 'splash' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SplashScreen onComplete={handleSplashComplete} />
        </motion.div>
      )}
      
      {appState === 'role-selection' && (
        <motion.div
          key="role-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RoleSelection onSelectRole={handleRoleSelection} />
        </motion.div>
      )}
      
      {appState === 'auth' && userRole && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AuthForm 
            role={userRole} 
            onSuccess={handleAuthSuccess} 
            onRoleChange={handleRoleChange}
          />
        </motion.div>
      )}
      
      {appState === 'dashboard' && isAuthenticated && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {userRole === 'customer' ? <CustomerDashboard /> : <OwnerDashboard />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
