// React hooks for state management and lifecycle
import { useEffect, useState, type ReactNode } from 'react';
// React Router for navigation and location management
import { Navigate, useLocation } from 'react-router-dom';
// API service for authentication verification
import { get } from '../services/ApiService';

/**
 * Props interface for the RequireAuth component
 */
interface RequireAuthProps {
  /** Child components to render if user is authenticated */
  children: ReactNode;
}

/**
 * RequireAuth Component
 * 
 * Authentication guard component that protects routes requiring user login.
 * Verifies user authentication by making an API call to the user endpoint.
 * Redirects to login page if authentication fails, while preserving the
 * intended destination for post-login redirect.
 * 
 * Features:
 * - Automatic authentication verification on mount
 * - Loading state while checking authentication
 * - Redirect to login with return location preservation
 * - Clean wrapper for protecting any component tree
 * 
 * @param children - Components to render if user is authenticated
 */
const RequireAuth = ({ children }: RequireAuthProps) => {
  // Get current location for post-login redirect
  const location = useLocation();
  // Track authentication status: null = checking, true = authenticated, false = not authenticated
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    /**
     * Verifies user authentication by calling the protected user endpoint
     * Sets authorization state based on API response
     */
    const checkAuth = async () => {
      try {
        // Attempt to fetch user data (requires valid JWT token)
        await get('user');
        setAuthorized(true);
      } catch {
        // Any error (401, 403, network, etc.) indicates unauthorized
        setAuthorized(false);
      }
    };

    checkAuth();
  }, []); // Run once on component mount

  // Show loading state while checking authentication
  if (authorized === null) return <div>Loading...</div>;

  // Render children if authorized, otherwise redirect to login with return location
  return authorized ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;
