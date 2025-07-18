// Type definitions for netlist data structures and graph visualization
import type { GraphLink, GraphNode, NetlistComponent, NetlistData } from '../types';

/**
 * Pin Positioning and Layout Utilities
 */

/**
 * Calculates the offset position for a pin in a component layout
 * Used for evenly spacing pins along a component's edge
 * 
 * @param index - Zero-based index of the pin
 * @param total - Total number of pins in the component
 * @returns Offset distance from center in pixels
 */
export const getPinOffset = (index: number, total: number): number => {
  const spacing = 36; // Pixels between adjacent pins
  // Center pins around zero, with equal spacing
  return (index - (total - 1) / 2) * spacing;
};

/**
 * Component Symbol Mapping
 */

/**
 * Returns a Unicode symbol representing the component type
 * Used for text-based component representation in fallback scenarios
 * 
 * @param type - Component type string (case-insensitive)
 * @returns Unicode symbol character for the component
 */
export const getComponentSymbol = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'ic': '□',              // Integrated Circuit
    'microcontroller': '□', // Microcontroller
    'processor': '□',       // Processor
    'resistor': '⧟',        // Resistor (zigzag)
    'resistance': '⧟',      // Alternative resistor name
    'capacitor': '⊥⊥',      // Capacitor (parallel lines)
    'cap': '⊥⊥',            // Alternative capacitor name
    'connector': '⊞',       // Connector/Header
    'conn': '⊞',            // Alternative connector name
    'module': '▬',          // Module/Board
    'board': '▬',           // Board/PCB
    'inductor': '◐',        // Inductor/Coil
    'led': '◊',             // Light Emitting Diode
    'diode': '▷',           // Standard Diode
    'transistor': '▲',      // Transistor
    'switch': '⫸',          // Switch
    'relay': '⧈',           // Relay
    'crystal': '◇',         // Crystal Oscillator
    'fuse': '═══',          // Fuse
  };
  
  return typeMap[type.toLowerCase()] || '◯'; // Default: generic component
};

/**
 * Net Classification and Coloring
 */

/**
 * Categorizes a net by its name and purpose in the circuit
 * Essential for proper color coding and validation in PCB design
 * 
 * @param netName - Name of the net/signal
 * @returns Category classification for the net
 */
export const getNetCategory = (netName: string): 'power' | 'ground' | 'signal' | 'clock' | 'special' => {
  const name = netName.toLowerCase();
  
  // Ground/reference nets - critical for circuit operation
  if (name.includes('gnd') || name.includes('ground') || name === '0v') return 'ground';
  
  // Power supply nets - voltage rails
  if (name.includes('vcc') || name.includes('vdd') || name.includes('pwr') || 
      name.includes('3v3') || name.includes('5v') || name.includes('power') ||
      /^\d+v\d*$/.test(name)) return 'power';
  
  // Clock and timing signals - require special routing considerations
  if (name.includes('clk') || name.includes('clock') || name.includes('osc')) return 'clock';
  
  // Control and special function signals
  if (name.includes('rst') || name.includes('reset') || name.includes('enable') ||
      name.includes('cs') || name.includes('ce')) return 'special';
  
  // Default: regular data/signal nets
  return 'signal';
};

/**
 * Returns a color code for a net based on its category
 * Follows standard PCB design color conventions for easy identification
 * 
 * @param netName - Name of the net to color
 * @returns Hex color code for the net
 */
export const getNetColor = (netName: string): string => {
  const category = getNetCategory(netName);
  
  const colorMap = {
    'power': '#ff4444',    // Red for power rails (traditional)
    'ground': '#888888',   // Gray for ground/reference
    'clock': '#44ff44',    // Green for clock signals
    'special': '#ffaa44',  // Orange for control signals
    'signal': '#4488ff',   // Blue for data/signal nets
  };
  
  return colorMap[category];
};

/**
 * Netlist Validation Functions
 */

/**
 * Validates a netlist for common PCB design errors and requirements
 * Performs comprehensive checks for component integrity, connectivity, and design rules
 * 
 * @param data - Complete netlist data structure
 * @returns Array of validation error messages
 */
export const validateNetlist = (data: NetlistData): string[] => {
  const errors: string[] = [];
  const componentMap = new Map<string, NetlistComponent>();

  // Validate individual components
  data.components.forEach(c => {
    if (!c.name.trim()) errors.push('Component name cannot be blank.');
    if (!c.type.trim()) errors.push(`Component ${c.name} has no type specified.`);
    if (!c.pins || c.pins.length === 0) errors.push(`Component ${c.name} has no pins defined.`);
    componentMap.set(c.name, c);
  });

  // Check for duplicate component names (would cause assembly conflicts)
  const names = data.components.map(c => c.name);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate component names: ${duplicates.join(', ')}`);
  }

  // Validate nets and connections
  data.nets.forEach(net => {
    if (!net.net.trim()) errors.push('Net name cannot be blank.');
    
    // Check for sufficient connections (nets need at least 2 points)
    if (!net.connections || net.connections.length < 2) {
      errors.push(`Net ${net.net} has insufficient connections (needs at least 2).`);
    }
    
    // Validate each connection in the net
    net.connections.forEach(conn => {
      const component = componentMap.get(conn.component);
      if (!component) {
        errors.push(`Net ${net.net} references unknown component: ${conn.component}`);
      } else if (!component.pins.includes(conn.pin)) {
        errors.push(`Component ${conn.component} does not have pin ${conn.pin}`);
      }
    });
  });

  // Check for GND net (critical for PCB functionality)
  const gndNet = data.nets.find(n => getNetCategory(n.net) === 'ground');
  if (!gndNet) {
    errors.push('No ground net found. Every PCB should have a ground connection.');
  } else {
    // Check which components are connected to ground
    const connectedComponents = new Set(gndNet.connections.map(conn => conn.component));
    data.components.forEach(c => {
      // Connectors might not need ground, but most active components should be grounded
      if (!['resistor', 'connector', 'led', 'capacitor'].includes(c.type.toLowerCase()) && !connectedComponents.has(c.name)) {
        errors.push(`${c.name} is not connected to ground - this may cause issues.`);
      }
    });
  }

  // Check for power net (most circuits need power distribution)
  const powerNets = data.nets.filter(n => getNetCategory(n.net) === 'power');
  if (powerNets.length === 0) {
    errors.push('No power net found. Most PCBs require power distribution.');
  }

  return errors;
};

/**
 * Graph Conversion Functions
 */

/**
 * Converts netlist data into graph format suitable for D3.js visualization
 * Creates nodes for components and links for net connections
 * 
 * @param netlist - Input netlist data structure
 * @returns Graph object with nodes and links arrays
 */
export const convertToGraph = (netlist: NetlistData) => {
  // Create nodes for each component
  const nodes: GraphNode[] = netlist.components.map(c => ({ 
    id: c.name, 
    label: c.name,
    // Add component type for symbol rendering
    componentType: c.type 
  }));
  
  const links: GraphLink[] = [];

  // Create links for each net by connecting all pairs of components in the net
  netlist.nets.forEach(net => {
    const conns = net.connections;
    // Create links between every pair of connections in the net
    for (let i = 0; i < conns.length; i++) {
      for (let j = i + 1; j < conns.length; j++) {
        links.push({
          source: conns[i].component,
          target: conns[j].component,
          sourcePin: conns[i].pin,
          targetPin: conns[j].pin,
          net: net.net,
          // Add net category for color coding
          netCategory: getNetCategory(net.net)
        });
      }
    }
  });

  return { nodes, links };
};

/**
 * Circuit Analysis Functions
 */

/**
 * Analyzes circuit complexity and composition for statistics display
 * Provides insights into the netlist structure and design characteristics
 * 
 * @param netlist - Input netlist data structure
 * @returns Analysis object with counts, types, and complexity metrics
 */
export const analyzeCircuit = (netlist: NetlistData) => {
  const analysis = {
    componentCount: netlist.components.length,
    netCount: netlist.nets.length,
    connectionCount: netlist.nets.reduce((sum, net) => sum + net.connections.length, 0),
    componentTypes: {} as { [key: string]: number },
    netCategories: {} as { [key: string]: number },
    complexityScore: 0,
  };

  // Count components by type for design overview
  netlist.components.forEach(comp => {
    const type = comp.type.toLowerCase();
    analysis.componentTypes[type] = (analysis.componentTypes[type] || 0) + 1;
  });

  // Count nets by category for routing complexity assessment
  netlist.nets.forEach(net => {
    const category = getNetCategory(net.net);
    analysis.netCategories[category] = (analysis.netCategories[category] || 0) + 1;
  });

  // Calculate relative complexity score (arbitrary but useful metric)
  analysis.complexityScore = 
    analysis.componentCount * 2 +     // Components add base complexity
    analysis.netCount * 1.5 +         // Nets add routing complexity
    analysis.connectionCount * 0.5;   // Connections add detail complexity

  return analysis;
};
