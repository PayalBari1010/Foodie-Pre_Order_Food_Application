
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const PaymentSection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [upiId, setUpiId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 999,
      period: 'monthly',
      features: [
        'List up to 50 menu items',
        'Basic analytics',
        '5% platform fee per order',
        'Email support',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 2499,
      period: 'monthly',
      features: [
        'Unlimited menu items',
        'Advanced analytics and insights',
        '3% platform fee per order',
        'Priority email & phone support',
        'Featured restaurant placement',
      ],
    },
    {
      id: 'annual',
      name: 'Annual Plan',
      price: 9999,
      period: 'yearly',
      features: [
        'All Premium features',
        '2% platform fee per order',
        'Dedicated account manager',
        '2 months free (compared to monthly)',
      ],
    },
  ];
  
  const handlePayment = () => {
    if (paymentMethod === 'upi' && !upiId) {
      toast({
        title: "UPI ID required",
        description: "Please enter your UPI ID to proceed with payment",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment successful!",
        description: `Your ${selectedPlan} plan is now active`,
      });
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Restaurant Subscription</h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Current Subscription</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium">Basic Plan</p>
            <p className="text-gray-500">Expires on: April 30, 2025</p>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Choose a Plan</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`cursor-pointer hover:shadow-lg transition-all ${
              selectedPlan === plan.id ? 'ring-2 ring-food-orange' : ''
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                ₹{plan.price.toLocaleString()}/{plan.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={selectedPlan === plan.id ? "default" : "outline"} 
                className="w-full"
                onClick={() => setSelectedPlan(plan.id)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <RadioGroup 
            defaultValue="upi" 
            className="space-y-4"
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="font-medium">UPI</Label>
            </div>
            
            {paymentMethod === 'upi' && (
              <div className="pl-6 pt-2">
                <Label htmlFor="upiId" className="text-sm mb-2 block">Enter UPI ID</Label>
                <Input 
                  id="upiId" 
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="max-w-md"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="font-medium">Credit/Debit Card</Label>
            </div>
            
            {paymentMethod === 'card' && (
              <div className="pl-6 pt-2">
                <p className="text-sm text-gray-600">Card payment will be available soon.</p>
              </div>
            )}
          </RadioGroup>
        </CardContent>
      </Card>
      
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Selected Plan</span>
          <span>
            {plans.find(plan => plan.id === selectedPlan)?.name}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Amount</span>
          <span>
            ₹{plans.find(plan => plan.id === selectedPlan)?.price.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">GST (18%)</span>
          <span>
            ₹{Math.round(plans.find(plan => plan.id === selectedPlan)?.price * 0.18).toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-semibold text-lg">
            ₹{Math.round(plans.find(plan => plan.id === selectedPlan)?.price * 1.18).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="bg-food-orange hover:bg-food-orange/90 min-w-[180px]"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Make Payment'}
        </Button>
      </div>
    </div>
  );
};

// Add the Badge component since it's used in the PaymentSection
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
};

export default PaymentSection;
