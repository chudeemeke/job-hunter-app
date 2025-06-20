@echo off
REM Universal GitHub Deployment Tool with Full Automation
REM This creates the repo automatically!

echo.
echo 🚀 Universal GitHub Deployer v2.0
echo ==================================
echo.

REM Check for GitHub CLI
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ GitHub CLI not installed!
    echo.
    echo Please install it first:
    echo 1. Go to: https://cli.github.com/
    echo 2. Download and install
    echo 3. Run: gh auth login
    echo.
    pause
    exit /b 1
)

REM Check if logged in
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please login to GitHub first:
    echo Run: gh auth login
    pause
    exit /b 1
)

REM Get project info
set /p repo_name="📝 Repository name: "
set /p repo_description="📄 Description (optional): "
set /p is_private="🔒 Make private? (y/N): "

if /i "%is_private%"=="y" (
    set visibility=--private
) else (
    set visibility=--public
)

echo.
echo 🏗️ Creating GitHub repository...

REM Create repo on GitHub
gh repo create %repo_name% %visibility% --description "%repo_description%" --confirm

echo.
echo 📦 Initializing Git...

REM Initialize git if needed
if not exist ".git" (
    git init
    echo ✅ Git initialized
)

REM Create smart .gitignore BEFORE adding files
if not exist ".gitignore" (
    (
        echo # Build and temp files
        echo node_modules/
        echo dist/
        echo build/
        echo *.tmp
        echo *.temp
        echo.
        echo # OS files
        echo .DS_Store
        echo Thumbs.db
        echo desktop.ini
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo *.swp
        echo.
        echo # Logs
        echo *.log
        echo npm-debug.log*
        echo.
        echo # Tests
        echo test/
        echo tests/
        echo *.test.js
        echo *.spec.js
        echo.
        echo # Documentation
        echo docs/
        echo *.md
        echo !README.md
        echo.
        echo # Dev files
        echo *.bat
        echo *.sh
        echo !start.bat
    ) > .gitignore
    echo ✅ Created smart .gitignore
)

REM Stage only non-ignored files
git add .
git commit -m "Initial commit"

REM Get current GitHub username
for /f "tokens=* usebackq" %%a in (`gh api user --jq .login`) do set github_user=%%a

REM Set remote and push
git remote add origin https://github.com/%github_user%/%repo_name%.git 2>nul
git branch -M main
git push -u origin main

echo.
echo 🌐 Enabling GitHub Pages...

REM Enable GitHub Pages automatically
gh api repos/%github_user%/%repo_name%/pages --method POST --field source[branch]=main --field source[path]=/ >nul 2>nul

echo.
echo ✅ Deployment Complete!
echo ==================================
echo.
echo 🎉 Your site will be available at:
echo 👉 https://%github_user%.github.io/%repo_name%/
echo.
echo Note: GitHub Pages may take 5-10 minutes to activate.
echo.
pause