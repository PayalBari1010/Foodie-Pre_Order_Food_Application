import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '@/components/customer/CustomerHeader';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Banknote, ArrowLeft, MapPin } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('COD');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpiVerification, setShowUpiVerification] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  
  const orderType = cartItems.length > 0 ? cartItems[0].orderType || 'delivery' : 'delivery';
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const taxes = totalAmount * 0.05;
  const totalPayable = totalAmount + deliveryFee + taxes;
  
  const restaurantAddress = cartItems.length > 0 ? cartItems[0].restaurantName : "";
  const userLocationCity = "Nashik";

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to place an order",
        variant: "destructive",
      });
      return;
    }
    
    if (orderType === 'delivery' && !deliveryAddress) {
      toast({
        title: "Delivery address required",
        description: "Please provide a delivery address",
        variant: "destructive",
      });
      return;
    }
    
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please provide a contact number",
        variant: "destructive",
      });
      return;
    }
    
    if (orderType === 'dine-in' && !tableNumber) {
      toast({
        title: "Table number required",
        description: "Please provide your table number",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === 'UPI' && !upiId) {
      toast({
        title: "UPI ID required",
        description: "Please provide your UPI ID",
        variant: "destructive",
      });
      return;
    }
    
    if (paymentMethod === 'UPI' && !showUpiVerification) {
      setShowUpiVerification(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const itemsForStorage = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        isAvailable: item.isAvailable
      }));
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: cartItems[0].restaurantId,
          items: itemsForStorage,
          total_amount: totalPayable,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'UPI' ? 'completed' : 'pending',
          mobile_number: phoneNumber,
          user_name: user.user_metadata?.full_name || 'Customer',
          upi_id: paymentMethod === 'UPI' ? upiId : null,
          upi_transaction_id: paymentMethod === 'UPI' ? upiTransactionId : null,
          scheduled_time: new Date(Date.now() + 30 * 60000).toISOString(),
          type: orderType,
          status: 'pending',
          delivery_address: orderType === 'delivery' ? deliveryAddress : null,
          table_number: orderType === 'dine-in' ? tableNumber : null,
          notes: notes || null,
        })
        .select();
      
      if (error) throw error;
      
      const notification = {
        order_id: data[0].id,
        restaurant_id: cartItems[0].restaurantId,
        message: `New ${orderType} order from ${user.user_metadata?.full_name || 'Customer'}`,
        created_at: new Date().toISOString(),
      };
      
      await supabase.channel('orders')
        .send({
          type: 'broadcast',
          event: 'new_order',
          payload: notification,
        });
        
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the restaurant",
      });
      
      clearCart();
      
      navigate('/');
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyUpi = () => {
    if (!upiTransactionId || upiTransactionId.length < 6) {
      toast({
        title: "Invalid transaction ID",
        description: "Please provide a valid transaction ID",
        variant: "destructive",
      });
      return;
    }
    
    handleSubmitOrder();
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomerHeader />
        <div className="container mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="mb-6 text-gray-500">Add some items to your cart before checkout</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-food-orange hover:bg-food-orange/90"
          >
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-food-orange">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold text-lg">Your Location: {userLocationCity}</span>
          </div>
          {cartItems.length > 0 && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>
                Restaurant: <span className="font-semibold">{cartItems[0].restaurantName}</span>
              </span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {orderType === 'delivery' 
                    ? 'Delivery Details' 
                    : orderType === 'pickup' 
                      ? 'Pickup Details' 
                      : 'Dine-in Details'
                  }
                </CardTitle>
                <CardDescription>
                  Order Type: {orderType.charAt(0).toUpperCase() + orderType.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderType === 'delivery' && (
                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                
                {orderType === 'dine-in' && (
                  <div>
                    <Label htmlFor="table">Table Number</Label>
                    <Input 
                      id="table" 
                      type="text" 
                      placeholder="Enter your table number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    placeholder={
                      orderType === 'delivery' 
                        ? "Any special instructions for delivery" 
                        : orderType === 'pickup' 
                          ? "Any special instructions for pickup" 
                          : "Any special requests for your table"
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'UPI' | 'COD')}>
                  <div className="flex items-center space-x-2 border rounded-md p-4 mb-3">
                    <RadioGroupItem value="UPI" id="upi" />
                    <Label htmlFor="upi" className="flex items-center font-medium cursor-pointer">
                      <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                      UPI Payment
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-4">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label htmlFor="cod" className="flex items-center font-medium cursor-pointer">
                      <Banknote className="mr-2 h-5 w-5 text-green-500" />
                      {orderType === 'delivery' ? 'Cash on Delivery' : 'Pay at Restaurant'}
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'UPI' && !showUpiVerification && (
                  <div className="mt-4 p-4 border rounded-md">
                    <Label htmlFor="upi-id">UPI ID</Label>
                    <Input 
                      id="upi-id" 
                      placeholder="Enter your UPI ID (e.g., name@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                
                {paymentMethod === 'UPI' && showUpiVerification && (
                  <div className="mt-4 p-4 border rounded-md">
                    <h3 className="font-medium mb-3">Verify UPI Payment</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Please make a payment of ₹{totalPayable.toFixed(2)} to {cartItems[0].restaurantName} 
                      and enter the UPI transaction ID below to complete your order.
                    </p>
                    
                    <Label htmlFor="upi-transaction">UPI Transaction ID</Label>
                    <InputOTP
                      value={upiTransactionId}
                      onChange={setUpiTransactionId}
                      maxLength={6}
                      className="mt-1"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                    
                    <Button 
                      onClick={handleVerifyUpi}
                      className="mt-4 w-full"
                    >
                      Verify Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {orderType.charAt(0).toUpperCase() + orderType.slice(1)} from {cartItems[0].restaurantName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} × {item.name}
                        {item.isAvailable === false && (
                          <span className="text-xs text-red-500 ml-1">(Unavailable)</span>
                        )}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>Taxes</span>
                      <span>₹{taxes.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {paymentMethod === 'UPI' && showUpiVerification ? (
                  <Button 
                    className="w-full bg-food-orange hover:bg-food-orange/90"
                    onClick={handleVerifyUpi}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Verify & Place Order'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-food-orange hover:bg-food-orange/90"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `${paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Pay'}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
