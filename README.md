# PCB Netlist Visualizer
This project enables engineers and designers to upload JSON netlist files, validate circuit connectivity, and view force-directed schematic visualizations with real-time error highlighting.

## Quick Start

### Prerequisites
- **macOS** (Intel or Apple Silicon)
- **Administrator privileges** (required for system configuration)
- **Internet connection** (for downloading dependencies)

### Setup
Add '127.0.0.1 api.dev.local dev.local' to /etc/hosts file.
```bash
./setup.sh
minikube tunnel
```
Then visit api.dev.local and dev.local to trust self signed certs.

This automated setup will:
1. Install all required dependencies (Docker, Kubernetes, Node.js, etc.)
2. Configure local Kubernetes cluster with Minikube
3. Generate SSL certificates for HTTPS development
4. Update `/etc/hosts` for local domain resolution
5. Deploy and start all services

### Manual Setup
```bash
# Infrastructure setup
cd infra
./setup.sh

# Build and deploy applications
make                    # Deploy all services
make minikube-tunnel    # Enable external access
```
## Netlist Format

The application accepts JSON netlists with the following structure:

```json
{
  "components": [
    {
      "name": "R1",
      "type": "resistor",
      "pins": ["1", "2"]
    },
    {
      "name": "IC1",
      "type": "ic",
      "pins": ["VCC", "GND", "IN", "OUT"]
    }
  ],
  "nets": [
    {
      "net": "VCC",
      "connections": [
        {"component": "IC1", "pin": "VCC"}
      ]
    },
    {
      "net": "signal_path",
      "connections": [
        {"component": "R1", "pin": "1"},
        {"component": "IC1", "pin": "IN"}
      ]
    }
  ]
}
```

### Sample Files
The project includes comprehensive sample netlists in `projects/client/netlist-sample-files/`:
- ✅ Valid circuit examples (simple, complex, power management, digital systems)
- ❌ Invalid examples for testing validation (missing ground, duplicate components, etc.)
- 📚 Detailed documentation in `NETLIST_TEST_FILES.md`


## Features

### Core Functionality
- **Interactive Netlist Upload** - Drag-and-drop JSON netlist file support
- **Real-time Validation** - Comprehensive PCB design rule checking
- **Visual Schematic Rendering** - Force-directed graph visualization with D3.js
- **Component Library** - Standard electronic component symbols (ICs, resistors, capacitors, connectors)
- **Error Highlighting** - Visual indication of validation errors on components and nets
- **Submission History** - Track and review past netlist uploads

### Technical Features
- **Professional UI** - PCB-themed interface with dark mode aesthetics
- **Responsive Design** - Works across desktop and tablet devices
- **Authentication System** - Secure user registration and login with JWT tokens
- **RESTful API** - Well-documented backend with comprehensive error handling
- **Comprehensive Testing** - 100% test coverage with Vitest and React Testing Library

### Visualization Capabilities
- **Component-Specific Symbols** - IEEE standard schematic symbols
- **Color-Coded Nets** - Power (red), ground (gray), clock (green), signal (blue)
- **Manhattan Routing** - PCB-style right-angle connection traces
- **Interactive Dragging** - Rearrange components with physics simulation
- **Error Overlays** - Visual indicators for validation issues
- **Grid Background** - Professional schematic appearance

## Project Architecture

### Directory Structure
```
pcb/
├── setup.sh                   # Main setup script
├── Makefile                   # Project-level build orchestration
├── infra/                     # Infrastructure configuration
│   ├── setup.sh              # Infrastructure setup
│   ├── Makefile              # Kubernetes deployment
│   ├── generate-cert.sh      # SSL certificate generation
│   └── mongo-db-values.yaml  # Database configuration
└── projects/
    ├── api/                   # Backend Node.js API
    │   ├── src/               # Express.js application
    │   ├── tests/             # API test suites
    │   └── Dockerfile         # Container configuration
    └── client/                # Frontend React application
        ├── src/               # React components and utilities
        ├── tests/             # Frontend test suites
        └── Dockerfile         # Container configuration
```

### Technology Stack

**Frontend (React/TypeScript):**
- React 18 with TypeScript
- Custom CSS with PCB-themed styling
- D3.js for interactive visualizations
- Vitest + React Testing Library
- Vite for fast development builds

**Backend (Node.js/TypeScript):**
- Express.js REST API
- JWT authentication with bcrypt
- MongoDB with Mongoose ODM
- Jest for API testing
- Comprehensive request validation

**Infrastructure (Kubernetes):**
- Docker containerization
- Minikube local Kubernetes cluster
- Helm package management
- NGINX Ingress with SSL termination
- MongoDB database deployment

## Usage Guide

### 1. Account Creation
1. Navigate to `https://dev.local`
2. Click "Create new account"
3. Fill in username, first name, last name, and password
4. Account creation redirects to login page

### 2. Authentication
1. Login with your username and password
2. JWT token stored automatically for session persistence
3. Protected routes require valid authentication

### 3. Netlist Upload
1. Click "Submit Netlist" on the homepage
2. Select a JSON netlist file
3. File is automatically validated and visualized
4. View any validation errors in the sidebar

### 4. Interactive Visualization
- **Drag Components:** Click and drag to rearrange the schematic
- **Zoom/Pan:** Mouse wheel to zoom, click-drag background to pan
- **Error Review:** Red/orange highlights indicate validation issues
- **Net Tracing:** Follow color-coded connections between components

### 5. Submission History
- View all past netlist submissions in the sidebar
- Click on previous submissions to reload them
- Submissions are stored with timestamps and user information

## Validation Rules

The netlist validator checks for:

### Component Validation
- ✅ Non-empty component names and types
- ✅ Valid pin definitions
- ❌ Duplicate component names
- ❌ Components without pins

### Connectivity Validation
- ✅ Minimum 2 connections per net
- ✅ Valid component and pin references
- ❌ References to non-existent components
- ❌ References to non-existent pins

### PCB Design Rules
- ✅ Ground net presence (critical for functionality)
- ✅ Power net validation
- ⚠️ Components without ground connections (warnings)
- ❌ Insufficient net connections

## Testing

The project maintains comprehensive test coverage:

### Frontend Tests
```bash
cd projects/client
npm test                # Run all tests
npm run test:coverage   # Generate coverage report
```

**Test Coverage:**
- ✅ Component rendering and interaction
- ✅ User authentication flows
- ✅ File upload and validation
- ✅ Graph visualization logic
- ✅ Error handling scenarios

### Backend Tests
```bash
cd projects/api
npm test                # Run API tests
npm run test:coverage   # Generate coverage report
```

**Test Coverage:**
- ✅ Authentication endpoints
- ✅ Netlist submission and retrieval
- ✅ User management
- ✅ Database operations
- ✅ Error response handling

## Development

### Local Development Setup
```bash
# Start development servers
make dev-start          # Start all services in development mode
make dev-stop           # Stop development services

# Individual service development
cd projects/client && npm run dev    # Frontend dev server
cd projects/api && npm run dev       # Backend dev server with hot reload
```

### Available Services
- **Frontend:** `https://dev.local` (React development server)
- **Backend API:** `https://api.dev.local` (Express server)
- **Database:** MongoDB cluster (internal access)
- **Registry:** `localhost:5000` (local Docker registry)

### Build and Deployment
```bash
make build             # Build all Docker images
make deploy            # Deploy to Kubernetes cluster
make clean             # Clean up resources
```

## Troubleshooting

### Common Issues

**Application Not Accessible:**
```bash
# Check minikube tunnel is running
minikube tunnel

# Verify ingress controller
kubectl get ingress -A
```

**SSL Certificate Warnings:**
- Browser warnings are expected with self-signed certificates
- Click "Advanced" → "Proceed to dev.local" to continue

**Docker/Kubernetes Issues:**
```bash
# Reset Kubernetes cluster
minikube delete
./setup.sh

# Check service status
kubectl get pods -A
kubectl get services -A
```

**Build Failures:**
```bash
# Clean Docker cache
docker system prune -f

# Rebuild images
make clean && make build
```

### Getting Help

**Check Service Logs:**
```bash
# Frontend logs
kubectl logs deployment/pcb-client

# Backend logs
kubectl logs deployment/pcb-api

# Database logs
kubectl logs deployment/mongo-db
```

**Verify Configuration:**
```bash
# Check hosts file
cat /etc/hosts | grep dev.local

# Verify certificates
ls -la infra/local-cert.*
```

## Code Standards
- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Comprehensive comments** for complex logic
- **Test coverage** for new features
- **Semantic commit messages**

## System Requirements

### Minimum Requirements
- **macOS 10.15+** (Catalina or later)
- **8GB RAM** (16GB recommended)
- **5GB free disk space**
- **Docker Desktop compatibility**

### Supported Architectures
- ✅ Apple Silicon (M1/M2/M3)
- ✅ Intel x86_64

---
**Ready to visualize your PCB netlists?** Run `./setup.sh` and start exploring!