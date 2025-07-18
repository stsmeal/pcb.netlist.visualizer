// React imports for component functionality and hooks
import React, { useEffect, useRef } from 'react';
// D3.js library for creating interactive data visualizations
import * as d3 from 'd3';
// Type definitions for netlist data structures and graph elements
import type { NetlistData, GraphNode, GraphLink } from '../types';
// Utility functions for pin positioning and net coloring
import { getPinOffset, getNetColor } from '../utils/graph';

/**
 * Props interface for the GraphCanvas component
 */
interface Props {
  /** The netlist data containing components and connections */
  netlist: NetlistData | null;
  /** Processed graph data with nodes and links for D3 visualization */
  graphData: { nodes: GraphNode[]; links: GraphLink[] } | null;
  /** Array of validation error messages to highlight problematic elements */
  validationErrors?: string[];
}

/**
 * Component Symbol Drawing Functions
 * 
 * These functions create SVG representations of different electronic components
 * following standard schematic symbol conventions for PCB design tools.
 */

/**
 * Draws an Integrated Circuit (IC) symbol with rectangular body and pin notch indicator
 * 
 * @param g - D3 selection for the SVG group to draw in
 * @param component - Component data containing pins array for sizing
 */
const drawICSymbol = (g: d3.Selection<any, any, any, any>, component: any) => {
  const width = 120;
  // Dynamic height based on pin count with minimum size
  const height = Math.max(60, component.pins.length * 12 + 20);
  
  // IC body - rectangular with rounded corners
  g.append('rect')
    .attr('x', -width/2)
    .attr('y', -height/2)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#2a2a2a')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2)
    .attr('rx', 4);
    
  // IC notch (pin 1 indicator) - small arc at top left
  g.append('path')
    .attr('d', `M ${-width/2 + 10} ${-height/2} A 5 5 0 0 0 ${-width/2 + 20} ${-height/2}`)
    .attr('fill', 'none')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2);
};

/**
 * Draws a resistor symbol using a zigzag pattern
 * Standard IEEE schematic symbol for resistive components
 * 
 * @param g - D3 selection for the SVG group to draw in
 */
const drawResistorSymbol = (g: d3.Selection<any, any, any, any>) => {
  const width = 80;
  const height = 20;
  
  // Resistor zigzag pattern - traditional schematic representation
  const zigzag = `M ${-width/2} 0 
                  L ${-width/2 + 10} -${height/2}
                  L ${-width/2 + 20} ${height/2}
                  L ${-width/2 + 30} -${height/2}
                  L ${-width/2 + 40} ${height/2}
                  L ${-width/2 + 50} -${height/2}
                  L ${-width/2 + 60} ${height/2}
                  L ${-width/2 + 70} -${height/2}
                  L ${width/2} 0`;
  
  g.append('path')
    .attr('d', zigzag)
    .attr('fill', 'none')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 3)
    .attr('stroke-linejoin', 'round');
};

/**
 * Draws a capacitor symbol using two parallel lines
 * Standard schematic symbol for capacitive components
 * 
 * @param g - D3 selection for the SVG group to draw in
 */
const drawCapacitorSymbol = (g: d3.Selection<any, any, any, any>) => {
  // Capacitor parallel lines - representing the two plates
  g.append('line')
    .attr('x1', -5)
    .attr('y1', -20)
    .attr('x2', -5)
    .attr('y2', 20)
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 3);
    
  g.append('line')
    .attr('x1', 5)
    .attr('y1', -20)
    .attr('x2', 5)
    .attr('y2', 20)
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 3);
};

/**
 * Draws a connector symbol with housing and connection tab
 * Represents physical connectors like headers, jacks, etc.
 * 
 * @param g - D3 selection for the SVG group to draw in
 * @param component - Component data containing pins for sizing
 */
const drawConnectorSymbol = (g: d3.Selection<any, any, any, any>, component: any) => {
  // Dynamic height based on pin count
  const height = Math.max(40, component.pins.length * 10 + 10);
  
  // Connector housing - main rectangular body
  g.append('rect')
    .attr('x', -30)
    .attr('y', -height/2)
    .attr('width', 60)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2)
    .attr('rx', 2);
    
  // Connector tab - indicates connection direction/mating
  g.append('rect')
    .attr('x', 30)
    .attr('y', -5)
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', 'none')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2);
};

/**
 * Validation Error Analysis Functions
 * 
 * These functions parse validation error messages and categorize them
 * for visual highlighting in the schematic diagram.
 */

/**
 * Parses validation error messages and categorizes them by type
 * 
 * @param errors - Array of validation error strings
 * @returns Object containing categorized error information
 */
const parseValidationErrors = (errors: string[]) => {
  // Set of component IDs that have errors
  const componentErrors = new Set<string>();
  // Map of component IDs to their problematic pin names
  const pinErrors = new Map<string, Set<string>>(); // componentId -> Set of pin names
  // Set of net names that have errors
  const netErrors = new Set<string>();

  errors.forEach(error => {
    // Parse different types of validation errors using regex patterns
    
    // Component not connected to ground: "R1 is not connected to ground - this may cause issues."
    const groundMatch = error.match(/^(\w+) is not connected to ground/);
    if (groundMatch) {
      componentErrors.add(groundMatch[1]);
    }
    
    // Component has no pin: "Component IC1 does not have pin VCC"
    const pinMatch = error.match(/Component (\w+) does not have pin (\w+)/);
    if (pinMatch) {
      const [, componentId, pinName] = pinMatch;
      componentErrors.add(componentId);
      if (!pinErrors.has(componentId)) {
        pinErrors.set(componentId, new Set());
      }
      pinErrors.get(componentId)!.add(pinName);
    }
    
    // Unknown component: "Net VCC references unknown component: UNKNOWN_IC"
    const unknownCompMatch = error.match(/references unknown component: (\w+)/);
    if (unknownCompMatch) {
      componentErrors.add(unknownCompMatch[1]);
    }
    
    // Net errors: "Net VCC has insufficient connections"
    const netMatch = error.match(/Net (\w+) has insufficient connections/);
    if (netMatch) {
      netErrors.add(netMatch[1]);
    }
    
    // Missing component names, missing nets, etc.
    if (error.includes('Component name cannot be blank')) {
      // This affects components but we can't identify which one specifically
    }
  });

  return { componentErrors, pinErrors, netErrors };
};

/**
 * Determines the error severity level for a specific component
 * 
 * @param componentId - The component identifier to check
 * @param errors - Parsed error analysis object
 * @returns Severity level: 'none', 'warning', or 'error'
 */
const getComponentErrorSeverity = (componentId: string, errors: { componentErrors: Set<string>; pinErrors: Map<string, Set<string>>; netErrors: Set<string> }): 'none' | 'warning' | 'error' => {
  if (errors.componentErrors.has(componentId)) {
    // Check if it's a serious error (missing component, invalid pins) vs warning (not connected to ground)
    return errors.pinErrors.has(componentId) ? 'error' : 'warning';
  }
  return 'none';
};

/**
 * Determines the error severity level for a specific pin
 * 
 * @param componentId - The component identifier
 * @param pinName - The pin name to check
 * @param errors - Parsed error analysis object
 * @returns Severity level: 'none', 'warning', or 'error'
 */
const getPinErrorSeverity = (componentId: string, pinName: string, errors: { componentErrors: Set<string>; pinErrors: Map<string, Set<string>>; netErrors: Set<string> }): 'none' | 'warning' | 'error' => {
  if (errors.pinErrors.has(componentId) && errors.pinErrors.get(componentId)!.has(pinName)) {
    return 'error';
  }
  return 'none';
};

/**
 * GraphCanvas Component
 * 
 * Interactive schematic visualization component using D3.js force simulation.
 * Renders electronic components as standard schematic symbols with connection
 * traces, drag-and-drop interaction, and validation error highlighting.
 * 
 * Features:
 * - Force-directed layout with collision detection
 * - Component-specific schematic symbols (IC, resistor, capacitor, connector)
 * - Manhattan routing for connection traces
 * - Visual error highlighting for validation issues
 * - Interactive dragging with physics simulation
 * - Grid background for professional appearance
 */
const GraphCanvas: React.FC<Props> = ({ netlist, graphData, validationErrors = [] }) => {
  // Reference to the SVG element for D3 manipulation
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Early return if required data is not available
    if (!graphData || !svgRef.current || !netlist) return;

    // Parse validation errors for visual highlighting
    const errorAnalysis = parseValidationErrors(validationErrors);

    // Canvas dimensions
    const width = 1200;
    const height = 800;
    const svg = d3.select(svgRef.current);
    // Clear any existing content
    svg.selectAll('*').remove();

    // Add grid pattern for professional schematic appearance
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');
    
    pattern.append('path')
      .attr('d', 'M 20 0 L 0 0 0 20')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(0, 255, 0, 0.1)')
      .attr('stroke-width', 1);

    // Add grid background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#grid)');

    // Create D3 force simulation for component layout
    const simulation = d3
      .forceSimulation<GraphNode>(graphData.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, any>(graphData.links)
          .id(d => d.id)
          .distance(300) // Desired distance between connected components
      )
      .force('charge', d3.forceManyBody().strength(-800)) // Repulsion between components
      .force('center', d3.forceCenter(width / 2, height / 2)) // Center the layout
      .force('collision', d3.forceCollide().radius(80)); // Prevent component overlap

    /**
     * Helper function to find a component by its ID
     * @param id - Component identifier
     * @returns Component data or undefined
     */
    const getComponent = (id: string) => {
      return netlist.components.find(c => c.name === id);
    };

    /**
     * Calculates the absolute position of a specific pin on a component
     * Handles different pin layouts for different component types
     * 
     * @param componentId - The component identifier
     * @param pinName - The pin name to locate
     * @returns Absolute x,y coordinates of the pin
     */
    const getPinPosition = (componentId: string, pinName: string): { x: number; y: number } => {
      const compNode = graphData.nodes.find(n => n.id === componentId);
      const component = getComponent(componentId);
      if (!compNode || !component) return { x: 0, y: 0 };
      const pinIndex = component.pins.indexOf(pinName);
      const totalPins = component.pins.length;
      
      // Different pin layouts for different component types
      if (component.type.toLowerCase() === 'ic') {
        // IC components use dual-inline package (DIP) layout
        const leftPins = Math.ceil(totalPins / 2);
        if (pinIndex < leftPins) {
          // Left side pins
          const offset = getPinOffset(pinIndex, leftPins);
          return {
            x: (compNode.x ?? 0) - 60,
            y: (compNode.y ?? 0) + offset * 0.5
          };
        } else {
          // Right side pins
          const rightPinIndex = pinIndex - leftPins;
          const rightPinsCount = totalPins - leftPins;
          const offset = getPinOffset(rightPinIndex, rightPinsCount);
          return {
            x: (compNode.x ?? 0) + 60,
            y: (compNode.y ?? 0) + offset * 0.5
          };
        }
      } else {
        // Horizontal layout for other components (resistors, capacitors, etc.)
        const offset = getPinOffset(pinIndex, totalPins);
        return {
          x: (compNode.x ?? 0) + offset * 0.8,
          y: (compNode.y ?? 0) + 30
        };
      }
    };

    // Draw connections (traces) between component pins
    const link = svg.append('g')
      .attr('class', 'traces')
      .selectAll('path')
      .data(graphData.links)
      .join('path')
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', d => getNetColor(d.net)) // Color-coded by net name
      .attr('stroke-dasharray', d => d.net.toLowerCase() === 'gnd' ? '5,5' : 'none'); // Dashed for ground

    // Create component groups for organizing SVG elements
    const nodeGroups = svg.append('g')
      .attr('class', 'components')
      .selectAll('g')
      .data(graphData.nodes)
      .join('g')
      .attr('class', 'component');

    // Make components draggable for interactive layout adjustment
    (nodeGroups as d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>).call(drag(simulation));

    // Draw component symbols based on component type
    nodeGroups.each(function (d) {
      const component = getComponent(d.id);
      if (!component) return;

      const g = d3.select(this);
      const type = component.type.toLowerCase();
      
      // Get error severity for visual highlighting
      const componentErrorSeverity = getComponentErrorSeverity(d.id, errorAnalysis);

      // Draw appropriate symbol based on component type
      if (type === 'ic' || type === 'microcontroller' || type === 'processor') {
        drawICSymbol(g, component);
      } else if (type === 'resistor' || type === 'resistance') {
        drawResistorSymbol(g);
      } else if (type === 'capacitor' || type === 'cap') {
        drawCapacitorSymbol(g);
      } else if (type === 'connector' || type === 'conn') {
        drawConnectorSymbol(g, component);
      } else {
        // Default generic component symbol
        g.append('rect')
          .attr('x', -40)
          .attr('y', -20)
          .attr('width', 80)
          .attr('height', 40)
          .attr('fill', '#333333')
          .attr('stroke', '#00ff00')
          .attr('stroke-width', 2)
          .attr('rx', 4);
      }
      
      // Add error overlay if component has validation errors
      if (componentErrorSeverity !== 'none') {
        const errorColor = componentErrorSeverity === 'error' ? '#ff4444' : '#ffaa44';
        const width = type === 'ic' ? 120 : 80;
        const height = type === 'ic' ? Math.max(60, component.pins.length * 12 + 20) : 40;
        
        // Error border overlay
        g.append('rect')
          .attr('x', -width/2)
          .attr('y', -height/2)
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'none')
          .attr('stroke', errorColor)
          .attr('stroke-width', 3)
          .attr('stroke-dasharray', componentErrorSeverity === 'error' ? '5,5' : '10,5')
          .attr('rx', 4);
          
        // Error indicator icon
        g.append('circle')
          .attr('cx', width/2 - 10)
          .attr('cy', -height/2 + 10)
          .attr('r', 6)
          .attr('fill', errorColor)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1);
          
        g.append('text')
          .text(componentErrorSeverity === 'error' ? '✗' : '⚠')
          .attr('x', width/2 - 10)
          .attr('y', -height/2 + 13)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-family', 'Arial, sans-serif')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold');
      }

      // Component label with error-aware coloring
      let labelColor = '#ffffff';
      if (componentErrorSeverity === 'error') {
        labelColor = '#ff4444';
      } else if (componentErrorSeverity === 'warning') {
        labelColor = '#ffaa44';
      }

      // Component name label
      g.append('text')
        .text(d.id)
        .attr('text-anchor', 'middle')
        .attr('dy', type === 'ic' ? -5 : -30)
        .attr('fill', labelColor)
        .attr('font-family', 'Courier New, monospace')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold');

      // Component type label
      g.append('text')
        .text(component.type)
        .attr('text-anchor', 'middle')
        .attr('dy', type === 'ic' ? 8 : -18)
        .attr('fill', '#ffffff')
        .attr('font-family', 'Courier New, monospace')
        .attr('font-size', '10px');

      // Draw individual pins for each component
      component.pins.forEach((pin) => {
        const pinPos = getPinPosition(d.id, pin);
        const localX = pinPos.x - (d.x ?? 0);
        const localY = pinPos.y - (d.y ?? 0);
        
        // Get error severity for pin-specific highlighting
        const pinErrorSeverity = getPinErrorSeverity(d.id, pin, errorAnalysis);
        const componentErrorSeverity = getComponentErrorSeverity(d.id, errorAnalysis);
        
        // Determine pin colors based on error severity
        let pinFill = '#00ff00';  // Default green
        let pinStroke = '#ffffff'; // Default white
        let pinStrokeWidth = 1;
        
        if (pinErrorSeverity === 'error') {
          pinFill = '#ff4444';     // Red for pin-specific errors
          pinStroke = '#ffffff';
          pinStrokeWidth = 2;
        } else if (componentErrorSeverity === 'warning') {
          pinFill = '#ffaa44';     // Orange for component warnings
          pinStroke = '#ffffff';
          pinStrokeWidth = 1.5;
        } else if (componentErrorSeverity === 'error') {
          pinFill = '#ff6666';     // Light red for component errors
          pinStroke = '#ffffff';
          pinStrokeWidth = 2;
        }

        // Pin circle
        g.append('circle')
          .attr('cx', localX)
          .attr('cy', localY)
          .attr('r', 4)
          .attr('fill', pinFill)
          .attr('stroke', pinStroke)
          .attr('stroke-width', pinStrokeWidth);

        // Add error indicator for pin-specific errors
        if (pinErrorSeverity === 'error') {
          g.append('circle')
            .attr('cx', localX + 6)
            .attr('cy', localY - 6)
            .attr('r', 3)
            .attr('fill', '#ff0000')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1);
            
          g.append('text')
            .text('!')
            .attr('x', localX + 6)
            .attr('y', localY - 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-family', 'Arial, sans-serif')
            .attr('font-size', '6px')
            .attr('font-weight', 'bold');
        }

        // Pin label with error-aware coloring
        let labelColor = '#ffffff';
        if (pinErrorSeverity === 'error') {
          labelColor = '#ff4444';
        } else if (componentErrorSeverity !== 'none') {
          labelColor = '#ffffff';
        }

        g.append('text')
          .text(pin)
          .attr('x', localX)
          .attr('y', localY + (type === 'ic' ? (localX < 0 ? -8 : 12) : 18))
          .attr('text-anchor', type === 'ic' ? (localX < 0 ? 'end' : 'start') : 'middle')
          .attr('fill', labelColor)
          .attr('font-family', 'Courier New, monospace')
          .attr('font-size', '8px')
          .attr('font-weight', pinErrorSeverity === 'error' ? 'bold' : 'normal');
      });
    });

    // Update positions on each simulation tick
    simulation.on('tick', () => {
      // Update trace paths with Manhattan routing
      link.attr('d', (d: any) => {
        const sourcePos = getPinPosition(d.source?.id ?? '', d.sourcePin);
        const targetPos = getPinPosition(d.target?.id ?? '', d.targetPin);
        
        // Create Manhattan routing (right-angle connections like PCB traces)
        const midX = (sourcePos.x + targetPos.x) / 2;
        return `M ${sourcePos.x} ${sourcePos.y} 
                L ${midX} ${sourcePos.y} 
                L ${midX} ${targetPos.y} 
                L ${targetPos.x} ${targetPos.y}`;
      });

      // Update component positions
      nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    /**
     * Drag behavior factory for interactive component manipulation
     * Implements standard D3 drag behavior with force simulation integration
     * 
     * @param simulation - The D3 force simulation to update during drag
     * @returns D3 drag behavior function
     */
    function drag(simulation: d3.Simulation<GraphNode, GraphLink>) {
      return d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          // Restart simulation with higher alpha for responsive dragging
          if (!event.active) simulation.alphaTarget(0.3).restart();
          // Fix the dragged node position
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          // Update fixed position to follow mouse
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          // Return simulation to normal state and release fixed position
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }
  }, [graphData, netlist, validationErrors]); // Re-run effect when dependencies change

  return (
    <svg 
      ref={svgRef} 
      width={1200} 
      height={800} 
      className="schematic-canvas"
    />
  );
};

export default GraphCanvas;
