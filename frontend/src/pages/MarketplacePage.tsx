import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchItems, buyItem } from '@/features/marketplace/marketplaceSlice';
import { MarketplaceItem } from '@/features/marketplace/components/MarketplaceItem';

export function MarketplacePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.marketplace);
  const { isConnected } = useAppSelector((state) => state.auth);
  
  // Buying state
  const [buyingItemId, setBuyingItemId] = useState<number | null>(null);
  
  // Filters
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showForSale, setShowForSale] = useState(true);
  const [showSold, setShowSold] = useState(false);
  
  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);
  
  const handleBuyItem = async (itemId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      setBuyingItemId(itemId);
      await dispatch(buyItem(itemId)).unwrap();
      alert('Item purchased successfully!');
    } catch (error) {
      alert(`Failed to buy item: ${error}`);
    } finally {
      setBuyingItemId(null);
    }
  };
  
  const filteredItems = items.filter(item => {
    // Apply filters
    if (showForSale && !showSold) {
      if (!item.isForSale) return false;
    } else if (!showForSale && showSold) {
      if (item.isForSale) return false;
    }
    
    // Price filter
    if (priceMin && parseFloat(item.price) < parseFloat(priceMin)) return false;
    if (priceMax && parseFloat(item.price) > parseFloat(priceMax)) return false;
    
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <Button 
          disabled={!isConnected}
          onClick={() => navigate('/list-item')}
        >
          List New Item
        </Button>
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
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="text"
                    placeholder="Max"
                    className="border rounded p-1 w-full text-sm"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="for-sale" 
                      className="mr-2"
                      checked={showForSale}
                      onChange={(e) => setShowForSale(e.target.checked)}
                    />
                    <label htmlFor="for-sale" className="text-sm">For Sale</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="sold" 
                      className="mr-2" 
                      checked={showSold}
                      onChange={(e) => setShowSold(e.target.checked)}
                    />
                    <label htmlFor="sold" className="text-sm">Sold</label>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => dispatch(fetchItems())}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-8">Loading items...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">No items found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MarketplaceItem 
                  key={item.id} 
                  item={item} 
                  onBuy={handleBuyItem}
                  isProcessing={buyingItemId === item.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 