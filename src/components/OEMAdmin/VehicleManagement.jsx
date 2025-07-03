import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([
    { id: 1, model: 'City', variant: 'Aspire', color: 'Pearl White', dealership_id: 1, dealership_name: 'Honda Karachi Central', is_delivered: false, relationship_id: 'REL001' },
    { id: 2, model: 'Civic', variant: 'RS', color: 'Metallic Black', dealership_id: 1, dealership_name: 'Honda Karachi Central', is_delivered: true, relationship_id: 'REL002' },
    { id: 3, model: 'City', variant: 'Aspire', color: 'Brilliant Red', dealership_id: 2, dealership_name: 'Honda Lahore Main', is_delivered: false, relationship_id: 'REL003' }
  ]);

  const dealerships = [
    { id: 1, name: 'Honda Karachi Central' },
    { id: 2, name: 'Honda Lahore Main' },
    { id: 3, name: 'Honda Islamabad' }
  ];

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
  const { toast } = useToast();

  const handleAddVehicle = () => {
    if (!newVehicle.model || !newVehicle.variant || !newVehicle.color || !newVehicle.dealership_id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const dealership = dealerships.find(d => d.id === parseInt(newVehicle.dealership_id));
    const vehicle = {
      id: vehicles.length + 1,
      ...newVehicle,
      dealership_id: parseInt(newVehicle.dealership_id),
      dealership_name: dealership.name,
      is_delivered: false
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ model: '', variant: '', color: '', dealership_id: '', relationship_id: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Vehicle added successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vehicle Management</CardTitle>
              <CardDescription>Manage vehicles across all dealerships</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover">Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>
                    Enter the vehicle details.
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
                          <SelectItem key={dealership.id} value={dealership.id.toString()}>
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
                  <Button onClick={handleAddVehicle}>Add Vehicle</Button>
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