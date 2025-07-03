import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FrameManagement = ({ userRole, dealershipId = null }) => {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);

  const models = ['City', 'Civic', 'Accord', 'HR-V', 'CR-V'];
  
  // Mock frame URLs (using placeholder images that will work)
  const presetFrames = {
    'City': 'https://via.placeholder.com/800x600/E60012/FFFFFF?text=Honda+City+Frame',
    'Civic': 'https://via.placeholder.com/800x600/E60012/FFFFFF?text=Honda+Civic+Frame',
    'Accord': 'https://via.placeholder.com/800x600/E60012/FFFFFF?text=Honda+Accord+Frame',
    'HR-V': 'https://via.placeholder.com/800x600/E60012/FFFFFF?text=Honda+HR-V+Frame',
    'CR-V': 'https://via.placeholder.com/800x600/E60012/FFFFFF?text=Honda+CR-V+Frame',
  };
  
  const [newFrame, setNewFrame] = useState({
    name: '',
    model: '',
    image_file: null,
    usePreset: false
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFrames();
  }, [userRole, dealershipId]);

  const fetchFrames = async () => {
    try {
      let query = supabase
        .from('frames')
        .select(`
          *,
          dealerships:dealership_id (name)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const framesWithDealershipName = data?.map(frame => ({
        ...frame,
        dealership_name: frame.dealerships?.name || 'Global (OEM)'
      })) || [];

      setFrames(framesWithDealershipName);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch frames",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFrame = async () => {
    if (!newFrame.name || !newFrame.model || (!newFrame.image_file && !newFrame.usePreset)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields and select an image or use preset",
      });
      return;
    }

    setAdding(true);

    try {
      let publicUrl;
      
      if (newFrame.usePreset && presetFrames[newFrame.model]) {
        // Use preset frame image
        publicUrl = presetFrames[newFrame.model];
      } else {
        // Upload custom image to Supabase Storage
        const fileExt = newFrame.image_file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('frames')
          .upload(fileName, newFrame.image_file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: uploadedUrl } } = supabase.storage
          .from('frames')
          .getPublicUrl(fileName);
        
        publicUrl = uploadedUrl;
      }

      // Insert frame record
      const { error: insertError } = await supabase
        .from('frames')
        .insert([{
          name: newFrame.name,
          model: newFrame.model,
          image_url: publicUrl,
          uploaded_by: userRole === 'dealership_admin' ? dealershipId : null,
          dealership_id: userRole === 'dealership_admin' ? dealershipId : null
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Frame uploaded successfully",
      });

      resetForm();
      fetchFrames();
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

  const handleEditFrame = (frame) => {
    setEditingFrame(frame);
    setNewFrame({
      name: frame.name,
      model: frame.model,
      image_file: null,
      usePreset: false
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteFrame = async (frameId) => {
    if (!confirm('Are you sure you want to delete this frame? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('frames')
        .delete()
        .eq('id', frameId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Frame deleted successfully",
      });

      fetchFrames();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewFrame({ name: '', model: '', image_file: null, usePreset: false });
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingFrame(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewFrame({ ...newFrame, image_file: file });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a valid image file",
      });
    }
  };

  // Filter frames based on user role
  const filteredFrames = userRole === 'dealership_admin' 
    ? frames.filter(frame => frame.dealership_id === dealershipId || frame.dealership_id === null)
    : frames;

  if (loading) {
    return <div className="text-center py-8">Loading frames...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Frame Management</CardTitle>
              <CardDescription>Upload and manage photo frames for vehicle models</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover">Upload Frame</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Frame' : 'Upload New Frame'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update the frame details.' : 'Upload a PNG frame template for a specific car model.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="frame-name">Frame Name</Label>
                    <Input
                      id="frame-name"
                      value={newFrame.name}
                      onChange={(e) => setNewFrame({ ...newFrame, name: e.target.value })}
                      placeholder="e.g., Honda City Red Frame"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model">Car Model</Label>
                    <Select value={newFrame.model} onValueChange={(value) => setNewFrame({ ...newFrame, model: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select car model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="frame-image">Frame Image (PNG)</Label>
                    {newFrame.model && presetFrames[newFrame.model] && (
                      <div className="mb-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setNewFrame({ ...newFrame, usePreset: true })}
                          className="w-full mb-2"
                        >
                          Use Preset {newFrame.model} Frame
                        </Button>
                        <div className="aspect-video bg-gray-100 rounded border p-2">
                          <img 
                            src={presetFrames[newFrame.model]} 
                            alt={`${newFrame.model} preset frame`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    <Input
                      id="frame-image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileUpload}
                    />
                    {newFrame.image_file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {newFrame.image_file.name}
                      </p>
                    )}
                    {newFrame.usePreset && (
                      <p className="text-sm text-success">
                        Using preset {newFrame.model} frame
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddFrame} disabled={adding}>
                    {adding ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Update Frame' : 'Upload Frame')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFrames.map((frame) => (
              <Card key={frame.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <img 
                    src={frame.image_url} 
                    alt={frame.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/6B7280?text=Frame+Not+Found';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2">{frame.name}</h3>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline">{frame.model}</Badge>
                    <Badge variant={frame.dealership_id ? "secondary" : "default"}>
                      {frame.dealership_name}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditFrame(frame)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteFrame(frame.id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrameManagement;