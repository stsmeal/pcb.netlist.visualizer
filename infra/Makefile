# Makefile to install infra and setup the cluster
# Note this only works for macOS.

.PHONY: all check-os check-arch install-rosetta install-minikube install-helm install-npm install-docker add-helm-repos start-minikube setup-registry connect-registry start-ingress-controller start-mongo-db

OS := $(shell uname -s)
ARCH := $(shell uname -m)

SHELL := /bin/bash
.SHELLFLAGS := -euo pipefail -c

all: check-os check-arch install-rosetta install-minikube install-helm install-npm install-docker add-helm-repos start-minikube start-ingress-controller start-mongo-db

check-os:
	@if [ "$(OS)" != "Darwin" ]; then \
		echo "❌ This Makefile is for macOS only."; \
		exit 1; \
	else \
		echo "✅ macOS detected."; \
	fi

check-arch:
	@echo "CPU Architecture: $(ARCH)"
	@if [ "$(ARCH)" = "arm64" ]; then \
		echo "Apple Silicon detected."; \
	elif [ "$(ARCH)" = "x86_64" ]; then \
		echo "Intel Mac detected."; \
	else \
		echo "❌ Unknown architecture: $(ARCH)"; \
		exit 1; \
	fi

install-rosetta:
	@if [ "$(ARCH)" = "arm64" ]; then \
		if /usr/bin/pgrep oahd >/dev/null 2>&1; then \
			echo "✅ Rosetta 2 already installed."; \
		else \
			echo "Installing Rosetta 2..."; \
			/usr/sbin/softwareupdate --install-rosetta --agree-to-license; \
		fi \
	else \
		echo "Intel Mac — Rosetta not needed."; \
	fi

install-minikube:
	@echo "Checking Minikube..."
	@if ! command -v minikube >/dev/null 2>&1; then \
		echo "Installing Minikube..."; \
		brew install minikube; \
	else \
		echo "✅ Minikube already installed."; \
	fi

install-helm:
	@echo "⎈ Checking Helm..."
	@if ! command -v helm >/dev/null 2>&1; then \
		echo "Installing Helm..."; \
		brew install helm; \
	else \
		echo "✅ Helm already installed."; \
	fi

install-npm:
	@echo "Checking npm and node..."
	@if ! command -v npm >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then \
		echo "Installing Node.js and npm..."; \
		brew install node; \
	else \
		echo "✅ npm and node already installed."; \
	fi

install-docker:
	@echo "Checking Docker Desktop..."
	@if ! command -v docker >/dev/null 2>&1; then \
		echo "Installing Docker Desktop..."; \
		brew install --cask docker; \
		echo "Please open Docker Desktop manually once to finish setup."; \
	else \
		echo "✅ Docker already installed."; \
	fi

add-helm-repos:
	@echo "Checking Helm repos..."
	@helm repo list | grep -q bitnami || helm repo add bitnami https://charts.bitnami.com/bitnami
	@helm repo list | grep -q ingress-nginx || helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
	@helm repo update

start-minikube:
	@echo "Starting Minikube..."
	@if ! minikube status >/dev/null 2>&1; then \
		minikube start; \
	else \
		echo "✅ Minikube already running."; \
	fi

setup-registry:
	@echo "Setting up local registry..."
	docker run -d -p 5000:5000 --restart=always --name registry registry:2 || echo "Registry already running"
	@echo "Local registry running on localhost:5000"

connect-registry:
	@echo "Connecting minikube to local registry..."
	minikube addons enable registry-aliases
	@echo "Registry connected. Use REGISTRY=localhost:5000 for builds."

start-ingress-controller:
	@echo "Installing ingress controller..."
	helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-controller --create-namespace
	@echo "✅ Ingress controller started."
	@echo "Creating local cert..."
	./generate-cert.sh
	@kubectl create secret tls local-tls \
		--cert=local-cert.crt \
		--key=local-cert.key \
		--namespace ingress-controller
	@echo "✅ Local TLS secret installed."

start-mongo-db:
	@echo "Starting MongoDB..."
	helm install mongo-db bitnami/mongodb -f ./mongo-db-values.yaml
	@echo "✅ MongoDB started."