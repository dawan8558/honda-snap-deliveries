-- Update Honda frames with professional branded frames
UPDATE public.frames SET 
  image_url = '/src/assets/frames/honda-professional-frame.png',
  name = 'Honda Professional Frame'
WHERE model = 'Accord';

UPDATE public.frames SET 
  image_url = '/src/assets/frames/honda-civic-branded-frame.png',
  name = 'Honda Civic Premium Frame'
WHERE model = 'Civic';

UPDATE public.frames SET 
  image_url = '/src/assets/frames/honda-professional-frame.png',
  name = 'Honda City Professional Frame'
WHERE model = 'City';

UPDATE public.frames SET 
  image_url = '/src/assets/frames/honda-professional-frame.png',
  name = 'Honda CR-V Professional Frame'
WHERE model = 'CR-V';

UPDATE public.frames SET 
  image_url = '/src/assets/frames/honda-professional-frame.png',
  name = 'Honda HR-V Professional Frame'
WHERE model = 'HR-V';