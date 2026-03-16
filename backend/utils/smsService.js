const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  async sendBloodRequestSMS(phoneNumber, donorName, bloodRequest) {
    try {
      const message = await this.client.messages.create({
        body: `URGENT: ${bloodRequest.hospitalName} needs ${bloodRequest.quantity} units of ${bloodRequest.bloodGroup} blood at ${bloodRequest.location}. Urgency: ${bloodRequest.urgency}. Please check your Donify app to accept. Reply STOP to unsubscribe.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log('SMS sent successfully:', message.sid);
      return message;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendDonationConfirmationSMS(phoneNumber, donorName, donation) {
    try {
      const message = await this.client.messages.create({
        body: `Thank you ${donorName}! Your blood donation of ${donation.quantity} units has been completed successfully. You've earned 10 points. Total donations: ${donation.totalDonations}. Reply STOP to unsubscribe.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log('Donation confirmation SMS sent successfully:', message.sid);
      return message;
    } catch (error) {
      console.error('Error sending donation confirmation SMS:', error);
      throw error;
    }
  }

  async sendAppointmentReminderSMS(phoneNumber, donorName, appointment) {
    try {
      const message = await this.client.messages.create({
        body: `Reminder: Your blood donation appointment is scheduled for ${appointment.date} at ${appointment.location}. Please arrive on time and bring your ID. Reply STOP to unsubscribe.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log('Appointment reminder SMS sent successfully:', message.sid);
      return message;
    } catch (error) {
      console.error('Error sending appointment reminder SMS:', error);
      throw error;
    }
  }
}

module.exports = new SMSService();
