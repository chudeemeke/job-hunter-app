#!/bin/bash
# Easy Deploy Script for Job Hunter Pro
# This script deploys your app to GitHub Pages

echo "🚀 Job Hunter Pro - Easy Deploy"
echo "=============================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "Download from: https://git-scm.com/downloads"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Please run this script from the JobBoardPWA directory"
    exit 1
fi

# Get GitHub username
echo "📝 Step 1: Enter your GitHub username"
read -p "GitHub username: " github_username

# Repository name
repo_name="job-hunter-app"

echo ""
echo "📦 Step 2: Creating Git repository..."

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git initialized"
fi

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*

# OS Files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporary files
*.tmp
*.temp
EOF

echo "✅ Created .gitignore"

# Stage all files
git add .
git commit -m "🎉 Initial commit - Job Hunter Pro PWA"

echo ""
echo "🌐 Step 3: Creating GitHub repository..."
echo ""
echo "Please do the following:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: ${repo_name}"
echo "3. Make it PUBLIC (required for GitHub Pages)"
echo "4. DO NOT initialize with README"
echo "5. Click 'Create repository'"
echo ""
read -p "Press Enter when you've created the repository..."

# Add remote
echo ""
echo "🔗 Step 4: Connecting to GitHub..."
git remote add origin "https://github.com/${github_username}/${repo_name}.git"
git branch -M main

# Push to GitHub
echo "📤 Step 5: Uploading to GitHub..."
git push -u origin main

echo ""
echo "⚙️ Step 6: Enabling GitHub Pages..."
echo ""
echo "Please do the following:"
echo "1. Go to https://github.com/${github_username}/${repo_name}/settings/pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: main"
echo "4. Folder: / (root)"
echo "5. Click Save"
echo ""
read -p "Press Enter when you've enabled GitHub Pages..."

echo ""
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🎉 Your app will be available at:"
echo "👉 https://${github_username}.github.io/${repo_name}/welcome.html"
echo ""
echo "📱 Share this link with your family!"
echo ""
echo "Note: It may take 5-10 minutes for the site to become active."
echo ""
echo "📧 Installation message for family:"
echo "-----------------------------------"
echo "Hey! I made a job hunting app for you. To install:"
echo ""
echo "1. Open this link on your phone:"
echo "   https://${github_username}.github.io/${repo_name}/welcome.html"
echo ""
echo "2. Follow the on-screen instructions"
echo ""
echo "That's it! Let me know if you need help 😊"
echo "-----------------------------------"