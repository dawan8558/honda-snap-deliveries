import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VehicleList = ({ dealershipId, onVehicleSelect }) => {
  // Mock data - undelivered vehicles for the operator's dealership
  const [vehicles] = useState([
    { 
      id: 1, 
      model: 'City', 
      variant: 'Aspire', 
      color: 'Pearl White', 
      is_delivered: false, 
      relationship_id: 'REL001',
      customer_name: '',
      whatsapp_number: ''
    },
    { 
      id: 4, 
      model: 'City', 
      variant: 'Aspire Prosmatec', 
      color: 'Brilliant Red', 
      is_delivered: false, 
      relationship_id: 'REL004',
      customer_name: '',
      whatsapp_number: ''
    },
    { 
      id: 5, 
      model: 'Civic', 
      variant: 'VTi Oriel', 
      color: 'Sonic Gray', 
      is_delivered: false, 
      relationship_id: 'REL005',
      customer_name: '',
      whatsapp_number: ''
    }
  ]);

  const pendingVehicles = vehicles.filter(vehicle => !vehicle.is_delivered);

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Pending Deliveries</CardTitle>
        <p className="text-sm text-muted-foreground">
          {pendingVehicles.length} vehicle{pendingVehicles.length !== 1 ? 's' : ''} ready for delivery
        </p>
      </CardHeader>

      {pendingVehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">All caught up!</p>
              <p className="text-sm">No vehicles pending delivery at the moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      Honda {vehicle.model} {vehicle.variant}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {vehicle.color}
                    </p>
                    {vehicle.relationship_id && (
                      <Badge variant="outline" className="text-xs">
                        {vehicle.relationship_id}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={() => onVehicleSelect(vehicle)}
                >
                  Start Delivery
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;