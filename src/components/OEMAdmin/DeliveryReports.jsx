import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SearchFilter } from '@/components/ui/search-filter';
import { DataTable } from '@/components/ui/data-table';

console.log('DeliveryReports: Component loaded');

const DeliveryReports = ({ userRole, dealershipId = null }) => {
  console.log('DeliveryReports component rendering, userRole:', userRole);
  
  const [deliveries, setDeliveries] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dealership: '',
    model: '',
    consent: '',
    date: ''
  });
  const { toast } = useToast();

  const models = ['City', 'Civic', 'Accord', 'HR-V', 'CR-V'];

  // Fixed useEffect with proper dependency array
  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      console.log('DeliveryReports: Starting data fetch...');
      
      try {
        // Build query based on user role
        let deliveriesQuery = supabase
          .from('deliveries')
          .select(`
            *,
            vehicles!inner (
              id,
              model,
              variant,
              color,
              dealership_id,
              dealerships!inner (name)
            ),
            profiles!deliveries_operator_id_fkey (name)
          `);

        // Filter by dealership if user is dealership admin
        if (userRole === 'dealership_admin' && dealershipId) {
          deliveriesQuery = deliveriesQuery.eq('vehicles.dealership_id', dealershipId);
        }

        deliveriesQuery = deliveriesQuery.order('created_at', { ascending: false });

        // Fetch deliveries and dealerships in parallel
        const [deliveriesResult, dealershipsResult] = await Promise.all([
          deliveriesQuery,
          
          supabase
            .from('dealerships')
            .select('*')
            .order('name')
        ]);

        if (!mounted) return; // Prevent state updates if component unmounted

        // Handle deliveries
        if (deliveriesResult.error) {
          console.error('Error fetching deliveries:', deliveriesResult.error);
          toast({
            title: "Error",
            description: "Failed to fetch deliveries",
            variant: "destructive",
          });
        } else {
          const deliveriesWithDetails = deliveriesResult.data?.map(delivery => ({
            ...delivery,
            vehicle_model: `${delivery.vehicles.model} ${delivery.vehicles.variant}`,
            vehicle_color: delivery.vehicles.color,
            dealership_name: delivery.vehicles.dealerships.name,
            operator_name: delivery.profiles?.name || 'Unknown'
          })) || [];

          console.log('DeliveryReports: Deliveries fetched:', deliveriesWithDetails.length);
          setDeliveries(deliveriesWithDetails);
        }

        // Handle dealerships
        if (dealershipsResult.error) {
          console.error('Error fetching dealerships:', dealershipsResult.error);
        } else {
          console.log('DeliveryReports: Dealerships fetched:', dealershipsResult.data?.length || 0);
          setDealerships(dealershipsResult.data || []);
        }

      } catch (error) {
        console.error('DeliveryReports: Fetch failed:', error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Failed to load data",
            variant: "destructive",
          });
        }
      } finally {
        if (mounted) {
          console.log('DeliveryReports: Setting loading to false');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Define filter options for SearchFilter component
  const filterOptions = [
    {
      key: 'dealership',
      label: 'Dealership',
      type: 'select',
      options: dealerships.map(d => ({ value: d.name, label: d.name }))
    },
    {
      key: 'model',
      label: 'Model',
      type: 'select',
      options: models.map(m => ({ value: m, label: m }))
    },
    {
      key: 'consent',
      label: 'Consent to Share',
      type: 'boolean'
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      dealership: '',
      model: '',
      consent: '',
      date: ''
    });
    setSearchTerm('');
  };

  // Filter and search deliveries
  const filteredDeliveries = deliveries.filter(delivery => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchableFields = [
        delivery.customer_name,
        delivery.vehicle_model,
        delivery.vehicle_color,
        delivery.dealership_name,
        delivery.operator_name,
        delivery.whatsapp_number
      ].filter(Boolean);
      
      const matchesSearch = searchableFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
      
      if (!matchesSearch) return false;
    }

    // Apply filters
    if (filters.dealership && delivery.dealership_name !== filters.dealership) {
      return false;
    }
    if (filters.model && !delivery.vehicle_model.includes(filters.model)) {
      return false;
    }
    if (filters.consent && filters.consent !== '') {
      const consentValue = filters.consent === 'true';
      if (delivery.consent_to_share !== consentValue) {
        return false;
      }
    }
    if (filters.date) {
      const deliveryDate = new Date(delivery.created_at).toISOString().split('T')[0];
      if (deliveryDate !== filters.date) {
        return false;
      }
    }
    return true;
  });

  // Define columns for DataTable
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'vehicle_model',
      label: 'Vehicle',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.vehicle_color}</div>
        </div>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.whatsapp_number}</div>
        </div>
      )
    },
    {
      key: 'operator_name',
      label: 'Operator',
      sortable: true
    },
    {
      key: 'dealership_name',
      label: 'Dealership',
      sortable: true
    },
    {
      key: 'consent_to_share',
      label: 'Consent',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setSelectedDelivery(row)}>
              View Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Delivery Photos - {row.customer_name}</DialogTitle>
              <DialogDescription>
                {row.vehicle_model} delivered by {row.operator_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {row.framed_image_urls?.map((url, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Delivery photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300/E5E7EB/6B7280?text=Photo+Not+Found';
                    }}
                  />
                </div>
              )) || (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No photos available for this delivery
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )
    }
  ];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading delivery reports...</div>
        <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Reports</CardTitle>
          <CardDescription>
            View all delivery submissions and photos 
            {filteredDeliveries.length !== deliveries.length && 
              ` (${filteredDeliveries.length} of ${deliveries.length} shown)`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchFilter
            searchPlaceholder="Search deliveries by customer, vehicle, operator..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredDeliveries}
        loading={loading}
        emptyMessage={
          deliveries.length === 0 
            ? "No deliveries found. Start by adding some deliveries." 
            : "No deliveries match your current search and filters."
        }
      />
    </div>
  );
};

export default DeliveryReports;