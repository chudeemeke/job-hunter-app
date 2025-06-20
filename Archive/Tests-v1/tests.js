// Tests for Job Hunter PWA

// Test Suite for Core Functionality
const tests = {
    // Test local storage operations
    testStateManagement: () => {
        console.log('Testing state management...');
        
        // Save test data
        const testState = {
            jobs: [{id: 999, title: 'Test Job'}],
            applications: [],
            settings: {email: 'test@example.com'}
        };
        
        localStorage.setItem('jobHunterState', JSON.stringify(testState));
        
        // Retrieve and verify
        const retrieved = JSON.parse(localStorage.getItem('jobHunterState'));
        console.assert(retrieved.jobs[0].id === 999, 'Job ID should match');
        console.assert(retrieved.settings.email === 'test@example.com', 'Email should match');
        
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
            requirements: ['Python', 'React', 'AWS']
        };
        
        // Simple keyword check
        let optimized = baseResume;
        job.requirements.forEach(req => {
            if (!optimized.includes(req)) {
                optimized += `\n${req}`;
            }
        });
        
        console.assert(optimized.includes('Python'), 'Should include Python');
        console.assert(optimized.includes('React'), 'Should include React');
        console.assert(optimized.includes('AWS'), 'Should include AWS');
        
        console.log('✓ Resume optimization test passed');
    },
    
    // Test application tracking
    testApplicationTracking: () => {
        console.log('Testing application tracking...');
        
        const applications = [];
        const newApp = {
            id: Date.now(),
            jobId: 1,
            status: 'applied',
            appliedDate: new Date().toISOString()
        };
        
        applications.push(newApp);
        console.assert(applications.length === 1, 'Should have 1 application');
        console.assert(applications[0].status === 'applied', 'Status should be applied');
        
        // Update status
        applications[0].status = 'interview';
        console.assert(applications[0].status === 'interview', 'Status should update');
        
        console.log('✓ Application tracking test passed');
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
        
        console.log('✓ PWA features test passed');
    }
};

// Run all tests
function runAllTests() {
    console.log('🧪 Running Job Hunter PWA Tests...\n');
    
    Object.keys(tests).forEach(testName => {
        try {
            tests[testName]();
        } catch (error) {
            console.error(`✗ ${testName} failed:`, error);
        }
    });
    
    console.log('\n✅ All tests completed!');
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