
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/contexts/CartContext';

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  taxes: number;
  totalPayable: number;
  orderType: string;
  paymentMethod: string;
  showUpiVerification: boolean;
  showQrCode: boolean;
  isSubmitting: boolean;
  handleVerifyUpi: () => void;
  handleSubmitOrder: () => void;
}

const OrderSummary = ({
  cartItems,
  totalAmount,
  deliveryFee,
  taxes,
  totalPayable,
  orderType,
  paymentMethod,
  showUpiVerification,
  showQrCode,
  isSubmitting,
  handleVerifyUpi,
  handleSubmitOrder
}: OrderSummaryProps) => {
  return (
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
        {(paymentMethod === 'UPI' && showUpiVerification) || (paymentMethod === 'QR' && showQrCode) ? (
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
  );
};

export default OrderSummary;
