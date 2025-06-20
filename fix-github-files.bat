@echo off
echo Removing unnecessary files from GitHub...

REM Remove files from Git tracking
git rm -r --cached Documentation/
git rm -r --cached Archive/
git rm -r --cached Tests/
git rm -r --cached docs/
git rm --cached test.html
git rm --cached create-professional-icons.html
git rm --cached icon-generator-script.js
git rm --cached deploy-easy.bat
git rm --cached deploy-easy.sh
git rm --cached cleanup-before-deploy.bat
git rm --cached aggressive-cleanup.bat
git rm --cached INSTALLATION-GUIDE.md
git rm --cached README.md
git rm --cached FAMILY-GUIDE.md
git rm --cached FILES-GUIDE.md

REM Commit the removal
git commit -m "Remove development files - keep only app files"

REM Push to GitHub
git push

echo Done! Your GitHub now only has the app files.
pause