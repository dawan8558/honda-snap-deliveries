import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Fetch user profile with enhanced error handling and profile creation
        let profile;
        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount <= maxRetries) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Profile fetch error during login:', profileError);
            
            // Retry on network errors
            if (retryCount < maxRetries && (profileError.message?.includes('network') || profileError.message?.includes('timeout'))) {
              retryCount++;
              console.log(`Retrying profile fetch (attempt ${retryCount})...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            
            throw new Error('Failed to load user profile. Please try again.');
          }

          profile = profileData;
          break;
        }

        // Create profile if it doesn't exist
        if (!profile) {
          console.log('No profile found, creating one...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email,
              email: data.user.email,
              role: 'operator', // Default role
              dealership_id: null // Will be assigned by admin
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create profile:', createError);
            throw new Error('Failed to create user profile. Please contact support.');
          }

          profile = newProfile;
          console.log('Profile created successfully:', profile);
        }

        // Validate profile completeness
        if (!profile.role) {
          console.warn('Profile missing role, updating...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'operator' })
            .eq('id', data.user.id);
          
          if (!updateError) {
            profile.role = 'operator';
          }
        }

        console.log('Login successful, profile loaded:', { role: profile.role, dealership_id: profile.dealership_id });
        
        onLogin({
          ...data.user,
          ...profile
        });

        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Account created! Please check your email for verification.",
        });
        setIsLogin(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-honda flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to Honda Delivery Photo App' : 'Join Honda Delivery Photo App'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              variant="honda"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;