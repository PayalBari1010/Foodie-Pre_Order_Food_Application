
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Star } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  distance: string;
  priceRange: string;
  offer?: string;
  isPopular: boolean;
}

interface RestaurantListProps {
  filterType: 'nearby' | 'popular' | 'offers';
}

const RestaurantList: React.FC<RestaurantListProps> = ({ filterType }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: 'rest1',
      name: 'Tasty Delights',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      cuisine: ['North Indian', 'Mughlai', 'Chinese'],
      rating: 4.5,
      deliveryTime: '30-40 mins',
      distance: '1.2 km',
      priceRange: '₹₹',
      offer: '50% off up to ₹100',
      isPopular: true,
    },
    {
      id: 'rest2',
      name: 'South Spice',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      cuisine: ['South Indian', 'Kerala', 'Tamil'],
      rating: 4.2,
      deliveryTime: '25-35 mins',
      distance: '0.8 km',
      priceRange: '₹',
      isPopular: false,
    },
    {
      id: 'rest3',
      name: 'Pizza Paradise',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGl6emF8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      cuisine: ['Italian', 'Fast Food', 'Beverages'],
      rating: 4.0,
      deliveryTime: '35-45 mins',
      distance: '2.5 km',
      priceRange: '₹₹₹',
      offer: '20% off on orders above ₹500',
      isPopular: true,
    },
    {
      id: 'rest4',
      name: 'Biryani House',
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmlyeWFuaXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      cuisine: ['Biryani', 'Hyderabadi', 'Mughlai'],
      rating: 4.7,
      deliveryTime: '40-50 mins',
      distance: '3.0 km',
      priceRange: '₹₹',
      offer: 'Free delivery on orders above ₹300',
      isPopular: true,
    },
    {
      id: 'rest5',
      name: 'Healthy Bites',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhlYWx0aHklMjBmb29kfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      cuisine: ['Salads', 'Healthy', 'Continental'],
      rating: 4.3,
      deliveryTime: '25-35 mins',
      distance: '1.8 km',
      priceRange: '₹₹₹',
      isPopular: false,
    },
    {
      id: 'rest6',
      name: 'Sweet Tooth',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZGVzc2VydHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      cuisine: ['Desserts', 'Bakery', 'Ice Cream'],
      rating: 4.8,
      deliveryTime: '20-30 mins',
      distance: '0.5 km',
      priceRange: '₹₹',
      offer: 'Buy 1 Get 1 on selected items',
      isPopular: true,
    },
  ]);
  
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  
  useEffect(() => {
    // Filter restaurants based on the selected tab
    let filtered = [...restaurants];
    
    if (filterType === 'nearby') {
      // Sort by distance
      filtered.sort((a, b) => {
        const distA = parseFloat(a.distance.split(' ')[0]);
        const distB = parseFloat(b.distance.split(' ')[0]);
        return distA - distB;
      });
    } else if (filterType === 'popular') {
      // Filter by popularity
      filtered = filtered.filter(r => r.isPopular);
      // Then sort by rating
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (filterType === 'offers') {
      // Filter by offers
      filtered = filtered.filter(r => r.offer);
    }
    
    setFilteredRestaurants(filtered);
  }, [filterType, restaurants]);

  return (
    <div>
      {filteredRestaurants.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500">No restaurants found for your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 w-full overflow-hidden relative">
                  <img 
                    src={restaurant.image} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  {restaurant.offer && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-food-orange text-white">{restaurant.offer}</Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                      <CardDescription>
                        {restaurant.cuisine.join(', ')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      <span className="font-medium">{restaurant.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="flex flex-wrap items-center text-gray-600 text-sm gap-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{restaurant.distance}</span>
                    </div>
                    <div>
                      <span className="font-medium">{restaurant.priceRange}</span>
                      <span className="ml-1">for two</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full bg-food-orange hover:bg-food-orange/90">
                    View Menu
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
