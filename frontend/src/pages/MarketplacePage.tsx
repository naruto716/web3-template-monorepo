import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Sample marketplace items
const SAMPLE_ITEMS = [
  {
    id: 1,
    name: 'Digital Artwork #1',
    description: 'A beautiful digital artwork',
    seller: '0x1234...5678',
    price: '0.2 ETH',
  },
  {
    id: 2,
    name: 'Game Item #42',
    description: 'A rare in-game collectible',
    seller: '0x8765...4321',
    price: '0.05 ETH',
  },
  {
    id: 3,
    name: 'Virtual Land Parcel',
    description: 'Prime location in the metaverse',
    seller: '0x5432...1098',
    price: '1.5 ETH',
  },
  {
    id: 4,
    name: 'Digital Membership',
    description: 'VIP access to exclusive digital content',
    seller: '0x9876...5432',
    price: '0.3 ETH',
  },
  {
    id: 5,
    name: 'Music NFT',
    description: 'Exclusive track from your favorite artist',
    seller: '0x6543...2109',
    price: '0.08 ETH',
  },
  {
    id: 6,
    name: 'Virtual Wearable',
    description: 'Stylish item for your avatar',
    seller: '0x2109...8765',
    price: '0.12 ETH',
  },
];

export function MarketplacePage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button>List New Item</Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-64 shrink-0 space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Min"
                    className="border rounded p-1 w-full text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="text"
                    placeholder="Max"
                    className="border rounded p-1 w-full text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <input type="checkbox" id="for-sale" className="mr-2" />
                    <label htmlFor="for-sale" className="text-sm">For Sale</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="sold" className="mr-2" />
                    <label htmlFor="sold" className="text-sm">Sold</label>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_ITEMS.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>Listed by {item.seller}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-md mb-3" />
                  <p className="text-sm">{item.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <span className="text-sm font-medium">{item.price}</span>
                  <Button variant="default" size="sm">Buy Now</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 