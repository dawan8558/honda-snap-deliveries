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
  const [profileLoading, setProfileLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    console.log('Setting up auth listener...');

    // Critical profile fetch with proper loading states
    const fetchUserProfile = async (authUser) => {
      if (!mounted) return;
      
      console.log('Fetching profile for user:', authUser.id);
      setProfileLoading(true);
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Profile fetch error:', error);
          setProfileLoading(false);
          return;
        }
        
        if (profile) {
          console.log('Profile fetched successfully:', { role: profile.role, dealership_id: profile.dealership_id });
          setUser({
            ...authUser,
            ...profile
          });
        } else {
          console.warn('No profile found for user:', authUser.id);
          setUser(authUser);
        }
        
        setProfileLoading(false);
      } catch (error) {
        console.error('Profile fetch failed:', error.message);
        if (mounted) {
          setUser(authUser);
          setProfileLoading(false);
        }
      }
    };

    // Improved auth state handler
    const handleAuthState = async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      
      if (session?.user) {
        // Wait for profile fetch to complete before setting loading to false
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setProfileLoading(false);
      }
      
      setLoading(false);
      setAuthInitialized(true);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthState);

    // Improved initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Session check error:', error);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          // Wait for profile fetch to complete during initialization
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setProfileLoading(false);
        }
        
        setLoading(false);
        setAuthInitialized(true);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        if (mounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Start initialization
    initializeAuth();

    return () => {
      console.log('Cleaning up auth listener');
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

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
    console.log('ProtectedRoute check:', { 
      user: user?.id, 
      userRole: user?.role, 
      allowedRoles, 
      profileLoading 
    });
    
    // Wait for profile loading to complete before making routing decisions
    if (profileLoading) {
      console.log('Profile still loading, showing loading state');
      return <LoadingPage message="Loading user profile..." />;
    }
    
    if (!user) {
      console.log('No user, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    // Check if user has a role (profile was loaded successfully)
    if (!user.role) {
      console.log('User has no role, profile may not be loaded');
      return <LoadingPage message="Loading user permissions..." />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      console.log('User role not allowed:', { userRole: user.role, allowedRoles });
      return <Navigate to="/unauthorized" replace />;
    }
    
    console.log('Access granted for user:', user.role);
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