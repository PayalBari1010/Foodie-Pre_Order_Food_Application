
import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { UserRound, UtensilsCrossed } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'customer' | 'owner') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-food-gray">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Logo size="lg" showText={true} />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-2xl md:text-3xl font-bold text-center mb-2"
      >
        Welcome to Foodies
      </motion.h1>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center text-gray-600 mb-8 max-w-md"
      >
        Pre-order food from your favorite restaurants for pickup or dine-in
      </motion.p>
      
      <div className="w-full max-w-md grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => onSelectRole('customer')}
          className="food-card flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-food-orange/5 border-2 border-transparent hover:border-food-orange"
        >
          <div className="w-16 h-16 bg-food-orange/10 rounded-full flex items-center justify-center mb-4">
            <UserRound className="w-8 h-8 text-food-orange" />
          </div>
          <h2 className="text-xl font-semibold mb-2">I'm a Customer</h2>
          <p className="text-center text-gray-600">Order food for pickup or dine-in</p>
        </motion.div>
        
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => onSelectRole('owner')}
          className="food-card flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-food-red/5 border-2 border-transparent hover:border-food-red"
        >
          <div className="w-16 h-16 bg-food-red/10 rounded-full flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-8 h-8 text-food-red" />
          </div>
          <h2 className="text-xl font-semibold mb-2">I'm a Restaurant Owner</h2>
          <p className="text-center text-gray-600">Manage your restaurant and orders</p>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
