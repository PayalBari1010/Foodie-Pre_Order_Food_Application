
import React, { useState } from 'react';
import Logo from '../Logo';
import { MapPin, ShoppingCart, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

const CustomerHeader: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'item1',
      name: 'Paneer Butter Masala',
      price: 249,
      quantity: 1,
      restaurantId: 'rest1',
      restaurantName: 'Tasty Delights',
    },
    {
      id: 'item2',
      name: 'Butter Naan',
      price: 30,
      quantity: 2,
      restaurantId: 'rest1',
      restaurantName: 'Tasty Delights',
    },
  ]);
  
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your order has been confirmed", time: "5 mins ago" },
    { id: 2, text: "Special offer: 20% off on your next order", time: "2 hours ago" },
  ]);
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const increaseQuantity = (itemId: string) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };
  
  const decreaseQuantity = (itemId: string) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    ));
  };
  
  const removeItem = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Logo size="sm" showText={true} />
          </div>
          
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-1 text-gray-600">
              <MapPin size={16} className="mr-1" />
              Bengaluru
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-food-orange rounded-full text-white text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="py-3">
                    <div>
                      <p className="font-medium">{notification.text}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && (
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <span className="text-food-orange text-sm">Mark all as read</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-food-orange rounded-full text-white text-xs flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-10">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-4 text-gray-500">Your cart is empty</p>
                      <Button className="mt-4 bg-food-orange hover:bg-food-orange/90">
                        Browse Restaurants
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="font-medium">{cartItems[0].restaurantName}</p>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b pb-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => decreaseQuantity(item.id)}
                              >
                                -
                              </Button>
                              <span className="mx-2 w-6 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => increaseQuantity(item.id)}
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 ml-2 text-red-500"
                                onClick={() => removeItem(item.id)}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Card className="bg-gray-50">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>₹40.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxes</span>
                              <span>₹{(totalAmount * 0.05).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                              <span>Total</span>
                              <span>₹{(totalAmount + 40 + totalAmount * 0.05).toFixed(2)}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full bg-food-orange hover:bg-food-orange/90">
                            Proceed to Checkout
                          </Button>
                        </CardFooter>
                      </Card>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Orders</DropdownMenuItem>
                <DropdownMenuItem>Addresses</DropdownMenuItem>
                <DropdownMenuItem>Favorites</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
