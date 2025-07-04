import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const PhotoComposer = ({ originalPhoto, selectedFrames, onCompositeComplete }) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [compositeImages, setCompositeImages] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [photoScale, setPhotoScale] = useState([0.8]);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current || !originalPhoto || selectedFrames.length === 0) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);
    loadCurrentFrame(canvas);

    return () => {
      canvas.dispose();
    };
  }, [originalPhoto, selectedFrames, currentFrameIndex]);

  const loadCurrentFrame = async (canvas) => {
    if (!canvas || selectedFrames.length === 0) return;

    setLoading(true);
    canvas.clear();

    try {
      const currentFrame = selectedFrames[currentFrameIndex];
      
      // Load the original photo with CORS
      const photoImg = await FabricImage.fromURL(originalPhoto, { crossOrigin: 'anonymous' });
      photoImg.set({
        left: 50 + photoPosition.x,
        top: 50 + photoPosition.y,
        scaleX: photoScale[0],
        scaleY: photoScale[0],
        selectable: true,
        moveCursor: 'move',
      });

      // Load the frame with CORS
      const frameImg = await FabricImage.fromURL(currentFrame.image_url, { crossOrigin: 'anonymous' });
      frameImg.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      // Scale frame to fit canvas
      const frameScale = Math.min(
        canvas.width / frameImg.width,
        canvas.height / frameImg.height
      );
      frameImg.scale(frameScale);

      // Add photo first (behind frame)
      canvas.add(photoImg);
      canvas.add(frameImg);
      
      canvas.renderAll();
      
      // Update photo position when moved on canvas
      photoImg.on('moving', () => {
        setPhotoPosition({ x: photoImg.left - 50, y: photoImg.top - 50 });
      });

    } catch (error) {
      console.error('Error loading frame/photo:', error);
      toast({
        title: "Error",
        description: "Failed to load photo or frame",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePhotoScale = (newScale) => {
    if (!fabricCanvas) return;
    
    const photoObject = fabricCanvas.getObjects().find(obj => obj.type === 'image' && obj.selectable);
    if (photoObject) {
      photoObject.set({
        scaleX: newScale[0],
        scaleY: newScale[0]
      });
      fabricCanvas.renderAll();
    }
  };

  const generateComposite = async () => {
    if (!fabricCanvas) return null;

    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 2, // Higher resolution
      });

      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      return {
        frameId: selectedFrames[currentFrameIndex].id,
        frameName: selectedFrames[currentFrameIndex].name,
        blob: blob,
        dataURL: dataURL
      };
    } catch (error) {
      console.error('Client-side compositing failed, trying server-side:', error);
      
      // Fallback to server-side compositing
      try {
        const response = await fetch('/functions/v1/composite-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            originalPhotoUrl: originalPhoto,
            frameUrl: selectedFrames[currentFrameIndex].image_url,
            position: photoPosition,
            scale: photoScale[0]
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Convert base64 to blob
          const byteCharacters = atob(result.compositeImage.split(',')[1]);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          return {
            frameId: selectedFrames[currentFrameIndex].id,
            frameName: selectedFrames[currentFrameIndex].name,
            blob: blob,
            dataURL: result.compositeImage
          };
        } else {
          throw new Error('Server-side compositing failed');
        }
      } catch (serverError) {
        console.error('Server-side compositing also failed:', serverError);
        throw error; // Throw original error
      }
    }
  };

  const handleFrameChange = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentFrameIndex + 1) % selectedFrames.length
      : (currentFrameIndex - 1 + selectedFrames.length) % selectedFrames.length;
    
    setCurrentFrameIndex(newIndex);
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    const results = [];

    try {
      for (let i = 0; i < selectedFrames.length; i++) {
        setCurrentFrameIndex(i);
        
        // Wait for canvas to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const composite = await generateComposite();
        if (composite) {
          results.push(composite);
        }
      }

      setCompositeImages(results);
      onCompositeComplete(results);
      
      toast({
        title: "Success",
        description: `Generated ${results.length} composite images`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate composite images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCurrent = async () => {
    setLoading(true);
    
    try {
      const composite = await generateComposite();
      if (composite) {
        const newResults = [...compositeImages];
        newResults[currentFrameIndex] = composite;
        setCompositeImages(newResults);
        onCompositeComplete([composite]);
        
        toast({
          title: "Success",
          description: "Generated composite image",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate composite image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!originalPhoto || selectedFrames.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No photo or frames selected for compositing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo Composer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the photo position and size, then generate your framed images
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Canvas */}
          <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
            <canvas 
              ref={canvasRef} 
              className="max-w-full border bg-white" 
              style={{ maxHeight: '400px' }}
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Frame Navigation */}
            <div className="space-y-2">
              <Label>Current Frame ({currentFrameIndex + 1} of {selectedFrames.length})</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFrameChange('prev')}
                  disabled={selectedFrames.length <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground flex-1 text-center">
                  {selectedFrames[currentFrameIndex]?.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFrameChange('next')}
                  disabled={selectedFrames.length <= 1}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Photo Scale */}
            <div className="space-y-2">
              <Label>Photo Size</Label>
              <Slider
                value={photoScale}
                onValueChange={(value) => {
                  setPhotoScale(value);
                  updatePhotoScale(value);
                }}
                max={1.5}
                min={0.3}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(photoScale[0] * 100)}%
              </div>
            </div>
          </div>

          {/* Generation Controls */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleGenerateCurrent}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? 'Generating...' : 'Generate Current Frame'}
            </Button>
            <Button
              onClick={handleGenerateAll}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Generating...' : 'Generate All Frames'}
            </Button>
          </div>

          {/* Preview of Generated Images */}
          {compositeImages.length > 0 && (
            <div className="space-y-2">
              <Label>Generated Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {compositeImages.map((composite, index) => (
                  <div key={index} className="space-y-1">
                    <img
                      src={composite.dataURL}
                      alt={composite.frameName}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      {composite.frameName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoComposer;