
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from '@/components/SplashScreen';
import RoleSelection from '@/components/RoleSelection';
import AuthForm from '@/components/auth/AuthForm';
import CustomerDashboard from '@/components/customer/CustomerDashboard';
import OwnerDashboard from '@/components/owner/OwnerDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  // App state machine
  const [appState, setAppState] = useState<'splash' | 'role-selection' | 'auth' | 'dashboard'>('splash');
  const [userRole, setUserRole] = useState<'customer' | 'owner' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        
        // Try to determine if user is a restaurant owner or customer
        const { data: ownerData } = await supabase
          .from('restaurant_owners')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
          
        if (ownerData) {
          setUserRole('owner');
        } else {
          setUserRole('customer');
        }
        
        // Important: Even if the user is authenticated, we'll always show the role selection first
        // This ensures users can switch between customer and restaurant owner views
        setAppState('role-selection');
      }
    };
    
    checkSession();
  }, []);
  
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
    
    // If the user is already authenticated, go directly to dashboard with the selected role
    if (isAuthenticated) {
      setAppState('dashboard');
    } else {
      setAppState('auth');
    }
  };
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setAppState('dashboard');
  };
  
  const handleRoleChange = () => {
    setUserRole(userRole === 'customer' ? 'owner' : 'customer');
  };
  
  // Setup real-time channel for restaurant menu updates
  useEffect(() => {
    const menuChannel = supabase
      .channel('menu-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'menu_items' 
        },
        (payload) => {
          console.log('Menu item changed:', payload);
          // The real-time update will be handled in the specific components
        })
      .subscribe();
      
    // Setup real-time channel for order notifications
    const orderChannel = supabase
      .channel('order-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders' 
        },
        (payload) => {
          console.log('New order received:', payload);
          // The real-time update will be handled in the OrderManagement component
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(menuChannel);
      supabase.removeChannel(orderChannel);
    };
  }, []);

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
