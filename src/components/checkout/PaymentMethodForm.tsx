
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CreditCard, Banknote, QrCode } from 'lucide-react';

interface PaymentMethodFormProps {
  paymentMethod: 'UPI' | 'COD' | 'QR';
  setPaymentMethod: (value: 'UPI' | 'COD' | 'QR') => void;
  showUpiVerification: boolean;
  upiId: string;
  setUpiId: (value: string) => void;
  upiTransactionId: string;
  setUpiTransactionId: (value: string) => void;
  handleVerifyUpi: () => void;
  orderType: string;
  totalPayable: number;
  restaurantName: string;
}

const PaymentMethodForm = ({
  paymentMethod,
  setPaymentMethod,
  showUpiVerification,
  upiId,
  setUpiId,
  upiTransactionId,
  setUpiTransactionId,
  handleVerifyUpi,
  orderType,
  totalPayable,
  restaurantName
}: PaymentMethodFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'UPI' | 'COD' | 'QR')}>
          <div className="flex items-center space-x-2 border rounded-md p-4 mb-3">
            <RadioGroupItem value="UPI" id="upi" />
            <Label htmlFor="upi" className="flex items-center font-medium cursor-pointer">
              <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
              UPI Payment
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border rounded-md p-4 mb-3">
            <RadioGroupItem value="QR" id="qr" />
            <Label htmlFor="qr" className="flex items-center font-medium cursor-pointer">
              <QrCode className="mr-2 h-5 w-5 text-purple-500" />
              QR Code Payment
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
              Please make a payment of ₹{totalPayable.toFixed(2)} to {restaurantName} 
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
  );
};

export default PaymentMethodForm;
