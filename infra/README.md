# PCB Netlist Visualizer - Infrastructure Setup
This directory contains the infrastructure setup and configuration files for the PCB Netlist Visualizer project, designed to create a complete local development environment using Kubernetes (Minikube), Docker, and Helm.

## 📁 Directory Contents

### Core Setup Files
- **`setup.sh`** - Main setup script that handles OS compatibility, dependency installation, and hosts file configuration
- **`Makefile`** - Infrastructure orchestration with targets for installing and configuring all required services

### SSL/TLS Configuration
- **`generate-cert.sh`** - Script to generate local SSL certificates for HTTPS development
- **`local-cert.cnf`** - OpenSSL configuration file for certificate generation
- **`local-cert.crt`** - Generated SSL certificate (created during setup)
- **`local-cert.key`** - Generated SSL private key (created during setup)

### Kubernetes Configuration
- **`mongo-db-values.yaml`** - Helm values file for MongoDB deployment configuration

## 🚀 Quick Start

### Prerequisites
- **macOS** (Intel or Apple Silicon)
- **Administrator privileges** (for modifying `/etc/hosts` and installing system dependencies)

### Automated Setup
Run the main setup script to configure everything automatically:

```bash
./setup.sh
```

This will:
1. ✅ Check OS compatibility and system architecture
2. 🍺 Install Homebrew (if not present)
3. 🔧 Install Make, Docker, Minikube, Helm, and Node.js
4. 🌐 Configure `/etc/hosts` with local domain entries
5. 🏗️ Execute the complete Makefile workflow

## 🔧 Makefile Usage

The Makefile provides granular control over the infrastructure setup process. All targets are designed to be idempotent (safe to run multiple times).

### Main Targets

#### Complete Setup
```bash
make all
```
Runs the entire infrastructure setup pipeline in the correct order.

#### Individual Components

**System Validation:**
```bash
make check-os        # Verify macOS compatibility
make check-arch      # Display CPU architecture info
```

**Dependencies:**
```bash
make install-rosetta    # Install Rosetta 2 (Apple Silicon only)
make install-minikube   # Install Kubernetes-in-Docker
make install-helm       # Install Kubernetes package manager
make install-npm        # Install Node.js and npm
make install-docker     # Install Docker Desktop
```

**Kubernetes Setup:**
```bash
make add-helm-repos           # Configure Helm repositories
make start-minikube          # Start local Kubernetes cluster
make setup-registry          # Start local Docker registry
make connect-registry        # Connect registry to Minikube
make start-ingress-controller # Install NGINX ingress with SSL
make start-mongo-db          # Deploy MongoDB database
```

### Service URLs

After successful setup, services will be available at:

- **Frontend (Client):** `https://dev.local`
- **Backend (API):** `https://api.dev.local`
- **MongoDB:** Internal cluster access at `mongo-db:27017`
- **Docker Registry:** `localhost:5000`

## 🏗️ Infrastructure Architecture

### Components Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Local Development                     │
├─────────────────────────────────────────────────────────┤
│  Browser                                               │
│  ├── https://dev.local (Client App)                   │
│  └── https://api.dev.local (API Server)               │
├─────────────────────────────────────────────────────────┤
│  Minikube Kubernetes Cluster                          │
│  ├── NGINX Ingress Controller (SSL Termination)       │
│  ├── PCB Client Pod (React/Vite)                      │
│  ├── PCB API Pod (Node.js/Express)                    │
│  └── MongoDB Pod (Database)                           │
├─────────────────────────────────────────────────────────┤
│  Docker Desktop                                        │
│  ├── Local Registry (localhost:5000)                  │
│  └── Container Images                                 │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Container Orchestration:** Minikube (local Kubernetes)
- **Package Management:** Helm Charts
- **Ingress/Load Balancer:** NGINX Ingress Controller
- **Database:** MongoDB (Bitnami Helm Chart)
- **SSL/TLS:** Self-signed certificates for local HTTPS
- **Container Registry:** Local Docker registry

## 📋 Configuration Details

### MongoDB Configuration (`mongo-db-values.yaml`)
- **Architecture:** Standalone (single instance)
- **Authentication:** Disabled for development
- **Persistence:** 1GB storage volume
- **Resources:** Optimized for local development (100-200Mi memory)
- **Service:** ClusterIP internal access

### SSL Certificate Configuration
- **Domain Coverage:** `*.dev.local` and `dev.local`
- **Algorithm:** RSA 2048-bit
- **Validity:** 365 days
- **Usage:** HTTPS termination at ingress level

### Hosts File Entries
The setup automatically adds these entries to `/etc/hosts`:
```
127.0.0.1 dev.local
127.0.0.1 api.dev.local
```

## 🔍 Troubleshooting

### Common Issues

**Minikube Won't Start:**
```bash
minikube delete  # Remove existing cluster
minikube start --driver=hyperkit  # Recreate cluster
```

**Docker Registry Issues:**
```bash
docker stop registry && docker rm registry  # Remove registry
make setup-registry  # Recreate registry
```

**SSL Certificate Problems:**
```bash
rm local-cert.*  # Remove existing certificates
./generate-cert.sh  # Regenerate certificates
```

**Helm Installation Failures:**
```bash
helm repo update  # Update repository metadata
make add-helm-repos  # Reconfigure repositories
```

### Verification Commands

**Check Cluster Status:**
```bash
minikube status
kubectl get pods --all-namespaces
```

**Verify Services:**
```bash
kubectl get services
kubectl get ingress
```

**Check MongoDB:**
```bash
kubectl logs deployment/mongo-db
```

## 🔄 Development Workflow

1. **Initial Setup:** Run `./setup.sh` once to configure environment
2. **Daily Development:** Services persist across reboots
3. **Restart Services:** Use individual Makefile targets as needed
4. **Clean Reset:** `minikube delete` + `./setup.sh` for fresh start

## 🛡️ Security Notes

- 🔒 Self-signed certificates (browser security warnings expected)
- 🔐 MongoDB runs without authentication (development only)
- 🌐 Services accessible only from localhost
- 📝 Not suitable for production deployment

## 🎯 Next Steps

After infrastructure setup:
1. Deploy application using project-level Makefiles
2. Access frontend at `https://dev.local`
3. API available at `https://api.dev.local`
4. Begin PCB netlist visualization development

---

**Note:** This infrastructure setup is specifically designed for macOS local development and requires administrator privileges for system modifications.
