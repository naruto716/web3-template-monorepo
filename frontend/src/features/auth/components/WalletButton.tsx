import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { connectWallet, disconnectWallet } from '../authSlice';

export function WalletButton() {
  const dispatch = useAppDispatch();
  const { isConnected, isConnecting, address } = useAppSelector((state) => state.auth);

  const handleConnect = () => {
    dispatch(connectWallet());
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
  };

  // Function to truncate the wallet address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {truncateAddress(address)}
        </span>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={isConnecting}
      variant="outline"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
} 