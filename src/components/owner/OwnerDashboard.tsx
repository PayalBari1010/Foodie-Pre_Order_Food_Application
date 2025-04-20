
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuManagement from './MenuManagement';
import OrderManagement from './OrderManagement';
import PaymentSection from './PaymentSection';
import OwnerHeader from './OwnerHeader';

const OwnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('menu');
  const restaurantData = {
    name: "Tasty Delights",
    address: "123 Food Street, Flavor Town",
    rating: 4.5,
    totalOrders: 128,
    monthlyRevenue: 25600,
  };

  return (
    <div className="min-h-screen bg-food-gray">
      <OwnerHeader restaurantName={restaurantData.name} />
      
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {restaurantData.name}!</h2>
            <p className="text-gray-600 mb-4">{restaurantData.address}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="food-card bg-blue-50 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Overall Rating</p>
                <p className="text-2xl font-bold">{restaurantData.rating} ⭐</p>
              </div>
              
              <div className="food-card bg-green-50 border-l-4 border-green-500">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{restaurantData.totalOrders}</p>
              </div>
              
              <div className="food-card bg-purple-50 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹{restaurantData.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <Tabs defaultValue="menu" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MenuManagement />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="orders">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <OrderManagement />
            </motion.div>
          </TabsContent>
          
          <TabsContent value="payment">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentSection />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
