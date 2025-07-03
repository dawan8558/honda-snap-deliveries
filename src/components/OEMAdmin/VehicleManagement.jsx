import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Car, Settings } from 'lucide-react';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vehicles');

  // Enhanced models and variants - now configurable
  const [models, setModels] = useState(['City', 'Civic', 'Accord', 'HR-V', 'CR-V', 'BR-V']);
  const [variants, setVariants] = useState({
    'City': ['Aspire', 'Aspire Prosmatec'],
    'Civic': ['VTi', 'VTi Oriel', 'RS'],
    'Accord': ['Standard', 'VTi-L'],
    'HR-V': ['Standard', 'RS'],
    'CR-V': ['Standard', 'Touring'],
    'BR-V': ['Standard', 'Prestige']
  });

  const [newVehicle, setNewVehicle] = useState({
    model: '',
    variant: '',
    color: '',
    dealership_id: '',
    relationship_id: ''
  });

  // Model/Variant management states
  const [newModel, setNewModel] = useState('');
  const [newVariant, setNewVariant] = useState('');
  const [selectedModelForVariant, setSelectedModelForVariant] = useState('');
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);

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

  const handleAddModel = () => {
    if (!newModel.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a model name",
      });
      return;
    }

    if (models.includes(newModel)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Model already exists",
      });
      return;
    }

    setModels([...models, newModel]);
    setVariants({ ...variants, [newModel]: [] });
    setNewModel('');
    setModelDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Model "${newModel}" added successfully`,
    });
  };

  const handleAddVariant = () => {
    if (!newVariant.trim() || !selectedModelForVariant) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a model and enter a variant name",
      });
      return;
    }

    if (variants[selectedModelForVariant]?.includes(newVariant)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Variant already exists for this model",
      });
      return;
    }

    setVariants({
      ...variants,
      [selectedModelForVariant]: [...(variants[selectedModelForVariant] || []), newVariant]
    });
    setNewVariant('');
    setSelectedModelForVariant('');
    setVariantDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Variant "${newVariant}" added successfully`,
    });
  };

  const handleDeleteModel = (modelToDelete) => {
    if (!confirm(`Are you sure you want to delete the "${modelToDelete}" model? This will also delete all its variants.`)) {
      return;
    }

    const updatedModels = models.filter(model => model !== modelToDelete);
    const updatedVariants = { ...variants };
    delete updatedVariants[modelToDelete];
    
    setModels(updatedModels);
    setVariants(updatedVariants);
    
    toast({
      title: "Success",
      description: `Model "${modelToDelete}" deleted successfully`,
    });
  };

  const handleDeleteVariant = (model, variantToDelete) => {
    if (!confirm(`Are you sure you want to delete the "${variantToDelete}" variant?`)) {
      return;
    }

    setVariants({
      ...variants,
      [model]: variants[model].filter(variant => variant !== variantToDelete)
    });
    
    toast({
      title: "Success",
      description: `Variant "${variantToDelete}" deleted successfully`,
    });
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
              <CardDescription>Manage vehicles, models, and variants across all dealerships</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="inline-flex h-12 items-center justify-center bg-muted p-1 text-muted-foreground rounded-lg">
              <TabsTrigger value="vehicles" className="px-4 py-2">
                <Car className="h-4 w-4 mr-2" />
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="models" className="px-4 py-2">
                <Settings className="h-4 w-4 mr-2" />
                Models & Variants
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Vehicle Inventory</CardTitle>
                      <CardDescription>Manage vehicles across all dealerships</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Vehicle
                        </Button>
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
                                  <SelectItem key={model} value={model}>Honda {model}</SelectItem>
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
                          <TableCell className="font-medium">Honda {vehicle.model}</TableCell>
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="models">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Models Management */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Honda Models</CardTitle>
                        <CardDescription>Manage Honda vehicle models</CardDescription>
                      </div>
                      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Model
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Model</DialogTitle>
                            <DialogDescription>Enter the name of the new Honda model.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="newModel">Model Name</Label>
                              <Input
                                id="newModel"
                                value={newModel}
                                onChange={(e) => setNewModel(e.target.value)}
                                placeholder="e.g., Pilot"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddModel}>Add Model</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {models.map((model) => (
                        <div key={model} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Car className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Honda {model}</span>
                            <Badge variant="outline">{variants[model]?.length || 0} variants</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModel(model)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Variants Management */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Model Variants</CardTitle>
                        <CardDescription>Manage variants for each model</CardDescription>
                      </div>
                      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Variant
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Variant</DialogTitle>
                            <DialogDescription>Add a new variant to an existing model.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="modelSelect">Model</Label>
                              <Select value={selectedModelForVariant} onValueChange={setSelectedModelForVariant}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {models.map((model) => (
                                    <SelectItem key={model} value={model}>Honda {model}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="newVariant">Variant Name</Label>
                              <Input
                                id="newVariant"
                                value={newVariant}
                                onChange={(e) => setNewVariant(e.target.value)}
                                placeholder="e.g., Sport Turbo"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddVariant}>Add Variant</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {models.map((model) => (
                        <div key={model} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-3">Honda {model}</h4>
                          <div className="space-y-2">
                            {variants[model]?.length > 0 ? (
                              variants[model].map((variant) => (
                                <div key={variant} className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span className="text-sm">{variant}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteVariant(model, variant)}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No variants added yet</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleManagement;