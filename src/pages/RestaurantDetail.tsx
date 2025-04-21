import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import CustomerHeader from '@/components/customer/CustomerHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { StarIcon, Clock, MapPin, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  is_available: boolean | null;
  is_vegetarian: boolean | null;
  image_url: string | null;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  description: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  rating: number | null;
  delivery_time: string | null;
  image_url: string | null;
  is_vegetarian: boolean | null;
}

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('delivery');
  
  // Fetch restaurant details
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as Restaurant;
    },
  });
  
  // Fetch menu items
  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery({
    queryKey: ['menuItems', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id);
        
      if (error) throw error;
      return data as MenuItem[];
    },
  });
  
  // Group menu items by category
  const menuCategories = React.useMemo(() => {
    if (!menuItems) return [];
    
    const categories = menuItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc.includes(category)) {
        acc.push(category);
      }
      return acc;
    }, [] as string[]);
    
    return categories;
  }, [menuItems]);
  
  // Set the first category as active when data loads
  useEffect(() => {
    if (menuCategories.length > 0 && !activeCategory) {
      setActiveCategory(menuCategories[0]);
    }
  }, [menuCategories, activeCategory]);
  
  const handleAddToCart = (item: MenuItem) => {
    if (restaurant) {
      // Check if there are items from another restaurant
      if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurant.id) {
        toast({
          title: "Items from another restaurant",
          description: "Your cart has items from another restaurant. Would you like to clear it and add this item?",
          action: (
            <Button 
              variant="destructive" 
              onClick={() => {
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: 1,
                  restaurantId: restaurant.id,
                  restaurantName: restaurant.name,
                  isAvailable: item.is_available !== false, // Default to true if null
                  orderType: orderType
                });
              }}
            >
              Clear & Add
            </Button>
          ),
        });
        return;
      }
      
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        isAvailable: item.is_available !== false, // Default to true if null
        orderType: orderType
      });

      toast({
        title: "Added to cart",
        description: `${item.name} added to your cart`,
      });
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };
  
  // Nashik as the fixed user location
  const userLocationCity = "Nashik";

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Show current city */}
        <div className="flex items-center mb-4 gap-2 text-food-orange">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold text-lg">Your Location: {userLocationCity}</span>
        </div>
        
        {isLoadingRestaurant ? (
          <div className="space-y-4">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          restaurant && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="h-56 bg-gray-200 relative">
                {restaurant.image_url ? (
                  <img 
                    src={restaurant.image_url} 
                    alt={restaurant.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
                  
                  <div className="flex items-center text-white mt-2 space-x-4">
                    {restaurant.cuisine_type && (
                      <span className="flex items-center text-sm">
                        {restaurant.cuisine_type}
                      </span>
                    )}
                    
                    {restaurant.rating !== null && (
                      <span className="flex items-center text-sm">
                        <StarIcon className="h-4 w-4 mr-1 text-yellow-400" />
                        {restaurant.rating.toFixed(1)}
                      </span>
                    )}
                    
                    {restaurant.delivery_time && (
                      <span className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {restaurant.delivery_time}
                      </span>
                    )}
                    
                    {restaurant.price_range && (
                      <span className="text-sm">
                        {restaurant.price_range}
                      </span>
                    )}
                    
                    {restaurant.is_vegetarian && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Pure Veg
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <p className="text-gray-600">{restaurant.address}</p>
                    </div>
                    
                    {restaurant.description && (
                      <p className="mt-4 text-gray-600">{restaurant.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Order Type Selection */}
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Select Order Type</h3>
                  <RadioGroup 
                    value={orderType} 
                    onValueChange={(value) => setOrderType(value as 'delivery' | 'pickup' | 'dine-in')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery">Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup">Pickup</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dine-in" id="dine-in" />
                      <Label htmlFor="dine-in">Dine-in</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          )
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu Categories */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-medium text-lg mb-4">Menu</h3>
              
              {isLoadingMenuItems ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {menuCategories.map((category) => (
                    <button
                      key={category}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeCategory === category
                          ? 'bg-food-orange text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Checkout button for mobile */}
              {cartItems.length > 0 && (
                <div className="mt-4 block md:hidden">
                  <Button 
                    className="w-full bg-food-orange hover:bg-food-orange/90"
                    onClick={handleProceedToCheckout}
                  >
                    Proceed to Checkout ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="md:w-3/4">
            {isLoadingMenuItems ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <Tabs value={activeCategory || ""} onValueChange={setActiveCategory}>
                <TabsList className="hidden">
                  {menuCategories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {menuCategories.map((category) => (
                  <TabsContent key={category} value={category} className="m-0">
                    <h2 className="text-xl font-semibold mb-4">{category}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {menuItems
                        ?.filter((item) => (item.category || 'Other') === category)
                        .map((item) => (
                          <Card key={item.id} className="relative overflow-hidden">
                            {item.is_available === false && (
                              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                <div className="bg-red-100 text-red-600 px-4 py-2 rounded-full flex items-center">
                                  <X className="w-4 h-4 mr-1" />
                                  Currently Unavailable
                                </div>
                              </div>
                            )}
                            
                            <div className="flex h-full">
                              <div className="flex-1 flex flex-col">
                                <CardHeader>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-lg">{item.name}</CardTitle>
                                      <CardDescription>
                                        {item.is_vegetarian && (
                                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">
                                            Veg
                                          </span>
                                        )}
                                        ₹{item.price.toFixed(2)}
                                      </CardDescription>
                                    </div>
                                    {item.image_url && (
                                      <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden">
                                        <img 
                                          src={item.image_url} 
                                          alt={item.name} 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </CardHeader>
                                
                                <CardContent>
                                  {item.description && (
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                  )}
                                </CardContent>
                                
                                <CardFooter className="mt-auto">
                                  <Button 
                                    variant="outline" 
                                    className="text-food-orange border-food-orange hover:bg-food-orange/10 w-full"
                                    onClick={() => handleAddToCart(item)}
                                    disabled={item.is_available === false}
                                  >
                                    Add to Cart
                                  </Button>
                                </CardFooter>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
        
        {/* Sticky checkout button for desktop */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 hidden md:block">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <span className="font-medium">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in cart</span>
                <p className="text-sm text-gray-500">From {cartItems[0].restaurantName}</p>
              </div>
              <Button 
                className="bg-food-orange hover:bg-food-orange/90"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
