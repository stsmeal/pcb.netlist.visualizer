import { describe, it, expect } from 'vitest';
import { 
  validateNetlist, 
  convertToGraph, 
  getPinOffset, 
  getComponentSymbol, 
  getNetCategory, 
  getNetColor,
  analyzeCircuit 
} from '../utils/graph';
import type { NetlistData } from '../types';

describe('graph utilities', () => {
  describe('getPinOffset', () => {
    it('should calculate correct offset for single pin', () => {
      expect(getPinOffset(0, 1)).toBe(0);
    });

    it('should calculate correct offset for multiple pins', () => {
      expect(getPinOffset(0, 3)).toBe(-36); // First pin
      expect(getPinOffset(1, 3)).toBe(0); // Middle pin
      expect(getPinOffset(2, 3)).toBe(36); // Last pin
    });

    it('should handle even number of pins', () => {
      expect(getPinOffset(0, 4)).toBe(-54); // (0 - 1.5) * 36
      expect(getPinOffset(1, 4)).toBe(-18); // (1 - 1.5) * 36
      expect(getPinOffset(2, 4)).toBe(18); // (2 - 1.5) * 36
      expect(getPinOffset(3, 4)).toBe(54); // (3 - 1.5) * 36
    });
  });

  describe('validateNetlist', () => {
    const validNetlist: NetlistData = {
      components: [
        { name: 'IC1', type: 'IC', pins: ['VCC', 'GND', 'OUT'] },
        { name: 'R1', type: 'Resistor', pins: ['1', '2'] },
        { name: 'CONN1', type: 'Connector', pins: ['VCC', 'GND'] },
      ],
      nets: [
        {
          net: 'GND',
          connections: [
            { component: 'IC1', pin: 'GND' },
            { component: 'R1', pin: '2' },
            { component: 'CONN1', pin: 'GND' },
          ],
        },
        {
          net: 'VCC',
          connections: [
            { component: 'IC1', pin: 'VCC' },
            { component: 'CONN1', pin: 'VCC' },
          ],
        },
      ],
    };

    it('should return no errors for valid netlist', () => {
      const errors = validateNetlist(validNetlist);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing component names', () => {
      const invalidNetlist = {
        ...validNetlist,
        components: [
          { name: '', type: 'IC', pins: ['VCC', 'GND'] },
          ...validNetlist.components.slice(1),
        ],
      };
      const errors = validateNetlist(invalidNetlist);
      expect(errors).toContain('Component name cannot be blank.');
    });

    it('should detect missing GND net', () => {
      const invalidNetlist = {
        ...validNetlist,
        nets: validNetlist.nets.filter(net => net.net.toLowerCase() !== 'gnd'),
      };
      const errors = validateNetlist(invalidNetlist);
      expect(errors).toContain('No ground net found. Every PCB should have a ground connection.');
    });

    it('should detect components not connected to GND', () => {
      const invalidNetlist = {
        ...validNetlist,
        nets: [
          {
            net: 'GND',
            connections: [
              { component: 'IC1', pin: 'GND' },
              // R1 is missing from GND connections
            ],
          },
          ...validNetlist.nets.slice(1),
        ],
      };
      const errors = validateNetlist(invalidNetlist);
      expect(errors).toContain('R1 is not connected to ground - this may cause issues.');
    });

    it('should not require connectors to be connected to GND', () => {
      const netlistWithConnector = {
        ...validNetlist,
        components: [
          ...validNetlist.components,
          { name: 'CONN2', type: 'connector', pins: ['SIG'] }, // lowercase type
        ],
      };
      const errors = validateNetlist(netlistWithConnector);
      expect(errors).not.toContain('CONN2 is not connected to GND.');
    });
  });

  describe('convertToGraph', () => {
    const testNetlist: NetlistData = {
      components: [
        { name: 'IC1', type: 'IC', pins: ['VCC', 'GND', 'OUT'] },
        { name: 'R1', type: 'Resistor', pins: ['1', '2'] },
      ],
      nets: [
        {
          net: 'GND',
          connections: [
            { component: 'IC1', pin: 'GND' },
            { component: 'R1', pin: '2' },
          ],
        },
        {
          net: 'VCC',
          connections: [
            { component: 'IC1', pin: 'VCC' },
            { component: 'R1', pin: '1' },
          ],
        },
      ],
    };

    it('should create nodes for each component', () => {
      const graph = convertToGraph(testNetlist);
      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes[0]).toMatchObject({ id: 'IC1', label: 'IC1' });
      expect(graph.nodes[1]).toMatchObject({ id: 'R1', label: 'R1' });
    });

    it('should create links between connected components', () => {
      const graph = convertToGraph(testNetlist);
      expect(graph.links).toHaveLength(2);

      const gndLink = graph.links.find(link => link.net === 'GND');
      expect(gndLink).toMatchObject({
        source: 'IC1',
        target: 'R1',
        sourcePin: 'GND',
        targetPin: '2',
        net: 'GND',
      });

      const vccLink = graph.links.find(link => link.net === 'VCC');
      expect(vccLink).toMatchObject({
        source: 'IC1',
        target: 'R1',
        sourcePin: 'VCC',
        targetPin: '1',
        net: 'VCC',
      });
    });

    it('should handle nets with multiple connections', () => {
      const multiConnectionNetlist: NetlistData = {
        components: [
          { name: 'IC1', type: 'IC', pins: ['OUT'] },
          { name: 'R1', type: 'Resistor', pins: ['1'] },
          { name: 'R2', type: 'Resistor', pins: ['1'] },
        ],
        nets: [
          {
            net: 'SIGNAL',
            connections: [
              { component: 'IC1', pin: 'OUT' },
              { component: 'R1', pin: '1' },
              { component: 'R2', pin: '1' },
            ],
          },
        ],
      };

      const graph = convertToGraph(multiConnectionNetlist);
      expect(graph.links).toHaveLength(3); // IC1-R1, IC1-R2, R1-R2

      const links = graph.links.filter(link => link.net === 'SIGNAL');
      expect(links).toHaveLength(3);
    });
  });

  describe('getComponentSymbol', () => {
    it('should return correct symbols for known component types', () => {
      expect(getComponentSymbol('IC')).toBe('□');
      expect(getComponentSymbol('Resistor')).toBe('⧟');
      expect(getComponentSymbol('Capacitor')).toBe('⊥⊥');
      expect(getComponentSymbol('Connector')).toBe('⊞');
      expect(getComponentSymbol('Module')).toBe('▬');
    });

    it('should be case insensitive', () => {
      expect(getComponentSymbol('ic')).toBe('□');
      expect(getComponentSymbol('RESISTOR')).toBe('⧟');
    });

    it('should return default symbol for unknown types', () => {
      expect(getComponentSymbol('Unknown')).toBe('◯');
      expect(getComponentSymbol('')).toBe('◯');
    });
  });

  describe('getNetCategory', () => {
    it('should categorize power nets correctly', () => {
      expect(getNetCategory('VCC')).toBe('power');
      expect(getNetCategory('VDD')).toBe('power');
      expect(getNetCategory('3V3')).toBe('power');
      expect(getNetCategory('5V')).toBe('power');
      expect(getNetCategory('PWR')).toBe('power');
    });

    it('should categorize ground nets correctly', () => {
      expect(getNetCategory('GND')).toBe('ground');
      expect(getNetCategory('GROUND')).toBe('ground');
      expect(getNetCategory('0V')).toBe('ground');
    });

    it('should categorize clock nets correctly', () => {
      expect(getNetCategory('CLK')).toBe('clock');
      expect(getNetCategory('CLOCK')).toBe('clock');
      expect(getNetCategory('OSC')).toBe('clock');
    });

    it('should categorize special control nets correctly', () => {
      expect(getNetCategory('RST')).toBe('special');
      expect(getNetCategory('RESET')).toBe('special');
      expect(getNetCategory('ENABLE')).toBe('special');
      expect(getNetCategory('CS')).toBe('special');
    });

    it('should default to signal for unknown nets', () => {
      expect(getNetCategory('DATA')).toBe('signal');
      expect(getNetCategory('IO1')).toBe('signal');
      expect(getNetCategory('SENSOR')).toBe('signal');
    });
  });

  describe('getNetColor', () => {
    it('should return appropriate colors for different net categories', () => {
      expect(getNetColor('VCC')).toBe('#ff4444'); // Power - red
      expect(getNetColor('GND')).toBe('#888888'); // Ground - gray
      expect(getNetColor('CLK')).toBe('#44ff44'); // Clock - green
      expect(getNetColor('RST')).toBe('#ffaa44'); // Special - orange
      expect(getNetColor('DATA')).toBe('#4488ff'); // Signal - blue
    });
  });

  describe('analyzeCircuit', () => {
    const testNetlist: NetlistData = {
      components: [
        { name: 'IC1', type: 'IC', pins: ['VCC', 'GND', 'OUT'] },
        { name: 'R1', type: 'Resistor', pins: ['1', '2'] },
        { name: 'C1', type: 'Capacitor', pins: ['1', '2'] },
      ],
      nets: [
        {
          net: 'GND',
          connections: [
            { component: 'IC1', pin: 'GND' },
            { component: 'R1', pin: '2' },
            { component: 'C1', pin: '2' },
          ],
        },
        {
          net: 'VCC',
          connections: [
            { component: 'IC1', pin: 'VCC' },
            { component: 'R1', pin: '1' },
            { component: 'C1', pin: '1' },
          ],
        },
      ],
    };

    it('should calculate basic circuit statistics', () => {
      const analysis = analyzeCircuit(testNetlist);
      
      expect(analysis.componentCount).toBe(3);
      expect(analysis.netCount).toBe(2);
      expect(analysis.connectionCount).toBe(6);
    });

    it('should categorize component types', () => {
      const analysis = analyzeCircuit(testNetlist);
      
      expect(analysis.componentTypes).toEqual({
        'ic': 1,
        'resistor': 1,
        'capacitor': 1,
      });
    });

    it('should categorize net types', () => {
      const analysis = analyzeCircuit(testNetlist);
      
      expect(analysis.netCategories).toEqual({
        'ground': 1,
        'power': 1,
      });
    });

    it('should calculate complexity score', () => {
      const analysis = analyzeCircuit(testNetlist);
      
      expect(analysis.complexityScore).toBeGreaterThan(0);
      expect(typeof analysis.complexityScore).toBe('number');
    });
  });
});
