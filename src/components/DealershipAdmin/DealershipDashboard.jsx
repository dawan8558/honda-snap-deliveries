import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VehicleView from './VehicleView';
import FrameManagement from '../OEMAdmin/FrameManagement';
import DeliveryReports from '../OEMAdmin/DeliveryReports';

const DealershipDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('vehicles');

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
              <h1 className="text-xl font-semibold text-gray-900">Honda Dealership Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dealership Dashboard</h2>
          <p className="text-gray-600">Manage your dealership's vehicles, frames, and view delivery history</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-xl">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="frames">Frames</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleView dealershipId={user.dealership_id} />
          </TabsContent>

          <TabsContent value="frames">
            <FrameManagement userRole="dealership_admin" dealershipId={user.dealership_id} />
          </TabsContent>

          <TabsContent value="deliveries">
            <DeliveryReports userRole="dealership_admin" dealershipId={user.dealership_id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DealershipDashboard;