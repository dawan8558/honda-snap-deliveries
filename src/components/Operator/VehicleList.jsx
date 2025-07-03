import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const VehicleList = ({ dealershipId, onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
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
    return <div className="text-center py-8">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle className="text-lg">Pending Deliveries</CardTitle>
        <p className="text-sm text-muted-foreground">
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} ready for delivery
        </p>
      </CardHeader>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">All caught up!</p>
              <p className="text-sm">No vehicles pending delivery at the moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
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
                  className="w-full bg-primary hover:bg-primary-hover"
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