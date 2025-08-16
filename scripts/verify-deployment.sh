#!/bin/bash

# Deployment Verification Script
# This script helps verify that the deployment is working correctly

set -e

echo "🔍 Packsi Mini App Deployment Verification"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${APP_DIRECTORY:-/var/www/packsi-mini-app}"
APP_URL="${APP_URL:-https://bot.draton.io}"

echo -e "${YELLOW}Checking application directory: $APP_DIR${NC}"

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Application directory not found: $APP_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Application directory exists${NC}"

# Check if dist directory exists
if [ ! -d "$APP_DIR/dist" ]; then
    echo -e "${RED}❌ Dist directory not found: $APP_DIR/dist${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dist directory exists${NC}"

# Check if index.html exists
if [ ! -f "$APP_DIR/dist/index.html" ]; then
    echo -e "${RED}❌ index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ index.html exists${NC}"

# Check file permissions
echo -e "${YELLOW}Checking file permissions...${NC}"
ls -la "$APP_DIR/dist/" | head -5

# Check Nginx status
echo -e "${YELLOW}Checking Nginx status...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
    echo "Try: sudo systemctl start nginx"
fi

# Check Nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if nginx -t 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    nginx -t
fi

# Test local HTTP connection
echo -e "${YELLOW}Testing local HTTP connection...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ Local HTTP connection works${NC}"
else
    echo -e "${RED}❌ Local HTTP connection failed${NC}"
fi

# Test external HTTPS connection
echo -e "${YELLOW}Testing external HTTPS connection: $APP_URL${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")

case $HTTP_CODE in
    200)
        echo -e "${GREEN}✅ HTTPS connection successful (200 OK)${NC}"
        ;;
    301|302)
        echo -e "${YELLOW}⚠️  HTTPS redirect detected ($HTTP_CODE)${NC}"
        ;;
    404)
        echo -e "${RED}❌ HTTPS connection failed (404 Not Found)${NC}"
        echo "This usually means:"
        echo "  - Domain is not pointing to this server"
        echo "  - Nginx virtual host is not configured correctly"
        echo "  - SSL certificate issues"
        ;;
    000)
        echo -e "${RED}❌ HTTPS connection failed (Connection error)${NC}"
        echo "This usually means:"
        echo "  - Server is not reachable"
        echo "  - DNS issues"
        echo "  - Firewall blocking connections"
        ;;
    *)
        echo -e "${RED}❌ HTTPS connection failed (HTTP $HTTP_CODE)${NC}"
        ;;
esac

# Test HTTP fallback
HTTP_URL=$(echo "$APP_URL" | sed 's/https:/http:/')
echo -e "${YELLOW}Testing HTTP fallback: $HTTP_URL${NC}"
HTTP_CODE_FALLBACK=$(curl -s -o /dev/null -w "%{http_code}" "$HTTP_URL" || echo "000")

if [ "$HTTP_CODE_FALLBACK" = "200" ]; then
    echo -e "${GREEN}✅ HTTP fallback works${NC}"
    echo -e "${YELLOW}💡 Consider setting up SSL certificate${NC}"
elif [ "$HTTP_CODE_FALLBACK" = "301" ] || [ "$HTTP_CODE_FALLBACK" = "302" ]; then
    echo -e "${GREEN}✅ HTTP redirects to HTTPS${NC}"
else
    echo -e "${RED}❌ HTTP fallback also failed ($HTTP_CODE_FALLBACK)${NC}"
fi

# Check SSL certificate (if HTTPS)
if [[ "$APP_URL" == https* ]]; then
    echo -e "${YELLOW}Checking SSL certificate...${NC}"
    DOMAIN=$(echo "$APP_URL" | sed 's|https://||' | sed 's|/.*||')
    
    if command -v openssl >/dev/null 2>&1; then
        SSL_INFO=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "SSL_ERROR")
        
        if [ "$SSL_INFO" != "SSL_ERROR" ]; then
            echo -e "${GREEN}✅ SSL certificate is valid${NC}"
            echo "$SSL_INFO"
        else
            echo -e "${RED}❌ SSL certificate issues detected${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  OpenSSL not available for certificate check${NC}"
    fi
fi

# Summary
echo ""
echo "==========================================="
echo -e "${YELLOW}📋 Verification Summary${NC}"
echo "==========================================="

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}🎉 Deployment is working correctly!${NC}"
    echo -e "${GREEN}✅ Application is accessible at: $APP_URL${NC}"
elif [ "$HTTP_CODE_FALLBACK" = "200" ]; then
    echo -e "${YELLOW}⚠️  Deployment is partially working${NC}"
    echo -e "${YELLOW}✅ Application is accessible at: $HTTP_URL${NC}"
    echo -e "${YELLOW}💡 HTTPS needs configuration${NC}"
else
    echo -e "${RED}❌ Deployment has issues${NC}"
    echo -e "${RED}🔧 Please check the troubleshooting guide${NC}"
fi

echo ""
echo "For more help, see: TROUBLESHOOTING.md"