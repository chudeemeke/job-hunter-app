@echo off
REM Cleanup and organize files for deployment

echo.
echo 🧹 Cleaning up JobBoardPWA for deployment...
echo ==========================================
echo.

REM Create assets/icons if it doesn't exist
if not exist "assets\icons" (
    mkdir "assets\icons"
    echo ✅ Created assets\icons folder
)

REM Move small icons to assets/icons if they exist in root
if exist "icon-16.png" (
    move "icon-16.png" "assets\icons\" >nul 2>&1
    echo ✅ Moved icon-16.png to assets\icons\
)
if exist "icon-32.png" (
    move "icon-32.png" "assets\icons\" >nul 2>&1
    echo ✅ Moved icon-32.png to assets\icons\
)
if exist "icon-180.png" (
    move "icon-180.png" "assets\icons\" >nul 2>&1
    echo ✅ Moved icon-180.png to assets\icons\
)

REM Check if required files exist
echo.
echo 📋 Checking required files...
echo.

set all_good=1

if exist "index.html" (
    echo ✅ index.html
) else (
    echo ❌ index.html MISSING!
    set all_good=0
)

if exist "manifest.json" (
    echo ✅ manifest.json
) else (
    echo ❌ manifest.json MISSING!
    set all_good=0
)

if exist "sw.js" (
    echo ✅ sw.js - service worker
) else (
    echo ❌ sw.js MISSING!
    set all_good=0
)

if exist "welcome.html" (
    echo ✅ welcome.html - install page
) else (
    echo ❌ welcome.html MISSING!
    set all_good=0
)

if exist "icon-192.png" (
    echo ✅ icon-192.png
) else (
    echo ❌ icon-192.png MISSING! (run create-professional-icons.html)
    set all_good=0
)

if exist "icon-512.png" (
    echo ✅ icon-512.png
) else (
    echo ❌ icon-512.png MISSING! (run create-professional-icons.html)
    set all_good=0
)

if exist "src\js\app.js" (
    echo ✅ src\ folder
) else (
    echo ❌ src\ folder MISSING!
    set all_good=0
)

echo.
if %all_good%==1 (
    echo 🎉 All required files present!
    echo.
    echo 📦 Your app is ready for deployment!
    echo.
    echo Next step: Run deploy-easy.bat
) else (
    echo ⚠️  Some files are missing! Please fix before deploying.
)

echo.
echo 📁 Files that WILL be uploaded:
echo ================================
echo - index.html
echo - manifest.json  
echo - sw.js
echo - welcome.html
echo - icon-192.png
echo - icon-512.png
echo - src\ (all app code)
echo - assets\icons\ (app icons)
echo.
echo 🚫 Files that will NOT be uploaded:
echo ===================================
echo - Test files (test.html)
echo - Documentation\ folder
echo - Archive\ folder
echo - Icon generators
echo - Deployment scripts
echo - README files
echo.
pause