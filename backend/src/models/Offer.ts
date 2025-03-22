import mongoose, { Document, Schema } from 'mongoose';

// Interface for Offer document
export interface IOffer extends Document {
  jobDescription: string;
  startDate: Date;
  endDate: Date;
  totalWorkHours: number;
  totalPay: string;  // In Wei (as string due to large numbers)
  employerId: Schema.Types.ObjectId;
  talentId: Schema.Types.ObjectId;
  status: 'waiting' | 'accepted' | 'paid' | 'working' | 'finished';
  paymentTxHash?: string;  // Transaction hash when payment is made
  workStartedAt?: Date;    // Actual work start timestamp
  workCompletedAt?: Date;  // Actual work completion timestamp
  createdAt: Date;
  updatedAt: Date;
}

// Define Offer schema
const offerSchema = new Schema<IOffer>({
  jobDescription: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalWorkHours: {
    type: Number,
    required: true,
    min: 1
  },
  totalPay: {
    type: String,
    required: true
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  talentId: {
    type: Schema.Types.ObjectId,
    ref: 'Talent',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['waiting', 'accepted', 'paid', 'working', 'finished'],
    default: 'waiting'
  },
  paymentTxHash: {
    type: String,
    sparse: true  // Index only non-null values
  },
  workStartedAt: {
    type: Date
  },
  workCompletedAt: {
    type: Date
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

// Add compound indexes for queries
offerSchema.index({ employerId: 1, status: 1 });
offerSchema.index({ talentId: 1, status: 1 });
offerSchema.index({ status: 1, startDate: 1 });

// Add validation for dates
offerSchema.pre('save', function(next) {
  // Ensure endDate is after startDate
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Ensure dates are not in the past when creating new offer
  if (this.isNew) {
    const now = new Date();
    if (this.startDate < now) {
      next(new Error('Start date cannot be in the past'));
    }
  }

  // Status-specific validations
  if (this.status === 'paid' && !this.paymentTxHash) {
    next(new Error('Payment transaction hash is required when status is paid'));
  }

  if (this.status === 'working' && !this.workStartedAt) {
    this.workStartedAt = new Date();
  }

  if (this.status === 'finished' && !this.workCompletedAt) {
    this.workCompletedAt = new Date();
  }

  next();
});

export const Offer = mongoose.model<IOffer>('Offer', offerSchema); 