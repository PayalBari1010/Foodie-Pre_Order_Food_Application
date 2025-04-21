
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  isAvailable?: boolean;
  orderType?: 'delivery' | 'pickup' | 'dine-in';
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart:", error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (item: CartItem) => {
    // Check if we're trying to add from a different restaurant
    if (cartItems.length > 0 && cartItems[0].restaurantId !== item.restaurantId) {
      if (window.confirm("Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?")) {
        setCartItems([{ ...item, quantity: 1 }]);
        toast({
          title: "Cart cleared",
          description: `Added ${item.name} to your cart`,
        });
      }
      return;
    }
    
    // Check if the item is already in the cart
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += 1;
      // Update orderType if it changed
      if (item.orderType && updatedItems[existingItemIndex].orderType !== item.orderType) {
        updatedItems[existingItemIndex].orderType = item.orderType;
      }
      setCartItems(updatedItems);
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    
    toast({
      title: "Item added to cart",
      description: `${item.name} added to your cart`,
    });
  };
  
  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
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
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        increaseQuantity, 
        decreaseQuantity, 
        clearCart,
        totalItems,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
