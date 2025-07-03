import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./components/Auth/Login";
import OEMDashboard from "./components/OEMAdmin/OEMDashboard";
import DealershipDashboard from "./components/DealershipAdmin/DealershipDashboard";
import OperatorApp from "./components/Operator/OperatorApp";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('honda_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('honda_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('honda_user');
  };

  if (loading) {
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
    if (!user) {
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