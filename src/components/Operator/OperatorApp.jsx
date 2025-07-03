import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VehicleList from './VehicleList';
import PhotoCapture from './PhotoCapture';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const OperatorApp = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('vehicles');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [dealershipName, setDealershipName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDealershipName();
  }, [user.dealership_id]);

  const fetchDealershipName = async () => {
    if (!user.dealership_id) return;
    
    try {
      const { data, error } = await supabase
        .from('dealerships')
        .select('name')
        .eq('id', user.dealership_id)
        .single();

      if (error) throw error;
      setDealershipName(data?.name || '');
    } catch (error) {
      console.error('Failed to fetch dealership name:', error);
      toast({
        title: "Warning",
        description: "Could not load dealership information",
        variant: "destructive",
      });
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentView('photo');
  };

  const handleBackToVehicles = () => {
    setCurrentView('vehicles');
    setSelectedVehicle(null);
  };

  const handleDeliveryComplete = () => {
    setCurrentView('vehicles');
    setSelectedVehicle(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {currentView === 'photo' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToVehicles}
                  className="mr-2 p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentView === 'vehicles' 
                    ? (dealershipName ? `${dealershipName} - Honda Delivery` : 'Honda Delivery') 
                    : `Honda ${selectedVehicle?.model}`
                  }
                </h1>
                {currentView === 'photo' && selectedVehicle && (
                  <p className="text-sm text-gray-600">
                    {selectedVehicle.variant} • {selectedVehicle.color}
                  </p>
                )}
                {currentView === 'vehicles' && dealershipName && (
                  <p className="text-xs text-gray-500">{dealershipName}</p>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-container min-h-screen pb-20">
        {currentView === 'vehicles' && (
          <div className="space-y-6">
            {/* Operator Info */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Welcome, {user.name}</h2>
                  <Badge variant="outline">Operator</Badge>
                </div>
              </CardContent>
            </Card>

            <VehicleList 
              dealershipId={user.dealership_id} 
              onVehicleSelect={handleVehicleSelect}
            />
          </div>
        )}

        {currentView === 'photo' && selectedVehicle && (
          <PhotoCapture 
            vehicle={selectedVehicle}
            operator={user}
            onComplete={handleDeliveryComplete}
            onBack={handleBackToVehicles}
          />
        )}
      </main>
    </div>
  );
};

export default OperatorApp;