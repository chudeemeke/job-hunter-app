@echo off
echo Fixing PWA paths for GitHub Pages...

REM Commit the path fixes
git add .
git commit -m "Fix: Update all paths for GitHub Pages deployment"

REM Push to GitHub
git push

echo.
echo ✅ Fix deployed! 
echo.
echo Your family should now:
echo 1. Uninstall the old version (hold icon, remove)
echo 2. Reinstall from: https://chudeemeke.github.io/job-hunter-app/welcome.html
echo.
echo The app icon should now show properly! 🎉
pause