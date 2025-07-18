/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 * 
 * This file extends Vite's default environment variable types to include
 * custom environment variables used by the PCB Netlist Visualizer application.
 * Provides TypeScript support for import.meta.env with custom variables.
 */

/**
 * Custom environment variables interface
 * Add new environment variables here to get TypeScript support
 */
interface ImportMetaEnv {
  /** API base URL for backend communication (optional, has fallbacks) */
  readonly VITE_API_BASE_URL: string
  // Add more environment variables here as the application grows
}

/**
 * Extended ImportMeta interface with custom environment variables
 * Ensures TypeScript recognizes our custom env variables
 */
interface ImportMeta {
  readonly env: ImportMetaEnv
}
