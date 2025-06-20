# 📁 JobBoardPWA File Guide

## ✅ Files REQUIRED for the App to Work:

### Root Directory:
- `index.html` - Main app file
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline functionality
- `welcome.html` - Installation page for family
- `icon-192.png` - PWA icon
- `icon-512.png` - PWA icon

### Folders:
- `src/` - All the app code (REQUIRED)
  - `js/` - JavaScript files
  - `views/` - All the screens
  - `components/` - AI assistant
  - `config/` - Configuration
  - `api/` - Job board connections
  - `utils/` - Helper functions
- `assets/icons/` - Small app icons
  - `icon-16.png`
  - `icon-32.png`  
  - `icon-180.png`

---

## 🚫 Files NOT Needed (Safe to Delete):

### Test/Development Files:
- `test.html` - Testing page
- `create-professional-icons.html` - Icon generator
- `generate-icons.html` - Old icon generator
- `icon-generator.html` - Another icon generator
- `Tests/` folder - Test files

### Documentation (for developers):
- `README.md`
- `INSTALLATION-GUIDE.md` 
- `FAMILY-GUIDE.md`
- `Documentation/` folder
- `docs/` folder

### Deployment Scripts (keep locally, don't upload):
- `deploy-easy.bat`
- `deploy-easy.sh`
- `cleanup-before-deploy.bat`
- `.gitignore`

### Other:
- `Archive/` folder - Old versions

---

## 🎯 Quick Cleanup Commands:

### Option A: Manual Cleanup
Delete these files/folders:
- All `.html` files except `index.html` and `welcome.html`
- All `.md` files
- All `.bat` and `.sh` files
- `Documentation/`, `Archive/`, `Tests/` folders

### Option B: Use the Cleanup Script
Just run: `cleanup-before-deploy.bat`

---

## 📦 Final Structure for Deployment:

```
JobBoardPWA/
├── index.html
├── manifest.json
├── sw.js
├── welcome.html
├── icon-192.png
├── icon-512.png
├── assets/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       └── icon-180.png
└── src/
    ├── js/
    ├── views/
    ├── components/
    ├── config/
    ├── api/
    └── utils/
```

That's it! Just these files are needed for a working app.