import { Request, Response } from 'express';
import { User, UserRole } from '../../models/User';
import { generateNonce, verifySignature, generateToken, AuthRequest } from '../../utils/auth';
import logger from '../../utils/logger';

/**
 * Request a challenge (nonce) for authentication
 */
export const requestChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      res.status(400).json({ error: 'Wallet address is required' });
      return;
    }
    
    const normalizedAddress = walletAddress.toLowerCase();
    const nonce = generateNonce();
    
    // Find user or create if not exists
    const user = await User.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { 
        walletAddress: normalizedAddress, 
        nonce,
        $setOnInsert: { roles: [UserRole.EMPLOYER] }
      },
      { upsert: true, new: true }
    );
    
    res.status(200).json({
      message: 'Challenge created',
      challenge: `Sign this message to authenticate: ${nonce}`,
      nonce,
    });
  } catch (error) {
    logger.error('Error in requestChallenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify wallet signature and authenticate user
 */
export const verifyChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, signature, nonce } = req.body;
    
    if (!walletAddress || !signature || !nonce) {
      res.status(400).json({ error: 'Wallet address, signature, and nonce are required' });
      return;
    }
    
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Find user with matching wallet address
    const user = await User.findOne({ walletAddress: normalizedAddress });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    // Verify the nonce matches
    if (user.nonce !== nonce) {
      res.status(401).json({ error: 'Invalid nonce' });
      return;
    }
    
    // Construct the message that was signed
    const message = `Sign this message to authenticate: ${nonce}`;
    
    // Verify signature
    const isValidSignature = verifySignature(message, signature, normalizedAddress);
    
    if (!isValidSignature) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    
    // Generate a new nonce for next login
    user.nonce = generateNonce();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        walletAddress: user.walletAddress,
        roles: user.roles,
      },
    });
  } catch (error) {
    logger.error('Error in verifyChallenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get the current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      walletAddress: user.walletAddress,
      roles: user.roles,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error('Error in getProfile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user roles (admin only)
 */
export const updateUserRoles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.roles.includes(UserRole.ADMIN)) {
      res.status(403).json({ error: 'Forbidden - Admin access required' });
      return;
    }
    
    const { walletAddress, roles } = req.body;
    
    if (!walletAddress || !roles || !Array.isArray(roles)) {
      res.status(400).json({ error: 'Wallet address and roles array are required' });
      return;
    }
    
    // Validate roles
    const validRoles = roles.every(role => Object.values(UserRole).includes(role as UserRole));
    
    if (!validRoles) {
      res.status(400).json({ error: 'Invalid roles provided' });
      return;
    }
    
    const user = await User.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { roles },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      message: 'User roles updated',
      user: {
        walletAddress: user.walletAddress,
        roles: user.roles,
      },
    });
  } catch (error) {
    logger.error('Error in updateUserRoles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 