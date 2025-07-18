// Configuration import for API base URL
import config from '../config';

/**
 * API Service Module
 * 
 * Provides HTTP client functionality for communicating with the backend API.
 * Handles authentication, error handling, and JSON serialization/deserialization.
 * Used throughout the application for all server communication.
 */

/**
 * Generic API request function with authentication and error handling
 * 
 * @param path - API endpoint path (relative to base URL)
 * @param body - Request body data (will be JSON serialized)
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param useAuth - Whether to include authentication token in headers
 * @returns Promise resolving to the parsed JSON response
 * @throws Error with server message or generic message on failure
 */
export async function api(path: string, body: any, method: string, useAuth: boolean = true) {
  // Build headers with optional authentication
  const headers: HeadersInit | undefined = useAuth
    ? {
        'Content-Type': 'application/json',
        authorization: `Bearer ${localStorage.getItem('token')}`, // JWT token from localStorage
      }
    : {
        'Content-Type': 'application/json',
      };

  // Make the HTTP request
  const res = await fetch(`${config.apiBaseUrl}/${path}`, {
    method: method,
    headers: headers,
    body: body != null ? JSON.stringify(body) : undefined, // Only serialize if body exists
  });

  // Handle HTTP error responses
  if (!res.ok) {
    const error = await res.json().catch(() => ({})); // Fallback to empty object if JSON parse fails
    throw new Error(error.message || 'Request failed');
  }

  // Parse and return successful response
  return res.json();
}

/**
 * Convenience function for GET requests
 * 
 * @param path - API endpoint path
 * @param useAuth - Whether to include authentication (default: true)
 * @returns Promise resolving to the response data
 */
export async function get(path: string, useAuth: boolean = true) {
  return await api(path, null, 'GET', useAuth);
}

/**
 * Convenience function for POST requests
 * 
 * @param path - API endpoint path
 * @param body - Request body data to be sent
 * @param useAuth - Whether to include authentication (default: true)
 * @returns Promise resolving to the response data
 */
export async function post(path: string, body: any, useAuth: boolean = true) {
  return await api(path, body, 'POST', useAuth);
}
