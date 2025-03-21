import mongoose, { Document, Schema } from 'mongoose';

// Interface for Transaction document
export interface ITransaction extends Document {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  timestamp?: Date;
  eventType?: string;
  itemId?: string;
  seller?: string;
  buyer?: string;
  price?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Transaction schema
const transactionSchema = new Schema<ITransaction>({
  hash: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number,
    default: null
  },
  gasUsed: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: null
  },
  // Event-specific fields
  eventType: {
    type: String,
    default: null
  },
  itemId: {
    type: String,
    default: null
  },
  seller: {
    type: String,
    default: null
  },
  buyer: {
    type: String,
    default: null
  },
  price: {
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

// Create and export the model
export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema); 