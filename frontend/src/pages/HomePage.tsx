import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="space-y-12">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Web3 Marketplace!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Buy and sell digital items on our decentralized marketplace.
        </p>
        <Button size="lg">
          <Link to="/marketplace">Explore Marketplace</Link>
        </Button>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Featured Items
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardHeader>
                <CardTitle>Digital Item #{item}</CardTitle>
                <CardDescription>Listed by 0x123...4567</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square bg-gray-100 rounded-md mb-3" />
                <p className="text-sm">A sample digital item for demonstration.</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-sm font-medium">0.1 ETH</span>
                <Link to={`/item/${item}`}>
                  <Button variant="outline" size="sm">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-10 rounded-lg">
        <div className="container px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-bold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">Connect your Ethereum wallet to get started.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-bold mb-2">Browse Items</h3>
              <p className="text-gray-600">Explore digital items listed for sale.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-bold mb-2">Buy or Sell</h3>
              <p className="text-gray-600">Purchase items or list your own for sale.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 