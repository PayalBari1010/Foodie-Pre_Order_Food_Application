
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import { MapPin, ShoppingCart, User, Bell, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerHeaderProps {
  onSearch?: (query: string) => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ onSearch }) => {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart, totalItems, totalAmount } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your order has been confirmed", time: "5 mins ago" },
    { id: 2, text: "Special offer: 20% off on your next order", time: "2 hours ago" },
  ]);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <Logo size="sm" showText={true} />
            </Link>
          </div>
          
          <div className="hidden md:flex flex-1 mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg relative">
              <Input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Button 
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 px-3 text-xs bg-food-orange hover:bg-food-orange/90"
              >
                Search
              </Button>
            </form>
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
                      
                      <div className="space-y-4 mb-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b pb-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                              {item.isAvailable === false && (
                                <p className="text-xs text-red-500">Currently unavailable</p>
                              )}
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
                                disabled={item.isAvailable === false}
                              >
                                +
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 ml-2 text-red-500"
                                onClick={() => removeFromCart(item.id)}
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
                          <Button 
                            className="w-full bg-food-orange hover:bg-food-orange/90"
                            onClick={() => {
                              navigate('/checkout');
                            }}
                          >
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
                <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
