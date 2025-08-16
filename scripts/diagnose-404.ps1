# 404 Diagnosis Script for bot.draton.io
# Usage: .\diagnose-404.ps1

Write-Host "Diagnosing 404 issue for bot.draton.io" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$Domain = "bot.draton.io"
$AppUrl = "https://$Domain"
$HttpUrl = "http://$Domain"

function Write-Status {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "[SUCCESS] $Message" -ForegroundColor Green
    } else {
        Write-Host "[FAILED] $Message" -ForegroundColor Red
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

Write-Host "`n1. Testing Domain Connection" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

# DNS Resolution Test
Write-Info "Testing DNS Resolution"
try {
    $dnsResult = Resolve-DnsName -Name $Domain -ErrorAction Stop
    Write-Status $true "DNS Resolution successful"
    Write-Host "IP Address: $($dnsResult.IPAddress)" -ForegroundColor Gray
} catch {
    Write-Status $false "DNS Resolution failed"
    Write-Warning "DNS configuration or domain issue"
}

# Ping Test
Write-Info "Testing Ping"
try {
    $pingResult = Test-Connection -ComputerName $Domain -Count 1 -Quiet
    Write-Status $pingResult "Ping to server"
} catch {
    Write-Status $false "Ping failed"
}

Write-Host "`n2. Testing HTTPS Connection" -ForegroundColor Yellow
Write-Host "---------------------------" -ForegroundColor Yellow

try {
    $httpsResponse = Invoke-WebRequest -Uri $AppUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Status $true "HTTPS connection successful"
    Write-Host "Status Code: $($httpsResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "Server: $($httpsResponse.Headers.Server)" -ForegroundColor Gray
} catch {
    Write-Status $false "HTTPS connection failed"
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*404*") {
        Write-Warning "Server responds but page not found (Nginx Virtual Host issue)"
    } elseif ($_.Exception.Message -like "*timeout*") {
        Write-Warning "Server not responding (server or firewall issue)"
    } elseif ($_.Exception.Message -like "*SSL*" -or $_.Exception.Message -like "*certificate*") {
        Write-Warning "SSL certificate issue"
    }
}

Write-Host "`n3. Testing HTTP Connection" -ForegroundColor Yellow
Write-Host "--------------------------" -ForegroundColor Yellow

try {
    $httpResponse = Invoke-WebRequest -Uri $HttpUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Status $true "HTTP connection successful"
    Write-Host "Status Code: $($httpResponse.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Status $false "HTTP connection failed"
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Testing Server Ports" -ForegroundColor Yellow
Write-Host "-----------------------" -ForegroundColor Yellow

# Test port 80 (HTTP)
Write-Info "Testing port 80 (HTTP)"
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ConnectAsync($Domain, 80).Wait(5000)
    if ($tcpClient.Connected) {
        Write-Status $true "Port 80 is open"
        $tcpClient.Close()
    } else {
        Write-Status $false "Port 80 is closed"
    }
} catch {
    Write-Status $false "Error connecting to port 80"
}

# Test port 443 (HTTPS)
Write-Info "Testing port 443 (HTTPS)"
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ConnectAsync($Domain, 443).Wait(5000)
    if ($tcpClient.Connected) {
        Write-Status $true "Port 443 is open"
        $tcpClient.Close()
    } else {
        Write-Status $false "Port 443 is closed"
    }
} catch {
    Write-Status $false "Error connecting to port 443"
}

Write-Host "`n5. SSL Certificate Check" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow

try {
    $uri = [System.Uri]$AppUrl
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($uri.Host, 443)
    
    $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
    $sslStream.AuthenticateAsClient($uri.Host)
    
    $cert = $sslStream.RemoteCertificate
    $cert2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cert)
    
    Write-Status $true "SSL certificate is valid"
    Write-Host "Issuer: $($cert2.Issuer)" -ForegroundColor Gray
    Write-Host "Expires: $($cert2.NotAfter)" -ForegroundColor Gray
    
    $sslStream.Close()
    $tcpClient.Close()
} catch {
    Write-Status $false "SSL certificate issue"
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. Summary and Recommendations" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow

Write-Host "`nServer-side troubleshooting steps:" -ForegroundColor Cyan
Write-Host "1. SSH to server: ssh username@server-ip" -ForegroundColor White
Write-Host "2. Run diagnosis script: ./scripts/diagnose-404.sh" -ForegroundColor White
Write-Host "3. Check Virtual Host: sudo ls -la /etc/nginx/sites-enabled/" -ForegroundColor White
Write-Host "4. Check app files: ls -la /var/www/packsi-mini-app/dist/" -ForegroundColor White
Write-Host "5. Check Nginx logs: sudo tail -f /var/log/nginx/error.log" -ForegroundColor White

Write-Host "`nUseful guides:" -ForegroundColor Cyan
Write-Host "- NGINX_404_FIX.md: Complete 404 fix guide" -ForegroundColor White
Write-Host "- TROUBLESHOOTING.md: General troubleshooting guide" -ForegroundColor White
Write-Host "- GITHUB_SECRETS_SETUP.md: GitHub Secrets setup" -ForegroundColor White

Write-Host "`nStatus Summary:" -ForegroundColor Cyan
try {
    $testResponse = Invoke-WebRequest -Uri $AppUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Website is accessible" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*404*") {
        Write-Host "Server works but Virtual Host not configured" -ForegroundColor Yellow
    } else {
        Write-Host "Website is not accessible" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Diagnosis completed" -ForegroundColor Cyan