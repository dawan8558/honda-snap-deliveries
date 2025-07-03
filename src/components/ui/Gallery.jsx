import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Search, Filter, Download, Eye, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import LazyImage from '@/components/ui/LazyImage';
import { GalleryLoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const Gallery = ({ userRole, dealershipId }) => {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [dealerships, setDealerships] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    dealership: 'all',
    model: 'all',
    consent: 'all',
    dateFrom: '',
    dateTo: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchPhotos();
    if (userRole === 'oem_admin') {
      fetchDealerships();
    }
  }, [userRole, dealershipId]);

  useEffect(() => {
    applyFilters();
  }, [photos, filters]);

  const fetchDealerships = async () => {
    try {
      const { data, error } = await supabase
        .from('dealerships')
        .select('id, name, city')
        .order('name');

      if (error) throw error;
      setDealerships(data || []);
    } catch (error) {
      console.error('Error fetching dealerships:', error);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('deliveries')
        .select(`
          id,
          customer_name,
          whatsapp_number,
          framed_image_urls,
          consent_to_share,
          created_at,
          vehicles (
            id,
            model,
            variant,
            color,
            dealerships (
              id,
              name,
              city
            )
          ),
          profiles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userRole === 'dealership_admin' && dealershipId) {
        // For dealership admins, only show photos from their dealership
        query = query.eq('vehicles.dealership_id', dealershipId);
      }
      // OEM admins see all photos (no additional filtering)

      const { data, error } = await query;

      if (error) throw error;

      // Flatten the photo data for easier filtering
      const flattenedPhotos = [];
      data?.forEach(delivery => {
        delivery.framed_image_urls?.forEach((imageUrl, index) => {
          flattenedPhotos.push({
            id: `${delivery.id}_${index}`,
            deliveryId: delivery.id,
            imageUrl,
            customerName: delivery.customer_name,
            whatsappNumber: delivery.whatsapp_number,
            consentToShare: delivery.consent_to_share,
            createdAt: delivery.created_at,
            vehicleModel: delivery.vehicles?.model,
            vehicleVariant: delivery.vehicles?.variant,
            vehicleColor: delivery.vehicles?.color,
            dealershipName: delivery.vehicles?.dealerships?.name,
            dealershipCity: delivery.vehicles?.dealerships?.city,
            dealershipId: delivery.vehicles?.dealerships?.id,
            operatorName: delivery.profiles?.name
          });
        });
      });

      setPhotos(flattenedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load photos",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...photos];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(photo => 
        photo.customerName?.toLowerCase().includes(searchTerm) ||
        photo.vehicleModel?.toLowerCase().includes(searchTerm) ||
        photo.dealershipName?.toLowerCase().includes(searchTerm)
      );
    }

    // Dealership filter (for OEM only)
    if (filters.dealership !== 'all' && userRole === 'oem_admin') {
      filtered = filtered.filter(photo => photo.dealershipId === filters.dealership);
    }

    // Model filter
    if (filters.model !== 'all') {
      filtered = filtered.filter(photo => photo.vehicleModel === filters.model);
    }

    // Consent filter
    if (filters.consent !== 'all') {
      const consentValue = filters.consent === 'yes';
      filtered = filtered.filter(photo => photo.consentToShare === consentValue);
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(photo => new Date(photo.createdAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(photo => new Date(photo.createdAt) <= new Date(filters.dateTo));
    }

    setFilteredPhotos(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dealership: 'all',
      model: 'all',
      consent: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const downloadPhoto = async (photo) => {
    try {
      const response = await fetch(photo.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.customerName}_${photo.vehicleModel}_${photo.createdAt.split('T')[0]}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Photo download has begun",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Could not download the photo",
      });
    }
  };

  const uniqueModels = [...new Set(photos.map(photo => photo.vehicleModel).filter(Boolean))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Photo Gallery</h2>
            <p className="text-muted-foreground">Loading photos...</p>
          </div>
        </div>
        <GalleryLoadingSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Photo Gallery</h2>
          <p className="text-muted-foreground">
            {filteredPhotos.length} of {photos.length} photos
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Customer, vehicle, dealership..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Dealership (OEM only) */}
            {userRole === 'oem_admin' && (
              <div className="space-y-2">
                <Label>Dealership</Label>
                <Select value={filters.dealership} onValueChange={(value) => handleFilterChange('dealership', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All dealerships" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dealerships</SelectItem>
                    {dealerships.map(dealership => (
                      <SelectItem key={dealership.id} value={dealership.id}>
                        {dealership.name} - {dealership.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label>Vehicle Model</Label>
              <Select value={filters.model} onValueChange={(value) => handleFilterChange('model', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {uniqueModels.map(model => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Consent Filter */}
            <div className="space-y-2">
              <Label>Sharing Consent</Label>
              <Select value={filters.consent} onValueChange={(value) => handleFilterChange('consent', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All photos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Photos</SelectItem>
                  <SelectItem value="yes">With Consent</SelectItem>
                  <SelectItem value="no">Without Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {photos.length === 0 ? "No photos available" : "No photos match your filters"}
          </div>
          {photos.length > 0 && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <LazyImage
                  src={photo.imageUrl}
                  alt={`${photo.customerName} delivery photo`}
                  className="cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                  aspectRatio="square"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={photo.consentToShare ? "default" : "secondary"} className="text-xs">
                    {photo.consentToShare ? "✓ Consent" : "✗ No Consent"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm truncate">{photo.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {photo.vehicleModel} {photo.vehicleVariant}
                  </p>
                  {userRole === 'oem_admin' && (
                    <p className="text-xs text-muted-foreground">{photo.dealershipName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPhoto(photo)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={selectedPhoto !== null} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Photo Details</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="aspect-video relative">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={`${selectedPhoto.customerName} delivery photo`}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Customer Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedPhoto.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vehicle</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedPhoto.vehicleModel} {selectedPhoto.vehicleVariant} - {selectedPhoto.vehicleColor}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">{selectedPhoto.whatsappNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {userRole === 'oem_admin' && (
                    <div>
                      <Label className="text-sm font-medium">Dealership</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedPhoto.dealershipName} - {selectedPhoto.dealershipCity}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Operator</Label>
                    <p className="text-sm text-muted-foreground">{selectedPhoto.operatorName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Delivery Date</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedPhoto.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Sharing Consent</Label>
                    <Badge variant={selectedPhoto.consentToShare ? "default" : "secondary"}>
                      {selectedPhoto.consentToShare ? "Yes - Approved for sharing" : "No - Private use only"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => downloadPhoto(selectedPhoto)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Photo
                </Button>
                <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;