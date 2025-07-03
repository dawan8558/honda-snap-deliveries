import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DealershipManagement = () => {
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDealership, setNewDealership] = useState({ name: '', city: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
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

  if (loading) {
    return <div className="text-center py-8">Loading dealerships...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Dealership Management</CardTitle>
              <CardDescription>Manage Honda dealerships across the country</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="honda">Add Dealership</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Dealership</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new dealership.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={newDealership.name}
                      onChange={(e) => setNewDealership({ ...newDealership, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Honda Dealership Name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">City</Label>
                    <Input
                      id="city"
                      value={newDealership.city}
                      onChange={(e) => setNewDealership({ ...newDealership, city: e.target.value })}
                      className="col-span-3"
                      placeholder="City"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddDealership} disabled={adding}>
                    {adding ? 'Adding...' : 'Add Dealership'}
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
                <TableHead>Dealership Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealerships.map((dealership, index) => (
                <TableRow key={dealership.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{dealership.name}</TableCell>
                  <TableCell>{dealership.city}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {dealerships.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No dealerships found. Add your first dealership above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealershipManagement;