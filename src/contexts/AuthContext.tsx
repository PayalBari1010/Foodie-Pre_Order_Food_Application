
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'customer' | 'owner' | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'customer' | 'owner', fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'customer' | 'owner' | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  // Helper function to determine user role
  const checkUserRole = async (userId: string) => {
    try {
      // Check if user is a restaurant owner
      const { data: ownerData } = await supabase
        .from('restaurant_owners')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (ownerData) {
        setUserRole('owner');
        // Set up real-time subscription for new orders for restaurant owners
        setupOrderNotifications(userId);
      } else {
        setUserRole('customer');
      }
    } catch (error) {
      console.error('Error determining user role:', error);
      setUserRole('customer'); // Default to customer if error occurs
    }
  };
  
  // Setup real-time order notifications for restaurant owners
  const setupOrderNotifications = (userId: string) => {
    try {
      // First get restaurant ID for this owner
      supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', userId)
        .single()
        .then(({ data: restaurant, error }) => {
          if (error) throw error;
          
          if (restaurant && restaurant.id) {
            // Subscribe to new orders for this restaurant
            const channel = supabase
              .channel('orders-notifications')
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'orders',
                  filter: `restaurant_id=eq.${restaurant.id}`,
                },
                (payload) => {
                  console.log('New order received:', payload);
                  const newOrder = payload.new as any;
                  
                  // Play notification sound
                  const audio = new Audio('/notification.mp3');
                  audio.play().catch(e => console.error('Could not play notification sound:', e));
                  
                  // Show toast notification
                  toast({
                    title: "New Order Received!",
                    description: `New ${newOrder.type} order from ${newOrder.user_name || 'Customer'}`,
                    duration: 10000,
                  });
                }
              )
              .subscribe();
              
            console.log('Order notification subscription established for restaurant:', restaurant.id);
          }
        });
    } catch (error) {
      console.error('Error setting up order notifications:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, role: 'customer' | 'owner', fullName: string) => {
    // Sign up without email verification
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    
    if (error) throw error;
    
    // Auto-sign in after signup to bypass verification
    if (data.user) {
      try {
        await signIn(email, password);
        toast({
          title: "Account created successfully",
          description: "You've been automatically logged in",
        });
      } catch (signInError) {
        console.error("Auto sign-in failed:", signInError);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
