import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const HONDA_MODELS = ['Civic', 'Accord', 'CR-V', 'HR-V', 'City'];
const HONDA_COLORS = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray'];

const VehicleEdit = ({ isOpen, onClose, vehicle, dealershipId, onVehicleUpdated }) => {
  const [formData, setFormData] = useState({
    model: '',
    variant: '',
    color: '',
    relationship_id: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (vehicle) {
      setFormData({
        model: vehicle.model || '',
        variant: vehicle.variant || '',
        color: vehicle.color || '',
        relationship_id: vehicle.relationship_id || ''
      });
    } else {
      setFormData({
        model: '',
        variant: '',
        color: '',
        relationship_id: ''
      });
    }
  }, [vehicle, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.model || !formData.variant || !formData.color) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (vehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            model: formData.model,
            variant: formData.variant,
            color: formData.color,
            relationship_id: formData.relationship_id || null
          })
          .eq('id', vehicle.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Vehicle updated successfully",
        });
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert({
            model: formData.model,
            variant: formData.variant,
            color: formData.color,
            relationship_id: formData.relationship_id || null,
            dealership_id: dealershipId
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Vehicle created successfully",
        });
      }

      onVehicleUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save vehicle",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          <DialogDescription>
            {vehicle ? 'Update the vehicle details below.' : 'Enter the details for the new vehicle.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Select 
              value={formData.model} 
              onValueChange={(value) => setFormData({ ...formData, model: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Honda model" />
              </SelectTrigger>
              <SelectContent>
                {HONDA_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant">Variant *</Label>
            <Input
              id="variant"
              value={formData.variant}
              onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
              placeholder="e.g., LX, EX, Sport"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <Select 
              value={formData.color} 
              onValueChange={(value) => setFormData({ ...formData, color: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {HONDA_COLORS.map((color) => (
                  <SelectItem key={color} value={color}>{color}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship_id">Relationship ID</Label>
            <Input
              id="relationship_id"
              value={formData.relationship_id}
              onChange={(e) => setFormData({ ...formData, relationship_id: e.target.value })}
              placeholder="Optional relationship identifier"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (vehicle ? 'Update Vehicle' : 'Add Vehicle')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleEdit;