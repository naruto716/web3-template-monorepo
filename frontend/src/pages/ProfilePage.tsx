import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi, UserProfile } from '@/services/api/auth';
import { ContractTimeline } from '@/features/contracts/components/ContractTimeline';
import { contractsApi } from '@/services/api/contracts';
import { Offer } from '@/services/api/offer';

export function ProfilePage() {
  const { isAuthenticated, address, roles, requireAuth, LoginDialog } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contracts, setContracts] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (isAuthenticated) {
      fetchProfile();
      fetchUserContracts();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userProfile = await authApi.getProfile();
      setProfile(userProfile);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserContracts = async () => {
    if (!isAuthenticated) return;
    
    setContractsLoading(true);
    
    try {
      const response = await contractsApi.getUserContracts();
      setContracts(response.offers);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setContractsLoading(false);
    }
  };

  const handleViewProfile = () => {
    const isAuthed = requireAuth();
    if (isAuthed) {
      fetchProfile();
      fetchUserContracts();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Profile</h1>
      
      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Connect your wallet to view your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleViewProfile}>
              Connect Wallet & Authenticate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
              <CardDescription>
                Your connected wallet and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p>Loading profile...</p>
              ) : error ? (
                <div className="text-red-500">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchProfile}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              ) : profile ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">Wallet Address:</div>
                    <div className="font-mono break-all">{address}</div>
                    
                    <div className="font-semibold">Roles:</div>
                    <div className="flex flex-wrap gap-2">
                      {roles && roles.map((role) => {
                        // Dynamic color mapping for different roles
                        const colors = {
                          professional: "bg-blue-100 text-blue-800 border border-blue-200 shadow-sm hover:bg-blue-200",
                          employer: "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm hover:bg-emerald-200",
                          admin: "bg-purple-100 text-purple-800 border border-purple-200 shadow-sm hover:bg-purple-200",
                          // Default colors for any other roles
                          default: "bg-amber-100 text-amber-800 border border-amber-200 shadow-sm hover:bg-amber-200"
                        };
                        
                        const colorClass = colors[role as keyof typeof colors] || colors.default;
                        
                        return (
                          <span
                            key={role}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${colorClass}`}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                    
                    <div className="font-semibold">Member Since:</div>
                    <div>
                      {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </>
              ) : (
                <Button onClick={fetchProfile}>Load Profile Data</Button>
              )}
            </CardContent>
          </Card>
          
          {/* Contract Timeline */}
          <ContractTimeline 
            contracts={contracts} 
            loading={contractsLoading}
            title={roles?.includes('professional') ? "My Freelance Contracts" : "My Projects"}
          />
        </div>
      )}
      
      {/* Login dialog will show when requireAuth is called and user is not authenticated */}
      {LoginDialog}
    </div>
  );
} 