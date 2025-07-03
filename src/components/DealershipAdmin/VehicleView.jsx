import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Car, Package, CheckCircle } from 'lucide-react';
import VehicleEdit from './VehicleEdit';

const VehicleView = ({ dealershipId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (dealershipId) {
      fetchVehicles();
    }
  }, [dealershipId]);

  const fetchVehicles = async () => {
    try {
      // Fetch vehicles for this specific dealership with delivery info
      const { data: vehiclesData, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          deliveries (
            id,
            operator_id,
            created_at
          )
        `)
        .eq('dealership_id', dealershipId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process vehicles data to include operator info
      const processedVehicles = vehiclesData?.map(vehicle => ({
        ...vehicle,
        delivery_info: vehicle.deliveries?.[0] || null,
        operator_name: vehicle.deliveries?.[0]?.profiles?.name || null
      })) || [];

      setVehicles(processedVehicles);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setEditDialogOpen(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setEditDialogOpen(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
      
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  const handleVehicleUpdated = () => {
    fetchVehicles();
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'delivered') return vehicle.is_delivered;
    if (filter === 'pending') return !vehicle.is_delivered;
    return true;
  });

  const stats = {
    total: vehicles.length,
    delivered: vehicles.filter(v => v.is_delivered).length,
    pending: vehicles.filter(v => !v.is_delivered).length
  };

  if (loading) {
    return <div className="text-center py-8">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Vehicles ({filteredVehicles.length})</CardTitle>
              <CardDescription>Manage vehicles assigned to your dealership</CardDescription>
            </div>
            <div className="flex items-center gap-4">
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
              <Button onClick={handleAddVehicle} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'all' ? 'No vehicles assigned to your dealership yet.' : 
               filter === 'delivered' ? 'No delivered vehicles found.' : 
               'No pending deliveries found.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Relationship ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">Honda {vehicle.model}</TableCell>
                    <TableCell>{vehicle.variant}</TableCell>
                    <TableCell>{vehicle.color}</TableCell>
                    <TableCell>{vehicle.operator_name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.is_delivered ? "default" : "secondary"}>
                        {vehicle.is_delivered ? 'Delivered' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{vehicle.relationship_id || '-'}</TableCell>
                    <TableCell>
                      {new Date(vehicle.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVehicle(vehicle)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <VehicleEdit
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        vehicle={selectedVehicle}
        dealershipId={dealershipId}
        onVehicleUpdated={handleVehicleUpdated}
      />
    </div>
  );
};

export default VehicleView;