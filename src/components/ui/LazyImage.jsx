import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  aspectRatio = 'square',
  fallback = null,
  onLoad = null,
  onError = null,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}
      {...props}
    >
      {!isInView && (
        <Skeleton className="w-full h-full" />
      )}
      
      {isInView && !hasError && (
        <>
          {!isLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallback || (
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-muted-foreground">
                📷
              </div>
              <p className="text-xs text-muted-foreground">Failed to load</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LazyImage;