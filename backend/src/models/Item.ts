import mongoose, { Document, Schema } from 'mongoose';

// Interface for Item document
export interface IItem extends Document {
  itemId: string;
  name: string;
  description: string;
  price: string;
  seller: string;
  buyer?: string;
  status: 'listed' | 'sold';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Item model with static methods
export interface IItemModel extends mongoose.Model<IItem> {
  findByItemId(itemId: string): Promise<IItem | null>;
  markAsSold(itemId: string, buyer: string): Promise<IItem | null>;
}

// Define Item schema
const itemSchema = new Schema<IItem, IItemModel>({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: String,
    required: true
  },
  seller: {
    type: String,
    required: true
  },
  buyer: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['listed', 'sold'],
    default: 'listed'
  },
  imageUrl: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add static methods to the schema
itemSchema.static('findByItemId', function(itemId: string): Promise<IItem | null> {
  return this.findOne({ itemId });
});

itemSchema.static('markAsSold', function(itemId: string, buyer: string): Promise<IItem | null> {
  return this.findOneAndUpdate(
    { itemId },
    { 
      $set: { 
        status: 'sold', 
        buyer, 
        updatedAt: new Date() 
      } 
    },
    { new: true }
  );
});

// Create and export the model
export const Item = mongoose.model<IItem, IItemModel>('Item', itemSchema); 