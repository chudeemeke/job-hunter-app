@echo off
REM Aggressive cleanup - removes ALL unnecessary files

echo.
echo ⚠️  AGGRESSIVE CLEANUP - This will DELETE unnecessary files!
echo ==========================================================
echo.
echo This will keep ONLY the files needed for the app to work.
echo.
set /p confirm="Are you SURE you want to delete test/doc files? (YES/no): "

if /i not "%confirm%"=="YES" (
    echo.
    echo Cancelled. No files were deleted.
    pause
    exit /b
)

echo.
echo 🗑️ Deleting unnecessary files...
echo.

REM Delete test/generator files
if exist "test.html" del "test.html" && echo ✅ Deleted test.html
if exist "create-professional-icons.html" del "create-professional-icons.html" && echo ✅ Deleted icon generator
if exist "generate-icons.html" del "generate-icons.html" && echo ✅ Deleted old icon generator
if exist "icon-generator.html" del "icon-generator.html" && echo ✅ Deleted icon generator

REM Delete documentation files
if exist "README.md" del "README.md" && echo ✅ Deleted README.md
if exist "INSTALLATION-GUIDE.md" del "INSTALLATION-GUIDE.md" && echo ✅ Deleted installation guide
if exist "FAMILY-GUIDE.md" del "FAMILY-GUIDE.md" && echo ✅ Deleted family guide
if exist "FILES-GUIDE.md" del "FILES-GUIDE.md" && echo ✅ Deleted files guide

REM Delete deployment scripts (after deployment)
if exist "cleanup-before-deploy.bat" del "cleanup-before-deploy.bat" && echo ✅ Deleted cleanup script
if exist "deploy-easy.sh" del "deploy-easy.sh" && echo ✅ Deleted Linux deploy script
if exist "aggressive-cleanup.bat" echo (keeping this script for now)

REM Delete folders
if exist "Documentation" (
    rmdir /s /q "Documentation"
    echo ✅ Deleted Documentation folder
)
if exist "Archive" (
    rmdir /s /q "Archive"
    echo ✅ Deleted Archive folder
)
if exist "Tests" (
    rmdir /s /q "Tests"
    echo ✅ Deleted Tests folder
)
if exist "docs" (
    rmdir /s /q "docs"
    echo ✅ Deleted docs folder
)

echo.
echo ✨ Cleanup complete! Your folder now contains ONLY:
echo.
echo 📁 Essential Files:
echo   - index.html (main app)
echo   - welcome.html (install page)
echo   - manifest.json (PWA config)
echo   - sw.js (offline support)
echo   - icon-192.png, icon-512.png
echo   - src/ folder (app code)
echo   - assets/icons/ folder
echo.
echo 🚀 Ready for deployment!
echo.
pause