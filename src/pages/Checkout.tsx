
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerHeader from '@/components/customer/CustomerHeader';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import DeliveryDetailsForm from '@/components/checkout/DeliveryDetailsForm';
import PaymentMethodForm from '@/components/checkout/PaymentMethodForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import QRCodeDialog from '@/components/checkout/QRCodeDialog';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD' | 'QR'>('COD');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpiVerification, setShowUpiVerification] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  
  const orderType = cartItems.length > 0 ? cartItems[0].orderType || 'delivery' : 'delivery';
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const taxes = totalAmount * 0.05;
  const totalPayable = totalAmount + deliveryFee + taxes;
  
  const userLocationCity = "Nashik";

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
    
    if (paymentMethod === 'QR' && !showQrCode) {
      setShowQrCode(true);
      return;
    }
    
    if (paymentMethod === 'QR' && showQrCode && !upiTransactionId) {
      toast({
        title: "Payment verification required",
        description: "Please complete the payment via QR code and enter the transaction ID",
        variant: "destructive",
      });
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
          payment_status: (paymentMethod === 'UPI' || paymentMethod === 'QR') ? 'completed' : 'pending',
          mobile_number: phoneNumber,
          user_name: user.user_metadata?.full_name || 'Customer',
          upi_id: paymentMethod === 'UPI' ? upiId : null,
          upi_transaction_id: (paymentMethod === 'UPI' || paymentMethod === 'QR') ? upiTransactionId : null,
          scheduled_time: new Date(Date.now() + 30 * 60000).toISOString(),
          type: orderType,
          status: 'pending',
          delivery_address: orderType === 'delivery' ? deliveryAddress : null,
          table_number: orderType === 'dine-in' ? tableNumber : null,
          notes: notes || null,
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Order placed successfully!",
        description: "Your order has been sent to the restaurant",
        duration: 5000,
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
            <DeliveryDetailsForm 
              orderType={orderType}
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              notes={notes}
              setNotes={setNotes}
            />
            
            <PaymentMethodForm 
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              showUpiVerification={showUpiVerification}
              upiId={upiId}
              setUpiId={setUpiId}
              upiTransactionId={upiTransactionId}
              setUpiTransactionId={setUpiTransactionId}
              handleVerifyUpi={handleVerifyUpi}
              orderType={orderType}
              totalPayable={totalPayable}
              restaurantName={cartItems[0].restaurantName}
            />
          </div>
          
          <div>
            <OrderSummary 
              cartItems={cartItems}
              totalAmount={totalAmount}
              deliveryFee={deliveryFee}
              taxes={taxes}
              totalPayable={totalPayable}
              orderType={orderType}
              paymentMethod={paymentMethod}
              showUpiVerification={showUpiVerification}
              showQrCode={showQrCode}
              isSubmitting={isSubmitting}
              handleVerifyUpi={handleVerifyUpi}
              handleSubmitOrder={handleSubmitOrder}
            />
          </div>
        </div>
      </div>
      
      <QRCodeDialog 
        open={showQrCode && paymentMethod === 'QR'}
        onOpenChange={setShowQrCode}
      />
    </div>
  );
};

export default Checkout;
