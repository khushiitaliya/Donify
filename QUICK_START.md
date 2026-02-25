# Donify Notification System - Quick Start Guide

## 5-Minute Setup

### 1. Add Environment Variables
Create `.env` file in your project root:

```env
# Twilio (SMS & WhatsApp)
REACT_APP_TWILIO_ACCOUNT_SID=ACxxxxx
REACT_APP_TWILIO_AUTH_TOKEN=your_token
REACT_APP_TWILIO_PHONE_NUMBER=+1555-0150
REACT_APP_TWILIO_WHATSAPP_NUMBER=+1555-0150

# SendGrid (Email)
REACT_APP_SENDGRID_API_KEY=SG.xxxxx
REACT_APP_FROM_EMAIL=noreply@donify.com
```

### 2. Enable Notification Channels
In `src/services/NotificationService.js`, update:

```javascript
this.serviceConfig.sms.enabled = true;
this.serviceConfig.whatsapp.enabled = true;
this.serviceConfig.email.enabled = true;
```

### 3. Test in Demo Mode
Without external service setup, the system automatically runs in simulation mode:
- Logs to browser console
- Stores logs in localStorage
- Shows simulated status to users

## How It Works

### For Hospitals
1. Navigate to Hospital Dashboard
2. Click **"+ New Request"**
3. Fill in:
   - Blood Group (e.g., "A+")
   - Units Required (e.g., 2)
   - Location (e.g., "Downtown")
   - Urgency Level (Low, Medium, High, Critical)
4. Click **"Send Request"**
5. See notification status showing:
   - ✅ Which donors were notified
   - 📱📧💬 Which channels (SMS, Email, WhatsApp)
   - Current delivery status

### For Donors
1. Navigate to Donor Dashboard
2. Scroll to **"Notification Preferences"**
3. Select preferred notification methods:
   - 📱 SMS Notifications
   - 💬 WhatsApp Messages
   - 📧 Email Notifications
4. Set urgency filter (All, High, Critical)
5. Click **"Save Preferences"**
6. When hospitals send requests, you'll receive notifications on enabled channels

## Testing the System

### Option A: Demo Mode (No External Services)
```javascript
// The system works immediately!
// Just create a request and check:
// 1. Browser console for notification logs
// 2. localStorage: 
JSON.parse(localStorage.getItem('donify_notification_logs'))
```

### Option B: With Real Services (Twilio + SendGrid)

**Get Free Test Credits:**
1. **Twilio**: https://www.twilio.com/console
   - Free trial account with $15 credit
   - SMS to verified numbers

2. **SendGrid**: https://sendgrid.com
   - Free tier: 100 emails/day
   - Full API access

## Real Service Setup

### Twilio SMS Setup
1. Create account at https://twilio.com
2. Copy **Account SID** and **Auth Token** from dashboard
3. Get a phone number (or use your sandbox number)
4. Add verified recipient numbers
5. Add credentials to `.env`

### SendGrid Email Setup
1. Create account at https://sendgrid.com
2. Go to Settings → API Keys
3. Create new key and save
4. Add to `.env` as `REACT_APP_SENDGRID_API_KEY`

## Example Workflows

### Scenario 1: Hospital Emergency Request
```
Hospital Dashboard → Create Request
  ↓
Blood Group: A+ | Quantity: 3 | Location: Downtown | Urgency: Critical
  ↓
System finds donors matching A+ in Downtown
  ↓
Sends SMS to: John Doe, Priya Kumar
  ↓
Sends Email to: All matching donors (if enabled)
  ↓
Sends WhatsApp to: Available donors with WhatsApp preference
  ↓
Hospital sees confirmation with delivery status
```

### Scenario 2: Donor Preference Management
```
Donor Dashboard → Notification Preferences
  ↓
✅ SMS Notifications
✅ WhatsApp Messages
❌ Email Notifications (disabled)
Urgency Filter: High & Critical only
  ↓
Save Preferences
  ↓
Donor only receives SMS/WhatsApp for High/Critical requests
```

## Key Features

| Feature | Details |
|---------|---------|
| **Smart Matching** | Finds donors by blood group, location, availability |
| **Multi-Channel** | SMS, WhatsApp, Email notifications |
| **Preferences** | Donors control how they receive requests |
| **Urgency Filter** | Donors can filter by request urgency |
| **Tracking** | Hospital sees who was notified and status |
| **Logs** | Complete notification history |
| **Demo Mode** | Works without external services |

## Troubleshooting

**Q: Notifications not sending?**
A: 
- Check `.env` file is created and variables set
- Enable services in NotificationService.js
- Check browser console for errors
- Review localStorage logs

**Q: Demo mode showing "simulated"?**
A: 
- This is normal without external services
- Notifications are logged locally
- Set `enabled = true` in config to switch

**Q: How do I see notification logs?**
A: 
- Browser Console → Find "📬 Notification Log" entries
- Or use: `JSON.parse(localStorage.getItem('donify_notification_logs'))`

**Q: Donors not receiving emails?**
A:
- Check SendGrid API key is correct
- Verify email addresses are valid
- Check spam folder
- Ensure account hasn't exceeded rate limits

## File Changes Summary

### New Files Created
- `src/services/NotificationService.js` - Core notification engine
- `src/services/bloodMatchingService.js` - Blood type matching logic
- `src/components/NotificationPreferences.js` - Donor preferences UI
- `src/components/NotificationLogs.js` - Notification history viewer
- `NOTIFICATION_SYSTEM_GUIDE.md` - Full documentation

### Files Updated
- `src/context/AuthContext.js` - Added notification logic
- `src/pages/hospital/HospitalDashboard.js` - Enhanced with feedback
- `src/pages/donor/DonorDashboard.js` - Added preferences panel
- `src/data/mockData.js` - Added contact info

## Next Steps

1. ✅ Copy all files to your project
2. ✅ Update imports in components
3. ⬜ Create `.env` file with variables
4. ⬜ Enable notification channels
5. ⬜ Test creating a request
6. ⬜ (Optional) Set up Twilio/SendGrid for real notifications

## Default Test Credentials

The system comes with demo donors:
- **John Doe**: A+, Downtown, john@example.com, +1234567890
- **Priya Kumar**: O-, Downtown, priya@example.com, +1234567891
- **Mike Johnson**: B+, Uptown, mike@example.com, +1234567892

Hospital:
- **City General Hospital**: city@hospital.com, password: hosp123

All have SMS, WhatsApp, and Email enabled in preferences.

## Performance Tips

- Notifications sent asynchronously (non-blocking)
- Max 5 best-matching donors notified per request
- Logs trimmed to 100 recent entries
- localStorage optimized for mobile
- Batch operations where possible

## Security Notes

- API keys in `.env` (never in code)
- Sensitive data not logged
- Phone numbers in E.164 format
- Email validation before sending
- CORS-friendly API calls

---

**Ready to go!** Create your first blood request and watch the notification system in action.

For detailed information, see `NOTIFICATION_SYSTEM_GUIDE.md`
