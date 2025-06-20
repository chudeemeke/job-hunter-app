@echo off
REM Easy Deploy Script for Job Hunter Pro (Windows)
REM This script deploys your app to GitHub Pages

echo.
echo 🚀 Job Hunter Pro - Easy Deploy
echo ==============================
echo.

REM Run cleanup first
echo 🧹 Step 1: Cleaning up files...
call cleanup-before-deploy.bat
echo.

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    echo Download from: https://git-scm.com/downloads
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "index.html" (
    echo ❌ Please run this script from the JobBoardPWA directory
    pause
    exit /b 1
)

REM Get GitHub username
echo 📝 Step 2: Enter your GitHub username
set /p github_username="GitHub username: "

REM Repository name
set repo_name=job-hunter-app

echo.
echo 📦 Step 3: Creating Git repository...

REM Initialize git if not already
if not exist ".git" (
    git init
    echo ✅ Git initialized
)

REM Create .gitignore
(
echo # Dependencies
echo node_modules/
echo npm-debug.log*
echo.
echo # OS Files
echo .DS_Store
echo Thumbs.db
echo.
echo # IDE
echo .vscode/
echo .idea/
echo.
echo # Temporary files
echo *.tmp
echo *.temp
) > .gitignore

echo ✅ Created .gitignore

REM Stage all files
git add .
git commit -m "🎉 Initial commit - Job Hunter Pro PWA"

echo.
echo 🌐 Step 4: Creating GitHub repository...
echo.
echo Please do the following:
echo 1. Go to https://github.com/new
echo 2. Repository name: %repo_name%
echo 3. Make it PUBLIC (required for GitHub Pages)
echo 4. DO NOT initialize with README
echo 5. Click 'Create repository'
echo.
pause

REM Add remote
echo.
echo 🔗 Step 5: Connecting to GitHub...
git remote add origin "https://github.com/%github_username%/%repo_name%.git"
git branch -M main

REM Push to GitHub
echo 📤 Step 6: Uploading to GitHub...
git push -u origin main

echo.
echo ⚙️ Step 7: Enabling GitHub Pages...
echo.
echo Please do the following:
echo 1. Go to https://github.com/%github_username%/%repo_name%/settings/pages
echo 2. Source: Deploy from a branch
echo 3. Branch: main
echo 4. Folder: / (root)
echo 5. Click Save
echo.
pause

echo.
echo ✅ Deployment Complete!
echo ==================================
echo.
echo 🎉 Your app will be available at:
echo 👉 https://%github_username%.github.io/%repo_name%/welcome.html
echo.
echo 📱 Share this link with your family!
echo.
echo Note: It may take 5-10 minutes for the site to become active.
echo.
echo 📧 Installation message for family:
echo -----------------------------------
echo Hey! I made a job hunting app for you. To install:
echo.
echo 1. Open this link on your phone:
echo    https://%github_username%.github.io/%repo_name%/welcome.html
echo.
echo 2. Follow the on-screen instructions
echo.
echo That's it! Let me know if you need help 😊
echo -----------------------------------
echo.
pause