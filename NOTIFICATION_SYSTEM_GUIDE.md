# Donify Notification System Implementation Guide

## Overview

The Donify blood donation platform now includes an advanced multi-channel notification system that automatically sends alerts to matching donors when hospitals request blood. Notifications can be delivered via:

- **SMS** (via Twilio)
- **WhatsApp** (via Twilio)
- **Email** (via SendGrid)

## Features

### 1. **Automatic Donor Notifications**
When a hospital creates a blood request, the system:
- Finds matching donors based on blood group compatibility
- Respects donor notification preferences
- Applies urgency filters (All, High, Critical)
- Sends notifications through enabled channels
- Tracks notification delivery status

### 2. **Notification Preferences**
Donors can customize:
- Enable/disable SMS notifications
- Enable/disable WhatsApp notifications
- Enable/disable Email notifications
- Filter requests by urgency level (All, High, Critical)

### 3. **Smart Blood Matching**
- Validates blood type compatibility using proper blood group rules
- Calculates match scores based on blood group, location, and availability
- Prioritizes best matches for notification

### 4. **Notification Logs**
- Tracks all notification attempts
- Shows delivery status (Sent, Failed, Simulated)
- Records recipient, type, and timestamp
- Accessible in admin dashboard

## Architecture

### File Structure
```
src/
├── services/
│   ├── NotificationService.js      # Core notification handling
│   └── bloodMatchingService.js     # Blood type compatibility logic
├── components/
│   ├── NotificationPreferences.js  # Donor preference UI
│   └── NotificationLogs.js         # Notification history viewer
├── context/
│   └── AuthContext.js              # Updated with notification logic
├── pages/
│   ├── hospital/
│   │   └── HospitalDashboard.js    # Enhanced with notification feedback
│   └── donor/
│       └── DonorDashboard.js       # Includes preferences panel
└── data/
    └── mockData.js                  # Updated with contact info
```

## Setup Instructions

### Step 1: Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Twilio Configuration (SMS & WhatsApp)
REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_account_sid
REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_auth_token
REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
REACT_APP_TWILIO_WHATSAPP_NUMBER=+1234567890

# SendGrid Configuration (Email)
REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key
REACT_APP_FROM_EMAIL=noreply@yourdomain.com
```

### Step 2: Install Dependencies

No additional npm packages are required! The system uses:
- Native `fetch` API for HTTP requests
- localStorage for demo/testing
- Built-in JavaScript features

### Step 3: Service Configuration

In `NotificationService.js`, update the configuration:

```javascript
// Enable/disable channels as needed
this.serviceConfig.sms.enabled = true;        // Enable SMS via Twilio
this.serviceConfig.whatsapp.enabled = true;   // Enable WhatsApp via Twilio
this.serviceConfig.email.enabled = true;      // Enable Email via SendGrid
```

## Integration with External Services

### Twilio Setup (SMS & WhatsApp)

1. **Sign up** at https://www.twilio.com
2. **Get credentials**:
   - Account SID from dashboard
   - Auth Token from dashboard
   - Verify phone number for SMS
   - Add WhatsApp sandbox number

3. **Configure in .env**:
```env
REACT_APP_TWILIO_ACCOUNT_SID=ACxxx...
REACT_APP_TWILIO_AUTH_TOKEN=your_token
REACT_APP_TWILIO_PHONE_NUMBER=+1555-0150
REACT_APP_TWILIO_WHATSAPP_NUMBER=+1555-0150
```

4. **SMS Message Format**:
```
🩸 URGENT: [Hospital Name] needs [Blood Group] blood ([Quantity]U). 
Location: [Location]. 
Urgency: [Level]. 
Please reply if you can donate. 
Visit: donify.com
```

5. **WhatsApp Message Format**:
Same as SMS but delivered via WhatsApp

### SendGrid Setup (Email)

1. **Sign up** at https://sendgrid.com
2. **Get API Key**:
   - Go to Settings > API Keys
   - Create new API Key
   - Save securely

3. **Configure in .env**:
```env
REACT_APP_SENDGRID_API_KEY=SG.xxx...
REACT_APP_FROM_EMAIL=noreply@yourdomain.com
```

4. **Email Features**:
   - Professional HTML template
   - Request details with urgency color coding
   - Quick action links
   - Professional branding

## Demo/Simulation Mode

For testing without external services:

```javascript
// Services automatically log to console and localStorage
// Set enabled = false for simulation
// Check browser console for notification logs
```

### View Notification Logs
```javascript
// Access in browser console
JSON.parse(localStorage.getItem('donify_notification_logs'))
```

## Usage Example

### Hospital Creating a Request
```javascript
// Automatic notification flow:
1. Hospital fills form (blood group, quantity, urgency, location)
2. Hospital clicks "Send Request"
3. System finds matching donors
4. Notifications sent to eligible donors via their preferred channels
5. Hospital sees confirmation with donor notification status
```

### Donor Managing Preferences
```javascript
// Donor Dashboard → Notification Preferences
1. Check/uncheck SMS, WhatsApp, Email
2. Select urgency filter
3. Click "Save Preferences"
```

## Key Components

### NotificationService.js

**Main Methods:**
- `sendSMS(phoneNumber, message)` - Send SMS via Twilio
- `sendWhatsApp(phoneNumber, message)` - Send WhatsApp via Twilio
- `sendEmail(email, subject, htmlContent)` - Send email via SendGrid
- `notifyDonor(donor, request, preferences)` - Complete notification workflow
- `getStatus()` - Check service configuration
- `setChannelEnabled(channel, enabled)` - Toggle channels

### bloodMatchingService.js

**Key Functions:**
- `canDonate(donorType, recipientType)` - Validates blood compatibility
- `getCompatibleDonors(bloodGroup, donors)` - Filter compatible donors
- `calculateMatchScore(request, donor)` - Score matching donors
- `findBestMatches(request, donors, limit)` - Get top matches

### NotificationPreferences Component

**Features:**
- Toggle SMS/WhatsApp/Email
- Set urgency filter
- Display active channels
- Save preferences to localStorage and context

## Data Flow

```
Hospital Creates Request
    ↓
findBestMatches() - Find compatible donors
    ↓
Filter by notification preferences & urgency
    ↓
sendNotificationsToMatchingDonors()
    ├─ For each matching donor:
    │  ├─ Check preferences
    │  ├─ Check urgency filter
    │  └─ Send enabled channels
    ├─ sendSMS()
    ├─ sendWhatsApp()
    └─ sendEmail()
    ↓
Update request with notification status
    ↓
Show confirmation to hospital
```

## Notification Status Tracking

### Request Object
```javascript
{
  id: "123",
  bloodGroup: "A+",
  quantity: 2,
  urgency: "High",
  notificationsSent: [
    {
      donorId: "d1",
      donorName: "John Doe",
      status: "Success",
      channels: [
        { type: "sms", status: "sent" },
        { type: "email", status: "sent" }
      ],
      timestamp: "2025-02-17T10:30:00Z"
    }
  ]
}
```

### Donor Notification Log
```javascript
{
  requestId: "req123",
  requestType: "A+",
  timestamp: "2025-02-17T10:30:00Z",
  status: "Sent"
}
```

## Blood Type Compatibility Matrix

| Donor | Can Donate To |
|-------|:------------:|
| O-    | Everyone (Universal Donor) |
| O+    | O+, A+, B+, AB+ |
| A-    | A-, A+, AB-, AB+ |
| A+    | A+, AB+ |
| B-    | B-, B+, AB-, AB+ |
| B+    | B+, AB+ |
| AB-   | AB-, AB+ |
| AB+   | AB+ (Universal Recipient) |

## Error Handling

### Graceful Degradation
- If Twilio unavailable, logs to console/localStorage
- If SendGrid unavailable, logs to console/localStorage
- User sees simulated/demo mode notifications

### Retry Logic
- System logs failed attempts
- Manual retry available through admin dashboard
- Notification history shows all attempts

## Testing Checklist

- [ ] Hospital can create blood request
- [ ] Matching donors identified correctly
- [ ] Donors receive SMS notifications
- [ ] Donors receive WhatsApp notifications
- [ ] Donors receive email notifications
- [ ] Donor preferences respected
- [ ] Urgency filters work
- [ ] Notification logs visible
- [ ] Hospital sees notification status

## Troubleshooting

### SMS/WhatsApp Not Sending
1. Check `.env` variables are set
2. Verify Twilio credentials
3. Check phone numbers in E.164 format (+1...)
4. Review browser console for errors
5. Check notification logs in localStorage

### Emails Not Sending
1. Verify SendGrid API key
2. Check `REACT_APP_FROM_EMAIL` is valid
3. Verify recipient email format
4. Check SendGrid account limits
5. Review console errors

### No Matching Donors
1. Check blood type compatibility rules
2. Verify donors have correct blood group
3. Ensure donors have at least one location match
4. Check if donors are marked as available

## Future Enhancements

- [ ] Twilio phone number verification
- [ ] Email template customization
- [ ] SMS character limit warnings
- [ ] Batch notification scheduling
- [ ] Notification read receipts
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Analytics dashboard

## API Reference

### Sending Notifications Programmatically

```javascript
import NotificationService from './services/NotificationService';

// Send SMS
await NotificationService.sendSMS('+1234567890', 'Message here');

// Send Email
await NotificationService.sendEmail(
  'user@example.com',
  'Subject',
  '<html>HTML content</html>'
);

// Notify Donor (Complete workflow)
const result = await NotificationService.notifyDonor(
  donorObject,
  requestObject,
  preferencesObject
);
```

## Support & Contribution

For issues or enhancements, please:
1. Check the troubleshooting section
2. Review notification logs
3. Verify environment variables
4. Check external service status
5. Contact support team

---

**Last Updated:** February 17, 2026
**Version:** 1.0.0
