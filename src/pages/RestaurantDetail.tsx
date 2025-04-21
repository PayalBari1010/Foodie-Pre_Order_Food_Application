
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import CustomerHeader from '@/components/customer/CustomerHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MapPin, X, StarIcon, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';

// Dummy data for mock menu items for each restaurant
const MENU_DATA: Record<string, any[]> = {
  'sweet-tooth': [
    {
      id: 'cake1', name: 'Chocolate Cake', description: 'Rich chocolate sponge cake.', price: 180, category: 'Cakes', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'cake2', name: 'Strawberry Pastry', description: 'Fresh strawberries and cream.', price: 120, category: 'Pastries', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'cake3', name: 'Black Forest', description: 'Classic Black Forest with cherries.', price: 200, category: 'Cakes', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'cake4', name: 'Pineapple Pastry', description: 'Tropical pineapple cream.', price: 110, category: 'Pastries', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'cake5', name: 'Red Velvet Cake', description: 'Soft red velvet layers.', price: 220, category: 'Cakes', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'south-spice': [
    {
      id: 'idli', name: 'Idli Sambar', description: 'Steamed rice cakes with sambar.', price: 60, category: 'Breakfast', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1629100564119-0c3c6595ee7c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'masala-dosa', name: 'Masala Dosa', description: 'Crispy dosa with potato.', price: 90, category: 'Dosa', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'vada', name: 'Medu Vada', description: 'Fried savory doughnuts.', price: 70, category: 'Snacks', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1633881010704-691d600bf7b5?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'uttapam', name: 'Uttapam', description: 'Thick pancake with veggies.', price: 80, category: 'Breakfast', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'tasty-delights': [
    {
      id: 'paneer-butter', name: 'Paneer Butter Masala', description: 'Creamy paneer curry.', price: 249, category: 'Main Course', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'chole-bhature', name: 'Chole Bhature', description: 'Spicy chickpeas & fried bread.', price: 180, category: 'Main Course', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'chowmein', name: 'Veg Chowmein', description: 'Stir-fried noodles.', price: 120, category: 'Chinese', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'gobi-manchurian', name: 'Gobi Manchurian', description: 'Cauliflower Manchurian dry.', price: 140, category: 'Chinese', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'healthy-bites': [
    {
      id: 'greek-salad', name: 'Greek Salad', description: 'Fresh salad with feta.', price: 130, category: 'Salads', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'quinoa-bowl', name: 'Quinoa Bowl', description: 'High-protein quinoa and veggies.', price: 170, category: 'Bowls', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'fruit-bowl', name: 'Fruit Bowl', description: 'Seasonal fresh fruits.', price: 100, category: 'Salads', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1629100564119-0c3c6595ee7c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'sprouts-salad', name: 'Sprouts Salad', description: 'Sprouted moong, veggies and lemon.', price: 80, category: 'Salads', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1633881010704-691d600bf7b5?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'pizza-paradise': [
    {
      id: 'veg-pizza', name: 'Veggie Pizza', description: 'Capsicum, onion, tomato.', price: 220, category: 'Pizzas', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'cheese-pizza', name: 'Cheese Burst Pizza', description: 'Extra cheesy delicious pizza.', price: 250, category: 'Pizzas', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1559628231-b8e017386857?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'pepperoni', name: 'Pepperoni Pizza', description: 'Non-veg pepperoni classic.', price: 290, category: 'Pizzas', is_available: true, is_vegetarian: false, image_url: 'https://images.unsplash.com/photo-1548365328-9bdb2f7ae67c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'margarita', name: 'Margherita', description: 'Classic cheese and sauce.', price: 180, category: 'Pizzas', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1571066811602-716837d68120?auto=format&fit=crop&w=400&q=80',
    },
  ],
  'biryani-house': [
    {
      id: 'chicken-biryani', name: 'Chicken Biryani', description: 'Aromatic rice with chicken.', price: 299, category: 'Main Course', is_available: true, is_vegetarian: false, image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'egg-biryani', name: 'Egg Biryani', description: 'Flavoured rice with boiled eggs.', price: 249, category: 'Main Course', is_available: true, is_vegetarian: false, image_url: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'mutton-biryani', name: 'Mutton Biryani', description: 'Tender mutton pieces.', price: 350, category: 'Main Course', is_available: true, is_vegetarian: false, image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'veg-biryani', name: 'Veg Biryani', description: 'Vegetarian biryani.', price: 210, category: 'Main Course', is_available: true, is_vegetarian: true, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    },
  ]
};

const RESTAURANT_INFO: Record<string, any> = {
  'sweet-tooth': {
    name: 'Sweet Tooth',
    address: 'MG Road, Nashik',
    description: 'Your destination for the best cakes and desserts in Nashik.',
    cuisine_type: 'Desserts',
    price_range: '₹₹',
    rating: 4.8,
    delivery_time: '20-30 mins',
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZGVzc2VydHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    is_vegetarian: true,
  },
  'south-spice': {
    name: 'South Spice',
    address: 'Gangapur Road, Nashik',
    description: 'Authentic South Indian cuisine.',
    cuisine_type: 'South Indian',
    price_range: '₹',
    rating: 4.2,
    delivery_time: '25-35 mins',
    image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3RhdXJhbnR8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    is_vegetarian: true,
  },
  'tasty-delights': {
    name: 'Tasty Delights',
    address: 'College Road, Nashik',
    description: 'Delicious North Indian & Chinese food.',
    cuisine_type: 'North Indian, Chinese',
    price_range: '₹₹',
    rating: 4.5,
    delivery_time: '30-40 mins',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    is_vegetarian: true,
  },
  'healthy-bites': {
    name: 'Healthy Bites',
    address: 'Dwarka, Nashik',
    description: 'Healthy & fresh bowls, salads, and more.',
    cuisine_type: 'Healthy',
    price_range: '₹₹₹',
    rating: 4.3,
    delivery_time: '25-35 mins',
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhlYWx0aHklMjBmb29kfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    is_vegetarian: true,
  },
  'pizza-paradise': {
    name: 'Pizza Paradise',
    address: 'College Road, Nashik',
    description: 'Pizzas, beverages and good times.',
    cuisine_type: 'Italian, Fast Food',
    price_range: '₹₹₹',
    rating: 4.0,
    delivery_time: '35-45 mins',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGl6emF8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    is_vegetarian: false,
  },
  'biryani-house': {
    name: 'Biryani House',
    address: 'Main Road, Nashik',
    description: 'Best biryanis in the city, non-veg & veg!',
    cuisine_type: 'Biryani, Mughlai',
    price_range: '₹₹',
    rating: 4.7,
    delivery_time: '40-50 mins',
    image_url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmlyeWFuaXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    is_vegetarian: false,
  },
};

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'dine-in'>('delivery');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Use mock data for demo
  const restaurant = RESTAURANT_INFO[id || ''] || null;
  const menuItems = MENU_DATA[id || ''] || [];

  // Categories
  const menuCategories = React.useMemo(() => {
    if (!menuItems) return [];
    const categories = menuItems.reduce((acc: string[], item) => {
      const category = item.category || 'Other';
      if (!acc.includes(category)) acc.push(category);
      return acc;
    }, []);
    return categories;
  }, [menuItems]);

  useEffect(() => {
    if (menuCategories.length > 0 && !activeCategory) {
      setActiveCategory(menuCategories[0]);
    }
  }, [menuCategories, activeCategory]);

  const handleAddToCart = (item: any) => {
    if (restaurant) {
      // Simplified: skip other restaurant item checks for demo
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurantId: id || '',
        restaurantName: restaurant.name,
        isAvailable: item.is_available !== false,
        orderType,
      });
      toast({
        title: "Added to cart",
        description: `${item.name} added to your cart`
      });
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  // Always Nashik location
  const userLocationCity = "Nashik";

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      <div className="container mx-auto px-4 py-6">
        {/* Always Nashik */}
        <div className="flex items-center mb-4 gap-2 text-food-orange">
          <MapPin className="w-5 h-5" />
          <span className="font-semibold text-lg">Your Location: Nashik</span>
        </div>
        {!restaurant ? (
          <div className="py-20 text-center text-gray-500">Restaurant not found!</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="h-56 bg-gray-200 relative">
              <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
                <div className="flex items-center text-white mt-2 space-x-4">
                  <span className="flex items-center text-sm">{restaurant.cuisine_type}</span>
                  <span className="flex items-center text-sm"><StarIcon className="h-4 w-4 mr-1 text-yellow-400" />{restaurant.rating}</span>
                  <span className="flex items-center text-sm"><Clock className="h-4 w-4 mr-1" />{restaurant.delivery_time}</span>
                  <span className="text-sm">{restaurant.price_range}</span>
                  {restaurant.is_vegetarian && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Pure Veg</Badge>}
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
                  {restaurant.description && <p className="mt-4 text-gray-600">{restaurant.description}</p>}
                </div>
              </div>
              {/* Order Type Selection */}
              <div className="mt-6">
                <h3 className="font-medium mb-2">Select Order Type</h3>
                <RadioGroup value={orderType} onValueChange={(value) => setOrderType(value as 'delivery' | 'pickup' | 'dine-in')} className="flex space-x-4">
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
        )}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu Categories */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-medium text-lg mb-4">Menu</h3>
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
            <Tabs value={activeCategory || ""} onValueChange={setActiveCategory}>
              <TabsList className="hidden">
                {menuCategories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              {menuCategories.map((category) => (
                <TabsContent key={category} value={category}>
                  <h2 className="text-xl font-semibold mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems
                      .filter((item: any) => (item.category || 'Other') === category)
                      .map((item: any) => (
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
                                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
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
