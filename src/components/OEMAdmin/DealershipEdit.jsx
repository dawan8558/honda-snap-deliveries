import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DealershipEdit = ({ dealership, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dealership) {
      setFormData({
        name: dealership.name || '',
        city: dealership.city || ''
      });
    } else {
      setFormData({ name: '', city: '' });
    }
  }, [dealership]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.city) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);

    try {
      if (dealership) {
        // Update existing dealership
        const { error } = await supabase
          .from('dealerships')
          .update({
            name: formData.name,
            city: formData.city
          })
          .eq('id', dealership.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Dealership updated successfully",
        });
      } else {
        // Create new dealership
        const { error } = await supabase
          .from('dealerships')
          .insert([{
            name: formData.name,
            city: formData.city
          }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Dealership created successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dealership ? 'Edit Dealership' : 'Add New Dealership'}</DialogTitle>
          <DialogDescription>
            {dealership ? 'Update the dealership details.' : 'Enter the dealership details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Dealership Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Honda Atlas Karachi"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g., Karachi"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (dealership ? 'Updating...' : 'Creating...') : (dealership ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DealershipEdit;