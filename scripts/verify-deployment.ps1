# Deployment Verification Script (PowerShell)
# This script helps verify that the deployment is working correctly from Windows

param(
    [string]$AppUrl = "https://tg.packsi.net",
    [string]$ServerHost = "",
    [string]$ServerUser = "deployment",
    [int]$ServerPort = 22
)

Write-Host "🔍 Packsi Mini App Deployment Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Test local build
Write-Host "📦 Checking local build..." -ForegroundColor Yellow

if (Test-Path "dist\index.html") {
    Write-Host "✅ Local dist/index.html exists" -ForegroundColor Green
    $distFiles = Get-ChildItem -Path "dist" -Recurse | Measure-Object
    Write-Host "📁 Dist contains $($distFiles.Count) files" -ForegroundColor Green
} else {
    Write-Host "❌ Local dist/index.html not found" -ForegroundColor Red
    Write-Host "💡 Run 'npm run build' first" -ForegroundColor Yellow
}

# Test external HTTPS connection
Write-Host "🌐 Testing external connection: $AppUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $AppUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    $statusCode = $response.StatusCode
    
    switch ($statusCode) {
        200 {
            Write-Host "✅ HTTPS connection successful (200 OK)" -ForegroundColor Green
        }
        { $_ -in 301, 302 } {
            Write-Host "⚠️  HTTPS redirect detected ($statusCode)" -ForegroundColor Yellow
        }
        default {
            Write-Host "⚠️  HTTPS returned status code: $statusCode" -ForegroundColor Yellow
        }
    }
} catch {
    $errorMessage = $_.Exception.Message
    
    if ($errorMessage -like "*404*") {
        Write-Host "❌ HTTPS connection failed (404 Not Found)" -ForegroundColor Red
        Write-Host "This usually means:" -ForegroundColor Yellow
        Write-Host "  - Domain is not pointing to the server" -ForegroundColor Yellow
        Write-Host "  - Nginx virtual host is not configured correctly" -ForegroundColor Yellow
        Write-Host "  - SSL certificate issues" -ForegroundColor Yellow
    } elseif ($errorMessage -like "*timeout*" -or $errorMessage -like "*unreachable*") {
        Write-Host "❌ HTTPS connection failed (Connection error)" -ForegroundColor Red
        Write-Host "This usually means:" -ForegroundColor Yellow
        Write-Host "  - Server is not reachable" -ForegroundColor Yellow
        Write-Host "  - DNS issues" -ForegroundColor Yellow
        Write-Host "  - Firewall blocking connections" -ForegroundColor Yellow
    } else {
        Write-Host "❌ HTTPS connection failed: $errorMessage" -ForegroundColor Red
    }
    
    # Test HTTP fallback
    $httpUrl = $AppUrl -replace "^https:", "http:"
    Write-Host "🔄 Testing HTTP fallback: $httpUrl" -ForegroundColor Yellow
    
    try {
        $httpResponse = Invoke-WebRequest -Uri $httpUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ HTTP fallback works (Status: $($httpResponse.StatusCode))" -ForegroundColor Green
        Write-Host "💡 Consider setting up SSL certificate" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ HTTP fallback also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test DNS resolution
Write-Host "🔍 Testing DNS resolution..." -ForegroundColor Yellow
$domain = ($AppUrl -replace "^https?://", "") -replace "/.*", ""

try {
    $dnsResult = Resolve-DnsName -Name $domain -ErrorAction Stop
    Write-Host "✅ DNS resolution successful" -ForegroundColor Green
    foreach ($record in $dnsResult) {
        if ($record.Type -eq "A") {
            Write-Host "📍 IP Address: $($record.IPAddress)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Check GitHub Secrets (if running in GitHub Actions)
if ($env:GITHUB_ACTIONS -eq "true") {
    Write-Host "🔐 Checking GitHub Secrets..." -ForegroundColor Yellow
    
    $secrets = @(
        "SERVER_HOST",
        "SERVER_USER", 
        "SERVER_SSH_KEY",
        "SERVER_PORT",
        "APP_DIRECTORY",
        "APP_URL"
    )
    
    foreach ($secret in $secrets) {
        $value = [Environment]::GetEnvironmentVariable($secret)
        if ($value) {
            Write-Host "✅ $secret is set" -ForegroundColor Green
        } else {
            Write-Host "❌ $secret is not set" -ForegroundColor Red
        }
    }
}

# SSH Connection Test (if server details provided)
if ($ServerHost -and $ServerUser) {
    Write-Host "🔑 Testing SSH connection to $ServerUser@$ServerHost..." -ForegroundColor Yellow
    
    # Note: This requires SSH client to be available on Windows
    if (Get-Command ssh -ErrorAction SilentlyContinue) {
        try {
            $sshTest = ssh -o ConnectTimeout=10 -o BatchMode=yes "$ServerUser@$ServerHost" "echo 'SSH connection successful'" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ SSH connection successful" -ForegroundColor Green
            } else {
                Write-Host "❌ SSH connection failed" -ForegroundColor Red
                Write-Host "Error: $sshTest" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ SSH test failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  SSH client not available for connection test" -ForegroundColor Yellow
        Write-Host "💡 Install OpenSSH client or use WSL" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "" 
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📋 Verification Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "🔧 Next steps if deployment failed:" -ForegroundColor Yellow
Write-Host "1. Check GitHub Secrets configuration" -ForegroundColor White
Write-Host "2. Verify server SSH access" -ForegroundColor White
Write-Host "3. Check Nginx configuration on server" -ForegroundColor White
Write-Host "4. Review DNS settings" -ForegroundColor White
Write-Host "5. Check SSL certificate status" -ForegroundColor White
Write-Host "" 
Write-Host "📚 For detailed troubleshooting, see: TROUBLESHOOTING.md" -ForegroundColor Cyan