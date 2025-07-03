import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Login from "./components/Auth/Login";
import OEMDashboard from "./components/OEMAdmin/OEMDashboard";
import DealershipDashboard from "./components/DealershipAdmin/DealershipDashboard";
import OperatorApp from "./components/Operator/OperatorApp";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          try {
            // Fetch user profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            if (mounted) {
              setUser(session.user);
            }
          } else if (profile && mounted) {
            setUser({
              ...session.user,
              ...profile
            });
          } else if (mounted) {
            // No profile found, use session user data
            setUser(session.user);
          }
          } catch (error) {
            console.error('Profile fetch failed:', error);
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          if (mounted) setLoading(false);
        }
        // The auth state change listener will handle the session
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  if (loading) {
    console.log('App is in loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const renderUserInterface = () => {
    console.log('renderUserInterface called, user:', user);
    
    if (!user) {
      console.log('No user found, rendering Login component');
      return <Login onLogin={handleLogin} />;
    }

    switch (user.role) {
      case 'oem_admin':
        return <OEMDashboard user={user} onLogout={handleLogout} />;
      case 'dealership_admin':
        return <DealershipDashboard user={user} onLogout={handleLogout} />;
      case 'operator':
        return <OperatorApp user={user} onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {renderUserInterface()}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;