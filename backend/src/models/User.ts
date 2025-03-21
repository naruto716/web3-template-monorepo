import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  USER = 'user',
  PROFESSIONAL = 'professional', 
  ADMIN = 'admin'
}

export interface IUser extends Document {
  walletAddress: string;
  roles: UserRole[];
  nonce: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
    },
    nonce: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Create and export User model
export const User = mongoose.model<IUser>('User', UserSchema); 