// Fallback page - main app is now in App.jsx with authentication

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Honda Delivery Photo App</h1>
        <p className="text-xl text-muted-foreground">Please access the main application</p>
      </div>
    </div>
  );
};

export default Index;
