import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { VehicleListLoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const VehicleList = ({ dealershipId, onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, [dealershipId]);

  const fetchVehicles = async () => {
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          dealerships:dealership_id (name)
        `)
        .eq('is_delivered', false)
        .order('created_at', { ascending: false });

      // If dealershipId is provided, filter by it
      // This ensures operators only see vehicles from their dealership
      if (dealershipId) {
        query = query.eq('dealership_id', dealershipId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVehicles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardHeader className="px-0">
          <CardTitle className="text-lg">Pending Deliveries</CardTitle>
          <p className="text-sm text-muted-foreground">Loading vehicles...</p>
        </CardHeader>
        <VehicleListLoadingSkeleton count={6} />
      </div>
    );
  }

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const searchableFields = [
      vehicle.model,
      vehicle.variant,
      vehicle.color,
      vehicle.relationship_id
    ].filter(Boolean);
    
    return searchableFields.some(field => 
      field.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Pending Deliveries</CardTitle>
        <p className="text-sm text-muted-foreground">
          {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} ready for delivery
          {searchTerm && filteredVehicles.length !== vehicles.length && (
            <span> (filtered from {vehicles.length})</span>
          )}
        </p>
      </CardHeader>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search vehicles by model, color, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              {searchTerm ? (
                <>
                  <p className="text-lg font-medium mb-2">No matching vehicles</p>
                  <p className="text-sm">Try adjusting your search term.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">All caught up!</p>
                  <p className="text-sm">No vehicles pending delivery at the moment.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-all duration-200 hover-scale">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      Honda {vehicle.model} {vehicle.variant}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {vehicle.color}
                    </p>
                    {vehicle.relationship_id && (
                      <Badge variant="outline" className="text-xs">
                        {vehicle.relationship_id}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover transition-colors"
                  onClick={() => onVehicleSelect(vehicle)}
                >
                  Start Delivery
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleList;