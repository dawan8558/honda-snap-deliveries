import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building, UserCheck } from 'lucide-react';
import { SearchFilter } from '@/components/ui/search-filter';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all users with dealership info
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          dealerships:dealership_id (name, city)
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch dealerships for filter options
      const { data: dealershipsData, error: dealershipsError } = await supabase
        .from('dealerships')
        .select('*')
        .order('name');

      if (dealershipsError) throw dealershipsError;

      setUsers(usersData || []);
      setDealerships(dealershipsData || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserDealership = async (userId, dealershipId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ dealership_id: dealershipId })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User dealership updated successfully",
      });

      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'oem_admin': return 'default';
      case 'dealership_admin': return 'secondary';
      case 'operator': return 'outline';
      default: return 'outline';
    }
  };

  const filterOptions = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'oem_admin', label: 'OEM Admin' },
        { value: 'dealership_admin', label: 'Dealership Admin' },
        { value: 'operator', label: 'Operator' }
      ]
    },
    {
      key: 'dealership_id',
      label: 'Dealership',
      type: 'select',
      options: dealerships.map(d => ({ value: d.id, label: d.name }))
    }
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchableFields = [user.name, user.email, user.dealerships?.name];
      if (!searchableFields.some(field => field?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }

    // Role filter
    if (activeFilters.role && user.role !== activeFilters.role) {
      return false;
    }

    // Dealership filter
    if (activeFilters.dealership_id && user.dealership_id !== activeFilters.dealership_id) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading user management...</div>;
  }

  const summary = {
    total: users.length,
    oem_admins: users.filter(u => u.role === 'oem_admin').length,
    dealership_admins: users.filter(u => u.role === 'dealership_admin').length,
    operators: users.filter(u => u.role === 'operator').length
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">OEM Admins</p>
                <p className="text-2xl font-bold">{summary.oem_admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Dealership Admins</p>
                <p className="text-2xl font-bold">{summary.dealership_admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Operators</p>
                <p className="text-2xl font-bold">{summary.operators}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all users across the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchFilter
            searchPlaceholder="Search users by name, email, or dealership..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
            onClearFilters={() => setActiveFilters({})}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dealership</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.dealerships ? `${user.dealerships.name} (${user.dealerships.city})` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oem_admin">OEM Admin</SelectItem>
                          <SelectItem value="dealership_admin">Dealership Admin</SelectItem>
                          <SelectItem value="operator">Operator</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {user.role !== 'oem_admin' && (
                        <Select
                          value={user.dealership_id || ''}
                          onValueChange={(dealershipId) => updateUserDealership(user.id, dealershipId)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select dealership" />
                          </SelectTrigger>
                          <SelectContent>
                            {dealerships.map((dealership) => (
                              <SelectItem key={dealership.id} value={dealership.id}>
                                {dealership.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;