.PHONY: up down run push build help

IMAGE_NAME ?= pcb-netlist-visualizer-client
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
	@echo "Deploying Client..."
	helm uninstall $(RELEASE_NAME) || echo "Release not found."
	minikube image rm $(IMAGE_NAME):$(TAG) || echo "Image not found in minikube."
	minikube image load $(IMAGE_NAME):$(TAG)
	helm install $(RELEASE_NAME) $(HELM_CHART) --set image.tag=$(TAG)
	@echo "Client deployed successfully."

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
	@echo "  build          - Build Docker image with no cache"
	@echo "  up             - Build and deploy using minikube's docker daemon"
	@echo "  down           - Uninstall the deployment"
	@echo "  run            - Install dependencies and start the application locally"
	@echo ""
	@echo "Environment variables:"
	@echo "  IMAGE_NAME     - Docker image name (default: pcb-netlist-visualizer-client)"
	@echo "  TAG            - Image tag (default: latest)"
	@echo "  RELEASE_NAME   - Helm release name (default: same as IMAGE_NAME)"