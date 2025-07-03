import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const DealershipManagement = () => {
  const [dealerships, setDealerships] = useState([
    { id: 1, name: 'Honda Karachi Central', city: 'Karachi' },
    { id: 2, name: 'Honda Lahore Main', city: 'Lahore' },
    { id: 3, name: 'Honda Islamabad', city: 'Islamabad' }
  ]);
  
  const [newDealership, setNewDealership] = useState({ name: '', city: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddDealership = () => {
    if (!newDealership.name || !newDealership.city) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    const dealership = {
      id: dealerships.length + 1,
      ...newDealership
    };

    setDealerships([...dealerships, dealership]);
    setNewDealership({ name: '', city: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Dealership added successfully",
    });
  };

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
                <Button className="bg-primary hover:bg-primary-hover">Add Dealership</Button>
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
                  <Button onClick={handleAddDealership}>Add Dealership</Button>
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
              {dealerships.map((dealership) => (
                <TableRow key={dealership.id}>
                  <TableCell className="font-medium">{dealership.id}</TableCell>
                  <TableCell>{dealership.name}</TableCell>
                  <TableCell>{dealership.city}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
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

export default DealershipManagement;