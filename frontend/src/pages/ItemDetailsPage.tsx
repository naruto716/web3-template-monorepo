import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";

export function ItemDetailsPage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Digital Item #{id}</CardTitle>
          <CardDescription>Listed by 0x123...4567</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-square bg-gray-100 rounded-lg" />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-600">A detailed description of this digital item.</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="text-lg font-semibold">0.1 ETH</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Token ID</h3>
                <p className="text-lg font-semibold">#{id}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Item Properties</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((prop) => (
                  <div key={prop} className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Property {prop}</p>
                    <p className="font-medium">Value {prop}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline">Share</Button>
          <Button>Purchase Now</Button>
        </CardFooter>
      </Card>
    </div>
  );
}