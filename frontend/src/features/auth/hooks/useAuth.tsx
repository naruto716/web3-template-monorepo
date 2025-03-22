import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { connectWallet, disconnectWallet, authenticateWithBackend } from '../authSlice';
import { LoginPrompt } from '../components/LoginPrompt';

export function useAuth() {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dispatch = useAppDispatch();
  const { 
    isConnected, 
    isConnecting, 
    isAuthenticated, 
    loading, 
    address, 
    roles,
    error 
  } = useAppSelector((state) => state.auth);

  const connect = async () => {
    await dispatch(connectWallet());
  };

  const disconnect = () => {
    dispatch(disconnectWallet());
  };

  const authenticate = () => {
    if (address) {
      dispatch(authenticateWithBackend(address));
    }
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return false;
    }
    return true;
  };

  const requireRole = (requiredRoles: string[]) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return false;
    }
    
    const hasRequiredRole = roles && roles.some(role => requiredRoles.includes(role));
    return hasRequiredRole || false;
  };

  const closeLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  // Render the login prompt if needed
  const LoginDialog = showLoginPrompt ? (
    <LoginPrompt isOpen={showLoginPrompt} onClose={closeLoginPrompt} />
  ) : null;

  return {
    isConnected,
    isConnecting,
    isAuthenticated,
    loading,
    address,
    roles: roles || [],
    error,
    connect,
    disconnect,
    authenticate,
    requireAuth,
    requireRole,
    LoginDialog,
  };
} 