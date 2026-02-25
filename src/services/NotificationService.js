/**
 * NotificationService
 * Handles sending notifications via SMS, WhatsApp, and Email
 * Supports integration with Twilio and SendGrid
 */

class NotificationService {
  constructor() {
    this.serviceConfig = {
      sms: {
        enabled: false,
        provider: 'twilio', // or 'custom'
        accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
        authToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
        fromNumber: process.env.REACT_APP_TWILIO_PHONE_NUMBER,
      },
      whatsapp: {
        enabled: false,
        provider: 'twilio', // Twilio WhatsApp Business API
        accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
        authToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
        fromNumber: process.env.REACT_APP_TWILIO_WHATSAPP_NUMBER,
      },
      email: {
        enabled: true,
        provider: 'emailjs', // Using EmailJS for FREE email notifications
        serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
        templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
        fromEmail: process.env.REACT_APP_FROM_EMAIL || 'noreply@donify.com',
        fromName: 'Donify Blood Bank',
      },
    };
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - Recipient phone number (E.164 format: +1234567890)
   * @param {string} message - SMS message content
   * @returns {Promise}
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.serviceConfig.sms.enabled) {
        console.log('📱 SMS Service Disabled - Message would be:', message);
        this.logNotification('sms', phoneNumber, message, 'simulated');
        return { status: 'simulated', provider: 'sms' };
      }

      // Call Twilio API
      const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.serviceConfig.sms.accountSid + ':' + this.serviceConfig.sms.authToken)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.serviceConfig.sms.fromNumber,
          To: phoneNumber,
          Body: message,
        }),
      });

      const data = await response.json();
      this.logNotification('sms', phoneNumber, message, 'sent', data);
      return { status: 'sent', provider: 'sms', data };
    } catch (error) {
      console.error('Error sending SMS:', error);
      this.logNotification('sms', phoneNumber, message, 'failed', error.message);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   * @param {string} phoneNumber - Recipient phone number (E.164 format: +1234567890)
   * @param {string} message - WhatsApp message content
   * @returns {Promise}
   */
  async sendWhatsApp(phoneNumber, message) {
    try {
      if (!this.serviceConfig.whatsapp.enabled) {
        console.log('💬 WhatsApp Service Disabled - Message would be:', message);
        this.logNotification('whatsapp', phoneNumber, message, 'simulated');
        return { status: 'simulated', provider: 'whatsapp' };
      }

      // Call Twilio WhatsApp API
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.serviceConfig.whatsapp.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(this.serviceConfig.whatsapp.accountSid + ':' + this.serviceConfig.whatsapp.authToken)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${this.serviceConfig.whatsapp.fromNumber}`,
            To: `whatsapp:${phoneNumber}`,
            Body: message,
          }),
        }
      );

      const data = await response.json();
      this.logNotification('whatsapp', phoneNumber, message, 'sent', data);
      return { status: 'sent', provider: 'whatsapp', data };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      this.logNotification('whatsapp', phoneNumber, message, 'failed', error.message);
      throw error;
    }
  }

  /**
   * Send Email notification using EmailJS (Free Service)
   * @param {string} email - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML email content
   * @returns {Promise}
   */
  async sendEmail(email, subject, htmlContent) {
    try {
      // Check if EmailJS is configured
      const emailJsServiceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const emailJsTemplateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const emailJsPublicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      // If no EmailJS config, use demo mode
      if (!emailJsServiceId || !emailJsTemplateId || !emailJsPublicKey) {
        console.log('📧 Email Service - Demo Mode (EmailJS not configured)');
        console.log('📧 To/To:', email);
        console.log('📧 Subject:', subject);
        console.log('📧 Message would contain blood request details');
        this.logNotification('email', email, subject, 'demo');
        return { status: 'demo', provider: 'email', message: 'Email sending is in demo mode. To enable real emails, configure EmailJS.' };
      }

      // Load EmailJS library if not already loaded
      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3.11.0/dist/index.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Initialize EmailJS if not already done
      if (window.emailjs && !window.emailjs._isInitialized) {
        window.emailjs.init(emailJsPublicKey);
        window.emailjs._isInitialized = true;
      }

      // Send email using EmailJS
      const response = await window.emailjs.send(
        emailJsServiceId,
        emailJsTemplateId,
        {
          to_email: email,
          subject: subject,
          message: htmlContent,
          reply_to: 'support@donify.com',
        }
      );

      console.log('✅ Email sent successfully via EmailJS:', response);
      this.logNotification('email', email, subject, 'sent');
      return { status: 'sent', provider: 'emailjs', data: response };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      this.logNotification('email', email, subject, 'failed', error.message);
      // Return success: false to allow logging, but don't throw - demo mode
      return { status: 'demo_fallback', error: error.message };
    }
  }

  /**
   * Send blood request notification to a donor via their chosen contact method
   * @param {Object} donor - Donor object with contact info & preference
   * @param {Object} request - Blood request details
   * @returns {Promise}
   */
  async notifyDonor(donor, request) {
    // Check if donor has been notified for this request already
    if (donor.notifiedRequests && donor.notifiedRequests.includes(request.id)) {
      console.log(`Donor ${donor.id} already notified for request ${request.id}`);
      return { success: false, reason: 'already_notified' };
    }

    // Check donor's contact preference
    const contactPreference = donor.contactPreference || 'phone';
    
    if (!donor.phone && contactPreference === 'phone') {
      console.log(`Donor ${donor.id} has no phone number`);
      return { success: false, reason: 'no_contact_info', preference: contactPreference };
    }

    if (!donor.email && contactPreference === 'email') {
      console.log(`Donor ${donor.id} has no email`);
      return { success: false, reason: 'no_contact_info', preference: contactPreference };
    }

    const smsMessage = this.generateSMSMessage(request);
    const emailSubject = this.generateEmailSubject(request);
    const emailContent = this.generateEmailContent(donor, request);

    try {
      let notificationMethod = '';
      
      // Send only to chosen contact method
      if (contactPreference === 'phone' && donor.phone) {
        await this.sendSMS(donor.phone, smsMessage);
        notificationMethod = 'sms';
      } else if (contactPreference === 'email' && donor.email) {
        await this.sendEmail(donor.email, emailSubject, emailContent);
        notificationMethod = 'email';
      }

      return { 
        success: true, 
        method: notificationMethod,
        donorId: donor.id,
        requestId: request.id
      };
    } catch (error) {
      console.error(`Error notifying donor ${donor.id}:`, error);
      return { 
        success: false, 
        error: error.message,
        donorId: donor.id,
        requestId: request.id
      };
    }
  }

  /**
   * Generate SMS message for blood request
   * @param {Object} request - Blood request details
   * @returns {string}
   */
  generateSMSMessage(request) {
    return `🩸 URGENT: ${request.hospitalName} needs ${request.bloodGroup} blood (${request.quantity}U). 
Location: ${request.location}. 
Urgency: ${request.urgency}. 
Please reply if you can donate. 
Visit: donify.com`;
  }

  /**
   * Generate email subject for blood request
   * @param {Object} request - Blood request details
   * @returns {string}
   */
  generateEmailSubject(request) {
    return `🩸 URGENT Blood Request: ${request.bloodGroup} needed - ${request.hospitalName}`;
  }

  /**
   * Generate HTML email content for blood request
   * @param {Object} donor - Donor object
   * @param {Object} request - Blood request details
   * @returns {string}
   */
  generateEmailContent(donor, request) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🩸 URGENT BLOOD REQUEST</h1>
            </div>
            <div class="content">
              <p>Hi ${donor.name},</p>
              
              <div class="alert">
                <strong>${request.hospitalName}</strong> has an urgent need for blood!
              </div>

              <h3>Request Details:</h3>
              <div class="details">
                <div class="detail-row">
                  <span><strong>Blood Group Needed:</strong></span>
                  <span style="font-size: 18px; font-weight: bold; color: #dc2626;">${request.bloodGroup}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Units Required:</strong></span>
                  <span>${request.quantity} units</span>
                </div>
                <div class="detail-row">
                  <span><strong>Location:</strong></span>
                  <span>${request.location}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Urgency Level:</strong></span>
                  <span style="color: ${request.urgency === 'Critical' ? '#dc2626' : request.urgency === 'High' ? '#ea580c' : '#2563eb'}; font-weight: bold;">
                    ${request.urgency}
                  </span>
                </div>
              </div>

              <p><strong>Can you help save a life?</strong> Your donation can make a critical difference.</p>

              <center>
                <a href="https://donify.com/requests/${request.id}" class="button">
                  View Request & Respond
                </a>
              </center>

              <h4>Quick Response Options:</h4>
              <ul>
                <li>✅ Accept the request on our platform</li>
                <li>📞 Contact the hospital directly</li>
                <li>💬 Reply to this email to confirm</li>
              </ul>

              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This request expires in 48 hours. Please respond as soon as possible.
              </p>

              <div class="footer">
                <p>Donify - Blood Donation Network</p>
                <p>Saving lives through timely blood donations</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Blood group compatibility matrix for transfusions
   * Shows which blood groups can receive from which donors
   */
  getBloodGroupCompatibility() {
    return {
      'O+': ['O+', 'O-'],           // Universal donor
      'O-': ['O-'],                 // Can give to all
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal recipient
      'AB-': ['AB-', 'A-', 'B-', 'O-'],
    };
  }

  /**
   * Send blood request notification to donors with matching blood group
   * @param {Array} donors - Array of all available donors
   * @param {Object} request - Blood request details with bloodGroup property
   * @returns {Promise<Object>} - Result with count of notifications sent
   */
  async notifyDonorsByBloodGroup(donors, request) {
    console.log(`🩸 Sending ${request.bloodGroup} blood request notification...`);
    
    const compatibilityMap = this.getBloodGroupCompatibility();
    const compatibleBloodGroups = compatibilityMap[request.bloodGroup] || [request.bloodGroup];
    
    console.log(`✅ Compatible blood groups: ${compatibleBloodGroups.join(', ')}`);

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };

    // Filter donors with compatible blood groups
    const eligibleDonors = donors.filter(donor => 
      compatibleBloodGroups.includes(donor.bloodGroup) && 
      donor.email && 
      donor.available !== false
    );

    console.log(`Found ${eligibleDonors.length} eligible donors for ${request.bloodGroup} blood`);

    // Send notifications to each eligible donor
    for (const donor of eligibleDonors) {
      try {
        const emailSubject = this.generateBloodGroupEmailSubject(request);
        const emailContent = this.generateBloodGroupEmailContent(donor, request);
        
        await this.sendEmail(donor.email, emailSubject, emailContent);
        results.sent++;
        results.details.push({
          donorId: donor.id,
          donorEmail: donor.email,
          bloodGroup: donor.bloodGroup,
          status: 'sent',
        });
        console.log(`✅ Notification sent to ${donor.name} (${donor.bloodGroup})`);
      } catch (error) {
        results.failed++;
        results.details.push({
          donorId: donor.id,
          donorEmail: donor.email,
          bloodGroup: donor.bloodGroup,
          status: 'failed',
          error: error.message,
        });
        console.error(`❌ Failed to notify ${donor.name}:`, error.message);
      }
    }

    console.log(`📊 Notification Results: ${results.sent} sent, ${results.failed} failed`);
    return results;
  }

  /**
   * Generate email subject for blood group request
   * @param {Object} request - Blood request details
   * @returns {string}
   */
  generateBloodGroupEmailSubject(request) {
    return `🩸 URGENT: ${request.bloodGroup} Blood Needed at ${request.hospitalName}`;
  }

  /**
   * Generate HTML email content for blood group request
   * @param {Object} donor - Donor object
   * @param {Object} request - Blood request details
   * @returns {string}
   */
  generateBloodGroupEmailContent(donor, request) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 4px; }
            .blood-group { background: #dc2626; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 4px; margin: 15px 0; }
            .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
            center { display: block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🩸 URGENT BLOOD NEEDED - YOUR HELP IS CRITICAL!</h1>
            </div>
            <div class="content">
              <p>Hello ${donor.name},</p>
              
              <div class="alert">
                <strong>${request.hospitalName}</strong> urgently needs your blood type!
              </div>

              <div class="blood-group">
                ${request.bloodGroup} BLOOD NEEDED
              </div>

              <h3>Request Details:</h3>
              <div class="details">
                <div class="detail-row">
                  <span><strong>Hospital:</strong></span>
                  <span>${request.hospitalName}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Your Blood Type:</strong></span>
                  <span style="font-weight: bold; color: #dc2626;">${donor.bloodGroup}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Units Required:</strong></span>
                  <span>${request.quantity || '2'} units</span>
                </div>
                <div class="detail-row">
                  <span><strong>Location:</strong></span>
                  <span>${request.location || 'Hospital Location'}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Urgency:</strong></span>
                  <span style="color: #dc2626; font-weight: bold;">
                    ${request.urgency || 'CRITICAL'}
                  </span>
                </div>
                ${request.patientInfo ? `
                <div class="detail-row">
                  <span><strong>Patient Info:</strong></span>
                  <span>${request.patientInfo}</span>
                </div>
                ` : ''}
              </div>

              <h3>Why Your Donation Matters:</h3>
              <ul>
                <li>✅ You are a perfect match for this patient's blood type</li>
                <li>❤️ Your donation can save a life TODAY</li>
                <li>⏰ Time is critical - response needed urgently</li>
              </ul>

              <center>
                <a href="https://donify.com/requests/${request.id}" class="button">
                  ✅ YES, I CAN DONATE
                </a>
              </center>

              <h4>Next Steps When You Click the Button:</h4>
              <ol>
                <li>Confirm your availability</li>
                <li>Get hospital contact details</li>
                <li>Schedule your donation appointment</li>
                <li>Save a life! 🩸</li>
              </ol>

              <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin-top: 20px;">
                <p><strong>Can't donate right now?</strong></p>
                <p>Even if you can't donate immediately, please:</p>
                <ul>
                  <li>📣 Share this with friends who have ${request.bloodGroup} blood</li>
                  <li>⏰ Check back later - additional units may be needed</li>
                  <li>📱 Keep your contact info updated in case of future emergencies</li>
                </ul>
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                <strong>Your Privacy:</strong> We only use your information to connect you with critical blood requests. Your contact info is never shared.
              </p>

              <div class="footer">
                <p>Donify - Connecting Blood Donors with Life-Saving Needs</p>
                <p>Every donation counts. Save a life today.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Log notification for debugging and analytics
   * @param {string} type - Notification type (sms, whatsapp, email)
   * @param {string} recipient - Recipient identifier
   * @param {string} message - Message content
   * @param {string} status - Status (sent, failed, simulated)
   * @param {any} metadata - Additional metadata
   */
  logNotification(type, recipient, message, status, metadata = null) {
    const log = {
      timestamp: new Date().toISOString(),
      type,
      recipient,
      message,
      status,
      metadata,
    };
    console.log('📬 Notification Log:', log);

    // Store in localStorage for demo purposes
    try {
      const logs = JSON.parse(localStorage.getItem('donify_notification_logs') || '[]');
      logs.unshift(log);
      // Keep only last 100 logs
      localStorage.setItem('donify_notification_logs', JSON.stringify(logs.slice(0, 100)));
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  /**
   * Get notification service status
   * @returns {Object}
   */
  getStatus() {
    return {
      sms: {
        enabled: this.serviceConfig.sms.enabled,
        provider: this.serviceConfig.sms.provider,
      },
      whatsapp: {
        enabled: this.serviceConfig.whatsapp.enabled,
        provider: this.serviceConfig.whatsapp.provider,
      },
      email: {
        enabled: this.serviceConfig.email.enabled,
        provider: this.serviceConfig.email.provider,
      },
    };
  }

  /**
   * Enable/disable notification channels
   * @param {string} channel - Channel to enable (sms, whatsapp, email)
   * @param {boolean} enabled - Enable or disable
   */
  setChannelEnabled(channel, enabled) {
    if (this.serviceConfig[channel]) {
      this.serviceConfig[channel].enabled = enabled;
    }
  }
}

const notificationServiceInstance = new NotificationService();
export default notificationServiceInstance;
export { notificationServiceInstance };
