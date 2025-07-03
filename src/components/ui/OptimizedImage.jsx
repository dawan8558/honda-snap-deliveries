import { useState, useRef, useEffect } from 'react';

/**
 * Optimized image component with automatic resizing and caching
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width,
  height,
  quality = 80,
  placeholder = null,
  onLoad = null,
  onError = null,
  eager = false,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const imgRef = useRef(null);

  // Generate optimized image URL for supported formats
  useEffect(() => {
    if (!src) return;
    
    // For external URLs or if dimensions are specified, create optimized version
    if ((width || height) && src.startsWith('http')) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', quality.toString());
      
      // For supported image optimization services
      if (src.includes('supabase')) {
        setOptimizedSrc(`${src}?${params.toString()}`);
      } else {
        setOptimizedSrc(src);
      }
    } else {
      setOptimizedSrc(src);
    }
  }, [src, width, height, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} {...props}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {!hasError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } w-full h-full object-cover`}
          width={width}
          height={height}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {placeholder || (
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <p className="text-xs text-muted-foreground">Image not available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;