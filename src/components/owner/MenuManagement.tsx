
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Edit, Trash, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
  restaurant_id: string;
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true,
  });
  
  const categories = [
    'Breakfast', 
    'Starters', 
    'Main Course', 
    'Desserts', 
    'Beverages'
  ];
  
  // Get restaurant id for logged-in owner
  useEffect(() => {
    if (user) {
      getRestaurantId();
    }
  }, [user]);
  
  // Fetch menu items when restaurant ID is available
  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
      // Set up real-time listener for menu changes
      setupMenuListener();
    }
  }, [restaurantId]);
  
  const getRestaurantId = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user?.id)
        .single();
      
      if (error) {
        throw error;
      }
      
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
  
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setMenuItems(data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error fetching menu",
        description: "Failed to load menu items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const setupMenuListener = () => {
    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'menu_items',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          console.log('Menu change detected:', payload);
          
          // Refresh the menu items
          fetchMenuItems();
          
          // Notify about the change
          toast({
            title: "Menu Updated",
            description: "The menu has been updated and is now visible to all customers.",
            duration: 3000,
          });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      is_available: true,
    });
    setIsEditing(false);
    setCurrentItem(null);
  };
  
  const handleDialogClose = () => {
    resetForm();
    setIsDialogOpen(false);
  };
  
  const handleEditItem = (item: MenuItem) => {
    setIsEditing(true);
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      image_url: item.image_url || '',
      is_available: item.is_available,
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setMenuItems(menuItems.filter(item => item.id !== id));
      toast({
        title: "Item deleted",
        description: "Menu item has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };
  
  const handleAvailabilityToggle = async (id: string) => {
    try {
      const item = menuItems.find(item => item.id === id);
      if (!item) return;
      
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update locally for immediate UI feedback
      setMenuItems(menuItems.map(item => 
        item.id === id ? { ...item, is_available: !item.is_available } : item
      ));
      
      toast({
        title: `Item ${item.is_available ? 'unavailable' : 'available'}`,
        description: `${item.name} is now ${item.is_available ? 'unavailable' : 'available'} for ordering`,
      });
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive",
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_available: checked }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!restaurantId) {
      toast({
        title: "Error",
        description: "Restaurant ID not found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500',
        is_available: formData.is_available,
        restaurant_id: restaurantId
      };
      
      if (isEditing && currentItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', currentItem.id);
          
        if (error) throw error;
        
        toast({
          title: "Item updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        // Add new item
        const { error } = await supabase
          .from('menu_items')
          .insert(menuItemData);
          
        if (error) throw error;
        
        toast({
          title: "Item added",
          description: `${formData.name} has been added to your menu`,
        });
      }
      
      handleDialogClose();
      // No need to fetch menu items here as the real-time listener will update the UI
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-food-orange hover:bg-food-orange/90">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dish Name*</Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Paneer Butter Masala"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your dish..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)*</Label>
                <Input 
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 249"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category*</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Paste image URL here..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="availability" 
                  checked={formData.is_available}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="availability">Available for ordering</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-food-orange hover:bg-food-orange/90">
                  {isEditing ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Loading menu items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${!item.is_available ? 'opacity-75' : ''}`}>
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500'} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                    <CardDescription className="text-food-orange font-semibold">
                      ₹{item.price.toFixed(2)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Switch 
                      checked={item.is_available}
                      onCheckedChange={() => handleAvailabilityToggle(item.id)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEditItem(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {menuItems.length === 0 && (
            <div className="col-span-3 bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No menu items found. Add your first dish!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
