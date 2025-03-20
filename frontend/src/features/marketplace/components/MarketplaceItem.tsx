import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatAddress } from '@/lib/utils';
import { MarketplaceItem as MarketplaceItemType } from '../marketplaceSlice';

interface MarketplaceItemProps {
  item: MarketplaceItemType;
  onBuy: (id: number) => void;
  isProcessing?: boolean;
}

export function MarketplaceItem({ item, onBuy, isProcessing = false }: MarketplaceItemProps) {
  const handleBuy = () => {
    onBuy(item.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>Listed by {formatAddress(item.seller)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-square bg-gray-100 rounded-md mb-3" />
        <p className="text-sm">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-sm font-medium">{item.price}</span>
        <Button 
          variant="default" 
          size="sm"
          onClick={handleBuy}
          disabled={!item.isForSale || isProcessing}
        >
          {isProcessing 
            ? 'Processing...' 
            : item.isForSale ? 'Buy Now' : 'Sold'}
        </Button>
      </CardFooter>
    </Card>
  );
} 