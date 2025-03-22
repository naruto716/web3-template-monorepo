import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { connectWallet, disconnectWallet, authenticateWithBackend } from '../authSlice';

export function WalletButton() {
  const dispatch = useAppDispatch();
  const { isConnected, isConnecting, isAuthenticated, loading, address, roles } = useAppSelector((state) => state.auth);

  const handleConnect = () => {
    dispatch(connectWallet());
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
  };

  const handleAuthenticate = () => {
    if (address) {
      dispatch(authenticateWithBackend(address));
    }
  };

  // Function to truncate the wallet address for display
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Show role badge if user is authenticated
  const getRoleBadge = () => {
    if (!isAuthenticated || !roles || roles.length === 0) return null;
    
    const highestRole = roles.includes('admin') 
      ? 'admin' 
      : roles.includes('professional') 
        ? 'professional' 
        : 'employer';
    
    const badgeColors = {
      admin: 'bg-purple-100 text-purple-800',
      professional: 'bg-blue-100 text-blue-800',
      employer: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeColors[highestRole as keyof typeof badgeColors]}`}>
        {highestRole}
      </span>
    );
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {getRoleBadge()}
        <span className="text-sm text-gray-600">
          {truncateAddress(address)}
        </span>
        {isAuthenticated ? (
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAuthenticate}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting || loading}
      variant="outline"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
} 