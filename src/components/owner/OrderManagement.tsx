
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Clock } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType: 'pickup' | 'dine-in';
  scheduledTime: string;
  paymentMethod: 'upi' | 'cod';
  paymentStatus: 'paid' | 'pending';
  createdAt: string;
}

const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      customerId: 'CUST001',
      customerName: 'Rahul Sharma',
      customerMobile: '+91 98765 43210',
      items: [
        { name: 'Paneer Butter Masala', quantity: 1, price: 249 },
        { name: 'Butter Naan', quantity: 2, price: 60 },
      ],
      total: 369,
      status: 'pending',
      orderType: 'pickup',
      scheduledTime: '2025-04-20T12:30:00Z',
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      createdAt: '2025-04-20T11:45:00Z',
    },
    {
      id: 'ORD002',
      customerId: 'CUST002',
      customerName: 'Priya Patel',
      customerMobile: '+91 87654 32109',
      items: [
        { name: 'Masala Dosa', quantity: 2, price: 298 },
        { name: 'Filter Coffee', quantity: 2, price: 80 },
      ],
      total: 378,
      status: 'preparing',
      orderType: 'dine-in',
      scheduledTime: '2025-04-20T13:00:00Z',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      createdAt: '2025-04-20T12:15:00Z',
    },
    {
      id: 'ORD003',
      customerId: 'CUST003',
      customerName: 'Amit Kumar',
      customerMobile: '+91 76543 21098',
      items: [
        { name: 'Chicken Biryani', quantity: 1, price: 299 },
        { name: 'Raita', quantity: 1, price: 49 },
      ],
      total: 348,
      status: 'completed',
      orderType: 'pickup',
      scheduledTime: '2025-04-20T11:00:00Z',
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      createdAt: '2025-04-20T10:30:00Z',
    },
  ]);
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const timeFromNow = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };
  
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast({
      title: "Order status updated",
      description: `Order #${orderId} is now ${newStatus}`,
    });
  };
  
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Management</h2>
      </div>
      
      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="preparing">Preparing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No {activeTab !== 'all' ? activeTab : ''} orders found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          Order #{order.id}
                          <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{timeFromNow(order.createdAt)}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerMobile}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Items</span>
                        <span className="font-medium">Amount</span>
                      </div>
                      
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>₹{order.total.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="outline" className="text-xs">
                          {order.orderType === 'pickup' ? 'Pickup' : 'Dine-in'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Scheduled: {formatTime(order.scheduledTime)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Payment: {order.paymentMethod.toUpperCase()}
                        </Badge>
                        <Badge className={`text-xs ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      </>
                    )}
                    
                    {order.status === 'preparing' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-purple-50 text-purple-600 hover:bg-purple-100"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        Mark as Ready
                      </Button>
                    )}
                    
                    {order.status === 'ready' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-green-50 text-green-600 hover:bg-green-100"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Complete Order
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default OrderManagement;
