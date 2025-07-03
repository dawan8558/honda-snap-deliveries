import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const FrameManagement = ({ userRole, dealershipId = null }) => {
  const [frames, setFrames] = useState([
    { id: 1, name: 'Honda City Red Frame', model: 'City', image_url: '/placeholder-frame.png', uploaded_by: 'oem_admin', dealership_id: null, dealership_name: 'Global (OEM)' },
    { id: 2, name: 'Civic Sport Frame', model: 'Civic', image_url: '/placeholder-frame.png', uploaded_by: 'oem_admin', dealership_id: null, dealership_name: 'Global (OEM)' },
    { id: 3, name: 'Karachi City Frame', model: 'City', image_url: '/placeholder-frame.png', uploaded_by: 'dealership_admin', dealership_id: 1, dealership_name: 'Honda Karachi Central' }
  ]);

  const models = ['City', 'Civic', 'Accord', 'HR-V', 'CR-V'];
  
  const [newFrame, setNewFrame] = useState({
    name: '',
    model: '',
    image_file: null
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddFrame = () => {
    if (!newFrame.name || !newFrame.model || !newFrame.image_file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields and upload an image",
      });
      return;
    }

    const frame = {
      id: frames.length + 1,
      name: newFrame.name,
      model: newFrame.model,
      image_url: URL.createObjectURL(newFrame.image_file),
      uploaded_by: userRole,
      dealership_id: userRole === 'dealership_admin' ? dealershipId : null,
      dealership_name: userRole === 'dealership_admin' ? 'Current Dealership' : 'Global (OEM)'
    };

    setFrames([...frames, frame]);
    setNewFrame({ name: '', model: '', image_file: null });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Frame uploaded successfully",
    });
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Frame Management</CardTitle>
              <CardDescription>Upload and manage photo frames for vehicle models</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-hover">Upload Frame</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Frame</DialogTitle>
                  <DialogDescription>
                    Upload a PNG frame template for a specific car model.
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
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddFrame}>Upload Frame</Button>
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
                      e.target.src = '/placeholder-frame.png';
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
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
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