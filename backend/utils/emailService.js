const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to Donify - Save Lives Through Blood Donation',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">Welcome to Donify, ${user.name}!</h2>
          <p>Thank you for joining our life-saving community. Your contribution can make a real difference.</p>
          ${user.role === 'donor' ? `
            <h3>Next Steps:</h3>
            <ul>
              <li>Complete your profile information</li>
              <li>Update your availability status</li>
              <li>Respond to blood requests when available</li>
            </ul>
          ` : `
            <h3>Next Steps:</h3>
            <ul>
              <li>Complete your hospital profile</li>
              <li>Create blood requests when needed</li>
              <li>Manage donor responses efficiently</li>
            </ul>
          `}
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The Donify Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendBloodRequestNotification(donor, bloodRequest) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: 'Urgent Blood Request - Donify',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">Urgent Blood Request</h2>
          <p>Hello ${donor.name},</p>
          <p>There's an urgent blood request that matches your profile:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Blood Group:</strong> ${bloodRequest.bloodGroup}</p>
            <p><strong>Quantity:</strong> ${bloodRequest.quantity} units</p>
            <p><strong>Location:</strong> ${bloodRequest.location}</p>
            <p><strong>Urgency:</strong> ${bloodRequest.urgency}</p>
            <p><strong>Hospital:</strong> ${bloodRequest.hospitalName}</p>
          </div>
          <p>Please log in to your Donify account to accept this request and help save a life.</p>
          <p>Thank you for being a hero!</p>
          <p>Best regards,<br>The Donify Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Blood request notification sent successfully');
    } catch (error) {
      console.error('Error sending blood request notification:', error);
    }
  }

  async sendDonationConfirmation(donor, donation) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: donor.email,
      subject: 'Thank You for Your Donation - Donify',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">Thank You for Your Donation!</h2>
          <p>Dear ${donor.name},</p>
          <p>Your blood donation has been successfully completed. You've helped save a life!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Donation Details:</strong></p>
            <p><strong>Date:</strong> ${donation.completedDate || new Date()}</p>
            <p><strong>Blood Group:</strong> ${donation.bloodGroup}</p>
            <p><strong>Quantity:</strong> ${donation.quantity} units</p>
            <p><strong>Hospital:</strong> ${donation.hospital}</p>
          </div>
          <p><strong>You've earned 10 points!</strong></p>
          <p>Your total donations: ${donor.totalDonations}</p>
          <p>Your current points: ${donor.points}</p>
          <p>Keep up the amazing work!</p>
          <p>Best regards,<br>The Donify Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Donation confirmation sent successfully');
    } catch (error) {
      console.error('Error sending donation confirmation:', error);
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset - Donify',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your Donify account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The Donify Team</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }
  }
}

module.exports = new EmailService();
