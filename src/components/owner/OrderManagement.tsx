import React, { useState, useEffect } from 'react';
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
import { Clock, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId?: string;
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
  table_number?: string | null;
}

const OrderManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      getRestaurantId();
    }
  }, [user]);
  
  useEffect(() => {
    if (restaurantId) {
      fetchOrders();
      setupOrdersSubscription();
    }
  }, [restaurantId]);
  
  const getRestaurantId = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user?.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setRestaurantId(data.id);
      }
    } catch (error) {
      console.error('Error fetching restaurant ID:', error);
      toast({
        title: "Error",
        description: "Could not find your restaurant. Please set up your restaurant first.",
        variant: "destructive",
      });
    }
  };
  
  const setupOrdersSubscription = () => {
    if (!restaurantId) return;
    
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Order change detected:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              handleNewOrder(payload.new);
              break;
            case 'UPDATE':
              handleOrderUpdate(payload.new);
              break;
            case 'DELETE':
              handleOrderDelete(payload.old);
              break;
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  };
  
  const parseOrderItems = (items: any): OrderItem[] => {
    if (Array.isArray(items) && items.length > 0 && typeof items[0] === 'object' && 'name' in items[0]) {
      return items as OrderItem[];
    }
    
    if (typeof items === 'string') {
      try {
        const parsedItems = JSON.parse(items);
        if (Array.isArray(parsedItems)) {
          return parsedItems as OrderItem[];
        }
      } catch (e) {
        console.error('Failed to parse order items:', e);
      }
    }
    
    return [];
  };
  
  const handleNewOrder = (newOrderData: any) => {
    try {
      const orderItems = parseOrderItems(newOrderData.items);
      
      const formattedOrder: Order = {
        id: newOrderData.id,
        customerName: newOrderData.user_name || 'Customer',
        customerMobile: newOrderData.mobile_number || 'Not provided',
        items: orderItems,
        total: newOrderData.total_amount || 0,
        status: (newOrderData.status || 'pending') as Order['status'],
        orderType: (newOrderData.type || 'pickup') as Order['orderType'],
        scheduledTime: newOrderData.scheduled_time || new Date().toISOString(),
        paymentMethod: (newOrderData.payment_method || 'cod') as Order['paymentMethod'],
        paymentStatus: (newOrderData.payment_status || 'pending') as Order['paymentStatus'],
        createdAt: newOrderData.created_at || new Date().toISOString(),
        table_number: newOrderData.table_number ?? null,
      };
      
      setOrders(prevOrders => {
        if (prevOrders.some(order => order.id === formattedOrder.id)) {
          return prevOrders;
        }
        return [formattedOrder, ...prevOrders];
      });
      
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.error('Could not play notification sound:', e));
      
      toast({
        title: "New Order Received!",
        description: `New ${formattedOrder.orderType} order from ${formattedOrder.customerName}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error processing new order:', error);
    }
  };
  
  const handleOrderUpdate = (updatedOrderData: any) => {
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === updatedOrderData.id 
            ? {
                ...order,
                status: updatedOrderData.status || order.status,
                paymentStatus: updatedOrderData.payment_status || order.paymentStatus,
              } 
            : order
        )
      );
    } catch (error) {
      console.error('Error handling order update:', error);
    }
  };
  
  const handleOrderDelete = (deletedOrderData: any) => {
    try {
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== deletedOrderData.id)
      );
    } catch (error) {
      console.error('Error handling order deletion:', error);
    }
  };
  
  const fetchOrders = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const formattedOrders: Order[] = data.map(order => {
          const orderItems = parseOrderItems(order.items);
          
          return {
            id: order.id,
            customerName: order.user_name || 'Customer',
            customerMobile: order.mobile_number || 'Not provided',
            items: orderItems,
            total: order.total_amount || 0,
            status: (order.status || 'pending') as Order['status'],
            orderType: (order.type || 'pickup') as Order['orderType'],
            scheduledTime: order.scheduled_time || new Date().toISOString(),
            paymentMethod: (order.payment_method || 'cod') as Order['paymentMethod'],
            paymentStatus: (order.payment_status || 'pending') as Order['paymentStatus'],
            createdAt: order.created_at || new Date().toISOString(),
            table_number: order.table_number ?? null,
          };
        });
        
        setOrders(formattedOrders);
      } else {
        setOrders([
          {
            id: 'ORD001',
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
            table_number: '5',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error fetching orders",
        description: "Failed to fetch orders. Using sample data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
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
  
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast({
        title: "Order status updated",
        description: `Order #${orderId.substring(0, 8)} is now ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Failed to update status",
        description: "There was an error updating the order status",
        variant: "destructive",
      });
    }
  };
  
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <Button 
          onClick={fetchOrders} 
          variant="outline" 
          className="gap-2"
          disabled={loading}
        >
          <Bell className="h-4 w-4" />
          Refresh Orders
        </Button>
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
          {loading ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
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
                          Order #{order.id.substring(0, 8)}
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
                    <div className="space-y-4">
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
                      
                      {order.orderType === 'dine-in' && order.table_number && (
                        <div className="mt-2 bg-gray-50 p-3 rounded-md text-sm">
                          <p className="font-medium">Table Number: <span className="text-gray-600">{order.table_number}</span></p>
                        </div>
                      )}
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
