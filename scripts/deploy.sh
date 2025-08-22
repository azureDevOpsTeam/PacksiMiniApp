#!/bin/bash

# Packsi Mini App Deployment Script
# This script handles the deployment process on the server

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

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

# Configuration
APP_DIR="${APP_DIRECTORY:-/var/www/tg-app}"
BACKUP_DIR="$APP_DIR/backups"
SERVICE_NAME="tg.service"
MAX_BACKUPS=5

# Create backup directory if it doesn't exist
print_status "Creating backup directory..."
mkdir -p "$BACKUP_DIR"

# Create backup of current deployment
if [ -d "$APP_DIR/dist" ]; then
    print_status "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$APP_DIR" dist/ docker-compose.yml Dockerfile nginx.conf tg.service 2>/dev/null || true
    print_success "Backup created: $BACKUP_NAME"
    
    # Clean old backups (keep only last 5)
    print_status "Cleaning old backups..."
    cd "$BACKUP_DIR"
    ls -t backup-*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
    print_success "Old backups cleaned"
fi

# Stop the service if it's running
print_status "Stopping application service..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    sudo systemctl stop "$SERVICE_NAME"
    print_success "Service stopped"
else
    print_warning "Service was not running"
fi

# Navigate to application directory
cd "$APP_DIR"

# Pull latest changes from git (if this is a git deployment)
if [ -d ".git" ]; then
    print_status "Pulling latest changes from git..."
    git fetch origin
    git reset --hard origin/main
    print_success "Git repository updated"
fi

# Stop and remove existing containers
print_status "Stopping existing Docker containers..."
docker-compose down --remove-orphans || true
print_success "Containers stopped"

# Remove old images to free up space
print_status "Cleaning up old Docker images..."
docker image prune -f || true
print_success "Docker cleanup completed"

# Build and start new containers
print_status "Building and starting new containers..."
export DOCKER_BUILDKIT=1
docker-compose build --no-cache app-prod
docker-compose up -d app-prod
print_success "New containers started"

# Wait for container to be ready
print_status "Waiting for application to be ready..."
sleep 10

# Check if container is running
if docker-compose ps app-prod | grep -q "Up"; then
    print_success "Container is running"
else
    print_error "Container failed to start"
    print_status "Container logs:"
    docker-compose logs app-prod
    exit 1
fi

# Test local connection
print_status "Testing local HTTP connection..."
for i in {1..30}; do
    if curl -f -s -o /dev/null http://localhost/; then
        print_success "Local HTTP connection successful"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Local HTTP connection failed after 30 attempts"
        print_status "Container logs:"
        docker-compose logs app-prod
        exit 1
    fi
    sleep 2
done

# Start the systemd service
print_status "Starting application service..."
sudo systemctl start "$SERVICE_NAME"
print_success "Service started"

# Enable service if not already enabled
if ! systemctl is-enabled --quiet "$SERVICE_NAME"; then
    print_status "Enabling service for auto-start..."
    sudo systemctl enable "$SERVICE_NAME"
    print_success "Service enabled for auto-start"
fi

# Reload nginx configuration
print_status "Reloading Nginx configuration..."
sudo nginx -t && sudo systemctl reload nginx
print_success "Nginx reloaded"

# Final health check
print_status "Performing final health check..."
if curl -f -s -o /dev/null http://localhost/health; then
    print_success "Health check passed"
else
    print_warning "Health check endpoint not responding (this might be normal)"
fi

# Show deployment summary
print_success "🎉 Deployment completed successfully!"
print_status "Deployment Summary:"
echo "  📁 Application Directory: $APP_DIR"
echo "  🐳 Docker Container: $(docker-compose ps -q app-prod)"
echo "  🔧 Service Status: $(systemctl is-active $SERVICE_NAME)"
echo "  📊 Container Stats:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose ps -q app-prod) 2>/dev/null || echo "    Container stats not available"
echo "  📋 Recent logs:"
docker-compose logs --tail=5 app-prod

print_status "Deployment process completed at $(date)"