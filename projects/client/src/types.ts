// D3.js type definitions for force simulation integration
import * as d3 from 'd3';

/**
 * Core Netlist Data Types
 * 
 * These interfaces define the structure of PCB netlist data
 * as used throughout the application for parsing, validation,
 * and visualization.
 */

/**
 * Represents a single electronic component in the netlist
 * Each component has a unique name, type classification, and pin list
 */
export interface NetlistComponent {
  /** Unique identifier for the component (e.g., "R1", "IC1", "C3") */
  name: string;
  /** Component type classification (e.g., "resistor", "ic", "capacitor") */
  type: string;
  /** Array of pin names/numbers for this component */
  pins: string[];
}

/**
 * Represents a net (electrical connection) in the netlist
 * A net connects multiple component pins together electrically
 */
export interface NetConnection {
  /** Name of the net (e.g., "VCC", "GND", "DATA_BUS") */
  net: string;
  /** Array of all component pin connections on this net */
  connections: {
    /** Component name that this connection refers to */
    component: string;
    /** Pin name/number on the specified component */
    pin: string;
  }[];
}

/**
 * Complete netlist data structure containing all components and nets
 * This is the top-level structure for PCB netlist files
 */
export interface NetlistData {
  /** Array of all components in the design */
  components: NetlistComponent[];
  /** Array of all nets (connections) in the design */
  nets: NetConnection[];
}

/**
 * Graph Visualization Types
 * 
 * These interfaces extend D3.js types for force-directed
 * graph visualization of the netlist data.
 */

/**
 * Graph node representing a component in the force simulation
 * Extends D3's SimulationNodeDatum with component-specific properties
 */
export interface GraphNode extends d3.SimulationNodeDatum {
  /** Unique node identifier (matches component name) */
  id: string;
  /** Display label for the node */
  label: string;
  /** Optional component type for symbol rendering */
  componentType?: string;
}

/**
 * Graph link representing a net connection between components
 * Used by D3's force simulation to create connections between nodes
 */
export interface GraphLink {
  /** Source component name */
  source: string;
  /** Target component name */
  target: string;
  /** Net name that connects these components */
  net: string;
  /** Specific pin on the source component */
  sourcePin: string;
  /** Specific pin on the target component */
  targetPin: string;
  /** Optional net category for color coding and routing */
  netCategory?: 'power' | 'ground' | 'signal' | 'clock' | 'special';
}

/**
 * Application Data Types
 * 
 * These interfaces define data structures for user management
 * and submission tracking in the application.
 */

/**
 * Represents a netlist submission by a user
 * Tracks the submitted data, user, and timestamp
 */
export interface Submission {
  /** Unique identifier for the submission */
  _id: string;
  /** JSON string containing the submitted netlist data */
  data: string;
  /** User who made the submission */
  user: User;
  /** Timestamp when the submission was created */
  dateCreated: Date;
}

/**
 * Represents a user account in the system
 * Contains basic user information and account creation date
 */
export interface User {
  /** Unique username for login */
  username: string;
  /** User's first name */
  firstname: string;
  /** User's last name */
  lastname: string;
  /** Timestamp when the account was created */
  dateCreated: Date;
}