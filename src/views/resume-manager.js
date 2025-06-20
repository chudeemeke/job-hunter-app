// Resume Manager View - AI-Powered Resume Optimization
import { AIOptimizerService } from '../js/services/aiOptimizerService.js';
import { JobBoardService } from '../js/services/jobBoardService.js';
import { MessageService } from '../js/services/messageService.js';
import { AnalyticsService } from '../js/services/analyticsService.js';

export class ResumeManagerView {
    constructor() {
        this.aiOptimizer = AIOptimizerService.getInstance();
        this.jobBoard = JobBoardService.getInstance();
        this.message = MessageService.getInstance();
        this.analytics = AnalyticsService.getInstance();
        
        this.selectedJobId = null;
        this.currentOptimization = null;
        this.variations = [];
        this.edgeOptions = {
            careerChange: false,
            employmentGap: false,
            overqualified: false
        };
    }

    async render() {
        this.analytics.track('view_resume_manager');
        
        return `
            <div class="resume-manager">
                <div class="header">
                    <h1>AI Resume Optimizer</h1>
                    <p class="subtitle">Intelligent resume optimization that learns from your success</p>
                </div>

                <div class="resume-grid">
                    <!-- Left Column: Job Selection & Options -->
                    <div class="left-panel">
                        <div class="card job-selector">
                            <h3>Select Target Job</h3>
                            <div class="job-search">
                                <input 
                                    type="text" 
                                    id="job-search" 
                                    placeholder="Search saved jobs..."
                                    class="form-input"
                                >
                            </div>
                            <div id="job-list" class="job-list">
                                <!-- Jobs will be loaded here -->
                            </div>
                        </div>

                        <div class="card edge-cases">
                            <h3>Special Circumstances</h3>
                            <p class="help-text">Help the AI understand your situation</p>
                            
                            <label class="checkbox-label">
                                <input type="checkbox" id="career-change">
                                <span>Career Change</span>
                                <small>Transitioning to a new field</small>
                            </label>
                            
                            <label class="checkbox-label">
                                <input type="checkbox" id="employment-gap">
                                <span>Employment Gap</span>
                                <small>Have gaps to address</small>
                            </label>
                            
                            <label class="checkbox-label">
                                <input type="checkbox" id="overqualified">
                                <span>Overqualified</span>
                                <small>Applying for lower-level role</small>
                            </label>
                        </div>

                        <div class="card optimization-history">
                            <h3>Recent Optimizations</h3>
                            <div id="history-list">
                                <!-- History will be loaded here -->
                            </div>
                        </div>
                    </div>

                    <!-- Center: Resume Input/Output -->
                    <div class="center-panel">
                        <div class="card resume-input">
                            <div class="section-header">
                                <h3>Your Base Resume</h3>
                                <button class="btn-secondary" onclick="resumeManager.loadTemplate()">
                                    <i class="icon">📄</i> Load Template
                                </button>
                            </div>
                            
                            <textarea 
                                id="base-resume" 
                                class="resume-textarea"
                                placeholder="Paste your resume here..."
                            ></textarea>
                            
                            <div class="resume-actions">
                                <button 
                                    id="optimize-btn" 
                                    class="btn-primary btn-large"
                                    onclick="resumeManager.optimize()"
                                    disabled
                                >
                                    <i class="icon">✨</i> Optimize Resume
                                </button>
                                
                                <div class="confidence-indicator" id="confidence-indicator" style="display: none;">
                                    <span class="label">AI Confidence:</span>
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" id="confidence-fill"></div>
                                    </div>
                                    <span class="confidence-value" id="confidence-value">0%</span>
                                </div>
                            </div>
                        </div>

                        <div class="card optimized-resume" id="optimized-section" style="display: none;">
                            <div class="section-header">
                                <h3>Optimized Resume</h3>
                                <div class="variation-selector" id="variation-selector">
                                    <!-- Variation buttons will be added here -->
                                </div>
                            </div>
                            
                            <div class="optimization-notes" id="optimization-notes">
                                <!-- AI insights will appear here -->
                            </div>
                            
                            <div class="resume-editor">
                                <div id="optimized-resume" class="resume-content" contenteditable="true">
                                    <!-- Optimized resume will appear here -->
                                </div>
                            </div>
                            
                            <div class="optimization-actions">
                                <button 
                                    class="btn-secondary"
                                    onclick="resumeManager.trackCorrections()"
                                >
                                    <i class="icon">📝</i> Save My Edits
                                </button>
                                
                                <button 
                                    class="btn-primary"
                                    onclick="resumeManager.applyWithResume()"
                                >
                                    <i class="icon">📧</i> Apply Now
                                </button>
                                
                                <button 
                                    class="btn-secondary"
                                    onclick="resumeManager.downloadResume()"
                                >
                                    <i class="icon">⬇️</i> Download
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel: AI Insights & Learning -->
                    <div class="right-panel">
                        <div class="card ai-insights">
                            <h3>AI Insights</h3>
                            <div id="ai-insights-content">
                                <div class="insight-placeholder">
                                    <i class="icon large">🤖</i>
                                    <p>Select a job to see AI insights</p>
                                </div>
                            </div>
                        </div>

                        <div class="card learning-tracker">
                            <h3>AI Learning Progress</h3>
                            <div class="stats-grid">
                                <div class="stat">
                                    <span class="stat-value" id="corrections-count">0</span>
                                    <span class="stat-label">Corrections Learned</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value" id="success-rate">0%</span>
                                    <span class="stat-label">Success Rate</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value" id="patterns-found">0</span>
                                    <span class="stat-label">Patterns Found</span>
                                </div>
                            </div>
                        </div>

                        <div class="card outcome-tracker">
                            <h3>Track Outcome</h3>
                            <p class="help-text">Help the AI learn by tracking results</p>
                            
                            <select id="outcome-select" class="form-select">
                                <option value="">Select optimization to track...</option>
                            </select>
                            
                            <div class="outcome-buttons">
                                <button 
                                    class="btn-outcome interview"
                                    onclick="resumeManager.trackOutcome('interview')"
                                >
                                    📞 Got Interview
                                </button>
                                <button 
                                    class="btn-outcome offer"
                                    onclick="resumeManager.trackOutcome('offer')"
                                >
                                    🎉 Got Offer
                                </button>
                                <button 
                                    class="btn-outcome rejected"
                                    onclick="resumeManager.trackOutcome('rejected')"
                                >
                                    ❌ Rejected
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadSavedJobs();
        await this.loadOptimizationHistory();
        await this.loadLearningStats();
        this.attachEventListeners();
        
        // Load saved resume if exists
        const savedResume = localStorage.getItem('base_resume');
        if (savedResume) {
            document.getElementById('base-resume').value = savedResume;
        }
    }

    attachEventListeners() {
        // Job search
        const jobSearch = document.getElementById('job-search');
        jobSearch?.addEventListener('input', (e) => this.filterJobs(e.target.value));

        // Edge case checkboxes
        ['career-change', 'employment-gap', 'overqualified'].forEach(id => {
            const checkbox = document.getElementById(id);
            checkbox?.addEventListener('change', (e) => {
                this.edgeOptions[id.replace('-', '')] = e.target.checked;
            });
        });

        // Resume textarea
        const baseResume = document.getElementById('base-resume');
        baseResume?.addEventListener('input', (e) => {
            localStorage.setItem('base_resume', e.target.value);
            this.updateOptimizeButton();
        });

        // Track edits in optimized resume
        const optimizedResume = document.getElementById('optimized-resume');
        optimizedResume?.addEventListener('input', () => {
            this.hasEdits = true;
        });
    }

    async loadSavedJobs() {
        try {
            const jobs = await this.jobBoard.getSavedJobs();
            const jobList = document.getElementById('job-list');
            
            if (!jobs || jobs.length === 0) {
                jobList.innerHTML = `
                    <div class="empty-state">
                        <p>No saved jobs yet</p>
                        <a href="#job-board" class="btn-link">Browse Jobs</a>
                    </div>
                `;
                return;
            }

            jobList.innerHTML = jobs.map(job => `
                <div class="job-item ${job.id === this.selectedJobId ? 'selected' : ''}" 
                     data-job-id="${job.id}"
                     onclick="resumeManager.selectJob('${job.id}')">
                    <h4>${job.title}</h4>
                    <p>${job.company} • ${job.location}</p>
                    <span class="job-type">${job.type || 'Full-time'}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading jobs:', error);
            this.message.error('Failed to load saved jobs');
        }
    }

    async selectJob(jobId) {
        this.selectedJobId = jobId;
        
        // Update UI
        document.querySelectorAll('.job-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.jobId === jobId);
        });

        // Load job details and show AI insights
        try {
            const job = await this.jobBoard.getJob(jobId);
            if (job) {
                await this.showAIInsights(job);
                this.updateOptimizeButton();
            }
        } catch (error) {
            console.error('Error selecting job:', error);
            this.message.error('Failed to load job details');
        }
    }

    async showAIInsights(job) {
        const insightsContent = document.getElementById('ai-insights-content');
        
        // Get AI analysis of the job
        const analysis = await this.aiOptimizer.analyzeJobRequirements(job);
        
        insightsContent.innerHTML = `
            <div class="insight-section">
                <h4>Key Requirements</h4>
                <ul class="requirement-list">
                    ${analysis.requirements.map(req => 
                        `<li><i class="icon">✓</i> ${req}</li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="insight-section">
                <h4>Important Keywords</h4>
                <div class="keyword-tags">
                    ${analysis.keywords.map(keyword => 
                        `<span class="keyword-tag">${keyword}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div class="insight-section">
                <h4>Optimization Strategy</h4>
                <p>${analysis.strategy}</p>
            </div>
            
            ${analysis.warnings.length > 0 ? `
                <div class="insight-section warnings">
                    <h4>Considerations</h4>
                    ${analysis.warnings.map(warning => 
                        `<div class="warning-item">
                            <i class="icon">⚠️</i> ${warning}
                        </div>`
                    ).join('')}
                </div>
            ` : ''}
        `;
    }

    updateOptimizeButton() {
        const btn = document.getElementById('optimize-btn');
        const hasResume = document.getElementById('base-resume').value.trim().length > 0;
        const hasJob = this.selectedJobId !== null;
        
        btn.disabled = !hasResume || !hasJob;
        
        if (!hasResume) {
            btn.textContent = '✨ Add Resume First';
        } else if (!hasJob) {
            btn.textContent = '✨ Select a Job First';
        } else {
            btn.textContent = '✨ Optimize Resume';
        }
    }

    async optimize() {
        if (!this.selectedJobId) {
            this.message.warning('Please select a target job first');
            return;
        }

        const baseResume = document.getElementById('base-resume').value;
        if (!baseResume.trim()) {
            this.message.warning('Please add your resume first');
            return;
        }

        const optimizeBtn = document.getElementById('optimize-btn');
        const originalText = optimizeBtn.textContent;
        optimizeBtn.disabled = true;
        optimizeBtn.innerHTML = '<i class="icon spinning">⚙️</i> Optimizing...';

        try {
            // Get the selected job
            const job = await this.jobBoard.getJob(this.selectedJobId);
            
            // Optimize with edge cases if selected
            const optimization = await this.aiOptimizer.optimizeResume(
                baseResume, 
                job,
                this.edgeOptions
            );
            
            this.currentOptimization = optimization;
            
            // Generate variations
            this.variations = await this.aiOptimizer.generateVariations(optimization);
            
            // Show results
            this.displayOptimization(optimization, 0);
            
            // Track the optimization
            this.analytics.track('resume_optimized', {
                jobId: this.selectedJobId,
                confidence: optimization.confidence,
                edgeCases: this.edgeOptions
            });
            
            this.message.success('Resume optimized successfully!');
            
        } catch (error) {
            console.error('Optimization error:', error);
            this.message.error('Failed to optimize resume. Please try again.');
        } finally {
            optimizeBtn.disabled = false;
            optimizeBtn.innerHTML = originalText;
        }
    }

    displayOptimization(optimization, variationIndex = 0) {
        // Show the optimized section
        document.getElementById('optimized-section').style.display = 'block';
        
        // Update confidence indicator
        const confidenceIndicator = document.getElementById('confidence-indicator');
        const confidenceFill = document.getElementById('confidence-fill');
        const confidenceValue = document.getElementById('confidence-value');
        
        confidenceIndicator.style.display = 'flex';
        confidenceFill.style.width = `${optimization.confidence}%`;
        confidenceValue.textContent = `${optimization.confidence}%`;
        
        // Add confidence color coding
        if (optimization.confidence >= 80) {
            confidenceFill.style.backgroundColor = '#10b981';
        } else if (optimization.confidence >= 60) {
            confidenceFill.style.backgroundColor = '#f59e0b';
        } else {
            confidenceFill.style.backgroundColor = '#ef4444';
        }
        
        // Show optimization notes
        const notesSection = document.getElementById('optimization-notes');
        notesSection.innerHTML = `
            <div class="optimization-summary">
                <h4>What the AI Did:</h4>
                <ul>
                    ${optimization.changes.map(change => 
                        `<li><i class="icon">✨</i> ${change}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
        
        // Display the optimized resume
        const resumeContent = document.getElementById('optimized-resume');
        const selectedVariation = variationIndex === 0 ? 
            optimization.optimizedResume : 
            this.variations[variationIndex - 1].content;
            
        resumeContent.innerHTML = this.formatResume(selectedVariation);
        
        // Update variation selector
        this.updateVariationSelector(variationIndex);
        
        // Reset edit tracking
        this.hasEdits = false;
        
        // Scroll to results
        document.getElementById('optimized-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    updateVariationSelector(selectedIndex) {
        const selector = document.getElementById('variation-selector');
        
        const buttons = [`
            <button 
                class="variation-btn ${selectedIndex === 0 ? 'active' : ''}"
                onclick="resumeManager.selectVariation(0)"
                title="Primary optimization"
            >
                Original
            </button>
        `];
        
        this.variations.forEach((variation, index) => {
            buttons.push(`
                <button 
                    class="variation-btn ${selectedIndex === index + 1 ? 'active' : ''}"
                    onclick="resumeManager.selectVariation(${index + 1})"
                    title="${variation.focus}"
                >
                    ${variation.name}
                </button>
            `);
        });
        
        selector.innerHTML = buttons.join('');
    }

    selectVariation(index) {
        if (this.currentOptimization) {
            this.displayOptimization(this.currentOptimization, index);
        }
    }

    formatResume(resumeText) {
        // Add basic formatting to make the resume more readable
        return resumeText
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    async trackCorrections() {
        if (!this.hasEdits || !this.currentOptimization) {
            this.message.info('No edits to save');
            return;
        }

        const editedContent = document.getElementById('optimized-resume').innerText;
        
        try {
            await this.aiOptimizer.learnFromCorrection(
                this.currentOptimization.id,
                {
                    original: this.currentOptimization.optimizedResume,
                    edited: editedContent,
                    jobId: this.selectedJobId
                }
            );
            
            this.message.success('AI has learned from your edits!');
            this.hasEdits = false;
            
            // Refresh learning stats
            await this.loadLearningStats();
            
        } catch (error) {
            console.error('Error tracking corrections:', error);
            this.message.error('Failed to save corrections');
        }
    }

    async trackOutcome(outcome) {
        const select = document.getElementById('outcome-select');
        const optimizationId = select.value;
        
        if (!optimizationId) {
            this.message.warning('Please select an optimization to track');
            return;
        }

        try {
            await this.aiOptimizer.trackApplicationOutcome(optimizationId, outcome);
            
            const messages = {
                interview: 'Great! The AI will learn from this success.',
                offer: 'Congratulations! This really helps the AI improve.',
                rejected: 'Thanks for the feedback. The AI will adapt.'
            };
            
            this.message.success(messages[outcome]);
            
            // Refresh stats and history
            await this.loadLearningStats();
            await this.loadOptimizationHistory();
            
            // Reset selector
            select.value = '';
            
        } catch (error) {
            console.error('Error tracking outcome:', error);
            this.message.error('Failed to track outcome');
        }
    }

    async loadOptimizationHistory() {
        try {
            const history = await this.aiOptimizer.getOptimizationHistory();
            const historyList = document.getElementById('history-list');
            const outcomeSelect = document.getElementById('outcome-select');
            
            if (!history || history.length === 0) {
                historyList.innerHTML = '<p class="empty-state">No optimizations yet</p>';
                return;
            }

            // Update history list
            historyList.innerHTML = history.slice(0, 5).map(item => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="job-title">${item.jobTitle}</span>
                        <span class="history-date">${this.formatDate(item.timestamp)}</span>
                    </div>
                    <div class="history-meta">
                        <span class="confidence">Confidence: ${item.confidence}%</span>
                        ${item.outcome ? `<span class="outcome ${item.outcome}">${item.outcome}</span>` : ''}
                    </div>
                </div>
            `).join('');

            // Update outcome selector with untracked optimizations
            const untrackedOptions = history
                .filter(item => !item.outcome)
                .slice(0, 10)
                .map(item => `
                    <option value="${item.id}">
                        ${item.jobTitle} - ${this.formatDate(item.timestamp)}
                    </option>
                `);
                
            outcomeSelect.innerHTML = `
                <option value="">Select optimization to track...</option>
                ${untrackedOptions.join('')}
            `;
            
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    async loadLearningStats() {
        try {
            const stats = await this.aiOptimizer.getLearningStats();
            
            document.getElementById('corrections-count').textContent = stats.correctionsLearned || 0;
            document.getElementById('success-rate').textContent = `${stats.successRate || 0}%`;
            document.getElementById('patterns-found').textContent = stats.patternsFound || 0;
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    filterJobs(searchTerm) {
        const jobItems = document.querySelectorAll('.job-item');
        const term = searchTerm.toLowerCase();
        
        jobItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
    }

    loadTemplate() {
        const template = `John Doe
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software developer with 5+ years building scalable web applications. Passionate about creating user-friendly solutions and working with modern technologies.

TECHNICAL SKILLS
• Languages: JavaScript, Python, Java, SQL
• Frameworks: React, Node.js, Express, Django
• Tools: Git, Docker, AWS, Jenkins
• Databases: PostgreSQL, MongoDB, Redis

PROFESSIONAL EXPERIENCE

Senior Software Developer | Tech Company | 2020 - Present
• Led development of microservices architecture serving 1M+ users
• Reduced API response time by 40% through optimization
• Mentored junior developers and conducted code reviews
• Implemented CI/CD pipeline improving deployment efficiency by 60%

Software Developer | Startup Inc | 2018 - 2020
• Built full-stack web applications using React and Node.js
• Collaborated with product team to deliver features on schedule
• Wrote comprehensive unit tests achieving 85% code coverage
• Participated in agile ceremonies and sprint planning

EDUCATION
Bachelor of Science in Computer Science | University Name | 2018

PROJECTS
• Open Source Contributor: Active contributor to popular React libraries
• Personal Blog: Technical blog with 10k+ monthly readers`;

        document.getElementById('base-resume').value = template;
        localStorage.setItem('base_resume', template);
        this.updateOptimizeButton();
        this.message.info('Template loaded - customize it with your information');
    }

    async applyWithResume() {
        if (!this.currentOptimization || !this.selectedJobId) {
            this.message.warning('Please optimize a resume first');
            return;
        }

        try {
            const job = await this.jobBoard.getJob(this.selectedJobId);
            const optimizedResume = document.getElementById('optimized-resume').innerText;
            
            // Here you would integrate with the email service
            // For now, we'll just show a success message
            this.message.success('Application prepared! Opening email client...');
            
            // Track application
            this.analytics.track('application_sent', {
                jobId: this.selectedJobId,
                optimizationId: this.currentOptimization.id
            });
            
        } catch (error) {
            console.error('Error applying:', error);
            this.message.error('Failed to prepare application');
        }
    }

    downloadResume() {
        if (!document.getElementById('optimized-resume').innerText) {
            this.message.warning('No optimized resume to download');
            return;
        }

        const content = document.getElementById('optimized-resume').innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${this.selectedJobId}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.message.success('Resume downloaded!');
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return hours === 0 ? 'Just now' : `${hours}h ago`;
        } else if (diff < 604800000) { // Less than 1 week
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

// Create global instance
window.resumeManager = new ResumeManagerView();