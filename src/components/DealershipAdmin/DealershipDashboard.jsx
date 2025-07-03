import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleView from './VehicleView';
import UserManagement from './UserManagement';
import FrameManagement from '../OEMAdmin/FrameManagement';
import DeliveryReports from '../OEMAdmin/DeliveryReports';
import Gallery from '../ui/Gallery';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DealershipDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('vehicles');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {dealershipName ? `${dealershipName} - Honda Dealership` : 'Honda Dealership Admin'}
                </h1>
                {dealershipName && (
                  <p className="text-sm text-gray-500">Dealership Administration Portal</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-600 block">Welcome, {user.name}</span>
                {dealershipName && (
                  <span className="text-xs text-gray-500">{dealershipName}</span>
                )}
              </div>
              <Button variant="outline" onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {dealershipName ? `${dealershipName} Dashboard` : 'Dealership Dashboard'}
          </h2>
          <p className="text-gray-600">
            {dealershipName 
              ? `Manage ${dealershipName}'s vehicles, operators, frames, and delivery history` 
              : 'Manage your dealership\'s vehicles, frames, and view delivery history'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-12 items-center justify-center bg-muted p-1 text-muted-foreground rounded-lg">
            <TabsTrigger value="vehicles" className="px-4 py-2">Vehicles</TabsTrigger>
            <TabsTrigger value="operators" className="px-4 py-2">Operators</TabsTrigger>
            <TabsTrigger value="frames" className="px-4 py-2">Frames</TabsTrigger>
            <TabsTrigger value="deliveries" className="px-4 py-2">Deliveries</TabsTrigger>
            <TabsTrigger value="gallery" className="px-4 py-2">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleView dealershipId={user.dealership_id} />
          </TabsContent>

          <TabsContent value="operators">
            <UserManagement dealershipId={user.dealership_id} />
          </TabsContent>

          <TabsContent value="frames">
            <FrameManagement userRole="dealership_admin" dealershipId={user.dealership_id} />
          </TabsContent>

          <TabsContent value="deliveries">
            <DeliveryReports userRole="dealership_admin" dealershipId={user.dealership_id} />
          </TabsContent>

          <TabsContent value="gallery">
            <Gallery userRole="dealership_admin" dealershipId={user.dealership_id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DealershipDashboard;