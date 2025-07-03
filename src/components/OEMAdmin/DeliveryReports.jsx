import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DeliveryReports = ({ userRole }) => {
  const [deliveries] = useState([
    {
      id: 1,
      vehicle_id: 2,
      vehicle_model: 'Civic RS',
      vehicle_color: 'Metallic Black',
      operator_name: 'Ahmed Ali',
      dealership_name: 'Honda Karachi Central',
      customer_name: 'John Doe',
      whatsapp_number: '+923001234567',
      framed_image_urls: ['/placeholder-delivery.jpg'],
      consent_to_share: true,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      vehicle_id: 1,
      vehicle_model: 'City Aspire',
      vehicle_color: 'Pearl White',
      operator_name: 'Sara Khan',
      dealership_name: 'Honda Lahore Main',
      customer_name: 'Jane Smith',
      whatsapp_number: '+923009876543',
      framed_image_urls: ['/placeholder-delivery.jpg', '/placeholder-delivery2.jpg'],
      consent_to_share: false,
      created_at: '2024-01-14T14:20:00Z'
    }
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filters, setFilters] = useState({
    dealership: '',
    model: '',
    date: ''
  });

  const dealerships = ['Honda Karachi Central', 'Honda Lahore Main', 'Honda Islamabad'];
  const models = ['City', 'Civic', 'Accord', 'HR-V', 'CR-V'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Dealership</label>
              <Select value={filters.dealership} onValueChange={(value) => setFilters({ ...filters, dealership: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All dealerships" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All dealerships</SelectItem>
                  {dealerships.map((dealership) => (
                    <SelectItem key={dealership} value={dealership}>{dealership}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Car Model</label>
              <Select value={filters.model} onValueChange={(value) => setFilters({ ...filters, model: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All models" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All models</SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Reports</CardTitle>
          <CardDescription>View all delivery submissions and photos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Dealership</TableHead>
                <TableHead>Consent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{delivery.vehicle_model}</div>
                      <div className="text-sm text-muted-foreground">{delivery.vehicle_color}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{delivery.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{delivery.whatsapp_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>{delivery.operator_name}</TableCell>
                  <TableCell>{delivery.dealership_name}</TableCell>
                  <TableCell>
                    <Badge variant={delivery.consent_to_share ? "default" : "secondary"}>
                      {delivery.consent_to_share ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(delivery.created_at)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedDelivery(delivery)}>
                          View Photos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Delivery Photos - {delivery.customer_name}</DialogTitle>
                          <DialogDescription>
                            {delivery.vehicle_model} delivered by {delivery.operator_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                          {delivery.framed_image_urls.map((url, index) => (
                            <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Delivery photo ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/placeholder-delivery.jpg';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryReports;