import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, roles } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to home page but save the current location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If roles are required, check if user has at least one of them
  if (requiredRoles.length > 0) {
    const hasRequiredRole = roles.some(role => requiredRoles.includes(role));
    
    if (!hasRequiredRole) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      );
    }
  }

  // If authenticated and has required roles, render the children
  return <>{children}</>;
} 