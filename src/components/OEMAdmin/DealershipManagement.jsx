import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DealershipEdit from './DealershipEdit';

const DealershipManagement = () => {
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDealership, setEditingDealership] = useState(null);
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

  const handleEditDealership = (dealership) => {
    setEditingDealership(dealership);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDealership = async (dealershipId) => {
    if (!confirm('Are you sure you want to delete this dealership? This will also delete all associated vehicles and deliveries.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('dealerships')
        .delete()
        .eq('id', dealershipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Dealership deleted successfully",
      });

      fetchDealerships();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDialogSuccess = () => {
    fetchDealerships();
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
            <Button 
              className="bg-primary hover:bg-primary-hover"
              onClick={() => {
                setEditingDealership(null);
                setIsEditDialogOpen(true);
              }}
            >
              Add Dealership
            </Button>
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
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDealership(dealership)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteDealership(dealership.id)}
                      >
                        Delete
                      </Button>
                    </div>
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

      <DealershipEdit
        dealership={editingDealership}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

export default DealershipManagement;