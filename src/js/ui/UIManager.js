// UI Manager - Comprehensive UI Management System
// Core principle: Zero raw errors, always graceful and beautiful

export class UIManager {
    constructor(app) {
        this.app = app;
        this.theme = localStorage.getItem('theme') || 'auto';
        this.animations = localStorage.getItem('animations') !== 'false';
        this.currentView = null;
        this.views = new Map();
        this.components = new Map();
        this.modals = new Map();
        this.initialized = false;
    }

    async initialize() {
        // Apply theme
        this.applyTheme();
        
        // Setup responsive handlers
        this.setupResponsive();
        
        // Initialize router
        this.initializeRouter();
        
        // Load initial view
        await this.loadInitialView();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize tooltips
        this.initTooltips();
        
        // Setup PWA install prompt
        this.setupInstallPrompt();
        
        this.initialized = true;
    }

    // Theme Management
    applyTheme() {
        if (this.theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            
            // Listen for changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.theme === 'auto') {
                    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        } else {
            document.documentElement.setAttribute('data-theme', this.theme);
        }
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme();
        
        this.app.services.analytics?.track('theme_changed', { theme });
    }

    // View Management
    async loadInitialView() {
        const user = this.app.services.user.currentUser;
        
        if (!user) {
            await this.showView('login');
        } else if (user.role === 'admin') {
            await this.showView('admin-dashboard');
        } else {
            await this.showView('dashboard');
        }
    }

    async showView(viewName, params = {}) {
        // Hide current view
        if (this.currentView) {
            await this.hideView(this.currentView);
        }

        // Load view if not cached
        if (!this.views.has(viewName)) {
            await this.loadView(viewName);
        }

        const view = this.views.get(viewName);
        if (!view) throw new Error(`View ${viewName} not found`);

        // Show loading state
        this.showLoading();

        try {
            // Initialize view
            if (view.initialize) {
                await view.initialize(params);
            }

            // Render view
            const content = await view.render(params);
            this.renderContent(content);

            // Post-render
            if (view.mounted) {
                await view.mounted();
            }

            this.currentView = viewName;
            this.hideLoading();

            // Update URL
            this.updateURL(viewName, params);

            // Analytics
            this.app.services.analytics?.track('view_shown', { view: viewName });

        } catch (error) {
            this.hideLoading();
            this.showError(error);
        }
    }

    async loadView(viewName) {
        const viewModule = await import(`../views/${viewName}.js`);
        const ViewClass = viewModule.default;
        const view = new ViewClass(this.app);
        this.views.set(viewName, view);
    }

    async hideView(viewName) {
        const view = this.views.get(viewName);
        if (view?.unmounted) {
            await view.unmounted();
        }
    }

    renderContent(content) {
        const appRoot = document.getElementById('app');
        
        if (this.animations) {
            appRoot.style.opacity = '0';
            appRoot.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                appRoot.innerHTML = content;
                appRoot.style.transition = 'all 0.3s ease';
                appRoot.style.opacity = '1';
                appRoot.style.transform = 'translateY(0)';
            }, 100);
        } else {
            appRoot.innerHTML = content;
        }
    }

    // Component System
    registerComponent(name, component) {
        this.components.set(name, component);
    }

    createComponent(name, props = {}) {
        const Component = this.components.get(name);
        if (!Component) throw new Error(`Component ${name} not found`);
        
        return new Component(this.app, props);
    }

    // Modal Management
    async showModal(modalName, props = {}) {
        const modalId = `modal-${Date.now()}`;
        
        // Create modal wrapper
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'modal-wrapper';
        modalWrapper.id = modalId;
        modalWrapper.innerHTML = `
            <div class="modal-backdrop" data-close="true"></div>
            <div class="modal-container">
                <div class="modal-content">
                    <button class="modal-close" data-close="true">×</button>
                    <div class="modal-body"></div>
                </div>
            </div>
        `;

        // Load modal content
        const modal = await this.loadModal(modalName);
        const content = await modal.render(props);
        
        modalWrapper.querySelector('.modal-body').innerHTML = content;
        document.body.appendChild(modalWrapper);

        // Add close handlers
        modalWrapper.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-close')) {
                this.closeModal(modalId);
            }
        });

        // Animate in
        requestAnimationFrame(() => {
            modalWrapper.classList.add('modal-active');
        });

        // Store reference
        this.modals.set(modalId, { modal, wrapper: modalWrapper });

        // Initialize modal
        if (modal.mounted) {
            await modal.mounted();
        }

        return modalId;
    }

    async loadModal(modalName) {
        const modalModule = await import(`../modals/${modalName}.js`);
        return new modalModule.default(this.app);
    }

    closeModal(modalId) {
        const modalData = this.modals.get(modalId);
        if (!modalData) return;

        const { modal, wrapper } = modalData;

        // Unmount
        if (modal.unmounted) {
            modal.unmounted();
        }

        // Animate out
        wrapper.classList.remove('modal-active');
        
        setTimeout(() => {
            wrapper.remove();
            this.modals.delete(modalId);
        }, 300);
    }

    // Loading States
    showLoading(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.className = 'ui-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <div class="loader-text">${message}</div>
            </div>
        `;
        
        document.getElementById('app').appendChild(loader);
    }

    hideLoading() {
        const loader = document.querySelector('.ui-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 300);
        }
    }

    // Error Handling
    showError(error) {
        const errorView = `
            <div class="error-container">
                <div class="error-icon">😕</div>
                <h2>Something went wrong</h2>
                <p>We encountered an unexpected issue. Don't worry, your data is safe.</p>
                <div class="error-actions">
                    <button onclick="window.location.reload()">Refresh Page</button>
                    <button onclick="window.ui.showView('dashboard')">Go to Dashboard</button>
                </div>
                ${this.app.isDevelopment ? `
                    <details class="error-details">
                        <summary>Technical Details</summary>
                        <pre>${error.stack || error.message}</pre>
                    </details>
                ` : ''}
            </div>
        `;
        
        this.renderContent(errorView);
    }

    // Router
    initializeRouter() {
        window.addEventListener('popstate', (e) => {
            if (e.state?.view) {
                this.showView(e.state.view, e.state.params);
            }
        });

        // Handle links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-view]');
            if (link) {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                const params = link.dataset;
                this.showView(view, params);
            }
        });
    }

    updateURL(view, params) {
        const state = { view, params };
        const url = this.buildURL(view, params);
        window.history.pushState(state, '', url);
    }

    buildURL(view, params) {
        const base = window.location.pathname;
        const queryString = new URLSearchParams(params).toString();
        return `${base}#${view}${queryString ? '?' + queryString : ''}`;
    }

    // Responsive Design
    setupResponsive() {
        const checkBreakpoint = () => {
            const width = window.innerWidth;
            const breakpoint = 
                width < 640 ? 'mobile' :
                width < 1024 ? 'tablet' :
                'desktop';
            
            document.documentElement.setAttribute('data-breakpoint', breakpoint);
            this.currentBreakpoint = breakpoint;
        };

        checkBreakpoint();
        window.addEventListener('resize', debounce(checkBreakpoint, 150));
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Ctrl+K': () => this.showCommandPalette(),
            'Ctrl+/': () => this.showShortcuts(),
            'Escape': () => this.closeAllModals(),
            'Ctrl+S': (e) => {
                e.preventDefault();
                this.saveCurrentView();
            }
        };

        document.addEventListener('keydown', (e) => {
            const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.key}`;
            const handler = shortcuts[key];
            
            if (handler) {
                handler(e);
            }
        });
    }

    showCommandPalette() {
        this.showModal('command-palette');
    }

    showShortcuts() {
        this.app.services.message.info('Keyboard Shortcuts', {
            duration: 0,
            content: `
                <div class="shortcuts-list">
                    <div><kbd>Ctrl+K</kbd> Command Palette</div>
                    <div><kbd>Ctrl+/</kbd> Show Shortcuts</div>
                    <div><kbd>Escape</kbd> Close Modals</div>
                    <div><kbd>Ctrl+S</kbd> Save</div>
                </div>
            `
        });
    }

    closeAllModals() {
        this.modals.forEach((_, modalId) => {
            this.closeModal(modalId);
        });
    }

    saveCurrentView() {
        const view = this.views.get(this.currentView);
        if (view?.save) {
            view.save();
            this.app.services.message.success('Saved!');
        }
    }

    // Tooltips
    initTooltips() {
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element && !element._tooltip) {
                this.showTooltip(element);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const element = e.target.closest('[data-tooltip]');
            if (element?._tooltip) {
                this.hideTooltip(element);
            }
        });
    }

    showTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'ui-tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
        
        // Store reference
        element._tooltip = tooltip;
        
        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
    }

    hideTooltip(element) {
        const tooltip = element._tooltip;
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => tooltip.remove(), 200);
            delete element._tooltip;
        }
    }

    // Utility: Create Element
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('on')) {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });
        
        return element;
    }
    
    // PWA Install Prompt
    setupInstallPrompt() {
        this.deferredPrompt = null;
        
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('App already installed');
        }
    }
    
    showInstallButton() {
        // Add install button to UI if not already present
        if (!document.getElementById('pwa-install-btn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = '📲 Install App';
            installBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                z-index: 9999;
                animation: pulse 2s infinite;
            `;
            
            // Add pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                #pwa-install-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }
            `;
            document.head.appendChild(style);
            
            installBtn.onclick = async () => {
                if (this.deferredPrompt) {
                    this.deferredPrompt.prompt();
                    const { outcome } = await this.deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        this.app.services.message.success('App installed successfully! 🎉');
                        installBtn.remove();
                    }
                    
                    this.deferredPrompt = null;
                }
            };
            
            document.body.appendChild(installBtn);
            
            // Auto-hide after 30 seconds
            setTimeout(() => {
                if (document.getElementById('pwa-install-btn')) {
                    installBtn.style.transition = 'opacity 0.5s';
                    installBtn.style.opacity = '0';
                    setTimeout(() => installBtn.remove(), 500);
                }
            }, 30000);
        }
    }

    // Inject global styles
    injectGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* UI Manager Global Styles */
            .ui-loader {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(var(--bg-primary-rgb), 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(10px);
            }

            .loader-content {
                text-align: center;
            }

            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid var(--gray-200);
                border-top-color: var(--primary);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loader-text {
                font-size: 1.125rem;
                color: var(--text-secondary);
            }

            /* Modal Styles */
            .modal-wrapper {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 1rem;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }

            .modal-wrapper.modal-active {
                opacity: 1;
                pointer-events: auto;
            }

            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }

            .modal-container {
                position: relative;
                width: 100%;
                max-width: 600px;
                max-height: 90vh;
                overflow: auto;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .modal-active .modal-container {
                transform: scale(1);
            }

            .modal-content {
                background: var(--bg-primary);
                border-radius: 16px;
                box-shadow: var(--shadow-xl);
                position: relative;
                overflow: hidden;
            }

            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                width: 32px;
                height: 32px;
                border: none;
                background: var(--gray-100);
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                z-index: 10;
            }

            .modal-close:hover {
                background: var(--gray-200);
                transform: scale(1.1);
            }

            .modal-body {
                padding: 2rem;
            }

            /* Error Container */
            .error-container {
                text-align: center;
                padding: 3rem 1.5rem;
                max-width: 500px;
                margin: 0 auto;
            }

            .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }

            .error-container h2 {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
            }

            .error-container p {
                color: var(--text-secondary);
                margin-bottom: 2rem;
            }

            .error-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }

            .error-actions button {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .error-actions button:first-child {
                background: var(--primary);
                color: white;
            }

            .error-actions button:first-child:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
            }

            .error-actions button:last-child {
                background: var(--gray-200);
                color: var(--text-primary);
            }

            .error-actions button:last-child:hover {
                background: var(--gray-300);
            }

            .error-details {
                margin-top: 2rem;
                text-align: left;
                background: var(--gray-100);
                padding: 1rem;
                border-radius: 8px;
            }

            .error-details summary {
                cursor: pointer;
                font-weight: 500;
                margin-bottom: 0.5rem;
            }

            .error-details pre {
                margin: 0;
                font-size: 0.875rem;
                overflow-x: auto;
                white-space: pre-wrap;
            }

            /* Tooltips */
            .ui-tooltip {
                position: fixed;
                background: var(--gray-900);
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                font-size: 0.875rem;
                pointer-events: none;
                z-index: 10000;
                opacity: 0;
                transform: translateY(5px);
                transition: all 0.2s;
                max-width: 250px;
                word-wrap: break-word;
            }

            /* Shortcuts List */
            .shortcuts-list {
                display: grid;
                gap: 0.5rem;
            }

            .shortcuts-list div {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 0;
            }

            .shortcuts-list kbd {
                background: var(--gray-100);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-family: monospace;
                font-size: 0.875rem;
                border: 1px solid var(--gray-300);
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Utility function: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make UI Manager accessible globally for debugging
window.ui = null;