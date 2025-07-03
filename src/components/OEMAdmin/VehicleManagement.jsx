import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);

  const models = ['City', 'Civic', 'Accord', 'HR-V', 'CR-V'];
  const variants = {
    'City': ['Aspire', 'Aspire Prosmatec'],
    'Civic': ['VTi', 'VTi Oriel', 'RS'],
    'Accord': ['Standard', 'VTi-L'],
    'HR-V': ['Standard', 'RS'],
    'CR-V': ['Standard', 'Touring']
  };

  const [newVehicle, setNewVehicle] = useState({
    model: '',
    variant: '',
    color: '',
    dealership_id: '',
    relationship_id: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
    fetchDealerships();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          dealerships:dealership_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const vehiclesWithDealershipName = data?.map(vehicle => ({
        ...vehicle,
        dealership_name: vehicle.dealerships?.name || 'Unknown'
      })) || [];

      setVehicles(vehiclesWithDealershipName);
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

  const fetchDealerships = async () => {
    try {
      const { data, error } = await supabase
        .from('dealerships')
        .select('*')
        .order('name');

      if (error) throw error;
      setDealerships(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dealerships",
        variant: "destructive",
      });
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.model || !newVehicle.variant || !newVehicle.color || !newVehicle.dealership_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setAdding(true);

    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([{
          model: newVehicle.model,
          variant: newVehicle.variant,
          color: newVehicle.color,
          dealership_id: newVehicle.dealership_id,
          relationship_id: newVehicle.relationship_id || null
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      resetForm();
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle({
      model: vehicle.model,
      variant: vehicle.variant,
      color: vehicle.color,
      dealership_id: vehicle.dealership_id,
      relationship_id: vehicle.relationship_id || ''
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleUpdateVehicle = async () => {
    if (!newVehicle.model || !newVehicle.variant || !newVehicle.color || !newVehicle.dealership_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setAdding(true);

    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          model: newVehicle.model,
          variant: newVehicle.variant,
          color: newVehicle.color,
          dealership_id: newVehicle.dealership_id,
          relationship_id: newVehicle.relationship_id || null
        })
        .eq('id', editingVehicle.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });

      resetForm();
      fetchVehicles();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

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
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewVehicle({ model: '', variant: '', color: '', dealership_id: '', relationship_id: '' });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingVehicle(null);
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
              <CardTitle>Vehicle Management</CardTitle>
              <CardDescription>Manage vehicles across all dealerships</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover">Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update the vehicle details.' : 'Enter the vehicle details.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="dealership">Dealership</Label>
                    <Select value={newVehicle.dealership_id} onValueChange={(value) => setNewVehicle({ ...newVehicle, dealership_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dealership" />
                      </SelectTrigger>
                      <SelectContent>
                        {dealerships.map((dealership) => (
                          <SelectItem key={dealership.id} value={dealership.id}>
                            {dealership.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={newVehicle.model} onValueChange={(value) => setNewVehicle({ ...newVehicle, model: value, variant: '' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="variant">Variant</Label>
                    <Select value={newVehicle.variant} onValueChange={(value) => setNewVehicle({ ...newVehicle, variant: value })} disabled={!newVehicle.model}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {newVehicle.model && variants[newVehicle.model]?.map((variant) => (
                          <SelectItem key={variant} value={variant}>{variant}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={newVehicle.color}
                      onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                      placeholder="e.g., Pearl White"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="relationship_id">Relationship ID (Optional)</Label>
                    <Input
                      id="relationship_id"
                      value={newVehicle.relationship_id}
                      onChange={(e) => setNewVehicle({ ...newVehicle, relationship_id: e.target.value })}
                      placeholder="e.g., REL001"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={isEditMode ? handleUpdateVehicle : handleAddVehicle} disabled={adding}>
                    {adding ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Vehicle' : 'Add Vehicle')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <TableHead>Dealership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Relationship ID</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">{vehicle.id}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.variant}</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>{vehicle.dealership_name}</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.is_delivered ? "default" : "secondary"}>
                      {vehicle.is_delivered ? 'Delivered' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.relationship_id || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleManagement;