import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi, UpdateRolesRequest } from '@/services/api/auth';

export function AdminPage() {
  const { isAuthenticated, roles, requireAuth, requireRole, LoginDialog } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check if the user is an admin
  const isAdmin = roles.includes('admin');

  // All available roles
  const availableRoles = ['user', 'professional', 'admin'];

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  };

  const handleUpdateRoles = async () => {
    // Check if input is valid
    if (!walletAddress || selectedRoles.length === 0) {
      setMessage({
        text: 'Please enter a wallet address and select at least one role',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Prepare the request
      const request: UpdateRolesRequest = {
        walletAddress,
        roles: selectedRoles
      };
      
      // Send the request
      const response = await authApi.updateUserRoles(request);
      
      // Show success message
      setMessage({
        text: `User roles updated successfully: ${response.user.roles.join(', ')}`,
        type: 'success'
      });
      
      // Clear the form
      setWalletAddress('');
      setSelectedRoles([]);
    } catch (error) {
      console.error('Failed to update roles:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to update user roles',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    requireAuth();
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to be logged in to access the admin panel
            </CardDescription>
          </CardHeader>
        </Card>
        {LoginDialog}
      </div>
    );
  }

  // If not an admin, show access denied
  if (!isAdmin) {
    requireRole(['admin']);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin panel
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage User Roles</CardTitle>
          <CardDescription>
            Change roles for users in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-col space-y-2">
              {availableRoles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked === true)}
                  />
                  <Label htmlFor={`role-${role}`} className="capitalize">
                    {role}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {message && (
            <div className={`p-3 rounded ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateRoles} disabled={loading}>
            {loading ? 'Updating Roles...' : 'Update Roles'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 