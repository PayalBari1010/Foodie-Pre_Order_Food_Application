
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '../Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AuthFormProps {
  role: 'customer' | 'owner';
  onSuccess: () => void;
  onRoleChange: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ role, onSuccess, onRoleChange }) => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [signupEmail, setSignupEmail] = useState<string>('');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  
  // Signup form state for both roles
  const [fullName, setFullName] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      toast({
        title: "Login successful!",
        description: `You're now logged in as a ${role}`,
      });
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if it's an email verification error
      if (error.message?.includes("Email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your email and click the verification link before logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signUp(signupEmail, signupPassword, role, fullName);
      setVerificationSent(true);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
        duration: 6000,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-food-gray">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex flex-col items-center mb-6">
          <Logo size="md" showText={true} />
          <h2 className="mt-4 text-2xl font-bold text-center">
            {role === 'customer' ? 'Customer' : 'Restaurant Owner'} Portal
          </h2>
        </div>
        
        <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                style={{ backgroundColor: role === 'customer' ? '#FF5A1F' : '#D70F64' }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              
              <div className="text-center mt-2">
                <p className="text-sm text-gray-600">
                  Having trouble logging in? Make sure you've verified your email.
                </p>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            {verificationSent ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle className="text-green-500 h-12 w-12 mb-2" />
                </div>
                <h3 className="text-xl font-semibold">Verification Email Sent!</h3>
                <p className="text-gray-600">
                  We've sent a verification link to <strong>{signupEmail}</strong>
                </p>
                <p className="text-gray-600">
                  Please check your inbox and click the link to activate your account.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Can't find the email? Check your spam folder or try signing up again.
                </p>
                <div className="pt-4">
                  <Button 
                    variant="outline"
                    className="mr-2"
                    onClick={() => setVerificationSent(false)}
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={() => setActiveTab('login')}
                    style={{ backgroundColor: role === 'customer' ? '#FF5A1F' : '#D70F64' }}
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input 
                    id="signupEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input 
                    id="mobile"
                    placeholder="+91 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input 
                    id="signupPassword"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2 text-sm">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-700">
                    After signup, you'll receive a verification email. Click the link in that email to activate your account.
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                  style={{ backgroundColor: role === 'customer' ? '#FF5A1F' : '#D70F64' }}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {role === 'customer' ? 'Are you a restaurant owner?' : 'Are you a customer?'}
          </p>
          <Button 
            variant="link" 
            onClick={onRoleChange}
            className={role === 'customer' ? 'text-food-red' : 'text-food-orange'}
          >
            Switch to {role === 'customer' ? 'Restaurant Owner' : 'Customer'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthForm;
