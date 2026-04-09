# DinnerTime — Push to GitHub
# Run this in PowerShell from your DinnerTime folder
# Right-click this file and "Run with PowerShell" or open PowerShell and paste the commands

Write-Host "Pushing DinnerTime app to GitHub..." -ForegroundColor Green

# Navigate to the app directory
Set-Location "$PSScriptRoot"

# Create .gitignore
@"
node_modules/
.next/
.env
.env.local
.env.production
*.log
.DS_Store
dist/
coverage/
.vercel/
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# Initialize git and push
git init
git add .
git commit -m "Initial DinnerTime app - full-stack dinner planning PWA"
git branch -M main
git remote add origin https://github.com/nonomnis/dinnertime-app.git
git push -u origin main

Write-Host ""
Write-Host "Done! Code pushed to https://github.com/nonomnis/dinnertime-app" -ForegroundColor Green
Write-Host "Come back to Cowork and tell me when this is done!" -ForegroundColor Yellow
