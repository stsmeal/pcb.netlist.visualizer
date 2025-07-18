# PCB Netlist Visualizer - Frontend Client
A modern React application for visualizing and validating PCB netlists with interactive schematic diagrams. This frontend provides an intuitive interface for engineers to upload netlist files, view circuit visualizations, and identify design issues through real-time validation.

## Overview

The client application is built with React 18 and TypeScript, featuring a professional PCB-themed dark mode interface. It uses D3.js for interactive force-directed graph visualizations that render electronic components as standard schematic symbols with color-coded connection traces.

## Key Features

### Interactive Visualization
- **D3.js Force Simulation** - Physics-based component layout with drag interaction
- **Standard Schematic Symbols** - IEEE-compliant symbols for ICs, resistors, capacitors, connectors
- **Color-Coded Nets** - Power (red), ground (gray), clock (green), signal (blue) connections
- **Manhattan Routing** - PCB-style right-angle connection traces
- **Error Highlighting** - Visual indicators for validation issues

### User Interface
- **File Upload** - Drag-and-drop JSON netlist support
- **Real-time Validation** - Instant feedback on circuit design rules
- **Circuit Statistics** - Component, net, and connection counts
- **Submission History** - Browse and reload previous netlists
- **Responsive Design** - Works across desktop and tablet devices

### Authentication
- **User Registration** - Account creation with form validation
- **Secure Login** - JWT token-based authentication
- **Protected Routes** - Automatic redirection for unauthorized access
- **Session Management** - Persistent login across browser sessions

## Architecture

### Technology Stack
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Full type safety and enhanced developer experience
- **D3.js** - Interactive data visualization and force simulations
- **Custom CSS** - PCB-themed styling with dark mode aesthetics
- **Vite** - Fast development server and optimized builds
- **Vitest** - Modern testing framework with React Testing Library

### Project Structure
```
src/
├── components/           # Reusable React components
│   ├── GraphCanvas.tsx   # D3.js visualization component
│   └── RequireAuth.tsx   # Authentication guard wrapper
├── pages/                # Application pages
│   ├── HomePage.tsx      # Main netlist upload and visualization
│   ├── LoginPage.tsx     # User authentication
│   └── SignUpPage.tsx    # User registration
├── services/             # API communication
│   └── ApiService.ts     # HTTP client with authentication
├── utils/                # Utility functions
│   └── graph.ts          # Netlist validation and graph conversion
├── types.ts              # TypeScript type definitions
├── config.ts             # Environment configuration
└── main.tsx              # Application entry point
```

### Component Architecture
- **HomePage** - Main application container managing netlist state and visualization
- **GraphCanvas** - D3.js-powered interactive schematic renderer
- **RequireAuth** - Higher-order component for route protection
- **Authentication Pages** - Login/signup with form validation and error handling

## Development

### Prerequisites
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Development Commands
```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run test suite with Vitest
npm run test:ui      # Open test UI interface
npm run lint         # Check code style with ESLint
npm run format       # Format code with Prettier
```

### Environment Configuration
The application supports multiple environment configurations:

**Development (.env.development):**
```bash
VITE_API_BASE_URL=https://api.dev.local
```

**Production (.env.production):**
```bash
VITE_API_BASE_URL=https://api.production.com
```

## Netlist Format

The application accepts JSON netlists with this structure:

```json
{
  "components": [
    {
      "name": "R1",
      "type": "resistor", 
      "pins": ["1", "2"]
    }
  ],
  "nets": [
    {
      "net": "VCC",
      "connections": [
        {"component": "R1", "pin": "1"}
      ]
    }
  ]
}
```

### Sample Files
The `netlist-sample-files/` directory contains:
- ✅ **Valid Examples** - Simple, complex, power management, digital systems
- ❌ **Invalid Examples** - Testing validation errors (missing ground, duplicates, etc.)
- **Documentation** - Detailed explanations in `NETLIST_TEST_FILES.md`

## Testing

### Test Coverage
The project maintains comprehensive test coverage:

```bash
npm test             # Run all tests
npm run test:coverage # Generate coverage report
```

**Test Categories:**
- ✅ **Component Tests** - React component rendering and interaction
- ✅ **User Flow Tests** - Authentication, file upload, form submission
- ✅ **Utility Tests** - Netlist validation, graph conversion algorithms
- ✅ **API Tests** - Service layer communication and error handling
- ✅ **Integration Tests** - End-to-end user workflows

### Test Files
- `src/**/*.test.tsx` - Component and page tests
- `src/**/*.test.ts` - Utility and service tests
- Coverage reports generated in `coverage/` directory

## Styling

### Design System
- **Color Palette** - PCB-inspired greens with high contrast
- **Typography** - Courier New for technical data, system fonts for UI
- **Components** - Consistent button, input, and panel styling
- **Responsive** - Mobile-first approach with flexible layouts

### CSS Architecture
- **Component-scoped CSS** - Styles co-located with components
- **BEM Methodology** - Consistent class naming convention
- **CSS Custom Properties** - Themeable color and spacing variables
- **Grid/Flexbox** - Modern layout techniques