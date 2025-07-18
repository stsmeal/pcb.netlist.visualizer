/**
 * Application Configuration Module
 * 
 * Centralized configuration management for the PCB Netlist Visualizer client.
 * Handles environment-specific settings including API endpoints and build modes.
 * Uses Vite's environment variable system for configuration.
 */

/**
 * Determines the appropriate API base URL based on environment
 * Supports both explicit environment variables and automatic detection
 * 
 * @returns The base URL for API requests
 */
const getApiBaseUrl = (): string => {
  // First priority: explicit environment variable from .env files
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Fallback: automatic detection based on current environment
  const isDevelopment = import.meta.env.DEV || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // Local development server
    return 'http://localhost:3000';
  }
  
  // Production/staging fallback
  return 'https://api.dev.local';
};

/**
 * Main configuration object containing all application settings
 * Exported as both named export and default export for flexibility
 */
export const config = {
  /** Base URL for all API requests */
  apiBaseUrl: getApiBaseUrl(),
  /** Flag indicating if running in development mode */
  isDevelopment: import.meta.env.DEV,
  /** Current build environment (development, production, etc.) */
  environment: import.meta.env.MODE,
  // Additional configuration options can be added here as needed
};

// Default export for convenient importing
export default config;
