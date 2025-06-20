// Settings View - Comprehensive User Preferences and Configuration
// Complete control over app behavior and personal settings

export default class SettingsView {
    constructor(app) {
        this.app = app;
        this.currentSection = 'profile';
        this.unsavedChanges = false;
        this.profileImage = null;
    }

    async render() {
        const user = this.app.services.user.currentUser;
        const profile = user.profile;
        const settings = await this.loadUserSettings();
        
        return `
            <div class="settings-container">
                <!-- Header -->
                <header class="settings-header">
                    <div class="header-content">
                        <h1 class="page-title">Settings</h1>
                        <p class="page-subtitle">Customize your Job Hunter experience</p>
                    </div>
                </header>

                <!-- Settings Layout -->
                <div class="settings-layout">
                    <!-- Sidebar Navigation -->
                    <aside class="settings-sidebar">
                        <nav class="settings-nav">
                            <button 
                                class="nav-item ${this.currentSection === 'profile' ? 'active' : ''}"
                                onclick="settings.showSection('profile')"
                            >
                                <span class="nav-icon">👤</span>
                                <span class="nav-label">Profile</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'preferences' ? 'active' : ''}"
                                onclick="settings.showSection('preferences')"
                            >
                                <span class="nav-icon">🎯</span>
                                <span class="nav-label">Job Preferences</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'email' ? 'active' : ''}"
                                onclick="settings.showSection('email')"
                            >
                                <span class="nav-icon">📧</span>
                                <span class="nav-label">Email & Templates</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'notifications' ? 'active' : ''}"
                                onclick="settings.showSection('notifications')"
                            >
                                <span class="nav-icon">🔔</span>
                                <span class="nav-label">Notifications</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'appearance' ? 'active' : ''}"
                                onclick="settings.showSection('appearance')"
                            >
                                <span class="nav-icon">🎨</span>
                                <span class="nav-label">Appearance</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'privacy' ? 'active' : ''}"
                                onclick="settings.showSection('privacy')"
                            >
                                <span class="nav-icon">🔒</span>
                                <span class="nav-label">Privacy & Security</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'data' ? 'active' : ''}"
                                onclick="settings.showSection('data')"
                            >
                                <span class="nav-icon">💾</span>
                                <span class="nav-label">Data Management</span>
                            </button>
                            
                            <button 
                                class="nav-item ${this.currentSection === 'about' ? 'active' : ''}"
                                onclick="settings.showSection('about')"
                            >
                                <span class="nav-icon">ℹ️</span>
                                <span class="nav-label">About</span>
                            </button>
                        </nav>
                    </aside>

                    <!-- Content Area -->
                    <main class="settings-content" id="settings-content">
                        ${await this.renderSection(this.currentSection, profile, settings)}
                    </main>
                </div>
            </div>

            <style>
                .settings-container {
                    min-height: 100vh;
                    background: var(--bg-secondary);
                }

                /* Header */
                .settings-header {
                    background: var(--bg-primary);
                    border-bottom: 1px solid var(--border-color);
                    padding: 2rem 0;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem;
                    color: var(--text-primary);
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    margin: 0;
                }

                /* Layout */
                .settings-layout {
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 0 2rem;
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 2rem;
                }

                /* Sidebar */
                .settings-sidebar {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 1.5rem;
                    height: fit-content;
                    position: sticky;
                    top: 2rem;
                }

                .settings-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: none;
                    border: none;
                    border-radius: 8px;
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                }

                .nav-item:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .nav-item.active {
                    background: var(--primary);
                    color: white;
                }

                .nav-icon {
                    font-size: 1.25rem;
                    width: 24px;
                    text-align: center;
                }

                .nav-label {
                    flex: 1;
                }

                /* Content */
                .settings-content {
                    background: var(--bg-primary);
                    border-radius: 12px;
                    padding: 2rem;
                    min-height: 600px;
                }

                /* Section Styles */
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.5rem;
                }

                .section-description {
                    color: var(--text-secondary);
                    margin: 0 0 2rem;
                }

                /* Form Groups */
                .form-section {
                    margin-bottom: 3rem;
                }

                .form-section:last-child {
                    margin-bottom: 0;
                }

                .form-section-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 1.5rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .form-help {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    margin-top: 0.25rem;
                }

                .form-input,
                .form-select,
                .form-textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .form-input:focus,
                .form-select:focus,
                .form-textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                /* Profile Section */
                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .avatar-upload {
                    position: relative;
                }

                .avatar-preview {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border: 4px solid var(--border-color);
                }

                .avatar-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-initials {
                    font-size: 2.5rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }

                .avatar-upload-btn {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 36px;
                    height: 36px;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.2s;
                }

                .avatar-upload-btn:hover {
                    transform: scale(1.1);
                }

                .profile-info {
                    flex: 1;
                }

                .profile-name {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 0.25rem;
                }

                .profile-email {
                    color: var(--text-secondary);
                    margin: 0 0 1rem;
                }

                .profile-stats {
                    display: flex;
                    gap: 2rem;
                }

                .profile-stat {
                    display: flex;
                    flex-direction: column;
                }

                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                /* Toggle Switch */
                .toggle-group {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }

                .toggle-info {
                    flex: 1;
                    margin-right: 1rem;
                }

                .toggle-label {
                    font-weight: 500;
                    color: var(--text-primary);
                    display: block;
                    margin-bottom: 0.25rem;
                }

                .toggle-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .toggle-switch {
                    position: relative;
                    width: 48px;
                    height: 24px;
                    background: var(--gray-300);
                    border-radius: 999px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-switch.active {
                    background: var(--success);
                }

                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.2s;
                    box-shadow: var(--shadow-sm);
                }

                .toggle-switch.active::after {
                    transform: translateX(24px);
                }

                /* Checkbox List */
                .checkbox-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .checkbox-input {
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                }

                .checkbox-label {
                    font-size: 0.875rem;
                    color: var(--text-primary);
                    cursor: pointer;
                }

                /* Email Templates */
                .template-card {
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                    transition: all 0.2s;
                }

                .template-card:hover {
                    border-color: var(--primary);
                    box-shadow: var(--shadow-sm);
                }

                .template-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .template-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .template-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .template-preview {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    white-space: pre-wrap;
                }

                /* Theme Selector */
                .theme-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .theme-card {
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .theme-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }

                .theme-card.active {
                    border-color: var(--primary);
                    background: rgba(var(--primary-rgb), 0.1);
                }

                .theme-preview {
                    width: 100%;
                    height: 80px;
                    border-radius: 6px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                }

                .theme-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                /* Data Management */
                .data-card {
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .data-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--bg-primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .data-info {
                    flex: 1;
                }

                .data-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }

                .data-description {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .data-action {
                    margin-left: auto;
                }

                /* Save Bar */
                .save-bar {
                    position: sticky;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: var(--bg-primary);
                    border-top: 1px solid var(--border-color);
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: var(--shadow-lg);
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                }

                .save-bar.show {
                    transform: translateY(0);
                }

                .save-message {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .save-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                /* Success Message */
                .success-message {
                    background: rgba(var(--success-rgb), 0.1);
                    color: var(--success);
                    padding: 0.75rem 1rem;
                    border-radius: 6px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Tag Input */
                .tag-input-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: 0.5rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    min-height: 44px;
                }

                .tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.75rem;
                    background: var(--primary);
                    color: white;
                    border-radius: 999px;
                    font-size: 0.875rem;
                }

                .tag-remove {
                    cursor: pointer;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }

                .tag-remove:hover {
                    opacity: 1;
                }

                .tag-input {
                    flex: 1;
                    min-width: 100px;
                    border: none;
                    background: none;
                    outline: none;
                    font-size: 0.875rem;
                }

                /* About Section */
                .about-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .about-card {
                    background: var(--bg-secondary);
                    border-radius: 8px;
                    padding: 1.5rem;
                    text-align: center;
                }

                .about-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                .about-title {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .about-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary);
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                    }

                    .settings-sidebar {
                        position: static;
                        padding: 1rem;
                    }

                    .settings-nav {
                        flex-direction: row;
                        overflow-x: auto;
                        padding-bottom: 0.5rem;
                    }

                    .nav-item {
                        flex-shrink: 0;
                    }

                    .nav-label {
                        display: none;
                    }
                }

                @media (max-width: 640px) {
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                    }

                    .profile-stats {
                        justify-content: center;
                    }

                    .theme-options {
                        grid-template-columns: 1fr;
                    }

                    .save-bar {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }

                    .save-actions {
                        width: 100%;
                    }

                    .save-actions button {
                        flex: 1;
                    }
                }

                /* Dark Mode */
                [data-theme="dark"] .settings-sidebar,
                [data-theme="dark"] .settings-content {
                    background: var(--bg-secondary);
                }

                [data-theme="dark"] .form-input,
                [data-theme="dark"] .form-select,
                [data-theme="dark"] .form-textarea {
                    background: var(--bg-tertiary);
                }

                [data-theme="dark"] .toggle-group,
                [data-theme="dark"] .data-card,
                [data-theme="dark"] .about-card {
                    background: var(--bg-tertiary);
                }

                /* Animations */
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

                .settings-content > * {
                    animation: slideUp 0.3s ease backwards;
                }
            </style>
        `;
    }

    async renderSection(section, profile, settings) {
        switch (section) {
            case 'profile':
                return this.renderProfileSection(profile);
            case 'preferences':
                return this.renderPreferencesSection(settings);
            case 'email':
                return this.renderEmailSection(settings);
            case 'notifications':
                return this.renderNotificationsSection(settings);
            case 'appearance':
                return this.renderAppearanceSection(settings);
            case 'privacy':
                return this.renderPrivacySection(settings);
            case 'data':
                return this.renderDataSection();
            case 'about':
                return this.renderAboutSection();
            default:
                return this.renderProfileSection(profile);
        }
    }

    renderProfileSection(profile) {
        return `
            <div class="profile-section">
                <h2 class="section-title">Profile Settings</h2>
                <p class="section-description">Manage your personal information and professional details</p>

                <!-- Profile Header -->
                <div class="profile-header">
                    <div class="avatar-upload">
                        <div class="avatar-preview">
                            ${profile.avatar ? 
                                `<img src="${profile.avatar}" alt="Profile">` :
                                `<div class="avatar-initials">${this.getInitials(profile.displayName)}</div>`
                            }
                        </div>
                        <button class="avatar-upload-btn" onclick="settings.uploadAvatar()">
                            📷
                        </button>
                        <input type="file" id="avatar-input" accept="image/*" style="display: none;" onchange="settings.handleAvatarChange(event)">
                    </div>
                    <div class="profile-info">
                        <h3 class="profile-name">${profile.displayName}</h3>
                        <p class="profile-email">${this.app.services.user.currentUser.email}</p>
                        <div class="profile-stats">
                            <div class="profile-stat">
                                <span class="stat-value">${profile.completeness || 0}%</span>
                                <span class="stat-label">Profile Complete</span>
                            </div>
                            <div class="profile-stat">
                                <span class="stat-value">${profile.viewCount || 0}</span>
                                <span class="stat-label">Profile Views</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Basic Information -->
                <div class="form-section">
                    <h3 class="form-section-title">Basic Information</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Display Name</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            value="${profile.displayName || ''}"
                            onchange="settings.updateField('displayName', this.value)"
                        >
                    </div>

                    <div class="form-group">
                        <label class="form-label">Professional Title</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            placeholder="e.g., Senior Software Engineer"
                            value="${profile.title || ''}"
                            onchange="settings.updateField('title', this.value)"
                        >
                        <p class="form-help">This appears on your applications and public profile</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            placeholder="City, State/Country"
                            value="${profile.location || ''}"
                            onchange="settings.updateField('location', this.value)"
                        >
                    </div>

                    <div class="form-group">
                        <label class="form-label">Professional Summary</label>
                        <textarea 
                            class="form-textarea" 
                            rows="4"
                            placeholder="Brief overview of your experience and career goals..."
                            onchange="settings.updateField('bio', this.value)"
                        >${profile.bio || ''}</textarea>
                        <p class="form-help">Keep it concise - 2-3 sentences work best</p>
                    </div>
                </div>

                <!-- Contact Information -->
                <div class="form-section">
                    <h3 class="form-section-title">Contact Information</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input 
                            type="tel" 
                            class="form-input" 
                            placeholder="+1 (555) 123-4567"
                            value="${profile.contactInfo?.phone || ''}"
                            onchange="settings.updateField('contactInfo.phone', this.value)"
                        >
                    </div>

                    <div class="form-group">
                        <label class="form-label">LinkedIn Profile</label>
                        <input 
                            type="url" 
                            class="form-input" 
                            placeholder="https://linkedin.com/in/yourprofile"
                            value="${profile.contactInfo?.linkedin || ''}"
                            onchange="settings.updateField('contactInfo.linkedin', this.value)"
                        >
                    </div>

                    <div class="form-group">
                        <label class="form-label">Portfolio/Website</label>
                        <input 
                            type="url" 
                            class="form-input" 
                            placeholder="https://yourportfolio.com"
                            value="${profile.contactInfo?.website || ''}"
                            onchange="settings.updateField('contactInfo.website', this.value)"
                        >
                    </div>
                </div>

                <!-- Skills -->
                <div class="form-section">
                    <h3 class="form-section-title">Skills & Expertise</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Technical Skills</label>
                        <div class="tag-input-container" onclick="settings.focusTagInput('technical')">
                            ${(profile.skills?.technical || []).map(skill => `
                                <span class="tag">
                                    ${skill}
                                    <span class="tag-remove" onclick="settings.removeSkill('technical', '${skill}')">×</span>
                                </span>
                            `).join('')}
                            <input 
                                type="text" 
                                class="tag-input" 
                                id="technical-skill-input"
                                placeholder="Add skill and press Enter"
                                onkeypress="settings.handleSkillInput(event, 'technical')"
                            >
                        </div>
                        <p class="form-help">e.g., JavaScript, Python, React, AWS</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Soft Skills</label>
                        <div class="tag-input-container" onclick="settings.focusTagInput('soft')">
                            ${(profile.skills?.soft || []).map(skill => `
                                <span class="tag">
                                    ${skill}
                                    <span class="tag-remove" onclick="settings.removeSkill('soft', '${skill}')">×</span>
                                </span>
                            `).join('')}
                            <input 
                                type="text" 
                                class="tag-input" 
                                id="soft-skill-input"
                                placeholder="Add skill and press Enter"
                                onkeypress="settings.handleSkillInput(event, 'soft')"
                            >
                        </div>
                        <p class="form-help">e.g., Leadership, Communication, Problem Solving</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderPreferencesSection(settings) {
        const prefs = settings.preferences || {};
        
        return `
            <div class="preferences-section">
                <h2 class="section-title">Job Preferences</h2>
                <p class="section-description">Help us find the perfect job matches for you</p>

                <!-- Job Type Preferences -->
                <div class="form-section">
                    <h3 class="form-section-title">Job Type</h3>
                    
                    <div class="checkbox-list">
                        ${['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map(type => `
                            <label class="checkbox-item">
                                <input 
                                    type="checkbox" 
                                    class="checkbox-input"
                                    ${prefs.jobTypes?.includes(type) ? 'checked' : ''}
                                    onchange="settings.togglePreference('jobTypes', '${type}')"
                                >
                                <span class="checkbox-label">${type}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Location Preferences -->
                <div class="form-section">
                    <h3 class="form-section-title">Work Location</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Open to Remote Work</label>
                            <p class="toggle-description">Include remote positions in job matches</p>
                        </div>
                        <div 
                            class="toggle-switch ${prefs.remote ? 'active' : ''}"
                            onclick="settings.togglePreference('remote')"
                        ></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Preferred Locations</label>
                        <div class="tag-input-container" onclick="settings.focusTagInput('locations')">
                            ${(prefs.locations || []).map(location => `
                                <span class="tag">
                                    ${location}
                                    <span class="tag-remove" onclick="settings.removePreference('locations', '${location}')">×</span>
                                </span>
                            `).join('')}
                            <input 
                                type="text" 
                                class="tag-input" 
                                id="locations-input"
                                placeholder="Add location and press Enter"
                                onkeypress="settings.handleLocationInput(event)"
                            >
                        </div>
                        <p class="form-help">Add cities or regions where you'd like to work</p>
                    </div>
                </div>

                <!-- Salary Preferences -->
                <div class="form-section">
                    <h3 class="form-section-title">Salary Expectations</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Minimum Salary (Annual)</label>
                        <input 
                            type="number" 
                            class="form-input" 
                            placeholder="e.g., 80000"
                            value="${prefs.minSalary || ''}"
                            onchange="settings.updatePreference('minSalary', this.value)"
                        >
                        <p class="form-help">We'll prioritize jobs that meet your salary requirements</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Preferred Currency</label>
                        <select 
                            class="form-select"
                            onchange="settings.updatePreference('currency', this.value)"
                        >
                            <option value="USD" ${prefs.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${prefs.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="GBP" ${prefs.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                            <option value="CAD" ${prefs.currency === 'CAD' ? 'selected' : ''}>CAD ($)</option>
                            <option value="AUD" ${prefs.currency === 'AUD' ? 'selected' : ''}>AUD ($)</option>
                        </select>
                    </div>
                </div>

                <!-- Industry Preferences -->
                <div class="form-section">
                    <h3 class="form-section-title">Industries & Keywords</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Preferred Industries</label>
                        <div class="checkbox-list">
                            ${['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'].map(industry => `
                                <label class="checkbox-item">
                                    <input 
                                        type="checkbox" 
                                        class="checkbox-input"
                                        ${prefs.industries?.includes(industry) ? 'checked' : ''}
                                        onchange="settings.togglePreference('industries', '${industry}')"
                                    >
                                    <span class="checkbox-label">${industry}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Job Alert Keywords</label>
                        <div class="tag-input-container" onclick="settings.focusTagInput('keywords')">
                            ${(prefs.keywords || []).map(keyword => `
                                <span class="tag">
                                    ${keyword}
                                    <span class="tag-remove" onclick="settings.removePreference('keywords', '${keyword}')">×</span>
                                </span>
                            `).join('')}
                            <input 
                                type="text" 
                                class="tag-input" 
                                id="keywords-input"
                                placeholder="Add keyword and press Enter"
                                onkeypress="settings.handleKeywordInput(event)"
                            >
                        </div>
                        <p class="form-help">We'll notify you when jobs matching these keywords are posted</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmailSection(settings) {
        const email = settings.email || {};
        
        return `
            <div class="email-section">
                <h2 class="section-title">Email & Templates</h2>
                <p class="section-description">Configure email settings and application templates</p>

                <!-- Email Configuration -->
                <div class="form-section">
                    <h3 class="form-section-title">Email Configuration</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Default From Email</label>
                        <input 
                            type="email" 
                            class="form-input" 
                            value="${email.fromEmail || this.app.services.user.currentUser.email}"
                            onchange="settings.updateEmail('fromEmail', this.value)"
                        >
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email Signature</label>
                        <textarea 
                            class="form-textarea" 
                            rows="4"
                            placeholder="Best regards,\nYour Name\nPhone: (555) 123-4567"
                            onchange="settings.updateEmail('signature', this.value)"
                        >${email.signature || ''}</textarea>
                    </div>
                </div>

                <!-- Application Templates -->
                <div class="form-section">
                    <h3 class="form-section-title">Application Templates</h3>
                    
                    ${(email.templates || this.getDefaultTemplates()).map((template, index) => `
                        <div class="template-card">
                            <div class="template-header">
                                <span class="template-name">${template.name}</span>
                                <div class="template-actions">
                                    <button class="btn-sm" onclick="settings.editTemplate(${index})">Edit</button>
                                    <button class="btn-sm danger" onclick="settings.deleteTemplate(${index})">Delete</button>
                                </div>
                            </div>
                            <div class="template-preview">Subject: ${template.subject}

${template.body.substring(0, 150)}...</div>
                        </div>
                    `).join('')}
                    
                    <button class="btn-secondary" onclick="settings.addTemplate()">
                        <i class="icon">➕</i> Add New Template
                    </button>
                </div>

                <!-- Follow-up Templates -->
                <div class="form-section">
                    <h3 class="form-section-title">Follow-up Templates</h3>
                    
                    <div class="form-group">
                        <label class="form-label">1-Week Follow-up</label>
                        <textarea 
                            class="form-textarea" 
                            rows="4"
                            placeholder="Subject: Following up on my application for {position}..."
                            onchange="settings.updateEmail('followUp1Week', this.value)"
                        >${email.followUp1Week || this.getDefaultFollowUp('1week')}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">2-Week Follow-up</label>
                        <textarea 
                            class="form-textarea" 
                            rows="4"
                            placeholder="Subject: Checking in regarding {position} at {company}..."
                            onchange="settings.updateEmail('followUp2Week', this.value)"
                        >${email.followUp2Week || this.getDefaultFollowUp('2week')}</textarea>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotificationsSection(settings) {
        const notif = settings.notifications || {};
        
        return `
            <div class="notifications-section">
                <h2 class="section-title">Notification Preferences</h2>
                <p class="section-description">Choose how and when you want to be notified</p>

                <!-- Email Notifications -->
                <div class="form-section">
                    <h3 class="form-section-title">Email Notifications</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">New Job Matches</label>
                            <p class="toggle-description">Get notified when new jobs match your preferences</p>
                        </div>
                        <div 
                            class="toggle-switch ${notif.emailJobMatches !== false ? 'active' : ''}"
                            onclick="settings.toggleNotification('emailJobMatches')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Application Status Updates</label>
                            <p class="toggle-description">Receive updates when your application status changes</p>
                        </div>
                        <div 
                            class="toggle-switch ${notif.emailStatusUpdates !== false ? 'active' : ''}"
                            onclick="settings.toggleNotification('emailStatusUpdates')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Follow-up Reminders</label>
                            <p class="toggle-description">Get reminded to follow up on applications</p>
                        </div>
                        <div 
                            class="toggle-switch ${notif.emailFollowUps !== false ? 'active' : ''}"
                            onclick="settings.toggleNotification('emailFollowUps')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Weekly Summary</label>
                            <p class="toggle-description">Receive a weekly summary of your job search activity</p>
                        </div>
                        <div 
                            class="toggle-switch ${notif.emailWeeklySummary !== false ? 'active' : ''}"
                            onclick="settings.toggleNotification('emailWeeklySummary')"
                        ></div>
                    </div>
                </div>

                <!-- Push Notifications -->
                <div class="form-section">
                    <h3 class="form-section-title">Push Notifications</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Enable Push Notifications</label>
                            <p class="toggle-description">Get real-time notifications in your browser</p>
                        </div>
                        <div 
                            class="toggle-switch ${notif.pushEnabled ? 'active' : ''}"
                            onclick="settings.togglePushNotifications()"
                        ></div>
                    </div>

                    ${notif.pushEnabled ? `
                        <div class="form-group">
                            <label class="form-label">Notification Sound</label>
                            <select 
                                class="form-select"
                                onchange="settings.updateNotification('sound', this.value)"
                            >
                                <option value="none" ${notif.sound === 'none' ? 'selected' : ''}>None</option>
                                <option value="default" ${notif.sound === 'default' ? 'selected' : ''}>Default</option>
                                <option value="chime" ${notif.sound === 'chime' ? 'selected' : ''}>Chime</option>
                                <option value="bell" ${notif.sound === 'bell' ? 'selected' : ''}>Bell</option>
                            </select>
                        </div>
                    ` : ''}
                </div>

                <!-- Notification Schedule -->
                <div class="form-section">
                    <h3 class="form-section-title">Notification Schedule</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Do Not Disturb</label>
                            <p class="toggle-description">Pause notifications during specific hours</p>
                        </div>
                        <div 
                            class="toggle-switch ${notif.doNotDisturb ? 'active' : ''}"
                            onclick="settings.toggleNotification('doNotDisturb')"
                        ></div>
                    </div>

                    ${notif.doNotDisturb ? `
                        <div class="form-group">
                            <label class="form-label">Quiet Hours</label>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <input 
                                    type="time" 
                                    class="form-input" 
                                    style="flex: 1;"
                                    value="${notif.quietStart || '22:00'}"
                                    onchange="settings.updateNotification('quietStart', this.value)"
                                >
                                <span>to</span>
                                <input 
                                    type="time" 
                                    class="form-input" 
                                    style="flex: 1;"
                                    value="${notif.quietEnd || '08:00'}"
                                    onchange="settings.updateNotification('quietEnd', this.value)"
                                >
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderAppearanceSection(settings) {
        const theme = settings.theme || 'auto';
        
        return `
            <div class="appearance-section">
                <h2 class="section-title">Appearance</h2>
                <p class="section-description">Customize how Job Hunter looks and feels</p>

                <!-- Theme Selection -->
                <div class="form-section">
                    <h3 class="form-section-title">Theme</h3>
                    
                    <div class="theme-options">
                        <div 
                            class="theme-card ${theme === 'light' ? 'active' : ''}"
                            onclick="settings.setTheme('light')"
                        >
                            <div class="theme-preview" style="background: #ffffff; color: #111827;">
                                ☀️
                            </div>
                            <span class="theme-name">Light</span>
                        </div>

                        <div 
                            class="theme-card ${theme === 'dark' ? 'active' : ''}"
                            onclick="settings.setTheme('dark')"
                        >
                            <div class="theme-preview" style="background: #111827; color: #f9fafb;">
                                🌙
                            </div>
                            <span class="theme-name">Dark</span>
                        </div>

                        <div 
                            class="theme-card ${theme === 'auto' ? 'active' : ''}"
                            onclick="settings.setTheme('auto')"
                        >
                            <div class="theme-preview" style="background: linear-gradient(90deg, #ffffff 50%, #111827 50%); color: #6b7280;">
                                🌓
                            </div>
                            <span class="theme-name">Auto</span>
                        </div>
                    </div>
                </div>

                <!-- Display Options -->
                <div class="form-section">
                    <h3 class="form-section-title">Display Options</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Animations</label>
                            <p class="toggle-description">Enable smooth transitions and animations</p>
                        </div>
                        <div 
                            class="toggle-switch ${settings.animations !== false ? 'active' : ''}"
                            onclick="settings.toggleSetting('animations')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Compact Mode</label>
                            <p class="toggle-description">Show more content with reduced spacing</p>
                        </div>
                        <div 
                            class="toggle-switch ${settings.compactMode ? 'active' : ''}"
                            onclick="settings.toggleSetting('compactMode')"
                        ></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Font Size</label>
                        <select 
                            class="form-select"
                            onchange="settings.updateSetting('fontSize', this.value)"
                        >
                            <option value="small" ${settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                            <option value="normal" ${!settings.fontSize || settings.fontSize === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="large" ${settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                            <option value="xlarge" ${settings.fontSize === 'xlarge' ? 'selected' : ''}>Extra Large</option>
                        </select>
                    </div>
                </div>

                <!-- Accessibility -->
                <div class="form-section">
                    <h3 class="form-section-title">Accessibility</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">High Contrast</label>
                            <p class="toggle-description">Increase contrast for better visibility</p>
                        </div>
                        <div 
                            class="toggle-switch ${settings.highContrast ? 'active' : ''}"
                            onclick="settings.toggleSetting('highContrast')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Reduce Motion</label>
                            <p class="toggle-description">Minimize animations for motion sensitivity</p>
                        </div>
                        <div 
                            class="toggle-switch ${settings.reduceMotion ? 'active' : ''}"
                            onclick="settings.toggleSetting('reduceMotion')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Keyboard Navigation Hints</label>
                            <p class="toggle-description">Show keyboard shortcuts and navigation hints</p>
                        </div>
                        <div 
                            class="toggle-switch ${settings.keyboardHints !== false ? 'active' : ''}"
                            onclick="settings.toggleSetting('keyboardHints')"
                        ></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPrivacySection(settings) {
        const privacy = settings.privacy || {};
        
        return `
            <div class="privacy-section">
                <h2 class="section-title">Privacy & Security</h2>
                <p class="section-description">Control your data and security preferences</p>

                <!-- Account Security -->
                <div class="form-section">
                    <h3 class="form-section-title">Account Security</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Change Password</label>
                        <button class="btn-secondary" onclick="settings.showChangePassword()">
                            Change Password
                        </button>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Two-Factor Authentication</label>
                            <p class="toggle-description">Add an extra layer of security to your account</p>
                        </div>
                        <div 
                            class="toggle-switch ${privacy.twoFactorEnabled ? 'active' : ''}"
                            onclick="settings.toggleTwoFactor()"
                        ></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Active Sessions</label>
                        <button class="btn-secondary" onclick="settings.viewActiveSessions()">
                            View Active Sessions
                        </button>
                        <p class="form-help">See all devices where you're logged in</p>
                    </div>
                </div>

                <!-- Data Privacy -->
                <div class="form-section">
                    <h3 class="form-section-title">Data Privacy</h3>
                    
                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Analytics</label>
                            <p class="toggle-description">Help us improve by sharing anonymous usage data</p>
                        </div>
                        <div 
                            class="toggle-switch ${privacy.analytics !== false ? 'active' : ''}"
                            onclick="settings.togglePrivacy('analytics')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Public Profile</label>
                            <p class="toggle-description">Allow recruiters to find your profile</p>
                        </div>
                        <div 
                            class="toggle-switch ${privacy.publicProfile ? 'active' : ''}"
                            onclick="settings.togglePrivacy('publicProfile')"
                        ></div>
                    </div>

                    <div class="toggle-group">
                        <div class="toggle-info">
                            <label class="toggle-label">Share Success Stories</label>
                            <p class="toggle-description">Anonymously share your success to help others</p>
                        </div>
                        <div 
                            class="toggle-switch ${privacy.shareSuccess ? 'active' : ''}"
                            onclick="settings.togglePrivacy('shareSuccess')"
                        ></div>
                    </div>
                </div>

                <!-- Data Retention -->
                <div class="form-section">
                    <h3 class="form-section-title">Data Retention</h3>
                    
                    <div class="form-group">
                        <label class="form-label">Application History</label>
                        <select 
                            class="form-select"
                            onchange="settings.updatePrivacy('retention', this.value)"
                        >
                            <option value="3months" ${privacy.retention === '3months' ? 'selected' : ''}>Keep for 3 months</option>
                            <option value="6months" ${privacy.retention === '6months' ? 'selected' : ''}>Keep for 6 months</option>
                            <option value="1year" ${privacy.retention === '1year' ? 'selected' : ''}>Keep for 1 year</option>
                            <option value="forever" ${privacy.retention === 'forever' ? 'selected' : ''}>Keep forever</option>
                        </select>
                        <p class="form-help">Automatically delete old application data after this period</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Clear Browsing Data</label>
                        <button class="btn-secondary danger" onclick="settings.clearBrowsingData()">
                            Clear Data
                        </button>
                        <p class="form-help">Remove cached data and temporary files</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderDataSection() {
        return `
            <div class="data-section">
                <h2 class="section-title">Data Management</h2>
                <p class="section-description">Export, import, and manage your Job Hunter data</p>

                <!-- Export Data -->
                <div class="form-section">
                    <h3 class="form-section-title">Export Your Data</h3>
                    
                    <div class="data-card">
                        <div class="data-icon">📄</div>
                        <div class="data-info">
                            <h4 class="data-title">Export All Data</h4>
                            <p class="data-description">Download all your data including profile, applications, and settings</p>
                        </div>
                        <div class="data-action">
                            <button class="btn-primary" onclick="settings.exportAllData()">
                                Export Data
                            </button>
                        </div>
                    </div>

                    <div class="data-card">
                        <div class="data-icon">📊</div>
                        <div class="data-info">
                            <h4 class="data-title">Export Applications</h4>
                            <p class="data-description">Download your application history as CSV</p>
                        </div>
                        <div class="data-action">
                            <button class="btn-secondary" onclick="settings.exportApplications()">
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div class="data-card">
                        <div class="data-icon">📝</div>
                        <div class="data-info">
                            <h4 class="data-title">Export Resumes</h4>
                            <p class="data-description">Download all your saved resumes and templates</p>
                        </div>
                        <div class="data-action">
                            <button class="btn-secondary" onclick="settings.exportResumes()">
                                Export Resumes
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Import Data -->
                <div class="form-section">
                    <h3 class="form-section-title">Import Data</h3>
                    
                    <div class="data-card">
                        <div class="data-icon">📥</div>
                        <div class="data-info">
                            <h4 class="data-title">Import from Backup</h4>
                            <p class="data-description">Restore your data from a previous export</p>
                        </div>
                        <div class="data-action">
                            <button class="btn-secondary" onclick="settings.importData()">
                                Choose File
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Delete Account -->
                <div class="form-section">
                    <h3 class="form-section-title">Delete Account</h3>
                    
                    <div class="data-card" style="border: 2px solid var(--danger);">
                        <div class="data-icon">⚠️</div>
                        <div class="data-info">
                            <h4 class="data-title" style="color: var(--danger);">Delete Your Account</h4>
                            <p class="data-description">Permanently delete your account and all associated data. This cannot be undone.</p>
                        </div>
                        <div class="data-action">
                            <button class="btn-secondary danger" onclick="settings.deleteAccount()">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAboutSection() {
        return `
            <div class="about-section">
                <h2 class="section-title">About Job Hunter Pro</h2>
                <p class="section-description">Your AI-powered career advancement platform</p>

                <!-- App Info -->
                <div class="about-grid">
                    <div class="about-card">
                        <div class="about-icon">🚀</div>
                        <h4 class="about-title">Version</h4>
                        <p class="about-value">6.0.0</p>
                    </div>

                    <div class="about-card">
                        <div class="about-icon">📊</div>
                        <h4 class="about-title">Your Applications</h4>
                        <p class="about-value">${this.getTotalApplications()}</p>
                    </div>

                    <div class="about-card">
                        <div class="about-icon">🎯</div>
                        <h4 class="about-title">Success Rate</h4>
                        <p class="about-value">${this.getSuccessRate()}%</p>
                    </div>

                    <div class="about-card">
                        <div class="about-icon">⏱️</div>
                        <h4 class="about-title">Member Since</h4>
                        <p class="about-value">${this.getMemberSince()}</p>
                    </div>
                </div>

                <!-- Features -->
                <div class="form-section">
                    <h3 class="form-section-title">Features</h3>
                    
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 1rem;">
                            <strong>🤖 AI-Powered Optimization</strong><br>
                            <span style="color: var(--text-secondary);">
                                Intelligent resume and cover letter optimization that learns from your success
                            </span>
                        </li>
                        <li style="margin-bottom: 1rem;">
                            <strong>📈 Smart Job Matching</strong><br>
                            <span style="color: var(--text-secondary);">
                                Advanced algorithms to find the perfect job matches for your skills
                            </span>
                        </li>
                        <li style="margin-bottom: 1rem;">
                            <strong>🔒 Privacy First</strong><br>
                            <span style="color: var(--text-secondary);">
                                Your data is encrypted and never shared without your permission
                            </span>
                        </li>
                        <li style="margin-bottom: 1rem;">
                            <strong>💯 100% Offline Capable</strong><br>
                            <span style="color: var(--text-secondary);">
                                Full functionality even without an internet connection
                            </span>
                        </li>
                    </ul>
                </div>

                <!-- Resources -->
                <div class="form-section">
                    <h3 class="form-section-title">Resources</h3>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <a href="#" class="btn-secondary" style="text-align: center;">
                            📚 User Guide
                        </a>
                        <a href="#" class="btn-secondary" style="text-align: center;">
                            💡 Tips & Tricks
                        </a>
                        <a href="#" class="btn-secondary" style="text-align: center;">
                            🐛 Report a Bug
                        </a>
                        <a href="#" class="btn-secondary" style="text-align: center;">
                            💬 Community Forum
                        </a>
                    </div>
                </div>

                <!-- Credits -->
                <div class="form-section">
                    <h3 class="form-section-title">Credits</h3>
                    
                    <p style="text-align: center; color: var(--text-secondary);">
                        Built with ❤️ by the Job Hunter Team<br>
                        Powered by cutting-edge AI and your determination to succeed
                    </p>
                </div>
            </div>
        `;
    }

    // Data Loading
    async loadUserSettings() {
        try {
            const userId = this.app.services.user.currentUser.id;
            const profile = await this.app.db.profiles.get(userId);
            
            // Load all settings from various sources
            const settings = {
                profile,
                preferences: profile?.preferences?.jobPreferences || {},
                email: profile?.emailSettings || {},
                notifications: profile?.notificationSettings || {},
                theme: localStorage.getItem('theme') || 'auto',
                animations: localStorage.getItem('animations') !== 'false',
                compactMode: localStorage.getItem('compactMode') === 'true',
                fontSize: localStorage.getItem('fontSize') || 'normal',
                highContrast: localStorage.getItem('highContrast') === 'true',
                reduceMotion: localStorage.getItem('reduceMotion') === 'true',
                keyboardHints: localStorage.getItem('keyboardHints') !== 'false',
                privacy: profile?.privacySettings || {}
            };

            return settings;
        } catch (error) {
            this.app.services.logger.error('Failed to load settings', error);
            return {};
        }
    }

    // Event Handlers
    async showSection(section) {
        this.currentSection = section;
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        event.target.closest('.nav-item').classList.add('active');
        
        // Load section content
        const profile = this.app.services.user.currentUser.profile;
        const settings = await this.loadUserSettings();
        const content = await this.renderSection(section, profile, settings);
        
        document.getElementById('settings-content').innerHTML = content;
        
        // Check for unsaved changes
        if (this.unsavedChanges) {
            this.showSaveBar();
        }
    }

    // Profile Management
    uploadAvatar() {
        document.getElementById('avatar-input').click();
    }

    async handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.app.services.message.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.app.services.message.error('Image must be less than 5MB');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                // In a real app, you'd upload to a server
                // For now, we'll store as base64
                const avatar = e.target.result;
                await this.updateField('avatar', avatar);
                
                // Update UI
                const preview = document.querySelector('.avatar-preview');
                preview.innerHTML = `<img src="${avatar}" alt="Profile">`;
                
                this.app.services.message.success('Profile photo updated!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            this.app.services.message.error('Failed to upload photo');
        }
    }

    async updateField(field, value) {
        try {
            const userId = this.app.services.user.currentUser.id;
            const profile = await this.app.db.profiles.get(userId);
            
            // Handle nested fields
            if (field.includes('.')) {
                const parts = field.split('.');
                let obj = profile;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!obj[parts[i]]) obj[parts[i]] = {};
                    obj = obj[parts[i]];
                }
                obj[parts[parts.length - 1]] = value;
            } else {
                profile[field] = value;
            }
            
            await this.app.db.profiles.put(profile);
            this.markUnsaved();
            
        } catch (error) {
            this.app.services.logger.error('Failed to update field', error);
            this.app.services.message.error('Failed to save changes');
        }
    }

    // Skills Management
    focusTagInput(type) {
        document.getElementById(`${type}-skill-input`).focus();
    }

    async handleSkillInput(event, type) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const input = event.target;
            const skill = input.value.trim();
            
            if (skill) {
                await this.addSkill(type, skill);
                input.value = '';
            }
        }
    }

    async addSkill(type, skill) {
        try {
            const userId = this.app.services.user.currentUser.id;
            const profile = await this.app.db.profiles.get(userId);
            
            if (!profile.skills) profile.skills = {};
            if (!profile.skills[type]) profile.skills[type] = [];
            
            if (!profile.skills[type].includes(skill)) {
                profile.skills[type].push(skill);
                await this.app.db.profiles.put(profile);
                
                // Refresh section
                await this.showSection('profile');
                this.markUnsaved();
            }
        } catch (error) {
            this.app.services.message.error('Failed to add skill');
        }
    }

    async removeSkill(type, skill) {
        try {
            const userId = this.app.services.user.currentUser.id;
            const profile = await this.app.db.profiles.get(userId);
            
            if (profile.skills?.[type]) {
                profile.skills[type] = profile.skills[type].filter(s => s !== skill);
                await this.app.db.profiles.put(profile);
                
                // Refresh section
                await this.showSection('profile');
                this.markUnsaved();
            }
        } catch (error) {
            this.app.services.message.error('Failed to remove skill');
        }
    }

    // Preferences Management
    async togglePreference(key, value) {
        try {
            const userId = this.app.services.user.currentUser.id;
            const profile = await this.app.db.profiles.get(userId);
            
            if (!profile.preferences) profile.preferences = {};
            if (!profile.preferences.jobPreferences) profile.preferences.jobPreferences = {};
            
            const prefs = profile.preferences.jobPreferences;
            
            if (value) {
                // Toggle array values
                if (!prefs[key]) prefs[key] = [];
                const index = prefs[key].indexOf(value);
                if (index > -1) {
                    prefs[key].splice(index, 1);
                } else {
                    prefs[key].push(value);
                }
            } else {
                // Toggle boolean
                prefs[key] = !prefs[key];
            }
            
            await this.app.db.profiles.put(profile);
            this.markUnsaved();
            
        } catch (error) {
            this.app.services.message.error('Failed to update preference');
        }
    }

    async updatePreference(key, value) {
        await this.updateField(`preferences.jobPreferences.${key}`, value);
    }

    // Theme Management
    async setTheme(theme) {
        this.app.ui.setTheme(theme);
        localStorage.setItem('theme', theme);
        
        // Update UI
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
        });
        event.target.closest('.theme-card').classList.add('active');
        
        this.app.services.message.success('Theme updated!');
    }

    // Settings Management
    async toggleSetting(key) {
        const current = localStorage.getItem(key) === 'true';
        const newValue = !current;
        localStorage.setItem(key, newValue);
        
        // Apply setting
        switch (key) {
            case 'animations':
                document.documentElement.classList.toggle('no-animations', !newValue);
                break;
            case 'compactMode':
                document.documentElement.classList.toggle('compact', newValue);
                break;
            case 'highContrast':
                document.documentElement.classList.toggle('high-contrast', newValue);
                break;
            case 'reduceMotion':
                document.documentElement.classList.toggle('reduce-motion', newValue);
                break;
        }
        
        this.markUnsaved();
    }

    async updateSetting(key, value) {
        localStorage.setItem(key, value);
        
        // Apply setting
        if (key === 'fontSize') {
            document.documentElement.style.fontSize = {
                'small': '14px',
                'normal': '16px',
                'large': '18px',
                'xlarge': '20px'
            }[value];
        }
        
        this.markUnsaved();
    }

    // Save Management
    markUnsaved() {
        this.unsavedChanges = true;
        this.showSaveBar();
    }

    showSaveBar() {
        let saveBar = document.querySelector('.save-bar');
        if (!saveBar) {
            saveBar = document.createElement('div');
            saveBar.className = 'save-bar';
            saveBar.innerHTML = `
                <span class="save-message">You have unsaved changes</span>
                <div class="save-actions">
                    <button class="btn-secondary" onclick="settings.discardChanges()">
                        Discard
                    </button>
                    <button class="btn-primary" onclick="settings.saveChanges()">
                        Save Changes
                    </button>
                </div>
            `;
            document.querySelector('.settings-container').appendChild(saveBar);
        }
        
        setTimeout(() => {
            saveBar.classList.add('show');
        }, 100);
    }

    async saveChanges() {
        try {
            // All changes are already saved to the database
            // This is just for UI feedback
            this.unsavedChanges = false;
            
            const saveBar = document.querySelector('.save-bar');
            if (saveBar) {
                saveBar.classList.remove('show');
                setTimeout(() => saveBar.remove(), 300);
            }
            
            // Show success message
            const content = document.getElementById('settings-content');
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = '✅ Settings saved successfully';
            content.insertBefore(successMsg, content.firstChild);
            
            setTimeout(() => successMsg.remove(), 3000);
            
            this.app.services.message.success('All settings saved!');
            
        } catch (error) {
            this.app.services.message.error('Failed to save settings');
        }
    }

    discardChanges() {
        if (confirm('Are you sure you want to discard your changes?')) {
            this.unsavedChanges = false;
            const saveBar = document.querySelector('.save-bar');
            if (saveBar) {
                saveBar.classList.remove('show');
                setTimeout(() => saveBar.remove(), 300);
            }
            
            // Reload current section
            this.showSection(this.currentSection);
        }
    }

    // Export/Import Functions
    async exportAllData() {
        try {
            this.app.services.message.info('Preparing your data export...');
            
            const userId = this.app.services.user.currentUser.id;
            const data = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                user: await this.app.db.users.get(userId),
                profile: await this.app.db.profiles.get(userId),
                applications: await this.app.db.applications
                    .where('userId')
                    .equals(userId)
                    .toArray(),
                resumes: await this.app.db.resumes
                    .where('userId')
                    .equals(userId)
                    .toArray(),
                coverLetters: await this.app.db.coverLetters
                    .where('userId')
                    .equals(userId)
                    .toArray(),
                optimizations: await this.app.db.optimizations
                    .where('userId')
                    .equals(userId)
                    .toArray(),
                settings: await this.loadUserSettings()
            };
            
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `job-hunter-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.app.services.message.success('Data exported successfully!');
            
        } catch (error) {
            this.app.services.message.error('Failed to export data');
        }
    }

    async exportApplications() {
        try {
            const applications = await this.app.db.applications
                .where('userId')
                .equals(this.app.services.user.currentUser.id)
                .toArray();
            
            // Convert to CSV
            const csv = this.convertToCSV(applications);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.app.services.message.success('Applications exported!');
            
        } catch (error) {
            this.app.services.message.error('Failed to export applications');
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = ['Company', 'Position', 'Status', 'Applied Date', 'Location', 'Type'];
        const rows = data.map(app => [
            app.company || '',
            app.position || '',
            app.status || '',
            new Date(app.appliedDate).toLocaleDateString(),
            app.location || '',
            app.type || ''
        ]);
        
        return [
            headers.join(','),
            ...rows.map(row => row.map(cell => 
                typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
            ).join(','))
        ].join('\n');
    }

    // Helper Methods
    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getDefaultTemplates() {
        return [
            {
                name: 'Standard Application',
                subject: 'Application for {position} at {company}',
                body: `Dear Hiring Manager,

I am writing to express my interest in the {position} position at {company}. With my background in {field}, I believe I would be a valuable addition to your team.

{coverLetter}

Thank you for considering my application. I look forward to discussing how I can contribute to {company}'s success.

Best regards,
{name}`
            },
            {
                name: 'Quick Apply',
                subject: 'Interest in {position} Role',
                body: `Hi,

I'm very interested in the {position} role at {company}. My experience aligns well with your requirements:

{keyPoints}

I've attached my resume for your review. I'd love to discuss this opportunity further.

Thanks,
{name}`
            }
        ];
    }

    getDefaultFollowUp(type) {
        if (type === '1week') {
            return `Subject: Following up on my application for {position}

Hi {hiringManager},

I wanted to follow up on my application for the {position} role that I submitted on {applicationDate}. I'm very enthusiastic about the opportunity to join {company} and contribute to your team.

I'd be happy to provide any additional information you might need. I'm available for an interview at your convenience.

Thank you for your time and consideration.

Best regards,
{name}`;
        } else {
            return `Subject: Checking in regarding {position} at {company}

Hello,

I hope this email finds you well. I'm writing to check on the status of my application for the {position} position, submitted on {applicationDate}.

I remain very interested in this opportunity and would love to discuss how my skills and experience align with your needs.

Please let me know if you need any additional information from me.

Thank you,
{name}`;
        }
    }

    async getTotalApplications() {
        const count = await this.app.db.applications
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .count();
        return count;
    }

    async getSuccessRate() {
        const applications = await this.app.db.applications
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();
        
        if (applications.length === 0) return 0;
        
        const successful = applications.filter(a => 
            ['interview', 'offer'].includes(a.status)
        ).length;
        
        return Math.round((successful / applications.length) * 100);
    }

    getMemberSince() {
        const user = this.app.services.user.currentUser;
        const date = new Date(user.created);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    // Delete Account
    async deleteAccount() {
        const confirmed = confirm(
            'Are you absolutely sure you want to delete your account?\n\n' +
            'This will permanently delete:\n' +
            '• Your profile and settings\n' +
            '• All job applications\n' +
            '• All saved resumes and templates\n' +
            '• All data associated with your account\n\n' +
            'This action CANNOT be undone!'
        );
        
        if (confirmed) {
            const doubleCheck = prompt(
                'Please type DELETE to confirm account deletion:'
            );
            
            if (doubleCheck === 'DELETE') {
                try {
                    await this.app.services.user.deleteAccount();
                    this.app.services.message.info('Account deleted. Goodbye!');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } catch (error) {
                    this.app.services.message.error('Failed to delete account');
                }
            }
        }
    }

    // Lifecycle
    async afterRender() {
        // Any post-render setup
    }
}

// Create global instance
window.settings = new SettingsView(window.app);