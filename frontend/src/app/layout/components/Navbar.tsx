import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/features/auth/components/WalletButton';

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold">Web3 Marketplace</Link>
        </div>
        
        <div className="flex gap-4">
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="ghost">Marketplace</Button>
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
} 