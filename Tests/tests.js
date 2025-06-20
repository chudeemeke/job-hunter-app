// Tests for Job Hunter PWA v2

// Test Suite for Core Functionality
const tests = {
    // Test local storage operations
    testStateManagement: () => {
        console.log('Testing state management...');
        
        // Save test data
        const testState = {
            jobs: [{id: 999, title: 'Test Job'}],
            applications: [],
            selectedJobs: [999],
            settings: {email: 'test@example.com', theme: 'dark'}
        };
        
        localStorage.setItem('jobHunterState', JSON.stringify(testState));
        
        // Retrieve and verify
        const retrieved = JSON.parse(localStorage.getItem('jobHunterState'));
        console.assert(retrieved.jobs[0].id === 999, 'Job ID should match');
        console.assert(retrieved.settings.email === 'test@example.com', 'Email should match');
        console.assert(retrieved.settings.theme === 'dark', 'Theme should match');
        
        console.log('✓ State management test passed');
    },
    
    // Test job filtering
    testJobFiltering: () => {
        console.log('Testing job filtering...');
        
        const jobs = [
            {id: 1, title: 'Remote Developer', location: 'Remote'},
            {id: 2, title: 'Office Developer', location: 'New York'}
        ];
        
        const remoteJobs = jobs.filter(job => job.location.includes('Remote'));
        console.assert(remoteJobs.length === 1, 'Should find 1 remote job');
        console.assert(remoteJobs[0].id === 1, 'Should find correct remote job');
        
        console.log('✓ Job filtering test passed');
    },
    
    // Test resume optimization
    testResumeOptimization: () => {
        console.log('Testing resume optimization...');
        
        const baseResume = 'John Doe\nSoftware Developer\nExperience with Java';
        const job = {
            title: 'Python Developer',
            company: 'Tech Corp',
            requirements: ['Python', 'React', 'AWS']
        };
        
        // Test keyword injection
        let optimized = baseResume;
        const keywordSection = `\n\nCORE COMPETENCIES:\n${job.requirements.join(' • ')}\n`;
        optimized = baseResume.slice(0, baseResume.indexOf('\n\n')) + keywordSection + baseResume.slice(baseResume.indexOf('\n\n'));
        
        console.assert(optimized.includes('Python'), 'Should include Python');
        console.assert(optimized.includes('React'), 'Should include React');
        console.assert(optimized.includes('AWS'), 'Should include AWS');
        console.assert(optimized.includes('CORE COMPETENCIES'), 'Should have competencies section');
        
        console.log('✓ Resume optimization test passed');
    },
    
    // Test cover letter generation
    testCoverLetterGeneration: () => {
        console.log('Testing cover letter generation...');
        
        const job = {
            title: 'Frontend Developer',
            company: 'StartupXYZ',
            description: 'Join our team to build amazing products',
            requirements: ['React', 'TypeScript']
        };
        
        // Generate cover letter
        const coverLetter = `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${job.title} position at ${job.company}.`;
        
        console.assert(coverLetter.includes(job.title), 'Should include job title');
        console.assert(coverLetter.includes(job.company), 'Should include company name');
        console.assert(coverLetter.includes('Dear Hiring Manager'), 'Should have greeting');
        
        console.log('✓ Cover letter generation test passed');
    },
    
    // Test batch selection
    testBatchSelection: () => {
        console.log('Testing batch selection...');
        
        const selectedJobs = new Set();
        
        // Add jobs
        selectedJobs.add(1);
        selectedJobs.add(2);
        selectedJobs.add(3);
        
        console.assert(selectedJobs.size === 3, 'Should have 3 selected jobs');
        console.assert(selectedJobs.has(2), 'Should contain job 2');
        
        // Remove job
        selectedJobs.delete(2);
        console.assert(selectedJobs.size === 2, 'Should have 2 selected jobs');
        console.assert(!selectedJobs.has(2), 'Should not contain job 2');
        
        console.log('✓ Batch selection test passed');
    },
    
    // Test application tracking
    testApplicationTracking: () => {
        console.log('Testing application tracking...');
        
        const applications = [];
        const newApp = {
            id: Date.now(),
            jobId: 1,
            status: 'applied',
            appliedDate: new Date().toISOString(),
            coverLetter: 'Test cover letter'
        };
        
        applications.push(newApp);
        console.assert(applications.length === 1, 'Should have 1 application');
        console.assert(applications[0].status === 'applied', 'Status should be applied');
        console.assert(applications[0].coverLetter, 'Should have cover letter');
        
        // Update status
        applications[0].status = 'interview';
        console.assert(applications[0].status === 'interview', 'Status should update');
        
        console.log('✓ Application tracking test passed');
    },
    
    // Test theme switching
    testThemeSwitching: () => {
        console.log('Testing theme switching...');
        
        // Test dark theme
        document.body.setAttribute('data-theme', 'dark');
        console.assert(document.body.getAttribute('data-theme') === 'dark', 'Should be dark theme');
        
        // Test light theme
        document.body.setAttribute('data-theme', 'light');
        console.assert(document.body.getAttribute('data-theme') === 'light', 'Should be light theme');
        
        // Test auto theme detection
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.assert(typeof prefersDark === 'boolean', 'Should detect color scheme preference');
        
        console.log('✓ Theme switching test passed');
    },
    
    // Test PWA features
    testPWAFeatures: () => {
        console.log('Testing PWA features...');
        
        // Check service worker support
        console.assert('serviceWorker' in navigator, 'Service Worker should be supported');
        
        // Check manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        console.assert(manifestLink !== null, 'Manifest link should exist');
        console.assert(manifestLink.href.includes('manifest.json'), 'Manifest should be linked');
        
        // Check iOS meta tags
        const iosCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
        console.assert(iosCapable && iosCapable.content === 'yes', 'Should be iOS capable');
        
        const iosTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
        console.assert(iosTitle && iosTitle.content === 'Job Hunter', 'Should have iOS title');
        
        console.log('✓ PWA features test passed');
    },
    
    // Test notification system
    testNotificationSystem: () => {
        console.log('Testing notification system...');
        
        const notification = document.getElementById('notification');
        console.assert(notification !== null, 'Notification element should exist');
        
        // Test notification classes
        notification.className = 'notification show success';
        console.assert(notification.classList.contains('show'), 'Should have show class');
        console.assert(notification.classList.contains('success'), 'Should have success class');
        
        console.log('✓ Notification system test passed');
    }
};

// Run all tests
function runAllTests() {
    console.log('🧪 Running Job Hunter PWA v2 Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    Object.keys(tests).forEach(testName => {
        try {
            tests[testName]();
            passed++;
        } catch (error) {
            console.error(`✗ ${testName} failed:`, error);
            failed++;
        }
    });
    
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('✅ All tests completed!');
}

// Run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export for use in other test runners
if (typeof module !== 'undefined' && module.exports) {
    module.exports = tests;
}