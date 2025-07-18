#!/usr/bin/env bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

print_status "Starting PCB Netlist Visualizer setup..."
print_status "Project root: $PROJECT_ROOT"

# Step 1: Run infrastructure setup
print_status "Step 1: Setting up infrastructure..."
if [ -f "$PROJECT_ROOT/infra/setup.sh" ]; then
    cd "$PROJECT_ROOT/infra"
    chmod +x setup.sh
    ./setup.sh
    print_success "Infrastructure setup completed"
else
    print_error "Infrastructure setup script not found at $PROJECT_ROOT/infra/setup.sh"
    exit 1
fi

# Step 2: Wait for infrastructure to be ready
print_status "Step 2: Waiting for infrastructure to be ready..."
sleep 10

# Check if kubectl is available and cluster is accessible
if command_exists kubectl; then
    print_status "Waiting for Kubernetes cluster to be ready..."
    timeout=300
    counter=0
    while ! kubectl cluster-info >/dev/null 2>&1; do
        if [ $counter -ge $timeout ]; then
            print_error "Timeout waiting for Kubernetes cluster to be ready"
            exit 1
        fi
        sleep 5
        counter=$((counter + 5))
        print_status "Waiting for cluster... ($counter/$timeout seconds)"
    done
    print_success "Kubernetes cluster is ready"
else
    print_warning "kubectl not found, skipping cluster readiness check"
fi

# Step 3: Deploy API project
print_status "Step 3: Deploying API project..."
if [ -f "$PROJECT_ROOT/projects/api/Makefile" ]; then
    cd "$PROJECT_ROOT/projects/api"
    if command_exists make; then
        print_status "Running 'make up' in API project..."
        make up
        print_success "API project deployed"
    else
        print_error "Make command not found"
        exit 1
    fi
else
    print_error "API Makefile not found at $PROJECT_ROOT/projects/api/Makefile"
    exit 1
fi

# Step 4: Deploy client project
print_status "Step 4: Deploying client project..."
if [ -f "$PROJECT_ROOT/projects/client/Makefile" ]; then
    cd "$PROJECT_ROOT/projects/client"
    print_status "Running 'make up' in client project..."
    make up
    print_success "Client project deployed"
else
    print_error "Client Makefile not found at $PROJECT_ROOT/projects/client/Makefile"
    exit 1
fi

# Step 5: Final status check
print_status "Step 5: Checking deployment status..."
cd "$PROJECT_ROOT"

if command_exists kubectl; then
    print_status "Checking pod status..."
    kubectl get pods --all-namespaces | grep -E "(api|client|mongo)" || print_warning "No application pods found"
    
    print_status "Checking ingress status..."
    kubectl get ingress --all-namespaces || print_warning "No ingress resources found"
    
    print_status "Checking services..."
    kubectl get services --all-namespaces | grep -E "(api|client|mongo)" || print_warning "No application services found"
fi

# Step 6: Display access information
print_success "PCB Netlist Visualizer setup completed!"
echo ""
print_status "Your applications should be accessible at:"
echo -e "  ${GREEN}Client (Frontend):${NC} https://dev.local"
echo -e "  ${GREEN}API (Backend):${NC}    https://api.dev.local"
echo -e "  ${RED}Navigate to both https://api.dev.local & https://dev.local to trust self signed cert${NC}"
echo ""
print_status "Make sure your /etc/hosts file has been updated with:"
echo "  127.0.0.1 dev.local"
echo "  127.0.0.1 api.dev.local"
echo ""
print_status "Useful commands:"
echo "  Check pod status:     kubectl get pods --all-namespaces"
echo "  View API logs:        kubectl logs -l app=pcb-netlist-visualizer-api"
echo "  View client logs:     kubectl logs -l app=pcb-netlist-visualizer-client"
echo "  Debug ingress:        cd infra && make debug-ingress"
echo "  Tear down:            cd projects/api && make down && cd ../client && make down"
echo ""
echo -e " ${GREEN}Run 'minikube tunnel' to enable LoadBalancer services!${NC}"