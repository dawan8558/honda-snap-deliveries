import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

const LoadingPage = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-primary-foreground font-bold text-sm">H</span>
      </div>
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-foreground font-medium">{message}</p>
      <p className="text-sm text-muted-foreground mt-2">Please wait...</p>
    </div>
  </div>
);

const LoadingCard = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

export { LoadingSpinner, LoadingPage, LoadingCard };
export default LoadingSpinner;