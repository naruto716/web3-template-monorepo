import mongoose, { Document, Schema } from 'mongoose';

// Interface for Skill
interface ISkill {
  name: string;
  hourlyRate: string;
  yearsOfExperience: number;
}

// Interface for Talent document
export interface ITalent extends Document {
  name: string;
  description: string;
  skills: ISkill[];
  availability: boolean;
  experience: 'entry' | 'intermediate' | 'expert';
  location: string;
  walletAddress: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Skill schema
const skillSchema = new Schema<ISkill>({
  name: {
    type: String,
    required: true
  },
  hourlyRate: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0
  }
});

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
  skills: [skillSchema],
  availability: {
    type: Boolean,
    default: true
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
talentSchema.index({ 
  name: 'text', 
  description: 'text',
  'skills.name': 'text'
});

// Add index for skills.name for better query performance
talentSchema.index({ 'skills.name': 1 });

export const Talent = mongoose.model<ITalent>('Talent', talentSchema); 