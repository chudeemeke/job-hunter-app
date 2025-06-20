// Login View - Beautiful and secure authentication
// Handles login, registration, and password reset

export default class LoginView {
    constructor(app) {
        this.app = app;
        this.mode = 'login'; // login, register, forgot
        this.rateLimiter = this.app.services.security.constructor.createRateLimiter();
    }

    async render() {
        return `
            <div class="auth-container">
                <div class="auth-backdrop"></div>
                <div class="auth-content">
                    <div class="auth-header">
                        <div class="auth-logo">
                            <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="45" fill="var(--primary)" opacity="0.1"/>
                                <path d="M50 15 L35 35 L35 65 L50 85 L65 65 L65 35 Z" fill="var(--primary)"/>
                                <circle cx="50" cy="50" r="8" fill="white"/>
                            </svg>
                        </div>
                        <h1 class="auth-title">Job Hunter Pro</h1>
                        <p class="auth-subtitle">Your AI-powered career assistant</p>
                    </div>

                    <div class="auth-form-container">
                        <div class="auth-tabs">
                            <button class="auth-tab active" data-mode="login">Sign In</button>
                            <button class="auth-tab" data-mode="register">Sign Up</button>
                        </div>

                        <form id="authForm" class="auth-form">
                            <div class="form-content" data-mode="login">
                                ${this.renderLoginForm()}
                            </div>
                            <div class="form-content hidden" data-mode="register">
                                ${this.renderRegisterForm()}
                            </div>
                            <div class="form-content hidden" data-mode="forgot">
                                ${this.renderForgotForm()}
                            </div>
                        </form>
                    </div>

                    <div class="auth-footer">
                        <p class="auth-demo-info">
                            <strong>Demo Account:</strong> admin@jobhunter.local / ChangeMe123!
                        </p>
                        <div class="auth-features">
                            <div class="feature">
                                <span class="feature-icon">🚀</span>
                                <span>Zero Cost</span>
                            </div>
                            <div class="feature">
                                <span class="feature-icon">🔒</span>
                                <span>Secure</span>
                            </div>
                            <div class="feature">
                                <span class="feature-icon">🤖</span>
                                <span>AI Powered</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .auth-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    position: relative;
                    overflow: hidden;
                }

                .auth-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    opacity: 0.1;
                    z-index: -1;
                }

                .auth-backdrop::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                    animation: moveGrid 20s linear infinite;
                }

                @keyframes moveGrid {
                    to {
                        transform: translate(50px, 50px);
                    }
                }

                .auth-content {
                    width: 100%;
                    max-width: 440px;
                    background: var(--bg-primary);
                    border-radius: 24px;
                    box-shadow: var(--shadow-xl);
                    overflow: hidden;
                    position: relative;
                    animation: slideUp 0.5s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .auth-header {
                    text-align: center;
                    padding: 3rem 2rem 2rem;
                    background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary));
                }

                .auth-logo {
                    display: inline-block;
                    margin-bottom: 1rem;
                    animation: pulse 2s ease infinite;
                }

                .auth-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem;
                }

                .auth-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin: 0;
                }

                .auth-form-container {
                    padding: 0 2rem 2rem;
                }

                .auth-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                    background: var(--bg-secondary);
                    padding: 0.25rem;
                    border-radius: 12px;
                }

                .auth-tab {
                    flex: 1;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: transparent;
                    font-size: 1rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .auth-tab:hover {
                    color: var(--text-primary);
                }

                .auth-tab.active {
                    background: var(--bg-primary);
                    color: var(--primary);
                    box-shadow: var(--shadow-sm);
                }

                .form-content.hidden {
                    display: none;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border: 2px solid var(--border-color);
                    border-radius: 10px;
                    font-size: 1rem;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    transition: all 0.2s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .form-input.error {
                    border-color: var(--danger);
                }

                .input-group {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                    font-size: 1.25rem;
                }

                .input-group .form-input {
                    padding-left: 3rem;
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.25rem;
                    font-size: 1.25rem;
                    transition: color 0.2s;
                }

                .password-toggle:hover {
                    color: var(--text-primary);
                }

                .form-error {
                    color: var(--danger);
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                    display: none;
                }

                .form-error.show {
                    display: block;
                    animation: shake 0.3s ease;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .form-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .checkbox-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .checkbox-wrapper input[type="checkbox"] {
                    width: 1.25rem;
                    height: 1.25rem;
                    cursor: pointer;
                }

                .checkbox-wrapper label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                }

                .form-link {
                    font-size: 0.875rem;
                    color: var(--primary);
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .form-link:hover {
                    color: var(--primary-dark);
                    text-decoration: underline;
                }

                .submit-button {
                    width: 100%;
                    padding: 1rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }

                .submit-button:hover:not(:disabled) {
                    background: var(--primary-dark);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }

                .submit-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .submit-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .submit-button.loading {
                    color: transparent;
                }

                .submit-button.loading::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 50%;
                    left: 50%;
                    margin: -10px 0 0 -10px;
                    border: 2px solid white;
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spin 1s linear infinite;
                }

                .divider {
                    text-align: center;
                    margin: 2rem 0;
                    position: relative;
                }

                .divider::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: var(--border-color);
                }

                .divider span {
                    background: var(--bg-primary);
                    padding: 0 1rem;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    position: relative;
                }

                .social-buttons {
                    display: flex;
                    gap: 1rem;
                }

                .social-button {
                    flex: 1;
                    padding: 0.75rem;
                    border: 2px solid var(--border-color);
                    background: var(--bg-primary);
                    border-radius: 10px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .social-button:hover {
                    border-color: var(--primary);
                    background: var(--bg-secondary);
                }

                .auth-footer {
                    padding: 2rem;
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--border-color);
                }

                .auth-demo-info {
                    text-align: center;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin: 0 0 1.5rem;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border-radius: 8px;
                }

                .auth-features {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                }

                .feature {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .feature-icon {
                    font-size: 1.25rem;
                }

                /* Responsive */
                @media (max-width: 480px) {
                    .auth-content {
                        max-width: 100%;
                        border-radius: 0;
                        min-height: 100vh;
                    }

                    .auth-header {
                        padding: 2rem 1.5rem 1.5rem;
                    }

                    .auth-form-container {
                        padding: 0 1.5rem 1.5rem;
                    }

                    .auth-title {
                        font-size: 1.75rem;
                    }

                    .auth-features {
                        gap: 1rem;
                    }

                    .feature span:not(.feature-icon) {
                        display: none;
                    }
                }

                /* Dark mode adjustments */
                [data-theme="dark"] .auth-backdrop {
                    opacity: 0.05;
                }

                [data-theme="dark"] .auth-content {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                /* Password strength indicator */
                .password-strength {
                    margin-top: 0.5rem;
                    height: 4px;
                    background: var(--gray-200);
                    border-radius: 2px;
                    overflow: hidden;
                }

                .password-strength-bar {
                    height: 100%;
                    width: 0;
                    transition: all 0.3s;
                    border-radius: 2px;
                }

                .password-strength-bar.weak {
                    width: 33%;
                    background: var(--danger);
                }

                .password-strength-bar.medium {
                    width: 66%;
                    background: var(--warning);
                }

                .password-strength-bar.strong {
                    width: 100%;
                    background: var(--success);
                }

                .password-requirements {
                    margin-top: 0.5rem;
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                }

                .requirement {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    margin-top: 0.25rem;
                }

                .requirement.met {
                    color: var(--success);
                }

                .requirement-icon {
                    font-size: 0.875rem;
                }
            </style>
        `;
    }

    renderLoginForm() {
        return `
            <div class="form-group">
                <label class="form-label" for="loginEmail">Email Address</label>
                <div class="input-group">
                    <span class="input-icon">📧</span>
                    <input 
                        type="email" 
                        id="loginEmail" 
                        name="email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        autocomplete="email"
                        required
                    >
                </div>
                <div class="form-error" data-error="email"></div>
            </div>

            <div class="form-group">
                <label class="form-label" for="loginPassword">Password</label>
                <div class="input-group">
                    <span class="input-icon">🔒</span>
                    <input 
                        type="password" 
                        id="loginPassword" 
                        name="password" 
                        class="form-input" 
                        placeholder="Enter your password"
                        autocomplete="current-password"
                        required
                    >
                    <button type="button" class="password-toggle" data-target="loginPassword">
                        👁️
                    </button>
                </div>
                <div class="form-error" data-error="password"></div>
            </div>

            <div class="form-options">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="rememberMe" name="remember">
                    <label for="rememberMe">Remember me</label>
                </div>
                <a href="#" class="form-link" data-action="forgot">Forgot password?</a>
            </div>

            <button type="submit" class="submit-button" data-action="login">
                Sign In
            </button>

            <div class="divider">
                <span>or continue with</span>
            </div>

            <div class="social-buttons">
                <button type="button" class="social-button" data-provider="github">
                    <span>🐙</span> GitHub
                </button>
                <button type="button" class="social-button" data-provider="google">
                    <span>🔍</span> Google
                </button>
            </div>
        `;
    }

    renderRegisterForm() {
        return `
            <div class="form-group">
                <label class="form-label" for="registerEmail">Email Address</label>
                <div class="input-group">
                    <span class="input-icon">📧</span>
                    <input 
                        type="email" 
                        id="registerEmail" 
                        name="email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        autocomplete="email"
                        required
                    >
                </div>
                <div class="form-error" data-error="email"></div>
            </div>

            <div class="form-group">
                <label class="form-label" for="registerUsername">Username</label>
                <div class="input-group">
                    <span class="input-icon">👤</span>
                    <input 
                        type="text" 
                        id="registerUsername" 
                        name="username" 
                        class="form-input" 
                        placeholder="johndoe"
                        autocomplete="username"
                        pattern="[a-zA-Z0-9_-]{3,30}"
                        required
                    >
                </div>
                <div class="form-error" data-error="username"></div>
            </div>

            <div class="form-group">
                <label class="form-label" for="registerPassword">Password</label>
                <div class="input-group">
                    <span class="input-icon">🔒</span>
                    <input 
                        type="password" 
                        id="registerPassword" 
                        name="password" 
                        class="form-input" 
                        placeholder="Create a strong password"
                        autocomplete="new-password"
                        required
                    >
                    <button type="button" class="password-toggle" data-target="registerPassword">
                        👁️
                    </button>
                </div>
                <div class="password-strength">
                    <div class="password-strength-bar"></div>
                </div>
                <div class="password-requirements">
                    <div class="requirement" data-req="length">
                        <span class="requirement-icon">○</span> At least 8 characters
                    </div>
                    <div class="requirement" data-req="uppercase">
                        <span class="requirement-icon">○</span> One uppercase letter
                    </div>
                    <div class="requirement" data-req="number">
                        <span class="requirement-icon">○</span> One number
                    </div>
                    <div class="requirement" data-req="special">
                        <span class="requirement-icon">○</span> One special character
                    </div>
                </div>
                <div class="form-error" data-error="password"></div>
            </div>

            <div class="form-options">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="agreeTerms" name="agree" required>
                    <label for="agreeTerms">
                        I agree to the <a href="#" class="form-link">Terms of Service</a>
                    </label>
                </div>
            </div>

            <button type="submit" class="submit-button" data-action="register">
                Create Account
            </button>
        `;
    }

    renderForgotForm() {
        return `
            <div class="form-group">
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
                <label class="form-label" for="forgotEmail">Email Address</label>
                <div class="input-group">
                    <span class="input-icon">📧</span>
                    <input 
                        type="email" 
                        id="forgotEmail" 
                        name="email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        autocomplete="email"
                        required
                    >
                </div>
                <div class="form-error" data-error="email"></div>
            </div>

            <button type="submit" class="submit-button" data-action="forgot">
                Send Reset Instructions
            </button>

            <div style="text-align: center; margin-top: 1.5rem;">
                <a href="#" class="form-link" data-action="back-to-login">
                    Back to Sign In
                </a>
            </div>
        `;
    }

    async mounted() {
        this.setupEventListeners();
        this.focusFirstInput();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        // Form submission
        const form = document.getElementById('authForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = document.getElementById(toggle.dataset.target);
                input.type = input.type === 'password' ? 'text' : 'password';
                toggle.textContent = input.type === 'password' ? '👁️' : '👁️‍🗨️';
            });
        });

        // Password strength
        const passwordInput = document.getElementById('registerPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }

        // Links
        document.querySelectorAll('[data-action]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.target.dataset.action;
                
                if (action === 'forgot') {
                    this.switchMode('forgot');
                } else if (action === 'back-to-login') {
                    this.switchMode('login');
                }
            });
        });

        // Social login
        document.querySelectorAll('.social-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleSocialLogin(button.dataset.provider);
            });
        });

        // Real-time validation
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    switchMode(mode) {
        this.mode = mode;
        
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Update forms
        document.querySelectorAll('.form-content').forEach(content => {
            content.classList.toggle('hidden', content.dataset.mode !== mode);
        });

        // Clear errors
        this.clearErrors();
        
        // Focus first input
        this.focusFirstInput();
    }

    async handleSubmit() {
        const form = document.getElementById('authForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Clear previous errors
        this.clearErrors();

        // Validate
        if (!this.validateForm()) {
            return;
        }

        // Show loading
        const button = form.querySelector('.submit-button');
        button.classList.add('loading');
        button.disabled = true;

        try {
            if (this.mode === 'login') {
                await this.handleLogin(data);
            } else if (this.mode === 'register') {
                await this.handleRegister(data);
            } else if (this.mode === 'forgot') {
                await this.handleForgot(data);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    async handleLogin(data) {
        try {
            // Rate limiting
            this.rateLimiter.check(data.email);

            const result = await this.app.services.user.login(
                data.email,
                data.password,
                data.remember
            );

            if (result.requiresTwoFactor) {
                // Show 2FA modal
                this.show2FAModal(result.userId);
            } else {
                // Success
                this.app.services.message.success('Welcome back!');
                
                // Check if onboarding needed
                await this.showOnboardingOrDashboard(result.user);
            }
        } catch (error) {
            if (error.message.includes('Invalid credentials')) {
                this.showFieldError('password', 'Invalid email or password');
            } else {
                throw error;
            }
        }
    }

    async handleRegister(data) {
        try {
            // Create user
            const result = await this.app.services.user.createUser({
                email: data.email,
                username: data.username,
                password: data.password
            });

            // Auto login
            await this.app.services.user.login(data.email, data.password);

            // Success
            this.app.services.message.success('Account created successfully!');
            
            // Show onboarding for new users
            await this.showOnboardingOrDashboard();
        } catch (error) {
            if (error.message.includes('already exists')) {
                this.showFieldError('email', 'This email is already registered');
            } else {
                throw error;
            }
        }
    }

    async handleForgot(data) {
        // Since we can't send emails, show instructions
        this.app.services.message.info('Password Reset', {
            duration: 0,
            content: `
                <div>
                    <p>Since this is a zero-cost implementation, we can't send emails.</p>
                    <p>To reset your password:</p>
                    <ol>
                        <li>Clear your browser's local storage for this site</li>
                        <li>Refresh the page</li>
                        <li>Create a new account with the same email</li>
                    </ol>
                    <p>Your data will be preserved if you use the same email.</p>
                </div>
            `
        });
    }

    async handleSocialLogin(provider) {
        this.app.services.message.info(`${provider} login would redirect to OAuth provider`, {
            duration: 5000
        });
        
        // In a real implementation, this would redirect to OAuth provider
        // For demo, we could store in GitHub Gist with user permission
    }

    validateForm() {
        const form = document.getElementById('authForm');
        const inputs = form.querySelectorAll('.form-input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        const name = input.name;
        let isValid = true;

        // Required check
        if (input.required && !value) {
            this.showFieldError(name, `${this.getFieldLabel(name)} is required`);
            return false;
        }

        // Type-specific validation
        switch (input.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    this.showFieldError(name, 'Please enter a valid email address');
                    isValid = false;
                }
                break;

            case 'text':
                if (name === 'username') {
                    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
                    if (!usernameRegex.test(value)) {
                        this.showFieldError(name, 'Username must be 3-30 characters, letters, numbers, underscore, and hyphen only');
                        isValid = false;
                    }
                }
                break;

            case 'password':
                if (this.mode === 'register') {
                    const validation = this.app.services.security.constructor.validateInput(value, 'password');
                    if (!validation.valid) {
                        this.showFieldError(name, validation.errors[0]);
                        isValid = false;
                    }
                }
                break;
        }

        if (isValid) {
            this.clearFieldError(name);
        }

        return isValid;
    }

    updatePasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirements display
        Object.entries(requirements).forEach(([req, met]) => {
            const element = document.querySelector(`[data-req="${req}"]`);
            if (element) {
                element.classList.toggle('met', met);
                element.querySelector('.requirement-icon').textContent = met ? '✓' : '○';
            }
        });

        // Update strength bar
        const metCount = Object.values(requirements).filter(Boolean).length;
        const strengthBar = document.querySelector('.password-strength-bar');
        
        if (strengthBar) {
            strengthBar.className = 'password-strength-bar';
            
            if (metCount >= 4) {
                strengthBar.classList.add('strong');
            } else if (metCount >= 2) {
                strengthBar.classList.add('medium');
            } else if (password.length > 0) {
                strengthBar.classList.add('weak');
            }
        }
    }

    show2FAModal(userId) {
        // Implementation for 2FA modal
        this.app.ui.showModal('two-factor-auth', { userId });
    }

    showFieldError(field, message) {
        const input = document.querySelector(`[name="${field}"]`);
        const error = document.querySelector(`[data-error="${field}"]`);
        
        if (input) {
            input.classList.add('error');
        }
        
        if (error) {
            error.textContent = message;
            error.classList.add('show');
        }
    }

    clearFieldError(field) {
        const input = document.querySelector(`[name="${field}"]`);
        const error = document.querySelector(`[data-error="${field}"]`);
        
        if (input) {
            input.classList.remove('error');
        }
        
        if (error) {
            error.textContent = '';
            error.classList.remove('show');
        }
    }

    clearErrors() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error');
        });
        
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
            error.classList.remove('show');
        });
    }

    showError(message) {
        this.app.services.message.error(message);
    }

    getFieldLabel(field) {
        const labels = {
            email: 'Email',
            username: 'Username',
            password: 'Password'
        };
        
        return labels[field] || field;
    }

    async showOnboardingOrDashboard(user = null) {
        // Check if onboarding has been completed
        const onboardingCompleted = await this.app.db.systemSettings.get('onboarding_completed');
        
        if (!onboardingCompleted || !onboardingCompleted.value) {
            // Show onboarding
            await this.app.ui.showView('onboarding');
        } else {
            // Go to appropriate dashboard
            const currentUser = user || this.app.services.user.currentUser;
            if (currentUser.role === 'admin') {
                await this.app.ui.showView('admin-dashboard');
            } else {
                await this.app.ui.showView('dashboard');
            }
        }
    }

    focusFirstInput() {
        setTimeout(() => {
            const firstInput = document.querySelector('.form-content:not(.hidden) .form-input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}
