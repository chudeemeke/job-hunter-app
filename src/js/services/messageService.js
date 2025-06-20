// Message Service - Unified Messaging Framework
// Handles all user-facing messages, notifications, and toasts

export class MessageService {
    constructor(app) {
        this.app = app;
        this.container = null;
        this.queue = [];
        this.activeMessages = new Map();
        this.init();
    }

    init() {
        // Create message container
        this.createContainer();
        
        // Setup notification permission
        this.setupNotifications();
        
        // Load saved announcements
        this.loadAnnouncements();
    }

    createContainer() {
        // Remove existing container if any
        const existing = document.getElementById('message-container');
        if (existing) existing.remove();

        // Create new container
        this.container = document.createElement('div');
        this.container.id = 'message-container';
        this.container.className = 'message-container';
        document.body.appendChild(this.container);

        // Add styles
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .message-container {
                position: fixed;
                top: 1rem;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                pointer-events: none;
                max-width: 90vw;
                width: 600px;
            }

            .message {
                background: var(--bg-primary, #ffffff);
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                margin-bottom: 1rem;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                pointer-events: auto;
                transform: translateY(-100px);
                opacity: 0;
                animation: messageSlideIn 0.3s ease forwards;
                position: relative;
                overflow: hidden;
                border: 1px solid var(--border-color, #e5e7eb);
            }

            @keyframes messageSlideIn {
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .message.hiding {
                animation: messageSlideOut 0.3s ease forwards;
            }

            @keyframes messageSlideOut {
                to {
                    transform: translateY(-20px);
                    opacity: 0;
                }
            }

            .message::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
            }

            .message.success::before { background: #10b981; }
            .message.error::before { background: #ef4444; }
            .message.warning::before { background: #f59e0b; }
            .message.info::before { background: #3b82f6; }

            .message-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .message.success .message-icon { color: #10b981; }
            .message.error .message-icon { color: #ef4444; }
            .message.warning .message-icon { color: #f59e0b; }
            .message.info .message-icon { color: #3b82f6; }

            .message-content {
                flex: 1;
                min-width: 0;
            }

            .message-title {
                font-weight: 600;
                margin-bottom: 0.25rem;
                color: var(--text-primary, #1f2937);
            }

            .message-text {
                color: var(--text-secondary, #6b7280);
                font-size: 0.875rem;
                line-height: 1.4;
            }

            .message-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }

            .message-action {
                padding: 0.25rem 0.75rem;
                border: none;
                border-radius: 6px;
                font-size: 0.875rem;
                cursor: pointer;
                transition: all 0.2s;
                background: var(--gray-100, #f3f4f6);
                color: var(--text-primary, #1f2937);
            }

            .message-action:hover {
                background: var(--gray-200, #e5e7eb);
            }

            .message-action.primary {
                background: var(--primary, #2563eb);
                color: white;
            }

            .message-action.primary:hover {
                background: var(--primary-dark, #1d4ed8);
            }

            .message-close {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: none;
                border: none;
                font-size: 1.25rem;
                cursor: pointer;
                color: var(--text-secondary, #6b7280);
                padding: 0.25rem;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .message-close:hover {
                background: var(--gray-100, #f3f4f6);
            }

            .message-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: currentColor;
                opacity: 0.3;
                transition: width linear;
            }

            /* Announcement styles */
            .announcement-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem;
                text-align: center;
                position: relative;
                animation: slideDown 0.5s ease;
            }

            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }

            .announcement-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .announcement-text {
                font-weight: 500;
            }

            .announcement-action {
                background: white;
                color: #667eea;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                transition: transform 0.2s;
            }

            .announcement-action:hover {
                transform: translateY(-2px);
            }

            .announcement-close {
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.8;
                transition: opacity 0.2s;
            }

            .announcement-close:hover {
                opacity: 1;
            }

            /* Dark mode support */
            [data-theme="dark"] .message {
                background: var(--bg-primary, #1f2937);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }

            [data-theme="dark"] .message-action {
                background: var(--gray-700, #374151);
                color: var(--text-primary, #f9fafb);
            }

            [data-theme="dark"] .message-action:hover {
                background: var(--gray-600, #4b5563);
            }

            /* Responsive */
            @media (max-width: 640px) {
                .message-container {
                    width: calc(100% - 2rem);
                    max-width: none;
                }

                .message {
                    padding: 0.875rem 1rem;
                }

                .message-icon {
                    font-size: 1.25rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Main message methods
    show(content, options = {}) {
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const message = {
            id: messageId,
            content,
            type: options.type || 'info',
            title: options.title,
            duration: options.duration || 5000,
            actions: options.actions || [],
            closable: options.closable !== false,
            progress: options.progress !== false,
            persist: options.persist || false,
            ...options
        };

        // Add to queue if needed
        if (this.activeMessages.size >= 3) {
            this.queue.push(message);
            return messageId;
        }

        this.displayMessage(message);
        return messageId;
    }

    displayMessage(message) {
        const element = this.createMessageElement(message);
        this.container.appendChild(element);
        this.activeMessages.set(message.id, { message, element });

        // Auto-hide after duration
        if (!message.persist && message.duration > 0) {
            const timer = setTimeout(() => {
                this.hide(message.id);
            }, message.duration);

            this.activeMessages.get(message.id).timer = timer;

            // Show progress bar
            if (message.progress) {
                this.animateProgress(element, message.duration);
            }
        }

        // Process queue
        this.processQueue();

        // Track in analytics
        this.app.services.analytics?.track('message_shown', {
            type: message.type,
            hasActions: message.actions.length > 0
        });
    }

    createMessageElement(message) {
        const element = document.createElement('div');
        element.className = `message ${message.type}`;
        element.id = message.id;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        element.innerHTML = `
            <div class="message-icon">${icons[message.type]}</div>
            <div class="message-content">
                ${message.title ? `<div class="message-title">${message.title}</div>` : ''}
                <div class="message-text">${message.content}</div>
                ${message.actions.length > 0 ? `
                    <div class="message-actions">
                        ${message.actions.map(action => `
                            <button class="message-action ${action.primary ? 'primary' : ''}" 
                                    data-action="${action.id}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            ${message.closable ? '<button class="message-close">×</button>' : ''}
            ${message.progress ? '<div class="message-progress"></div>' : ''}
        `;

        // Event listeners
        if (message.closable) {
            element.querySelector('.message-close').addEventListener('click', () => {
                this.hide(message.id);
            });
        }

        // Action handlers
        message.actions.forEach(action => {
            const btn = element.querySelector(`[data-action="${action.id}"]`);
            btn?.addEventListener('click', () => {
                if (action.handler) action.handler();
                if (action.dismiss !== false) this.hide(message.id);
            });
        });

        return element;
    }

    animateProgress(element, duration) {
        const progress = element.querySelector('.message-progress');
        if (progress) {
            progress.style.width = '100%';
            progress.style.transition = `width ${duration}ms linear`;
            
            requestAnimationFrame(() => {
                progress.style.width = '0%';
            });
        }
    }

    hide(messageId) {
        const messageData = this.activeMessages.get(messageId);
        if (!messageData) return;

        const { element, timer } = messageData;

        // Clear timer
        if (timer) clearTimeout(timer);

        // Animate out
        element.classList.add('hiding');
        
        setTimeout(() => {
            element.remove();
            this.activeMessages.delete(messageId);
            this.processQueue();
        }, 300);
    }

    // Convenience methods
    success(content, options = {}) {
        return this.show(content, { ...options, type: 'success' });
    }

    error(content, options = {}) {
        return this.show(content, { ...options, type: 'error', duration: 0 });
    }

    warning(content, options = {}) {
        return this.show(content, { ...options, type: 'warning' });
    }

    info(content, options = {}) {
        return this.show(content, { ...options, type: 'info' });
    }

    // Loading message
    loading(content = 'Loading...', options = {}) {
        const loadingHtml = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="loading-spinner"></div>
                <span>${content}</span>
            </div>
        `;

        return this.show(loadingHtml, {
            ...options,
            type: 'info',
            duration: 0,
            closable: false,
            progress: false
        });
    }

    // Update message
    update(messageId, updates) {
        const messageData = this.activeMessages.get(messageId);
        if (!messageData) return;

        const { message, element } = messageData;
        
        // Update message object
        Object.assign(message, updates);

        // Update DOM
        if (updates.content) {
            element.querySelector('.message-text').innerHTML = updates.content;
        }

        if (updates.type) {
            element.className = `message ${updates.type}`;
        }
    }

    // Process queue
    processQueue() {
        if (this.queue.length === 0 || this.activeMessages.size >= 3) return;

        const message = this.queue.shift();
        this.displayMessage(message);
    }

    // Confirmation dialog
    confirm(content, options = {}) {
        return new Promise((resolve) => {
            this.show(content, {
                type: 'warning',
                title: options.title || 'Confirm',
                duration: 0,
                closable: false,
                actions: [
                    {
                        id: 'confirm',
                        label: options.confirmText || 'Confirm',
                        primary: true,
                        handler: () => resolve(true)
                    },
                    {
                        id: 'cancel',
                        label: options.cancelText || 'Cancel',
                        handler: () => resolve(false)
                    }
                ]
            });
        });
    }

    // Prompt dialog
    prompt(content, options = {}) {
        return new Promise((resolve) => {
            const inputId = `input-${Date.now()}`;
            const promptContent = `
                <div>
                    <div style="margin-bottom: 0.75rem;">${content}</div>
                    <input type="${options.type || 'text'}" 
                           id="${inputId}" 
                           class="form-input" 
                           placeholder="${options.placeholder || ''}"
                           value="${options.defaultValue || ''}"
                           style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px;">
                </div>
            `;

            const messageId = this.show(promptContent, {
                type: 'info',
                title: options.title || 'Input Required',
                duration: 0,
                closable: false,
                actions: [
                    {
                        id: 'submit',
                        label: options.submitText || 'Submit',
                        primary: true,
                        handler: () => {
                            const input = document.getElementById(inputId);
                            resolve(input?.value || null);
                        }
                    },
                    {
                        id: 'cancel',
                        label: options.cancelText || 'Cancel',
                        handler: () => resolve(null)
                    }
                ]
            });

            // Focus input
            setTimeout(() => {
                document.getElementById(inputId)?.focus();
            }, 100);
        });
    }

    // Announcements
    async loadAnnouncements() {
        const announcements = await this.app.db.announcements
            .where('active')
            .equals(1)
            .toArray();

        const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');

        announcements.forEach(announcement => {
            if (!dismissed.includes(announcement.id)) {
                this.showAnnouncement(announcement);
            }
        });
    }

    showAnnouncement(announcement) {
        const banner = document.createElement('div');
        banner.className = 'announcement-banner';
        banner.innerHTML = `
            <div class="announcement-content">
                <span class="announcement-text">${announcement.content}</span>
                ${announcement.actionUrl ? `
                    <a href="${announcement.actionUrl}" class="announcement-action" target="_blank">
                        ${announcement.actionText || 'Learn More'}
                    </a>
                ` : ''}
            </div>
            <button class="announcement-close">×</button>
        `;

        banner.querySelector('.announcement-close').addEventListener('click', () => {
            this.dismissAnnouncement(announcement.id, banner);
        });

        document.body.insertBefore(banner, document.body.firstChild);
    }

    dismissAnnouncement(id, element) {
        element.style.animation = 'slideUp 0.5s ease forwards';
        
        setTimeout(() => {
            element.remove();
        }, 500);

        // Save dismissal
        const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
        dismissed.push(id);
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed));
    }

    // Push notifications
    async setupNotifications() {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.app.services.logger?.info('Push notifications enabled');
            }
        }
    }

    async sendNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/icon-192.png',
                badge: '/icon-96.png',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                if (options.onClick) options.onClick();
                notification.close();
            };

            return notification;
        }
    }
}