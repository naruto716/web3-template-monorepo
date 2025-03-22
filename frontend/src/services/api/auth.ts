import client from './client';

// Interfaces for auth responses and requests
export interface AuthChallengeResponse {
  message: string;
  challenge: string;
  nonce: string;
}

export interface AuthVerifyRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
}

export interface AuthVerifyResponse {
  message: string;
  token: string;
  user: {
    walletAddress: string;
    roles: string[];
  };
}

export interface UserProfile {
  _id?: string;
  walletAddress: string;
  roles: string[];
  createdAt: string;
}

export interface UpdateRolesRequest {
  walletAddress: string;
  roles: string[];
}

export interface UpdateRolesResponse {
  message: string;
  user: {
    walletAddress: string;
    roles: string[];
  };
}

// Auth service for interacting with the authentication API
export const authApi = {
  // Request a challenge to sign with wallet
  requestChallenge: async (walletAddress: string): Promise<AuthChallengeResponse> => {
    const response = await client.post<AuthChallengeResponse>('/auth/challenge', {
      walletAddress,
    });
    return response.data;
  },

  // Verify a signature and get authentication token
  verifySignature: async (data: AuthVerifyRequest): Promise<AuthVerifyResponse> => {
    const response = await client.post<AuthVerifyResponse>('/auth/verify', data);
    return response.data;
  },

  // Get the current user profile
  getProfile: async (): Promise<UserProfile> => {
    const response = await client.get<UserProfile>('/auth/profile');
    return response.data;
  },
  
  // Update a user's roles (admin only)
  updateUserRoles: async (data: UpdateRolesRequest): Promise<UpdateRolesResponse> => {
    const response = await client.put<UpdateRolesResponse>('/auth/roles', data);
    return response.data;
  }
}; 