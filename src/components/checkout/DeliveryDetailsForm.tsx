
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

interface DeliveryDetailsFormProps {
  orderType: 'delivery' | 'pickup' | 'dine-in';
  deliveryAddress: string;
  setDeliveryAddress: (value: string) => void;
  tableNumber: string;
  setTableNumber: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

const DeliveryDetailsForm = ({
  orderType,
  deliveryAddress,
  setDeliveryAddress,
  tableNumber,
  setTableNumber,
  phoneNumber,
  setPhoneNumber,
  notes,
  setNotes
}: DeliveryDetailsFormProps) => {
  return (
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
  );
};

export default DeliveryDetailsForm;
