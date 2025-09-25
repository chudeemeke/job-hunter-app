# Job Hunter PWA v2 - Enhanced Application Tracker & Resume Optimizer

A Progressive Web App for managing job applications with AI-powered resume optimization and batch application features.

## 🚀 New Features in v2

### 🎨 Smart Dark Mode
- Automatic theme detection based on system preferences
- Manual toggle between light/dark modes
- Smooth transitions and optimized contrast

### 📱 Enhanced Mobile Support
- Fully installable on iOS/iPadOS (Add to Home Screen)
- Android PWA installation support
- Touch-optimized interface
- No pinch-zoom issues

### 🔗 Clickable Job Cards
- Click any job card to view the original posting
- Direct links to source job listings
- Seamless navigation

### 📧 AI-Powered Cover Letters
- Automatically generated based on job descriptions
- Tailored to match job requirements
- Uses job description keywords

### 📋 Batch Operations
- Select multiple jobs with checkboxes
- Batch optimize resumes for multiple positions
- Apply to multiple jobs with preview
- Bulk application management

### 🔔 Top-Center Notifications
- No more pop-ups or alerts
- Toast notifications slide down from top
- Success, error, and info states
- Auto-dismiss after 3 seconds

### 🔄 Auto-Update System
- Automatic updates without reinstalling
- Checks for updates every hour
- Updates when app regains focus
- Seamless refresh with notification
- Works on all devices (iOS/Android/Desktop)

## How It Works

See [HOW-IT-WORKS.md](HOW-IT-WORKS.md) for detailed explanation of:
- Job scraping process
- Resume optimization algorithm
- AI-powered cover letter generation
- Auto-update mechanism

## Features

### 📋 Job Board
- Browse and search job listings
- Filter by location, type, and level
- Multi-select with checkboxes
- Direct links to original postings
- Quick apply functionality
- Save jobs for later

### 📊 Application Tracking
- Track application status (Applied, Interview, Offer, Rejected)
- Add notes to applications
- View application history
- Status-based filtering
- Click to view original job posting

### 🎯 Resume Optimizer
- Auto-optimize resume for specific job postings
- Keyword injection based on job requirements
- Highlight relevant experience
- AI-generated tailored cover letters
- Batch optimization for multiple jobs
- Preview before sending

### 📧 Email Integration
- Configure email templates
- Send applications via email
- Pre-filled subject and body
- Custom email signatures

### 💾 PWA Features
- Works offline
- Installable on all platforms
- Background sync for job updates
- Push notifications for job alerts
- Auto-save functionality

## Installation

### Desktop (Chrome/Edge)
1. Open `index.html` in Chrome or Edge
2. Click the install icon in the address bar
3. Follow the installation prompts

### iOS/iPadOS
1. Open `index.html` in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name the app and tap "Add"

### Android
1. Open `index.html` in Chrome
2. Tap the three-dot menu
3. Select "Add to Home screen"
4. Follow the prompts

## Usage

### Getting Started
1. Go to Settings tab and configure your email
2. Browse jobs in the Job Board tab
3. Select jobs using checkboxes for batch operations
4. Click "Optimize Resume" for tailored applications

### Batch Applications
1. Select multiple jobs using checkboxes
2. Click "Batch Optimize" to optimize for all selected
3. Review each optimized resume and cover letter
4. Send applications individually or in batch

### Resume Optimization
1. Select one or more jobs from the job board
2. Paste your base resume in the Resume Optimizer tab
3. Click "Optimize Resume" to generate tailored content
4. Review and send applications with one click

### Application Tracking
1. All applications are automatically tracked
2. Update status as your application progresses
3. Click any application to view the original job posting

## Testing

Run the test suite by including the test file:
```html
<script src="Tests/tests.js"></script>
```

Tests cover:
- State management
- Job filtering
- Resume optimization
- Cover letter generation
- Batch selection
- Application tracking
- Theme switching
- PWA features
- Notification system

## Technical Details

- **Storage**: LocalStorage for persistence
- **Offline**: Service Worker with cache-first strategy
- **Styling**: CSS custom properties for theming
- **Framework**: Vanilla JavaScript (no dependencies)
- **Compatibility**: iOS 11.3+, Android 5+, all modern browsers

## File Structure
```
JobBoardPWA/
├── index.html       # Main application
├── manifest.json    # PWA configuration
├── sw.js           # Service worker
├── Tests/
│   └── tests.js    # Test suite
└── README.md       # Documentation
```

## Browser Support

- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support (iOS 11.3+)
- ✅ Samsung Internet: Full support
- ❌ Internet Explorer: Not supported

## Future Enhancements

- Real API integration for job boards
- Advanced resume parsing with AI
- Interview scheduling integration
- Salary negotiation tracker
- Analytics dashboard
- Export to PDF functionality

## License

MIT License - Feel free to modify and use for your job search!

## Changelog

### v2.0.0
- Added smart dark mode with auto-detection
- Enhanced mobile support for iOS/Android
- Implemented batch operations
- AI-powered cover letter generation
- Moved notifications to top-center position
- Made all cards clickable to source
- Improved PWA installation experience

### v3.0.0
- Added auto-update mechanism
- Network-first strategy for HTML updates
- Improved service worker caching
- Added version checking system
- Enhanced offline capabilities
## 🤖 CI/CD Auto-Fix

This repository uses Claude AI to automatically fix CI/CD failures.
If builds fail, Claude will automatically create a fix PR.

