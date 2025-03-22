import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole, IUser } from '../models/User';
import { Request, Response, NextFunction } from 'express';

// Generate a random nonce for authentication
export const generateNonce = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Verify a signature against a wallet address and message
export const verifySignature = (
  message: string,
  signature: string,
  walletAddress: string
): boolean => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    return false;
  }
};

// Generate a JWT token for a user
export const generateToken = (user: IUser): string => {
  const secretKey = process.env.JWT_SECRET;
  
  if (!secretKey) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  return jwt.sign(
    {
      walletAddress: user.walletAddress,
      roles: user.roles,
    },
    secretKey,
    {
      expiresIn: '24h',
    }
  );
};

// Define the structure for the authenticated request
export interface AuthRequest extends Request {
  user?: {
    walletAddress: string;
    roles: UserRole[];
  };
}

// Authentication middleware
export const authenticateJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized - No token provided' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET;
    
    if (!secretKey) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    
    const decoded = jwt.verify(token, secretKey) as { 
      walletAddress: string;
      roles: UserRole[];
    };
    
    req.user = {
      walletAddress: decoded.walletAddress,
      roles: decoded.roles,
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// Role-based access control middleware
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized - Authentication required' });
      return;
    }
    
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role as UserRole));
    
    if (!hasPermission) {
      res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
      return;
    }
    
    next();
  };
}; 