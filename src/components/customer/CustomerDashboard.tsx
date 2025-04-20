
import React, { useState } from 'react';
import CustomerHeader from './CustomerHeader';
import RestaurantList from './RestaurantList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomerDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('nearby');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // In a real app, this would trigger a search API call
  };

  return (
    <div className="min-h-screen bg-food-gray">
      <CustomerHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-food-orange to-food-red rounded-xl p-6 md:p-10 text-white mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Hungry? We've got you covered</h1>
          <p className="mb-6 md:w-2/3">Order food from the finest restaurants near you with just a few taps.</p>
          
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search for restaurants or dishes..."
              className="pl-10 pr-16 py-6 rounded-full bg-white/90 text-gray-800 placeholder:text-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <Button 
              type="submit"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-10 bg-food-orange hover:bg-food-orange/90"
            >
              Search
            </Button>
          </form>
        </div>
        
        {/* Restaurants Section */}
        <Tabs defaultValue="nearby" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="offers">Great Offers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nearby">
            <RestaurantList filterType="nearby" />
          </TabsContent>
          
          <TabsContent value="popular">
            <RestaurantList filterType="popular" />
          </TabsContent>
          
          <TabsContent value="offers">
            <RestaurantList filterType="offers" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
