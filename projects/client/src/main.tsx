// React imports for application initialization
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Global application styles
import './index.css';
// Root application component
import App from './App.tsx';

/**
 * Application Entry Point
 * 
 * Initializes and renders the PCB Netlist Visualizer React application.
 * Uses React 18's createRoot API for improved performance and concurrent features.
 * Wraps the application in StrictMode for development-time checks and warnings.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
