import mongoose, { Document, Schema } from 'mongoose';

// Interface for Talent document
export interface ITalent extends Document {
  name: string;
  description: string;
  skills: string[];
  hourlyRate: string;
  availability: boolean;
  rating: number;
  experience: 'entry' | 'intermediate' | 'expert';
  location: string;
  completedJobs: number;
  walletAddress: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Talent schema
const talentSchema = new Schema<ITalent>({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    index: true
  }],
  hourlyRate: {
    type: String,
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  experience: {
    type: String,
    enum: ['entry', 'intermediate', 'expert'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String
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

// Add text index for search
talentSchema.index({ name: 'text', description: 'text', skills: 'text' });

export const Talent = mongoose.model<ITalent>('Talent', talentSchema); 