import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VehicleView = ({ dealershipId }) => {
  // Mock data - in real app this would be filtered by dealership_id
  const [vehicles] = useState([
    { id: 1, model: 'City', variant: 'Aspire', color: 'Pearl White', is_delivered: false, relationship_id: 'REL001', operator_name: 'Ahmed Ali' },
    { id: 2, model: 'Civic', variant: 'RS', color: 'Metallic Black', is_delivered: true, relationship_id: 'REL002', operator_name: 'Sara Khan' },
    { id: 4, model: 'City', variant: 'Aspire Prosmatec', color: 'Brilliant Red', is_delivered: false, relationship_id: 'REL004', operator_name: 'Ali Hassan' }
  ]);

  const [filter, setFilter] = useState('all');

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'delivered') return vehicle.is_delivered;
    if (filter === 'pending') return !vehicle.is_delivered;
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Vehicles</CardTitle>
              <CardDescription>View vehicles assigned to your dealership</CardDescription>
            </div>
            <div className="w-48">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="pending">Pending Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Relationship ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.id}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.variant}</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>{vehicle.operator_name || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.is_delivered ? "default" : "secondary"}>
                      {vehicle.is_delivered ? 'Delivered' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.relationship_id || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {vehicles.filter(v => v.is_delivered).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {vehicles.filter(v => !v.is_delivered).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleView;