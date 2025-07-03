import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DealershipManagement from './DealershipManagement';
import VehicleManagement from './VehicleManagement';
import UserManagement from './UserManagement';
import FrameManagement from './FrameManagement';
import DeliveryReports from './DeliveryReports';

const OEMDashboard = ({ user, onLogout }) => {
  console.log('Rendering OEM Dashboard');
  const [activeTab, setActiveTab] = useState('dealerships');

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
              <h1 className="text-xl font-semibold text-gray-900">Honda OEM Admin</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">OEM Dashboard</h2>
          <p className="text-gray-600">Manage dealerships, vehicles, frames, and view delivery reports</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-12 items-center justify-center bg-muted p-1 text-muted-foreground rounded-lg">
            <TabsTrigger value="dealerships" className="px-4 py-2">Dealerships</TabsTrigger>
            <TabsTrigger value="vehicles" className="px-4 py-2">Vehicles</TabsTrigger>
            <TabsTrigger value="users" className="px-4 py-2">Users</TabsTrigger>
            <TabsTrigger value="frames" className="px-4 py-2">Frames</TabsTrigger>
            <TabsTrigger value="reports" className="px-4 py-2">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dealerships">
            <DealershipManagement />
          </TabsContent>

          <TabsContent value="vehicles">
            <VehicleManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="frames">
            <FrameManagement userRole="oem_admin" />
          </TabsContent>

          <TabsContent value="reports">
            <DeliveryReports userRole="oem_admin" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OEMDashboard;