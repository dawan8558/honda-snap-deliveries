import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload } from 'lucide-react';

const PhotoCapture = ({ vehicle, operator, onComplete, onBack }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: vehicle.customer_name || '',
    whatsapp: vehicle.whatsapp_number || ''
  });
  
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [framedPhotos, setFramedPhotos] = useState([]);
  const [consent, setConsent] = useState(false);
  const [currentStep, setCurrentStep] = useState('info'); // info, photo, frames, preview, submit
  
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Mock frames that match the vehicle model
  const availableFrames = [
    { id: 1, name: 'Honda City Red Frame', model: 'City', image_url: '/placeholder-frame.png' },
    { id: 2, name: 'Honda City Blue Frame', model: 'City', image_url: '/placeholder-frame.png' },
    { id: 3, name: 'Civic Sport Frame', model: 'Civic', image_url: '/placeholder-frame.png' }
  ].filter(frame => frame.model === vehicle.model);

  const handleInfoNext = () => {
    if (!customerInfo.name || !customerInfo.whatsapp) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in customer name and WhatsApp number",
      });
      return;
    }
    setCurrentStep('photo');
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target.result);
        setCurrentStep('frames');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFrameSelect = (frame) => {
    const isSelected = selectedFrames.find(f => f.id === frame.id);
    if (isSelected) {
      setSelectedFrames(selectedFrames.filter(f => f.id !== frame.id));
    } else {
      setSelectedFrames([...selectedFrames, frame]);
    }
  };

  const handleFramesNext = () => {
    if (selectedFrames.length === 0) {
      toast({
        variant: "destructive",
        title: "No frames selected",
        description: "Please select at least one frame",
      });
      return;
    }

    // Mock frame application - in real app this would composite the images
    const framed = selectedFrames.map(frame => ({
      frameId: frame.id,
      frameName: frame.name,
      image: capturedPhoto // In real app, this would be the composited image
    }));
    
    setFramedPhotos(framed);
    setCurrentStep('preview');
  };

  const handleSubmit = async () => {
    if (!consent) {
      toast({
        variant: "destructive",
        title: "Consent required",
        description: "Please indicate whether you consent to sharing photos",
      });
      return;
    }

    try {
      // Mock submission - in real app this would save to Supabase
      console.log('Submitting delivery:', {
        vehicle_id: vehicle.id,
        operator_id: operator.id,
        customer_name: customerInfo.name,
        whatsapp_number: customerInfo.whatsapp,
        framed_photos: framedPhotos,
        consent_to_share: consent
      });

      toast({
        title: "Delivery submitted!",
        description: "Customer delivery photos have been saved",
      });

      // Show WhatsApp option
      setCurrentStep('complete');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent("Thank you for choosing Honda! Here's your delivery photo.");
    const whatsappUrl = `https://wa.me/${customerInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Complete the delivery process
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Customer Information Step */}
      {currentStep === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter customer details for delivery
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Customer Name</Label>
              <Input
                id="customer-name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={customerInfo.whatsapp}
                onChange={(e) => setCustomerInfo({ ...customerInfo, whatsapp: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>
            <Button onClick={handleInfoNext} className="w-full">
              Next: Take Photo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Photo Capture Step */}
      {currentStep === 'photo' && (
        <Card>
          <CardHeader>
            <CardTitle>Take Delivery Photo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Capture a photo of the customer with their new Honda
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="camera"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Button
                onClick={handleCameraClick}
                className="w-full h-32 bg-gray-100 hover:bg-gray-200 text-gray-600 flex flex-col items-center justify-center border-2 border-dashed border-gray-300"
                variant="outline"
              >
                <Camera className="h-8 w-8 mb-2" />
                <span>Take Photo</span>
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              or
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload from Gallery
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Frame Selection Step */}
      {currentStep === 'frames' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Frames</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose frames for your {vehicle.model} delivery photo
              </p>
            </CardHeader>
            <CardContent>
              {capturedPhoto && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Captured Photo:</p>
                  <img 
                    src={capturedPhoto} 
                    alt="Captured delivery" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            {availableFrames.map((frame) => {
              const isSelected = selectedFrames.find(f => f.id === frame.id);
              return (
                <Card 
                  key={frame.id} 
                  className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                  onClick={() => handleFrameSelect(frame)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <img 
                          src={frame.image_url} 
                          alt={frame.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{frame.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {frame.model}
                        </Badge>
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        {isSelected && (
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button onClick={handleFramesNext} className="w-full" disabled={selectedFrames.length === 0}>
            Preview Photos ({selectedFrames.length})
          </Button>
        </div>
      )}

      {/* Preview Step */}
      {currentStep === 'preview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Submit</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review your framed photos before submission
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {framedPhotos.map((photo, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-sm font-medium">{photo.frameName}</p>
                    <img 
                      src={photo.image} 
                      alt={`Framed photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="consent" 
                    checked={consent}
                    onCheckedChange={setConsent}
                  />
                  <label htmlFor="consent" className="text-sm leading-relaxed">
                    Do you consent to sharing this photo on dealership and Honda Atlas social media?
                  </label>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Submit Delivery
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Step */}
      {currentStep === 'complete' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-green-600 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Delivery Complete!</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Photos have been saved for {customerInfo.name}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleWhatsAppShare}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Share via WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={onComplete}
                className="w-full"
              >
                Back to Vehicles
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoCapture;