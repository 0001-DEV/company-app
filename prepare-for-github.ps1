# Script to prepare project for GitHub upload
# This creates a COPY of your project, so your original work is safe!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparing Project for GitHub Upload" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$sourceDir = Get-Location
$parentDir = Split-Path $sourceDir -Parent
$projectName = Split-Path $sourceDir -Leaf
$destinationDir = Join-Path $parentDir "$projectName-github"

Write-Host "Source: $sourceDir" -ForegroundColor Yellow
Write-Host "Destination: $destinationDir" -ForegroundColor Yellow
Write-Host ""

# Check if destination already exists
if (Test-Path $destinationDir) {
    Write-Host "Destination folder already exists. Deleting old copy..." -ForegroundColor Yellow
    Remove-Item -Path $destinationDir -Recurse -Force
}

Write-Host "Creating copy of project..." -ForegroundColor Green

# Copy entire project
Copy-Item -Path $sourceDir -Destination $destinationDir -Recurse -Force

Write-Host "Project copied successfully!" -ForegroundColor Green
Write-Host ""

# Remove node_modules folders
Write-Host "Removing node_modules folders..." -ForegroundColor Green

$nodeModulesPaths = @(
    "$destinationDir\node_modules",
    "$destinationDir\frontend\node_modules",
    "$destinationDir\backend\node_modules"
)

foreach ($path in $nodeModulesPaths) {
    if (Test-Path $path) {
        Write-Host "  Removing: $path" -ForegroundColor Yellow
        Remove-Item -Path $path -Recurse -Force
        Write-Host "  Removed successfully" -ForegroundColor Green
    }
}

Write-Host ""

# Clear .env files
Write-Host "Clearing sensitive data from .env files..." -ForegroundColor Green

$envFiles = @(
    "$destinationDir\backend\.env",
    "$destinationDir\frontend\.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Write-Host "  Clearing: $envFile" -ForegroundColor Yellow
        Remove-Item -Path $envFile -Force
        Write-Host "  Removed successfully" -ForegroundColor Green
    }
}

Write-Host ""

# Remove uploads folder
$uploadsPath = "$destinationDir\backend\uploads"
if (Test-Path $uploadsPath) {
    Write-Host "Removing uploads folder..." -ForegroundColor Yellow
    Remove-Item -Path $uploadsPath -Recurse -Force
    Write-Host "Uploads folder removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DONE! Your project is ready for GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your ORIGINAL project is untouched at:" -ForegroundColor Yellow
Write-Host "  $sourceDir" -ForegroundColor White
Write-Host ""
Write-Host "GitHub-ready copy is at:" -ForegroundColor Yellow
Write-Host "  $destinationDir" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to the GitHub-ready folder" -ForegroundColor White
Write-Host "2. Compress it to a ZIP file" -ForegroundColor White
Write-Host "3. Upload to GitHub via web interface" -ForegroundColor White
Write-Host ""

# Open the folder
explorer $destinationDir
