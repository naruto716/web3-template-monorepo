import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { listItem } from '@/features/marketplace/marketplaceSlice';

export function ListItemPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!name || !description || !price) {
      alert('Please fill all fields');
      return;
    }
    
    // Validate price is a valid number
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the listItem thunk action
      await dispatch(listItem({ name, description, price })).unwrap();
      alert('Item listed successfully!');
      navigate('/marketplace');
    } catch (error) {
      console.error('Error listing item:', error);
      alert('Error listing item: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">List New Item</h1>
      
      {!isConnected ? (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-6">
          Please connect your wallet to list an item.
        </div>
      ) : null}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Item Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="e.g. Digital Artwork #1"
            disabled={isSubmitting || !isConnected}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-md h-24"
            placeholder="Describe your item..."
            disabled={isSubmitting || !isConnected}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Price (ETH)
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="e.g. 0.1"
            disabled={isSubmitting || !isConnected}
          />
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !isConnected}
          >
            {isSubmitting ? 'Listing...' : 'List Item'}
          </Button>
        </div>
        
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/marketplace')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 