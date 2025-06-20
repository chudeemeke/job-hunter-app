// Onboarding View - Visually intensive app tour with Figma-style annotations
// Shows actual UI with flow arrows and highlights

export default class OnboardingView {
    constructor(app) {
        this.app = app;
        this.currentStep = 0;
        this.steps = this.getOnboardingSteps();
        this.autoProgress = true;
        this.progressInterval = null;
    }

    async render() {
        return `
            <div class="onboarding-overlay" id="onboardingOverlay">
                <!-- Background blur -->
                <div class="onboarding-backdrop"></div>
                
                <!-- Main container -->
                <div class="onboarding-container">
                    <!-- Progress indicator -->
                    <div class="onboarding-progress">
                        ${this.steps.map((_, index) => `
                            <div class="progress-dot ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}"
                                 data-step="${index}"></div>
                        `).join('')}
                    </div>

                    <!-- Content area -->
                    <div class="onboarding-content">
                        ${this.renderStep(this.currentStep)}
                    </div>

                    <!-- Navigation -->
                    <div class="onboarding-nav">
                        <div class="nav-left">
                            <label class="never-show-container">
                                <input type="checkbox" id="neverShowAgain" class="never-show-checkbox">
                                <span class="never-show-label">Don't show this again</span>
                            </label>
                        </div>
                        <div class="nav-right">
                            <button class="nav-button secondary" data-action="skip">
                                Skip Tour
                            </button>
                            <button class="nav-button secondary" data-action="prev" 
                                    ${this.currentStep === 0 ? 'disabled style="display:none"' : ''}>
                                Previous
                            </button>
                            <button class="nav-button primary" data-action="next">
                                ${this.currentStep === this.steps.length - 1 ? 'Get Started' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Animated elements -->
                <svg class="flow-arrows" id="flowArrows">
                    <!-- Arrows will be dynamically added -->
                </svg>
                
                <!-- Floating annotations -->
                <div class="floating-annotations" id="floatingAnnotations">
                    <!-- Annotations will be dynamically added -->
                </div>
            </div>

            <style>
                .onboarding-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    animation: fadeIn 0.5s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .onboarding-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                }

                .onboarding-container {
                    position: relative;
                    width: 90%;
                    max-width: 1200px;
                    height: 90vh;
                    max-height: 800px;
                    margin: 5vh auto;
                    background: var(--bg-primary);
                    border-radius: 24px;
                    box-shadow: 0 25px 100px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: slideUp 0.5s ease 0.2s both;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                /* Progress */
                .onboarding-progress {
                    display: flex;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 2rem;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-color);
                }

                .progress-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--gray-300);
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }

                .progress-dot:hover {
                    transform: scale(1.2);
                }

                .progress-dot.active {
                    background: var(--primary);
                    transform: scale(1.3);
                }

                .progress-dot.active::after {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    border: 2px solid var(--primary);
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.5;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .progress-dot.completed {
                    background: var(--success);
                }

                /* Content */
                .onboarding-content {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }

                .step-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    animation: slideIn 0.5s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                /* Navigation */
                .onboarding-nav {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 2rem;
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--border-color);
                }

                .nav-left {
                    flex: 1;
                }

                .never-show-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    user-select: none;
                }

                .never-show-checkbox {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .never-show-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .nav-right {
                    display: flex;
                    gap: 1rem;
                }

                .nav-button {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .nav-button.primary {
                    background: var(--primary);
                    color: white;
                }

                .nav-button.primary:hover {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .nav-button.secondary {
                    background: var(--gray-200);
                    color: var(--text-primary);
                }

                .nav-button.secondary:hover {
                    background: var(--gray-300);
                }

                .nav-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Step styles */
                .step-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    height: 100%;
                    gap: 3rem;
                    padding: 3rem;
                }

                .step-visual {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .step-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 2rem;
                }

                .step-number {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .step-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1.2;
                    margin: 0;
                }

                .step-description {
                    font-size: 1.125rem;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .step-features {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .feature-item {
                    display: flex;
                    align-items: start;
                    gap: 1rem;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .feature-item:hover {
                    background: var(--bg-tertiary);
                    transform: translateX(4px);
                }

                .feature-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .feature-text {
                    flex: 1;
                }

                .feature-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .feature-desc {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                /* UI Screenshots */
                .ui-showcase {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                }

                .ui-screenshot {
                    width: 100%;
                    height: 100%;
                    background: var(--bg-secondary);
                    position: relative;
                    overflow: hidden;
                }

                /* Figma-style annotations */
                .annotation {
                    position: absolute;
                    background: var(--primary);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    z-index: 10;
                    animation: annotationPop 0.5s ease;
                    white-space: nowrap;
                }

                @keyframes annotationPop {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .annotation::before {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-style: solid;
                }

                .annotation.top::before {
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 8px 8px 0 8px;
                    border-color: var(--primary) transparent transparent transparent;
                }

                .annotation.bottom::before {
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 0 8px 8px 8px;
                    border-color: transparent transparent var(--primary) transparent;
                }

                .annotation.left::before {
                    right: -8px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-width: 8px 0 8px 8px;
                    border-color: transparent transparent transparent var(--primary);
                }

                .annotation.right::before {
                    left: -8px;
                    top: 50%;
                    transform: translateY(-50%);
                    border-width: 8px 8px 8px 0;
                    border-color: transparent var(--primary) transparent transparent;
                }

                /* Highlight areas */
                .highlight-area {
                    position: absolute;
                    border: 2px dashed var(--primary);
                    border-radius: 8px;
                    background: rgba(37, 99, 235, 0.1);
                    animation: highlightPulse 2s ease infinite;
                    pointer-events: none;
                }

                @keyframes highlightPulse {
                    0%, 100% {
                        opacity: 0.5;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.02);
                    }
                }

                /* Flow arrows */
                .flow-arrows {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                }

                .flow-arrow {
                    stroke: var(--primary);
                    stroke-width: 3;
                    fill: none;
                    marker-end: url(#arrowhead);
                    stroke-dasharray: 5, 5;
                    animation: flowDash 1s linear infinite;
                }

                @keyframes flowDash {
                    to {
                        stroke-dashoffset: -10;
                    }
                }

                /* Floating badges */
                .floating-badge {
                    position: absolute;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 999px;
                    font-weight: 600;
                    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
                    animation: float 3s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                /* Mobile styles */
                .mobile-frame {
                    width: 375px;
                    height: 667px;
                    border: 16px solid #1a1a1a;
                    border-radius: 36px;
                    overflow: hidden;
                    position: relative;
                    background: white;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .mobile-notch {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 150px;
                    height: 30px;
                    background: #1a1a1a;
                    border-radius: 0 0 20px 20px;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .onboarding-container {
                        width: 95%;
                        height: 95vh;
                        margin: 2.5vh auto;
                    }

                    .step-content {
                        grid-template-columns: 1fr;
                        padding: 1.5rem;
                    }

                    .step-visual {
                        display: none;
                    }

                    .step-title {
                        font-size: 2rem;
                    }

                    .nav-button {
                        padding: 0.625rem 1rem;
                        font-size: 0.875rem;
                    }
                }

                /* Welcome step specific */
                .welcome-animation {
                    position: relative;
                    width: 400px;
                    height: 400px;
                }

                .logo-large {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto 2rem;
                    animation: logoRotate 20s linear infinite;
                }

                @keyframes logoRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .feature-cards {
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    animation: orbit 10s linear infinite;
                }

                @keyframes orbit {
                    from {
                        transform: rotate(0deg) translateX(150px) rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg) translateX(150px) rotate(-360deg);
                    }
                }

                .feature-cards:nth-child(2) { animation-delay: -2.5s; }
                .feature-cards:nth-child(3) { animation-delay: -5s; }
                .feature-cards:nth-child(4) { animation-delay: -7.5s; }

                /* Stats counter */
                .stats-display {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin-top: 2rem;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-number {
                    font-size: 3rem;
                    font-weight: 700;
                    color: var(--primary);
                    font-variant-numeric: tabular-nums;
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                /* Dark mode adjustments */
                [data-theme="dark"] .ui-showcase {
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                }

                [data-theme="dark"] .mobile-frame {
                    border-color: #2a2a2a;
                }

                [data-theme="dark"] .annotation {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
                }
            </style>
        `;
    }

    renderStep(stepIndex) {
        const step = this.steps[stepIndex];
        return `
            <div class="step-container" data-step="${stepIndex}">
                <div class="step-content">
                    <div class="step-visual">
                        ${step.visual}
                    </div>
                    <div class="step-info">
                        <div class="step-number">Step ${stepIndex + 1} of ${this.steps.length}</div>
                        <h2 class="step-title">${step.title}</h2>
                        <p class="step-description">${step.description}</p>
                        ${step.features ? `
                            <div class="step-features">
                                ${step.features.map(feature => `
                                    <div class="feature-item">
                                        <div class="feature-icon">${feature.icon}</div>
                                        <div class="feature-text">
                                            <div class="feature-title">${feature.title}</div>
                                            <div class="feature-desc">${feature.description}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getOnboardingSteps() {
        return [
            {
                title: "Welcome to Job Hunter Pro",
                description: "Your AI-powered career assistant that works smarter, not harder. Zero server costs, maximum intelligence.",
                visual: this.renderWelcomeVisual(),
                features: [
                    {
                        icon: "🚀",
                        title: "$0 Implementation",
                        description: "Runs entirely in your browser, no server costs"
                    },
                    {
                        icon: "🤖",
                        title: "Self-Learning AI",
                        description: "Gets smarter with every interaction"
                    },
                    {
                        icon: "🔒",
                        title: "Your Data, Your Control",
                        description: "Everything stored locally, fully encrypted"
                    }
                ]
            },
            {
                title: "Smart Job Search",
                description: "We aggregate jobs from multiple free sources and use AI to find your perfect matches.",
                visual: this.renderJobSearchVisual(),
                features: [
                    {
                        icon: "🎯",
                        title: "AI Matching",
                        description: "Jobs scored based on your profile"
                    },
                    {
                        icon: "⚡",
                        title: "Batch Apply",
                        description: "Apply to multiple jobs at once"
                    },
                    {
                        icon: "🔄",
                        title: "Real-time Updates",
                        description: "Fresh jobs from GitHub, RemoteOK & more"
                    }
                ]
            },
            {
                title: "AI Resume Optimization",
                description: "Our AI learns from your corrections and successful applications to perfectly tailor your resume.",
                visual: this.renderResumeOptimizerVisual(),
                features: [
                    {
                        icon: "✨",
                        title: "Intelligent Adaptation",
                        description: "Automatically adjusts for each job"
                    },
                    {
                        icon: "📈",
                        title: "Success Tracking",
                        description: "Learns what works from outcomes"
                    },
                    {
                        icon: "🎨",
                        title: "Multiple Variations",
                        description: "A/B test different approaches"
                    }
                ]
            },
            {
                title: "Your Personal Dashboard",
                description: "Track everything in one beautiful interface. See your progress, get AI insights, and stay organized.",
                visual: this.renderDashboardVisual(),
                features: [
                    {
                        icon: "📊",
                        title: "Real-time Analytics",
                        description: "Track response rates and trends"
                    },
                    {
                        icon: "💡",
                        title: "AI Insights",
                        description: "Personalized recommendations daily"
                    },
                    {
                        icon: "📅",
                        title: "Smart Scheduling",
                        description: "Never miss a follow-up"
                    }
                ]
            },
            {
                title: "Ready to Land Your Dream Job?",
                description: "Everything is set up and ready. Let's start your journey to career success!",
                visual: this.renderSuccessVisual(),
                features: [
                    {
                        icon: "🎯",
                        title: "Set Your Preferences",
                        description: "Tell us what you're looking for"
                    },
                    {
                        icon: "📄",
                        title: "Upload Your Resume",
                        description: "We'll optimize it with AI"
                    },
                    {
                        icon: "🚀",
                        title: "Start Applying",
                        description: "Land interviews faster than ever"
                    }
                ]
            }
        ];
    }

    renderWelcomeVisual() {
        return `
            <div class="welcome-animation">
                <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <svg class="logo-large" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" fill="var(--primary)" opacity="0.1"/>
                        <path d="M50 15 L35 35 L35 65 L50 85 L65 65 L65 35 Z" fill="var(--primary)"/>
                        <circle cx="50" cy="50" r="8" fill="white"/>
                    </svg>
                    
                    <div class="feature-cards" style="position: absolute;">
                        <span style="font-size: 2rem;">🚀</span>
                        <span style="font-size: 0.75rem; margin-top: 0.5rem;">Zero Cost</span>
                    </div>
                    <div class="feature-cards">
                        <span style="font-size: 2rem;">🤖</span>
                        <span style="font-size: 0.75rem; margin-top: 0.5rem;">AI Power</span>
                    </div>
                    <div class="feature-cards">
                        <span style="font-size: 2rem;">🔒</span>
                        <span style="font-size: 0.75rem; margin-top: 0.5rem;">Secure</span>
                    </div>
                    <div class="feature-cards">
                        <span style="font-size: 2rem;">⚡</span>
                        <span style="font-size: 0.75rem; margin-top: 0.5rem;">Fast</span>
                    </div>
                </div>
                
                <div class="stats-display" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%;">
                    <div class="stat-item">
                        <div class="stat-number" data-count="1000">0</div>
                        <div class="stat-label">Jobs Daily</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" data-count="95">0</div>
                        <div class="stat-label">Match Rate %</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" data-count="0">0</div>
                        <div class="stat-label">Server Cost $</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderJobSearchVisual() {
        return `
            <div class="ui-showcase">
                <div class="ui-screenshot" style="padding: 1.5rem; background: var(--bg-secondary);">
                    <!-- Search bar -->
                    <div style="background: var(--bg-primary); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <span style="font-size: 1.25rem;">🔍</span>
                            <div style="flex: 1; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px;">
                                AI-powered job search...
                            </div>
                            <div style="padding: 0.5rem 1rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; border-radius: 8px; font-weight: 600; font-size: 0.875rem;">
                                AI Search
                            </div>
                        </div>
                    </div>
                    
                    <!-- Job cards -->
                    <div style="display: grid; gap: 1rem;">
                        ${[85, 92, 78].map((score, i) => `
                            <div style="background: var(--bg-primary); border-radius: 12px; padding: 1.5rem; position: relative; border: 2px solid ${i === 0 ? 'var(--primary)' : 'var(--border-color)'}; box-shadow: var(--shadow-sm);">
                                <div class="highlight-area" style="top: -2px; left: -2px; right: -2px; height: 60px; ${i !== 0 ? 'display: none;' : ''}"></div>
                                <div style="position: absolute; top: -8px; right: 1rem; padding: 0.25rem 0.75rem; background: var(--success); color: white; font-size: 0.75rem; font-weight: 600; border-radius: 999px;">
                                    ${score}% match
                                </div>
                                <div style="display: flex; gap: 1rem; align-items: start;">
                                    <div style="width: 56px; height: 56px; background: var(--gray-200); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 600;">
                                        ${['T', 'G', 'M'][i]}
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; font-size: 1.125rem; margin-bottom: 0.25rem;">
                                            ${['Senior React Developer', 'Full Stack Engineer', 'Frontend Developer'][i]}
                                        </div>
                                        <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                                            ${['TechCorp Inc.', 'GitHub', 'Meta'][i]} • Remote
                                        </div>
                                        <div style="display: flex; gap: 0.5rem;">
                                            <span style="padding: 0.25rem 0.75rem; background: var(--bg-secondary); font-size: 0.75rem; border-radius: 999px;">React</span>
                                            <span style="padding: 0.25rem 0.75rem; background: var(--bg-secondary); font-size: 0.75rem; border-radius: 999px;">TypeScript</span>
                                            <span style="padding: 0.25rem 0.75rem; background: var(--bg-secondary); font-size: 0.75rem; border-radius: 999px;">Node.js</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Annotations -->
                    <div class="annotation top" style="top: 10px; left: 50%; transform: translateX(-50%);">
                        AI analyzes your profile
                    </div>
                    <div class="annotation right" style="top: 100px; right: -150px;">
                        Perfect matches highlighted
                    </div>
                    <div class="annotation bottom" style="bottom: 20px; left: 20px;">
                        Multiple sources aggregated
                    </div>
                </div>
            </div>
        `;
    }

    renderResumeOptimizerVisual() {
        return `
            <div class="ui-showcase">
                <div class="ui-screenshot" style="display: grid; grid-template-columns: 1fr 1fr; height: 100%;">
                    <!-- Original resume -->
                    <div style="padding: 2rem; background: var(--bg-secondary); border-right: 1px solid var(--border-color);">
                        <h3 style="margin-bottom: 1rem; color: var(--text-secondary);">Original Resume</h3>
                        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; font-size: 0.875rem; line-height: 1.6;">
                            <div style="margin-bottom: 1rem;">
                                <strong>Summary</strong><br>
                                Experienced developer with 5 years of experience...
                            </div>
                            <div style="margin-bottom: 1rem;">
                                <strong>Experience</strong><br>
                                • Worked on various projects<br>
                                • Developed applications<br>
                                • Collaborated with team
                            </div>
                        </div>
                    </div>
                    
                    <!-- Optimized resume -->
                    <div style="padding: 2rem; background: var(--bg-primary);">
                        <h3 style="margin-bottom: 1rem; color: var(--primary);">AI Optimized</h3>
                        <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; font-size: 0.875rem; line-height: 1.6; border: 2px solid var(--primary);">
                            <div style="margin-bottom: 1rem;">
                                <strong>Summary</strong><br>
                                <span style="background: rgba(37, 99, 235, 0.1); padding: 2px 4px; border-radius: 4px;">Senior React Developer</span> with 5 years building <span style="background: rgba(37, 99, 235, 0.1); padding: 2px 4px; border-radius: 4px;">scalable web applications</span>...
                            </div>
                            <div>
                                <strong>Experience</strong><br>
                                • <span style="background: rgba(16, 185, 129, 0.1); padding: 2px 4px; border-radius: 4px;">Increased performance by 40%</span> through optimization<br>
                                • Built <span style="background: rgba(16, 185, 129, 0.1); padding: 2px 4px; border-radius: 4px;">microservices handling 1M+ requests</span><br>
                                • Led team of 5 engineers using <span style="background: rgba(37, 99, 235, 0.1); padding: 2px 4px; border-radius: 4px;">Agile methodologies</span>
                            </div>
                        </div>
                        
                        <!-- AI Learning indicator -->
                        <div style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; display: flex; align-items: center; gap: 1rem;">
                            <span style="font-size: 1.5rem;">🧠</span>
                            <div>
                                <div style="font-weight: 600; margin-bottom: 0.25rem;">AI Confidence: 92%</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Based on 50+ successful applications</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Floating annotations -->
                    <div class="annotation top" style="top: 20px; left: 25%;">
                        Keywords extracted from job
                    </div>
                    <div class="annotation right" style="top: 50%; right: -120px;">
                        Quantified achievements
                    </div>
                    <div class="floating-badge" style="bottom: 40px; right: 40px;">
                        Learns from your edits
                    </div>
                </div>
            </div>
        `;
    }

    renderDashboardVisual() {
        return `
            <div class="ui-showcase">
                <div class="ui-screenshot" style="padding: 1.5rem;">
                    <!-- Header -->
                    <div style="margin-bottom: 1.5rem;">
                        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Good morning, Sarah 👋</h2>
                        <p style="color: var(--text-secondary);">You're on fire! Keep up the momentum.</p>
                    </div>
                    
                    <!-- Stats cards -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        ${[
                            { value: '47', label: 'Applications', trend: '↑ 23%' },
                            { value: '8', label: 'Interviews', trend: '↑ 60%' },
                            { value: '32%', label: 'Response Rate', trend: 'Excellent' },
                            { value: '124', label: 'Jobs Matched', trend: 'View all' }
                        ].map((stat, i) => `
                            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center; box-shadow: var(--shadow-sm); ${i === 1 ? 'border: 2px solid var(--primary);' : ''}">
                                <div style="font-size: 2rem; font-weight: 700; color: var(--text-primary);">${stat.value}</div>
                                <div style="font-size: 0.875rem; color: var(--text-secondary); margin: 0.25rem 0;">${stat.label}</div>
                                <div style="font-size: 0.75rem; color: ${i < 2 ? 'var(--success)' : 'var(--primary)'}; font-weight: 500;">${stat.trend}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- AI Insights -->
                    <div style="background: var(--bg-primary); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-sm);">
                        <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                            <span style="padding: 0.125rem 0.5rem; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white; font-size: 0.75rem; font-weight: 600; border-radius: 999px;">AI</span>
                            Insights & Suggestions
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <div style="display: flex; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; cursor: pointer;">
                                <span style="font-size: 1.5rem;">📈</span>
                                <div>
                                    <div style="font-weight: 600;">Optimize for React roles</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">Your React experience gets 3x more responses</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; cursor: pointer;">
                                <span style="font-size: 1.5rem;">⏰</span>
                                <div>
                                    <div style="font-weight: 600;">Follow up with TechCorp</div>
                                    <div style="font-size: 0.875rem; color: var(--text-secondary);">It's been 7 days since your application</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Annotations -->
                    <div class="annotation top" style="top: 10px; right: 20px;">
                        Real-time updates
                    </div>
                    <div class="annotation left" style="top: 150px; left: -140px;">
                        Track all metrics
                    </div>
                    <div class="annotation bottom" style="bottom: 10px; left: 50%; transform: translateX(-50%);">
                        AI learns your patterns
                    </div>
                </div>
            </div>
        `;
    }

    renderSuccessVisual() {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
                <div style="font-size: 5rem; margin-bottom: 2rem; animation: bounce 2s ease infinite;">🎉</div>
                
                <div style="position: relative; margin-bottom: 3rem;">
                    <div style="font-size: 4rem; font-weight: 700; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                        You're All Set!
                    </div>
                    
                    <!-- Confetti animation -->
                    ${Array(20).fill(0).map((_, i) => `
                        <div style="position: absolute; width: 10px; height: 10px; background: ${['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'][i % 5]}; top: ${Math.random() * 100 - 50}px; left: ${Math.random() * 400 - 200}px; animation: confetti 3s ease-out infinite; animation-delay: ${Math.random() * 2}s; opacity: 0;"></div>
                    `).join('')}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: var(--shadow-md);">
                            🎯
                        </div>
                        <div style="font-weight: 600;">Set Preferences</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: var(--shadow-md);">
                            📄
                        </div>
                        <div style="font-weight: 600;">Upload Resume</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: var(--shadow-md);">
                            🚀
                        </div>
                        <div style="font-weight: 600;">Start Applying</div>
                    </div>
                </div>
                
                <style>
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    @keyframes confetti {
                        0% {
                            transform: translateY(0) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100px) rotate(720deg);
                            opacity: 0;
                        }
                    }
                </style>
            </div>
        `;
    }

    async mounted() {
        this.setupEventListeners();
        this.animateStep(this.currentStep);
        this.startAutoProgress();
        
        // Add flow arrows
        this.addFlowArrows();
        
        // Animate counters
        this.animateCounters();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });

        // Progress dots
        document.querySelectorAll('.progress-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const step = parseInt(e.target.dataset.step);
                this.goToStep(step);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.handleAction('next');
            if (e.key === 'ArrowLeft') this.handleAction('prev');
            if (e.key === 'Escape') this.handleAction('skip');
        });
    }

    handleAction(action) {
        switch (action) {
            case 'next':
                if (this.currentStep < this.steps.length - 1) {
                    this.goToStep(this.currentStep + 1);
                } else {
                    this.complete();
                }
                break;
                
            case 'prev':
                if (this.currentStep > 0) {
                    this.goToStep(this.currentStep - 1);
                }
                break;
                
            case 'skip':
                this.complete();
                break;
        }
    }

    goToStep(step) {
        this.currentStep = step;
        
        // Update content
        const content = document.querySelector('.onboarding-content');
        content.innerHTML = this.renderStep(step);
        
        // Update progress
        this.updateProgress();
        
        // Update navigation
        this.updateNavigation();
        
        // Animate new step
        this.animateStep(step);
        
        // Restart auto progress
        this.startAutoProgress();
    }

    updateProgress() {
        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index === this.currentStep) {
                dot.classList.add('active');
            } else if (index < this.currentStep) {
                dot.classList.add('completed');
            }
        });
    }

    updateNavigation() {
        const prevButton = document.querySelector('[data-action="prev"]');
        const nextButton = document.querySelector('[data-action="next"]');
        
        if (this.currentStep === 0) {
            prevButton.style.display = 'none';
        } else {
            prevButton.style.display = 'block';
        }
        
        if (this.currentStep === this.steps.length - 1) {
            nextButton.textContent = 'Get Started';
        } else {
            nextButton.textContent = 'Next';
        }
    }

    animateStep(step) {
        // Step-specific animations
        setTimeout(() => {
            if (step === 0) {
                this.animateWelcome();
            } else if (step === 1) {
                this.animateJobSearch();
            } else if (step === 2) {
                this.animateResumeOptimizer();
            } else if (step === 3) {
                this.animateDashboard();
            } else if (step === 4) {
                this.animateSuccess();
            }
        }, 300);
    }

    animateWelcome() {
        // Animate stats counters
        this.animateCounters();
    }

    animateJobSearch() {
        // Add pulsing to highlighted job
        const highlights = document.querySelectorAll('.highlight-area');
        highlights.forEach(h => h.style.display = 'block');
    }

    animateResumeOptimizer() {
        // Highlight optimizations
        const optimizations = document.querySelectorAll('[style*="background: rgba"]');
        optimizations.forEach((el, i) => {
            setTimeout(() => {
                el.style.animation = 'highlightPulse 2s ease infinite';
            }, i * 200);
        });
    }

    animateDashboard() {
        // Animate insights sliding in
        const insights = document.querySelectorAll('.ui-screenshot > div > div > div');
        insights.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                el.style.transition = 'all 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateX(0)';
            }, i * 200);
        });
    }

    animateSuccess() {
        // Success animation is handled in CSS
    }

    animateCounters() {
        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }

    addFlowArrows() {
        // Add SVG arrows between elements
        const svg = document.getElementById('flowArrows');
        svg.innerHTML = `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
                </marker>
            </defs>
        `;
    }

    startAutoProgress() {
        if (!this.autoProgress) return;
        
        clearInterval(this.progressInterval);
        this.progressInterval = setInterval(() => {
            if (this.currentStep < this.steps.length - 1) {
                this.goToStep(this.currentStep + 1);
            } else {
                clearInterval(this.progressInterval);
            }
        }, 8000); // 8 seconds per step
    }

    async complete() {
        // Check if "never show again" is checked
        const neverShow = document.getElementById('neverShowAgain').checked;
        
        if (neverShow) {
            await this.app.db.systemSettings.put({
                key: 'onboarding_completed',
                value: true,
                updated: new Date().toISOString()
            });
        }
        
        // Fade out
        const overlay = document.getElementById('onboardingOverlay');
        overlay.style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            overlay.remove();
            // Navigate to dashboard
            this.app.ui.showView('dashboard');
        }, 500);
    }

    unmounted() {
        clearInterval(this.progressInterval);
    }
}
