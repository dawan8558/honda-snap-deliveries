import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MapPin, Building2, Edit, Search, Filter } from 'lucide-react';

const DealershipManagement = () => {
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDealership, setNewDealership] = useState({ name: '', city: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDealerships();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddDealership = async () => {
    if (!newDealership.name || !newDealership.city) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setAdding(true);

    try {
      const { error } = await supabase
        .from('dealerships')
        .insert([newDealership]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dealership added successfully",
      });

      setNewDealership({ name: '', city: '' });
      setIsDialogOpen(false);
      fetchDealerships();
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

  const filteredDealerships = dealerships.filter(
    (dealership) =>
      dealership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealership.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="honda-logo mb-4">
            <span className="text-white font-bold">H</span>
          </div>
          <p className="text-gray-600">Loading dealerships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-red-600" />
            Dealership Management
          </h3>
          <p className="text-gray-600 mt-1">Manage Honda dealerships across the country</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="honda" className="shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Dealership
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                Add New Dealership
              </DialogTitle>
              <DialogDescription>
                Enter the details for the new Honda dealership location.
              </DialogDescription>
            </DialogHeader>
            <div className="form-modern">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium">Dealership Name</Label>
                  <Input
                    id="name"
                    value={newDealership.name}
                    onChange={(e) => setNewDealership({ ...newDealership, name: e.target.value })}
                    placeholder="Honda City Center"
                    className="transition-all duration-200 focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="font-medium">City</Label>
                  <Input
                    id="city"
                    value={newDealership.city}
                    onChange={(e) => setNewDealership({ ...newDealership, city: e.target.value })}
                    placeholder="Karachi"
                    className="transition-all duration-200 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDealership} disabled={adding} variant="honda">
                {adding ? 'Adding...' : 'Add Dealership'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="card-elevated">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search dealerships by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dealerships Table */}
      <Card className="card-elevated">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center justify-between">
            <span>Dealership Directory</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredDealerships.length} Locations
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="table-modern">
            <Table>
              <TableHeader className="table-header">
                <TableRow>
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Dealership Name</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDealerships.map((dealership, index) => (
                  <TableRow key={dealership.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="font-medium text-gray-900">{dealership.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {dealership.city}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="hover:bg-gray-100">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredDealerships.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No dealerships found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first dealership'}
                </p>
                {!searchTerm && (
                  <Button variant="honda" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Dealership
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DealershipManagement;