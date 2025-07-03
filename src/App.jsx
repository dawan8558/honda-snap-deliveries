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
import { LoadingPage } from "./components/ui/loading";

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

    // Simple, fast auth state handler - no blocking operations
    const handleAuthState = (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Clear timeout since we got a response
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      setAuthInitialized(true);

      // Fetch profile in background - don't block auth flow
      if (session?.user && mounted) {
        fetchUserProfile(session.user);
      }
    };

    // Non-blocking profile fetch
    const fetchUserProfile = async (user) => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (mounted && profile && !error) {
          console.log('Profile fetched, updating user data');
          setUser(prevUser => ({
            ...prevUser,
            ...profile
          }));
        }
      } catch (error) {
        console.log('Profile fetch failed (non-critical):', error.message);
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthState);

    // Fast initial session check
    const initializeAuth = async () => {
      try {
        console.log('Quick session check...');
        
        // Set a much shorter timeout for initial check
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        );

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        if (mounted) {
          if (error) {
            console.error('Session check error:', error);
          }
          
          // Always initialize quickly, let auth listener handle the rest
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
          setAuthInitialized(true);

          // Fetch profile in background if we have a user
          if (session?.user) {
            fetchUserProfile(session.user);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed or timed out:', error);
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Much shorter fallback timeout - 3 seconds max
    timeoutId = setTimeout(() => {
      console.log('Auth timeout - forcing app to load without auth');
      if (mounted && !authInitialized) {
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 3000);

    // Start initialization
    initializeAuth();

    return () => {
      console.log('Cleaning up auth listener');
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription?.unsubscribe?.();
    };
  }, []); // Remove authInitialized dependency to prevent re-runs

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
    return <LoadingPage message="Checking authentication..." />;
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