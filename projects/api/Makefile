.PHONY: up down run push build up help

IMAGE_NAME ?= pcb-netlist-visualizer-api
TAG ?= latest
RELEASE_NAME ?= $(IMAGE_NAME)
HELM_CHART := ./deploy/

# Build Docker image
build:
	@echo "Building Docker image..."
	docker build --no-cache -t $(IMAGE_NAME):$(TAG) .
	@echo "Docker image built successfully."

# Deploy to cluster
up: build
	@echo "Deploying API..."
	helm uninstall $(RELEASE_NAME) || echo "Release not found."
	minikube image rm $(IMAGE_NAME):$(TAG) || echo "Image not found in minikube."
	@echo "This might take a while, please be patient..."
	minikube image load $(IMAGE_NAME):$(TAG)
	helm install $(RELEASE_NAME) $(HELM_CHART) --set image.tag=$(TAG)
	@echo "API deployed successfully."

# Uninstall deployment
down:
	@echo "Uninstalling release..."
	@helm uninstall $(RELEASE_NAME) || echo "Release not found."
	@echo "Uninstalled"

run:
	npm install
	npm start

# Help target
help:
	@echo "Available targets:"
	@echo "  build          - Build Docker image"
	@echo "  up             - Deploy using minikube's docker daemon"
	@echo "  down           - Uninstall the deployment"
	@echo "  run            - Install dependencies and start the application locally"
	@echo ""
	@echo "Environment variables:"
	@echo "  IMAGE_NAME     - Docker image name (default: pcb-netlist-visualizer-api)"
	@echo "  TAG            - Image tag (default: latest)"
	@echo "  RELEASE_NAME   - Helm release name (default: same as IMAGE_NAME)"