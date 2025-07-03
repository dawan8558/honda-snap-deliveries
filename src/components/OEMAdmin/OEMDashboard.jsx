import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Car, Image, BarChart3, Users, ChevronDown } from 'lucide-react';
import DealershipManagement from './DealershipManagement';
import VehicleManagement from './VehicleManagement';
import FrameManagement from './FrameManagement';
import DeliveryReports from './DeliveryReports';

const OEMDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dealerships');

  const stats = [
    { label: 'Total Dealerships', value: '24', icon: Building2, color: 'bg-blue-500' },
    { label: 'Active Vehicles', value: '156', icon: Car, color: 'bg-green-500' },
    { label: 'Frame Templates', value: '12', icon: Image, color: 'bg-purple-500' },
    { label: 'Deliveries Today', value: '8', icon: BarChart3, color: 'bg-orange-500' },
  ];

  const tabItems = [
    { value: 'dealerships', label: 'Dealerships', icon: Building2 },
    { value: 'vehicles', label: 'Vehicles', icon: Car },
    { value: 'frames', label: 'Frames', icon: Image },
    { value: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header */}
      <header className="header-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="honda-logo">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Honda OEM Admin</h1>
                <p className="text-sm text-gray-600">Delivery Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="honda-badge">
                <Users className="w-3 h-3 mr-1" />
                OEM Admin
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Welcome, {user.name}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600 mt-1">Manage your Honda delivery operations across all dealerships</p>
            </div>
            <Button variant="honda" className="shadow-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="dashboard-grid mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="card-elevated hover:scale-[1.02] transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Tabs */}
        <Card className="card-elevated">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                <TabsList className="nav-modern h-auto p-2 bg-transparent w-full justify-start">
                  {tabItems.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`nav-item flex items-center space-x-2 ${
                        activeTab === tab.value ? 'nav-item-active' : ''
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="dealerships" className="mt-0">
                  <DealershipManagement />
                </TabsContent>

                <TabsContent value="vehicles" className="mt-0">
                  <VehicleManagement />
                </TabsContent>

                <TabsContent value="frames" className="mt-0">
                  <FrameManagement userRole="oem_admin" />
                </TabsContent>

                <TabsContent value="reports" className="mt-0">
                  <DeliveryReports userRole="oem_admin" />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OEMDashboard;