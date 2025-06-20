# Job Hunter PWA - Application Tracker & Resume Optimizer

A Progressive Web App for managing job applications, optimizing resumes, and automating the application process.

## Features

### 📋 Job Board
- Browse and search job listings
- Filter by location, type, and level
- Quick apply functionality
- Save jobs for later

### 📊 Application Tracking
- Track application status (Applied, Interview, Offer, Rejected)
- Add notes to applications
- View application history
- Status-based filtering

### 🎯 Resume Optimizer
- Auto-optimize resume for specific job postings
- Keyword injection based on job requirements
- Highlight relevant experience
- Generate tailored cover letters

### 📧 Email Integration
- Configure email templates
- Send applications via email
- Pre-filled subject and body

### 💾 PWA Features
- Works offline
- Installable on desktop and mobile
- Background sync for job updates
- Push notifications for job alerts

## Installation

1. Open `index.html` in a web browser
2. For PWA installation, click the install button in the address bar
3. The app will work offline once installed

## Usage

### Getting Started
1. Go to Settings tab and configure your email
2. Browse jobs in the Job Board tab
3. Click "Optimize Resume" on any job to tailor your resume
4. Use "Quick Apply" to track applications

### Resume Optimization
1. Select a job from the job board
2. Paste your base resume in the Resume Optimizer tab
3. Click "Optimize Resume" to generate tailored content
4. Review and send the application

### Application Tracking
1. All applications are automatically tracked
2. Update status as your application progresses
3. Add notes for interview prep or follow-ups

## Testing

Run the test suite by including the test file:
```html
<script src="Tests/tests.js"></script>
```

## Technical Details

- **Storage**: LocalStorage for persistence
- **Offline**: Service Worker for offline functionality
- **Styling**: Custom CSS with modern design
- **Framework**: Vanilla JavaScript (no dependencies)

## Future Enhancements

- Real API integration for job boards
- Advanced resume parsing
- Interview scheduling
- Salary negotiation tracker
- Analytics dashboard

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11.3+)
- Internet Explorer: Not supported

## License

MIT License - Feel free to modify and use for your job search!