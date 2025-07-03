import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login - in real app this would use Supabase auth
      const mockUsers = {
        'admin@honda.com': { role: 'oem_admin', name: 'OEM Admin', dealership_id: null },
        'dealer@honda.com': { role: 'dealership_admin', name: 'Dealer Admin', dealership_id: 1 },
        'operator@honda.com': { role: 'operator', name: 'Operator', dealership_id: 1 }
      };

      const user = mockUsers[credentials.email];
      if (user && credentials.password === 'password') {
        onLogin(user);
        toast({
          title: "Login successful",
          description: `Welcome ${user.name}!`,
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <CardTitle className="text-2xl font-bold">Honda Delivery</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-xs text-muted-foreground text-center">
            <p>Demo credentials:</p>
            <p>OEM Admin: admin@honda.com / password</p>
            <p>Dealer Admin: dealer@honda.com / password</p>
            <p>Operator: operator@honda.com / password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;