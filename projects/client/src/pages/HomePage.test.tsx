import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../pages/HomePage';

// Mock the GraphCanvas component to avoid D3 and SVG rendering issues in tests
vi.mock('../components/GraphCanvas', () => ({
  default: ({ netlist, graphData }: any) => (
    <div data-testid="graph-canvas">
      {netlist && <div data-testid="netlist-loaded">Netlist loaded</div>}
      {graphData && <div data-testid="graph-data-loaded">Graph data loaded</div>}
    </div>
  ),
}));

describe('HomePage', () => {
  it('should render placeholder when no netlist is loaded', () => {
    render(<HomePage />);
    expect(screen.getByText('No Netlist Loaded')).toBeInTheDocument();
    expect(screen.getByText('Load a netlist file to visualize your PCB schematic')).toBeInTheDocument();
  });
});
