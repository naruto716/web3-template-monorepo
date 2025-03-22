import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi, UserProfile } from '@/services/api/auth';

export function ProfilePage() {
  const { isAuthenticated, address, roles, requireAuth, LoginDialog } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (isAuthenticated) {
      fetchProfile();
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

  const handleViewProfile = () => {
    const isAuthed = requireAuth();
    if (isAuthed) {
      fetchProfile();
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
                    <div>
                      {roles && roles.map((role) => (
                        <span
                          key={role}
                          className="inline-block px-2 py-1 mr-2 text-xs rounded-full bg-secondary/20"
                        >
                          {role}
                        </span>
                      ))}
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
        </div>
      )}
      
      {/* Login dialog will show when requireAuth is called and user is not authenticated */}
      {LoginDialog}
    </div>
  );
} 