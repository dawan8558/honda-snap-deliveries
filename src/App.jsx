import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Login from "./components/Auth/Login";
import OEMDashboard from "./components/OEMAdmin/OEMDashboard";
import DealershipDashboard from "./components/DealershipAdmin/DealershipDashboard";
import OperatorApp from "./components/Operator/OperatorApp";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId;

    console.log('Setting up auth listener...');

    const handleAuthState = async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      setSession(session);
      
      if (session?.user) {
        console.log('User found, fetching profile...');
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (mounted) {
            if (error) {
              console.log('Profile fetch error, using basic user:', error.message);
              setUser(session.user);
            } else {
              console.log('Profile fetched successfully:', profile);
              setUser({
                ...session.user,
                ...profile
              });
            }
            setLoading(false);
            setAuthInitialized(true);
          }
        } catch (error) {
          console.log('Profile fetch failed, using basic user:', error.message);
          if (mounted) {
            setUser(session.user);
            setLoading(false);
            setAuthInitialized(true);
          }
        }
      } else {
        console.log('No session, clearing user');
        if (mounted) {
          setUser(null);
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthState);

    // Initial session check with timeout fallback
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          if (mounted && !authInitialized) {
            setLoading(false);
            setAuthInitialized(true);
          }
          return;
        }

        // If no session found, stop loading immediately
        if (!session) {
          console.log('No existing session found');
          if (mounted && !authInitialized) {
            setLoading(false);
            setAuthInitialized(true);
          }
        }
        // If session exists, handleAuthState will be called by the listener
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted && !authInitialized) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Fallback timeout - if nothing happens in 10 seconds, stop loading
    timeoutId = setTimeout(() => {
      console.log('Auth timeout - forcing app to load');
      if (mounted && !authInitialized) {
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 10000);

    initializeAuth();

    return () => {
      console.log('Cleaning up auth listener');
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [authInitialized]);

  const handleLogin = (userData) => {
    console.log('handleLogin called with:', userData);
    setUser(userData);
    setLoading(false);
    setAuthInitialized(true);
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  if (loading) {
    console.log('App is in loading state, loading value:', loading);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <p>Loading...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
  };

  const LoginRoute = () => {
    if (user) {
      // Redirect based on user role
      switch (user.role) {
        case 'oem_admin':
          return <Navigate to="/oem" replace />;
        case 'dealership_admin':
          return <Navigate to="/dealership" replace />;
        case 'operator':
          return <Navigate to="/operator" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
    return <Login onLogin={handleLogin} />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route 
                path="/oem/*" 
                element={
                  <ProtectedRoute allowedRoles={['oem_admin']}>
                    <OEMDashboard user={user} onLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dealership/*" 
                element={
                  <ProtectedRoute allowedRoles={['dealership_admin']}>
                    <DealershipDashboard user={user} onLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/operator/*" 
                element={
                  <ProtectedRoute allowedRoles={['operator']}>
                    <OperatorApp user={user} onLogout={handleLogout} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/unauthorized" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
                      <p className="text-muted-foreground">You don't have permission to access this page.</p>
                    </div>
                  </div>
                } 
              />
              <Route path="/" element={<Navigate to={user ? (
                user.role === 'oem_admin' ? '/oem' : 
                user.role === 'dealership_admin' ? '/dealership' : 
                '/operator'
              ) : '/login'} replace />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;