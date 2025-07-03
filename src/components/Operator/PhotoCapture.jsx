import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PhotoComposer from '../PhotoCompositing/PhotoComposer';
import { compressImage } from '@/utils/imageCompression';

const PhotoCapture = ({ vehicle, operator, onComplete, onBack }) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: vehicle.customer_name || '',
    whatsapp: vehicle.whatsapp_number || ''
  });
  
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedPhotoFile, setCapturedPhotoFile] = useState(null);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [framedPhotos, setFramedPhotos] = useState([]);
  const [availableFrames, setAvailableFrames] = useState([]);
  const [consent, setConsent] = useState(false);
  const [compositeResults, setCompositeResults] = useState([]);
  const [currentStep, setCurrentStep] = useState('info'); // info, photo, frames, compose, preview, submit
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableFrames();
  }, [vehicle.model]);

  const fetchAvailableFrames = async () => {
    try {
      // Fetch frames for this vehicle model, including both global and dealership-specific frames
      const { data, error } = await supabase
        .from('frames')
        .select('*')
        .eq('model', vehicle.model);

      if (error) throw error;

      console.log(`Found ${data?.length || 0} frames for model: ${vehicle.model}`);
      setAvailableFrames(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No frames available",
          description: `No frames found for ${vehicle.model}. Please contact your administrator.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching frames:', error);
      toast({
        title: "Error",
        description: "Failed to load frames for this vehicle model",
        variant: "destructive",
      });
    }
  };

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

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 10MB",
        });
        return;
      }

      try {
        // Show compression progress
        toast({
          title: "Processing image...",
          description: "Optimizing image for upload",
        });

        // Compress the image
        const compressedFile = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8
        });

        setCapturedPhotoFile(compressedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedPhoto(e.target.result);
          toast({
            title: "Photo captured!",
            description: "Review your photo and click 'Use This Photo' to continue",
          });
        };
        reader.onerror = () => {
          toast({
            variant: "destructive",
            title: "Error reading file",
            description: "Please try again with a different image",
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast({
          variant: "destructive",
          title: "Error processing image",
          description: "Please try again with a different image",
        });
      }
    }
  };

  const handleCameraClick = async () => {
    setCapturing(true);
    
    // Try to use device camera API if available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Request camera access for better mobile experience
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Use back camera by default
          } 
        });
        // Stop the stream immediately - we just wanted to request permission
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.log('Camera permission not granted, falling back to file input');
      }
    }
    
    setCapturing(false);
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

    setCurrentStep('compose');
  };

  const handleCompositeComplete = (results) => {
    setCompositeResults(results);
    
    // Generate preview images for the final step
    const framed = results.map(result => ({
      frameId: result.frameId,
      frameName: result.frameName,
      image: result.dataURL,
      blob: result.blob
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

    setLoading(true);

    try {
      // Upload composite images to storage
      const uploadedUrls = [];
      
      for (let i = 0; i < framedPhotos.length; i++) {
        const photo = framedPhotos[i];
        if (photo.blob) {
          try {
            const fileExt = 'png';
            const fileName = `delivery_${vehicle.id}_${operator.id}_${Date.now()}_${i}.${fileExt}`;
            
            console.log(`Uploading image ${i + 1}/${framedPhotos.length}: ${fileName}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('delivery-photos')
              .upload(fileName, photo.blob, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
              .from('delivery-photos')
              .getPublicUrl(fileName);

            if (publicUrl) {
              uploadedUrls.push(publicUrl);
              console.log(`Image ${i + 1} uploaded successfully: ${publicUrl}`);
            } else {
              throw new Error(`Failed to get public URL for image ${i + 1}`);
            }
          } catch (error) {
            console.error(`Error uploading image ${i + 1}:`, error);
            throw error;
          }
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('No images were successfully uploaded. Please try again.');
      }

      console.log(`Successfully uploaded ${uploadedUrls.length} images`);

      // Save delivery record to database
      const { error: insertError } = await supabase
        .from('deliveries')
        .insert([{
          vehicle_id: vehicle.id,
          operator_id: operator.id,
          customer_name: customerInfo.name,
          whatsapp_number: customerInfo.whatsapp,
          framed_image_urls: uploadedUrls,
          consent_to_share: consent
        }]);

      if (insertError) throw insertError;

      // Mark vehicle as delivered
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ is_delivered: true })
        .eq('id', vehicle.id);

      if (updateError) throw updateError;

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
    } finally {
      setLoading(false);
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
            {!capturedPhoto ? (
              <>
                {/* Live Camera Capture Option */}
                <div className="text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <Button
                    onClick={handleCameraClick}
                    className="w-full h-32 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex flex-col items-center justify-center border-2 border-red-300"
                  >
                    <Camera className="h-8 w-8 mb-2" />
                    <span className="font-semibold">Take Photo with Camera</span>
                    <span className="text-xs text-red-100 mt-1">Recommended for best quality</span>
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-sm text-muted-foreground px-2">or</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                
                {/* Upload from Gallery Option */}
                <Button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = handlePhotoCapture;
                    input.click();
                  }}
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center"
                >
                  <Upload className="h-5 w-5 mb-1" />
                  <span>Upload from Gallery</span>
                </Button>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Tip:</strong> For best results, ensure good lighting and include both the customer and vehicle in the photo.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Photo Preview */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Captured Photo:</p>
                  <div className="relative">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured delivery" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setCapturedPhoto(null);
                      setCapturedPhotoFile(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Retake Photo
                  </Button>
                  <Button
                    onClick={() => setCurrentStep('frames')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Use This Photo
                  </Button>
                </div>
              </>
            )}
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
            Next: Compose Photos ({selectedFrames.length})
          </Button>
        </div>
      )}

      {/* Photo Composition Step */}
      {currentStep === 'compose' && (
        <PhotoComposer
          originalPhoto={capturedPhoto}
          selectedFrames={selectedFrames}
          onCompositeComplete={handleCompositeComplete}
        />
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

              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Delivery'}
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