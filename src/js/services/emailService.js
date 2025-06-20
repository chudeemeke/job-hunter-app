// Email Service - Zero-cost email integration
// Uses mailto: with templates and optional GitHub Gist for email tracking

export class EmailService {
    constructor(app) {
        this.app = app;
        this.db = app.db;
        this.templates = new Map();
        this.initializeTemplates();
    }

    async initializeTemplates() {
        // Load default templates
        const defaultTemplates = [
            {
                id: 'application',
                name: 'Job Application',
                subject: 'Application for {position} at {company}',
                body: `Dear Hiring Manager,

I am writing to express my strong interest in the {position} position at {company}. {opening_line}

{body_paragraph_1}

{body_paragraph_2}

{closing_paragraph}

Best regards,
{name}

Attachments: Resume, Cover Letter`
            },
            {
                id: 'followup',
                name: 'Follow Up',
                subject: 'Following up on my application for {position}',
                body: `Dear {hiring_manager},

I hope this email finds you well. I wanted to follow up on my application for the {position} role submitted on {date}.

I remain very interested in this opportunity and would welcome the chance to discuss how my skills in {skills} align with your needs.

Thank you for your time and consideration.

Best regards,
{name}`
            },
            {
                id: 'thank_you',
                name: 'Thank You',
                subject: 'Thank you - {position} interview',
                body: `Dear {interviewer},

Thank you for taking the time to meet with me {when} to discuss the {position} role at {company}.

{specific_discussion_point}

I am very excited about the opportunity to {contribution} and look forward to the next steps.

Best regards,
{name}`
            },
            {
                id: 'networking',
                name: 'Networking',
                subject: 'Connecting regarding {topic}',
                body: `Hi {name},

{connection_context}

I noticed your expertise in {area} and would love to connect to learn more about {specific_interest}.

Would you be open to a brief {meeting_type} to discuss {topic}?

Best regards,
{sender_name}`
            }
        ];

        // Save to database
        for (const template of defaultTemplates) {
            await this.db.emailTemplates.put({
                ...template,
                userId: 'system',
                created: new Date().toISOString()
            });
        }

        // Load user templates
        await this.loadUserTemplates();
    }

    async loadUserTemplates() {
        if (!this.app.services.user.currentUser) return;

        const userTemplates = await this.db.emailTemplates
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();

        userTemplates.forEach(template => {
            this.templates.set(template.id, template);
        });
    }

    // Send email (opens email client)
    async sendEmail(data) {
        try {
            const { to, subject, body, cc, bcc, attachments } = data;

            // Get user's email settings
            const emailAccount = await this.getUserEmailAccount();
            
            // Build mailto URL
            const params = new URLSearchParams();
            if (subject) params.append('subject', subject);
            if (body) params.append('body', this.formatBody(body, emailAccount));
            if (cc) params.append('cc', cc);
            if (bcc) params.append('bcc', bcc);

            const mailtoUrl = `mailto:${to}?${params.toString()}`;

            // Track email
            const emailId = await this.trackEmail({
                to,
                subject,
                body,
                attachments,
                sentDate: new Date().toISOString(),
                status: 'opened'
            });

            // Open email client
            window.open(mailtoUrl, '_blank');

            // Show instructions for attachments
            if (attachments && attachments.length > 0) {
                this.showAttachmentInstructions(attachments);
            }

            return { success: true, emailId };

        } catch (error) {
            this.app.services.logger.error('Email send failed', error);
            throw error;
        }
    }

    // Send job application email
    async sendApplication(jobId, resumeId, coverLetterId) {
        const [job, resume, coverLetter] = await Promise.all([
            this.db.jobs.get(jobId),
            this.db.resumes.get(resumeId),
            this.db.coverLetters.get(coverLetterId)
        ]);

        const template = await this.getTemplate('application');
        const emailData = await this.populateTemplate(template, {
            position: job.title,
            company: job.company,
            ...this.generateApplicationContent(job, resume)
        });

        // Add tracking
        emailData.metadata = {
            jobId,
            resumeId,
            coverLetterId,
            type: 'application'
        };

        return await this.sendEmail(emailData);
    }

    // Generate email content from template
    async populateTemplate(template, variables) {
        let subject = template.subject;
        let body = template.body;

        // Replace variables
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{${key}}`, 'g');
            subject = subject.replace(regex, value);
            body = body.replace(regex, value);
        });

        // Get email from user settings
        const userEmail = await this.getUserEmail();

        return {
            to: variables.to || '',
            subject,
            body,
            from: userEmail
        };
    }

    // Get user's configured email
    async getUserEmail() {
        const userId = this.app.services.user.currentUser?.id;
        if (!userId) throw new Error('User not authenticated');

        const emailAccount = await this.db.emailAccounts
            .where('userId')
            .equals(userId)
            .first();

        return emailAccount?.email || this.app.services.user.currentUser.email;
    }

    async getUserEmailAccount() {
        const userId = this.app.services.user.currentUser?.id;
        if (!userId) return null;

        return await this.db.emailAccounts
            .where('userId')
            .equals(userId)
            .first();
    }

    // Format body with signature
    formatBody(body, emailAccount) {
        if (!emailAccount?.signature) return body;

        return `${body}\n\n${emailAccount.signature}`;
    }

    // Track sent emails
    async trackEmail(emailData) {
        const sentEmail = {
            userId: this.app.services.user.currentUser.id,
            jobId: emailData.metadata?.jobId,
            to: emailData.to,
            subject: emailData.subject,
            sentDate: emailData.sentDate,
            status: emailData.status,
            metadata: emailData.metadata
        };

        const emailId = await this.db.sentEmails.add(sentEmail);

        // Sync to GitHub Gist for backup
        await this.syncToGist(sentEmail);

        return emailId;
    }

    // Sync email tracking to GitHub Gist
    async syncToGist(emailData) {
        try {
            const gistId = localStorage.getItem('email_tracking_gist');
            if (!gistId) return;

            // Get current gist data
            const response = await fetch(`https://api.github.com/gists/${gistId}`);
            const gist = await response.json();
            
            const tracking = JSON.parse(gist.files['email-tracking.json']?.content || '[]');
            
            // Add new tracking
            tracking.push({
                ...emailData,
                id: undefined, // Remove local ID
                syncedAt: new Date().toISOString()
            });

            // Update gist
            await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${localStorage.getItem('github_token') || ''}`
                },
                body: JSON.stringify({
                    files: {
                        'email-tracking.json': {
                            content: JSON.stringify(tracking, null, 2)
                        }
                    }
                })
            });
        } catch (error) {
            // Fail silently - this is optional backup
            console.warn('Email sync failed:', error);
        }
    }

    // Show attachment instructions
    showAttachmentInstructions(attachments) {
        const fileList = attachments.map(att => `• ${att.name}`).join('\n');
        
        this.app.services.message.info('Attach Files to Email', {
            duration: 0,
            content: `
                <div>
                    <p>Your email client has been opened. Please attach the following files:</p>
                    <pre style="margin: 1rem 0; padding: 0.5rem; background: var(--gray-100); border-radius: 4px;">
${fileList}
                    </pre>
                    <p style="font-size: 0.875rem; color: var(--text-secondary);">
                        Files have been prepared and can be found in your Downloads folder.
                    </p>
                </div>
            `,
            actions: [{
                id: 'download',
                label: 'Download All Files',
                primary: true,
                handler: () => this.downloadAttachments(attachments)
            }]
        });
    }

    // Download attachments
    async downloadAttachments(attachments) {
        for (const attachment of attachments) {
            if (attachment.type === 'resume') {
                await this.downloadResume(attachment.id);
            } else if (attachment.type === 'coverLetter') {
                await this.downloadCoverLetter(attachment.id);
            }
        }
    }

    async downloadResume(resumeId) {
        const resume = await this.db.resumes.get(resumeId);
        if (!resume) return;

        const blob = new Blob([resume.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.name || 'resume'}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async downloadCoverLetter(letterId) {
        const letter = await this.db.coverLetters.get(letterId);
        if (!letter) return;

        const blob = new Blob([letter.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cover-letter.txt';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Template management
    async createTemplate(templateData) {
        const template = {
            ...templateData,
            userId: this.app.services.user.currentUser.id,
            created: new Date().toISOString()
        };

        const id = await this.db.emailTemplates.add(template);
        this.templates.set(id, { id, ...template });
        
        return id;
    }

    async updateTemplate(templateId, updates) {
        await this.db.emailTemplates.update(templateId, updates);
        
        const template = await this.db.emailTemplates.get(templateId);
        this.templates.set(templateId, template);
    }

    async deleteTemplate(templateId) {
        await this.db.emailTemplates.delete(templateId);
        this.templates.delete(templateId);
    }

    async getTemplate(templateId) {
        return this.templates.get(templateId) || 
               await this.db.emailTemplates.get(templateId);
    }

    async getTemplates() {
        const systemTemplates = await this.db.emailTemplates
            .where('userId')
            .equals('system')
            .toArray();

        const userTemplates = await this.db.emailTemplates
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();

        return [...systemTemplates, ...userTemplates];
    }

    // Email account settings
    async saveEmailSettings(settings) {
        const encrypted = await this.app.services.security.secureStorage.setItem(
            'email_settings',
            settings
        );

        await this.db.emailAccounts.put({
            userId: this.app.services.user.currentUser.id,
            email: settings.email,
            signature: settings.signature,
            replyTo: settings.replyTo,
            updated: new Date().toISOString()
        });

        this.app.services.message.success('Email settings saved');
    }

    // Generate application content
    generateApplicationContent(job, resume) {
        const resumeData = this.app.services.aiOptimizer.parseResume(resume.content);
        
        return {
            opening_line: `With my background in ${this.extractTopSkills(resumeData).join(' and ')}, I am excited to contribute to your team.`,
            body_paragraph_1: this.generateBodyParagraph(job, resumeData, 1),
            body_paragraph_2: this.generateBodyParagraph(job, resumeData, 2),
            closing_paragraph: `I would welcome the opportunity to discuss how my experience aligns with your needs. Thank you for considering my application.`,
            name: resumeData.contact.name
        };
    }

    generateBodyParagraph(job, resumeData, paragraphNumber) {
        if (paragraphNumber === 1) {
            // Focus on relevant experience
            const relevantExp = this.findRelevantExperience(resumeData.experience, job);
            return `In my current role as ${relevantExp.title} at ${relevantExp.company}, I have ${relevantExp.bullets[0]}. This experience has prepared me well for the challenges of the ${job.title} position.`;
        } else {
            // Focus on skills and achievements
            const topSkills = this.extractTopSkills(resumeData);
            return `My expertise in ${topSkills.join(', ')} combined with my track record of ${this.extractTopAchievement(resumeData)} makes me an ideal candidate for this role.`;
        }
    }

    findRelevantExperience(experiences, job) {
        // Simple relevance scoring
        return experiences[0] || {
            title: 'Professional',
            company: 'Previous Company',
            bullets: ['delivered successful projects']
        };
    }

    extractTopSkills(resumeData) {
        return resumeData.skills?.slice(0, 3) || ['technical expertise', 'problem-solving', 'collaboration'];
    }

    extractTopAchievement(resumeData) {
        // Look for quantified achievements
        for (const exp of resumeData.experience || []) {
            for (const bullet of exp.bullets || []) {
                if (bullet.match(/\d+%|increased|improved|delivered/i)) {
                    return bullet.toLowerCase();
                }
            }
        }
        return 'delivering impactful results';
    }

    // Email analytics
    async getEmailStats() {
        const emails = await this.db.sentEmails
            .where('userId')
            .equals(this.app.services.user.currentUser.id)
            .toArray();

        const stats = {
            total: emails.length,
            byType: {},
            byStatus: {},
            recentActivity: []
        };

        emails.forEach(email => {
            // By type
            const type = email.metadata?.type || 'other';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // By status
            stats.byStatus[email.status] = (stats.byStatus[email.status] || 0) + 1;
        });

        // Recent activity
        stats.recentActivity = emails
            .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate))
            .slice(0, 10);

        return stats;
    }

    // Follow-up reminders
    async scheduleFollowUp(emailId, daysLater) {
        const email = await this.db.sentEmails.get(emailId);
        if (!email) throw new Error('Email not found');

        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + daysLater);

        await this.db.notifications.add({
            userId: this.app.services.user.currentUser.id,
            type: 'email_followup',
            title: 'Email Follow-up Reminder',
            message: `Time to follow up on your email to ${email.to} about "${email.subject}"`,
            read: false,
            created: new Date().toISOString(),
            scheduledFor: followUpDate.toISOString(),
            metadata: { emailId }
        });

        this.app.services.message.success(`Follow-up reminder set for ${daysLater} days from now`);
    }
}

// Export singleton
export default EmailService;