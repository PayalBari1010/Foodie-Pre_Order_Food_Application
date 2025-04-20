
import React, { useState } from 'react';
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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Paneer Butter Masala',
      description: 'Creamy paneer curry with rich tomato gravy and butter.',
      price: 249,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDZ8fGluZGlhbiUyMGZvb2R8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Masala Dosa',
      description: 'Crispy rice crepe filled with spiced potato filling.',
      price: 149,
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fGRvc2F8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice cooked with marinated chicken and aromatic spices.',
      price: 299,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmlyeWFuaXxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      isAvailable: false,
    },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true,
  });
  
  const categories = [
    'Breakfast', 
    'Starters', 
    'Main Course', 
    'Desserts', 
    'Beverages'
  ];
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      isAvailable: true,
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
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      isAvailable: item.isAvailable,
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      description: "Menu item has been removed successfully",
    });
  };
  
  const handleAvailabilityToggle = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
    
    const item = menuItems.find(item => item.id === id);
    toast({
      title: `Item ${item?.isAvailable ? 'unavailable' : 'available'}`,
      description: `${item?.name} is now ${item?.isAvailable ? 'unavailable' : 'available'} for ordering`,
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isAvailable: checked }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing && currentItem) {
      // Update existing item
      setMenuItems(menuItems.map(item => 
        item.id === currentItem.id ? {
          ...item,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image: formData.image || item.image,
          isAvailable: formData.isAvailable,
        } : item
      ));
      
      toast({
        title: "Item updated",
        description: `${formData.name} has been updated successfully`,
      });
    } else {
      // Add new item
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500',
        isAvailable: formData.isAvailable,
      };
      
      setMenuItems([...menuItems, newItem]);
      
      toast({
        title: "Item added",
        description: `${formData.name} has been added to your menu`,
      });
    }
    
    handleDialogClose();
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
                <Label htmlFor="image">Image URL</Label>
                <Input 
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="Paste image URL here..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="availability" 
                  checked={formData.isAvailable}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-75' : ''}`}>
            <div className="h-48 w-full overflow-hidden">
              <img 
                src={item.image} 
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
                    checked={item.isAvailable}
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
                  {item.isAvailable ? 'Available' : 'Unavailable'}
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
      </div>
      
      {menuItems.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No menu items found. Add your first dish!</p>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
