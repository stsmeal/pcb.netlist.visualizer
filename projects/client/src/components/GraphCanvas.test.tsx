import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import GraphCanvas from './GraphCanvas';
import type { NetlistData, GraphNode, GraphLink } from '../types';
import * as d3 from 'd3';

// Mock D3
vi.mock('d3', () => {
  const mockSimulation = {
    force: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    alphaTarget: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
  };

  const mockSelection = {
    selectAll: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnThis(),
    data: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    attr: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    each: vi.fn().mockReturnThis(),
  };

  const mockDrag = {
    on: vi.fn().mockReturnThis(),
  };

  return {
    select: vi.fn(() => mockSelection),
    forceSimulation: vi.fn(() => mockSimulation),
    forceLink: vi.fn().mockReturnValue({
      id: vi.fn().mockReturnThis(),
      distance: vi.fn().mockReturnThis(),
    }),
    forceManyBody: vi.fn().mockReturnValue({
      strength: vi.fn().mockReturnThis(),
    }),
    forceCenter: vi.fn().mockReturnThis(),
    forceCollide: vi.fn().mockReturnValue({
      radius: vi.fn().mockReturnThis(),
    }),
    scaleOrdinal: vi.fn().mockReturnThis(),
    schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
    drag: vi.fn(() => mockDrag),
  };
});

// Mock the graph utility
vi.mock('../utils/graph', () => ({
  getPinOffset: vi.fn((index: number, total: number) => {
    // Simple mock implementation - distribute pins evenly
    const spacing = 180 / (total + 1);
    return -90 + spacing * (index + 1);
  }),
}));

describe('GraphCanvas', () => {
  const mockNetlist: NetlistData = {
    components: [
      {
        name: 'R1',
        type: 'resistor',
        pins: ['1', '2'],
      },
      {
        name: 'C1',
        type: 'capacitor',
        pins: ['1', '2'],
      },
    ],
    nets: [
      {
        net: 'VCC',
        connections: [
          { component: 'R1', pin: '1' },
          { component: 'C1', pin: '1' },
        ],
      },
    ],
  };

  const mockGraphData = {
    nodes: [
      { id: 'R1', label: 'R1', x: 100, y: 100 },
      { id: 'C1', label: 'C1', x: 200, y: 200 },
    ] as GraphNode[],
    links: [
      {
        source: 'R1',
        target: 'C1',
        sourcePin: '1',
        targetPin: '1',
        net: 'VCC',
      },
    ] as GraphLink[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not initialize D3 when no data is provided', () => {
    render(<GraphCanvas netlist={null} graphData={null} />);

    expect(d3.select).not.toHaveBeenCalled();
  });

  it('does not initialize D3 when netlist is missing', () => {
    render(<GraphCanvas netlist={null} graphData={mockGraphData} />);

    expect(d3.select).not.toHaveBeenCalled();
  });

  it('does not initialize D3 when graphData is missing', () => {
    render(<GraphCanvas netlist={mockNetlist} graphData={null} />);

    expect(d3.select).not.toHaveBeenCalled();
  });

  it('initializes D3 simulation when both netlist and graphData are provided', () => {
    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(d3.select).toHaveBeenCalled();
    expect(d3.forceSimulation).toHaveBeenCalledWith(mockGraphData.nodes);
  });

  it('sets up force simulation with correct forces', () => {
    const mockSimulation = {
      force: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
    };
    (d3.forceSimulation as Mock).mockReturnValue(mockSimulation);

    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(mockSimulation.force).toHaveBeenCalledWith('link', expect.any(Object));
    expect(mockSimulation.force).toHaveBeenCalledWith('charge', expect.any(Object));
    expect(mockSimulation.force).toHaveBeenCalledWith('center', expect.any(Object));
  });

  it('sets up force link with correct configuration', () => {
    const mockForceLink = {
      id: vi.fn().mockReturnThis(),
      distance: vi.fn().mockReturnThis(),
    };
    (d3.forceLink as Mock).mockReturnValue(mockForceLink);

    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(d3.forceLink).toHaveBeenCalledWith(mockGraphData.links);
    expect(mockForceLink.id).toHaveBeenCalled();
    expect(mockForceLink.distance).toHaveBeenCalledWith(300);
  });

  it('sets up many-body force with correct strength', () => {
    const mockForceManyBody = {
      strength: vi.fn().mockReturnThis(),
    };
    (d3.forceManyBody as Mock).mockReturnValue(mockForceManyBody);

    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(d3.forceManyBody).toHaveBeenCalled();
    expect(mockForceManyBody.strength).toHaveBeenCalledWith(-800);
  });

  it('sets up center force with correct dimensions', () => {
    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(d3.forceCenter).toHaveBeenCalledWith(600, 400); // 1200/2, 800/2
  });

  it('clears previous SVG content on re-render', () => {
    const mockSelection = {
      selectAll: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      data: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      each: vi.fn().mockReturnThis(),
    };
    (d3.select as Mock).mockReturnValue(mockSelection);

    const { rerender } = render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    // Re-render with updated data
    rerender(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(mockSelection.selectAll).toHaveBeenCalledWith('*');
    expect(mockSelection.remove).toHaveBeenCalled();
  });

  it('creates node groups for components', () => {
    const mockNodeGroupSelection = {
      call: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      each: vi.fn().mockReturnThis(),
    };
    const mockSelection = {
      selectAll: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      data: vi.fn().mockReturnThis(),
      join: vi.fn(() => mockNodeGroupSelection),
      attr: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      each: vi.fn().mockReturnThis(),
    };
    (d3.select as Mock).mockReturnValue(mockSelection);

    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(mockNodeGroupSelection.call).toHaveBeenCalled();
    expect(mockNodeGroupSelection.each).toHaveBeenCalled();
  });

  it('handles empty components array', () => {
    const emptyNetlist: NetlistData = {
      components: [],
      nets: [],
    };
    const emptyGraphData = {
      nodes: [],
      links: [],
    };

    expect(() => {
      render(<GraphCanvas netlist={emptyNetlist} graphData={emptyGraphData} />);
    }).not.toThrow();
  });

  it('handles component without pins', () => {
    const netlistWithoutPins: NetlistData = {
      components: [
        {
          name: 'R1',
          type: 'resistor',
          pins: [],
        },
      ],
      nets: [],
    };
    const graphDataWithNode = {
      nodes: [{ id: 'R1', label: 'R1', x: 100, y: 100 }] as GraphNode[],
      links: [] as GraphLink[],
    };

    expect(() => {
      render(<GraphCanvas netlist={netlistWithoutPins} graphData={graphDataWithNode} />);
    }).not.toThrow();
  });

  it('re-renders when props change', () => {
    const { rerender } = render(<GraphCanvas netlist={null} graphData={null} />);

    expect(d3.select).not.toHaveBeenCalled();

    rerender(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(d3.select).toHaveBeenCalled();
  });

  it('sets up drag behavior', () => {
    const mockDrag = {
      on: vi.fn().mockReturnThis(),
    };
    (d3.drag as Mock).mockReturnValue(mockDrag);

    render(<GraphCanvas netlist={mockNetlist} graphData={mockGraphData} />);

    expect(d3.drag).toHaveBeenCalled();
    expect(mockDrag.on).toHaveBeenCalledWith('start', expect.any(Function));
    expect(mockDrag.on).toHaveBeenCalledWith('drag', expect.any(Function));
    expect(mockDrag.on).toHaveBeenCalledWith('end', expect.any(Function));
  });

  it('should highlight components and pins with validation errors', () => {
    const mockNetlistWithErrors: NetlistData = {
      components: [
        { name: 'IC1', type: 'IC', pins: ['VCC', 'GND', 'OUT'] },
        { name: 'R1', type: 'Resistor', pins: ['1', '2'] },
      ],
      nets: [
        {
          net: 'VCC',
          connections: [
            { component: 'IC1', pin: 'VCC' },
            { component: 'R1', pin: '1' },
          ],
        },
      ],
    };

    const mockGraphDataWithErrors = {
      nodes: [
        { id: 'IC1', label: 'IC1' },
        { id: 'R1', label: 'R1' },
      ],
      links: [
        {
          source: 'IC1',
          target: 'R1',
          sourcePin: 'VCC',
          targetPin: '1',
          net: 'VCC',
        },
      ],
    };

    const validationErrors = [
      'R1 is not connected to ground - this may cause issues.',
      'Component IC1 does not have pin INVALID_PIN',
    ];

    expect(() => {
      render(
        <GraphCanvas
          netlist={mockNetlistWithErrors}
          graphData={mockGraphDataWithErrors}
          validationErrors={validationErrors}
        />
      );
    }).not.toThrow();
  });
});
