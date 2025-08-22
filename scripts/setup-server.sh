#!/bin/bash

set -e  # Exit on any error
# Packsi Mini App Server Setup Script
# This script sets up a fresh VPS for the Telegram Mini App

echo "🚀 Starting Packsi Mini App server setup..."

echo "generate rsa ssh key..."
ssh-keygen -t rsa -b 4096 -C "deployment@tg-app"
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

echo "Updating system and installing git..."
sudo apt update
sudo apt install -y git

echo "Installing .NET SDK 9.0..."
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt update
sudo apt install -y dotnet-sdk-9.0

echo "Installing SQL Server 2022..."
echo "deb [arch=amd64,arm64,armhf] https://packages.microsoft.com/ubuntu/22.04/mssql-server-2022 jammy main" | sudo tee /etc/apt/sources.list.d/mssql-server-2022.list
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/microsoft.gpg
sudo apt update
sudo apt install -y mssql-server
sudo /opt/mssql/bin/mssql-conf setup
sudo systemctl status mssql-server

echo "Installing SQL Server tools..."
sudo apt install -y mssql-tools unixodbc-dev
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
source ~/.bashrc

echo "Upgrading system..."
sudo apt upgrade -y

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

# Check if running as root
# if [[ $EUID -eq 0 ]]; then
#    print_error "This script should not be run as root for security reasons"
#    print_status "Please run as a regular user with sudo privileges"
#    exit 1
# fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    # Get latest version
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
    
    # Download and install
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already installed"
fi

# Install Node.js and npm
print_status "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    
    print_success "Node.js ${NODE_VERSION} and npm ${NPM_VERSION} installed successfully"
else
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js ${NODE_VERSION} and npm ${NPM_VERSION} are already installed"
fi

# Install Nginx
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    print_success "Nginx installed and started"
else
    print_success "Nginx is already installed"
fi

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed successfully"
else
    print_success "Certbot is already installed"
fi

# Configure SSL certificates
print_status "Setting up SSL certificates..."
if [ ! -z "$DOMAIN" ]; then
    sudo certbot --nginx -d tg.packsi.net
    sudo certbot --nginx -d packsi.net
    sudo certbot --nginx -d api.packsi.net
    sudo certbot --nginx -d panel.packsi.net
    print_success "SSL certificates configured"
else
    print_warning "No domain specified, skipping SSL certificate setup"
fi

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
print_success "Firewall configured"

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
print_success "Fail2ban configured"

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/tg-app
sudo chown -R $USER:$USER /var/www/tg-app
print_success "Application directory created"

# Create logs directory
print_status "Creating logs directory..."
sudo mkdir -p /var/log/tg-app
sudo chown -R $USER:$USER /var/log/tg-app
print_success "Logs directory created"

print_success "🎉 Server setup completed successfully!"
print_status "Next steps:"
echo "1. Clone your repository to /var/www/tg-app"
echo "2. Copy the systemd service file: sudo cp tg.service /etc/systemd/system/"
echo "3. Enable and start the service: sudo systemctl enable tg.service && sudo systemctl start tg.service"
echo "4. Configure SSL certificate with: sudo certbot --nginx -d your-domain.com"
echo "5. Test the deployment"
print_warning "Please log out and log back in for Docker group changes to take effect"