# Vercel Deployment Script
# Run this after logging in to Vercel

Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
Write-Host ""

# Link project (if not already linked)
Write-Host "Linking project..." -ForegroundColor Yellow
if (-not (Test-Path ".vercel")) {
    Write-Host "Project not linked. Linking now..." -ForegroundColor Yellow
    vercel link --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to link project" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Project already linked" -ForegroundColor Green
}

Write-Host ""

# Deploy to production
Write-Host "Deploying to production..." -ForegroundColor Yellow
Write-Host ""
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Make sure Root Directory is set to 'frontend' in Vercel Dashboard" -ForegroundColor Yellow
    Write-Host "   Settings → General → Root Directory = 'frontend'" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}



