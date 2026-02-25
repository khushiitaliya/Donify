# Donify Notification System - Quick Reference Card

## 🚀 Quick Start (5 minutes)

```bash
# Step 1: Copy all files to your project directory
# (Already done - check file list below)

# Step 2: Create .env file (optional, for real services)
cp .env.example .env
# Then add your credentials

# Step 3: Start your React app
npm start

# Step 4: Test the system
# Hospital: Create a request
# Donor: Manage notification preferences
```

## 📁 Files to Copy

### New Services (Add to src/services/)
- ✅ `NotificationService.js` - Notification engine
- ✅ `bloodMatchingService.js` - Blood matching

### New Components (Add to src/components/)
- ✅ `NotificationPreferences.js` - Donor preferences UI
- ✅ `NotificationLogs.js` - Notification history

### Updated Files (Replace existing)
- 📝 `src/context/AuthContext.js`
- 📝 `src/pages/hospital/HospitalDashboard.js`
- 📝 `src/pages/donor/DonorDashboard.js`
- 📝 `src/data/mockData.js`

### Documentation (Add to project root)
- 📚 `QUICK_START.md`
- 📚 `NOTIFICATION_SYSTEM_GUIDE.md`
- 📚 `ARCHITECTURE.md`
- 📚 `.env.example`

## 🔑 Environment Variables (Optional)

```env
# For Twilio SMS & WhatsApp
REACT_APP_TWILIO_ACCOUNT_SID=ACxxx
REACT_APP_TWILIO_AUTH_TOKEN=xxx
REACT_APP_TWILIO_PHONE_NUMBER=+1555-0150

# For SendGrid Email
REACT_APP_SENDGRID_API_KEY=SG.xxx
REACT_APP_FROM_EMAIL=noreply@donify.com
```

**Note**: Leave blank for demo mode

## 🧪 Demo Credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Hospital | city@hospital.com | hosp123 | Can create blood requests |
| Donor | john@example.com | donor123 | A+ Blood, Downtown |
| Donor | priya@example.com | donor123 | O- Blood (Universal) |
| Donor | mike@example.com | donor123 | B+ Blood, Uptown |

## 📱 How It Works

### Hospital Creates Request
1. Login as hospital
2. Dashboard → "Create Emergency Request"
3. Fill: Blood Group, Quantity, Location, Urgency
4. Submit → Automatic notifications sent
5. See: Which donors notified, delivery status

### Donor Receives Notifications
1. Hospital sends request
2. System finds matching donors
3. Respects donor preferences (SMS/WhatsApp/Email)
4. Applies urgency filter
5. Donor receives notification on chosen channels

### Donor Manages Preferences
1. Login as donor
2. Dashboard → "Notification Preferences"
3. Toggle channels: SMS, WhatsApp, Email
4. Set urgency filter: All, High, Critical
5. Save → Preferences persisted

## 🎯 Key Features

| Feature | Details |
|---------|---------|
| **Auto-Matching** | Finds compatible donors by blood type |
| **Smart Scoring** | Ranks donors: Blood (50%), Location (25%), Availability (25%) |
| **Multi-Channel** | SMS, WhatsApp, Email in parallel |
| **Preferences** | Donors control how they receive alerts |
| **Filtering** | Urgency level filtering (All/High/Critical) |
| **Tracking** | Hospital sees delivery status per donor |
| **Logging** | Full notification history in localStorage |
| **Demo Mode** | Works without external services |
| **Production** | Supports Twilio & SendGrid |

## 🩸 Blood Type Compatibility

Who can donate to whom:
- **O-** → Everyone (Universal Donor)
- **O+** → O+, A+, B+, AB+
- **A-** → A-, A+, AB-, AB+
- **A+** → A+, AB+
- **B-** → B-, B+, AB-, AB+
- **B+** → B+, AB+
- **AB-** → AB-, AB+
- **AB+** → AB+ only (Universal Recipient)

## 🔧 Configuration

### Enable Notifications (in NotificationService.js)
```javascript
this.serviceConfig.sms.enabled = true;
this.serviceConfig.whatsapp.enabled = true;
this.serviceConfig.email.enabled = true;
```

### View Notification Logs
```javascript
// In Browser Console
JSON.parse(localStorage.getItem('donify_notification_logs'))
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No matching donors | Check blood type compatibility, donor availability |
| Notifications say "Simulated" | Normal without external services, add .env credentials |
| Phone error | Use E.164 format: +1-555-0150 → +15550150 |
| Email not arriving | Check spam, verify sender in SendGrid |
| Preferences not saving | Check browser localStorage is enabled |
| Console errors | Verify all imports, check file paths |

## 📊 Understanding the System

```
Hospital Creates Request
     ↓
Find Compatible Donors (bloodMatchingService)
     ↓
Check Donor Preferences (notificationPreferences)
     ↓
Check Urgency Filter
     ↓
Send SMS/WhatsApp/Email (NotificationService)
     ↓
Track Status (localStorage + AuthContext)
     ↓
Show Confirmation to Hospital
     ↓
Donor Receives Notification
```

## 🎓 Key Components

| Component | Purpose |
|-----------|---------|
| NotificationService | Core notification engine |
| bloodMatchingService | Blood type compatibility |
| NotificationPreferences | Donor settings UI |
| NotificationLogs | History viewer |
| AuthContext | State management |

## 📚 Documentation

- **QUICK_START.md** → Setup in 5 minutes
- **NOTIFICATION_SYSTEM_GUIDE.md** → Complete reference
- **ARCHITECTURE.md** → System design & flow
- **This file** → Quick reference

## 🔐 Security Notes

- ✅ API keys in .env (not in code)
- ✅ Never commit .env to git
- ✅ Phone numbers validated
- ✅ Emails validated
- ✅ No sensitive data logged
- ✅ Secure localStorage usage

## 📞 Common Tasks

### Add New Donor
1. Update mockData.js donors array
2. Add email to users array
3. Include phone, preferences, notificationLog

### Change Notification Message
1. Edit `generateSMSMessage()` in NotificationService.js
2. Edit `generateEmailContent()` for email templates
3. Changes apply to all future requests

### View All Notifications Sent
Browser Console:
```javascript
JSON.parse(localStorage.getItem('donify_notification_logs'))
```

### Clear Notification Logs
Browser Console:
```javascript
localStorage.removeItem('donify_notification_logs')
```

### Check Service Status
Browser Console:
```javascript
import NotificationService from './services/NotificationService'
NotificationService.getStatus()
```

## ⚡ Performance Tips

- Notifications run asynchronously (non-blocking)
- Max 5 donors notified per request (configurable)
- SMS/WhatsApp/Email sent in parallel
- Logs trimmed to 100 entries automatically
- Match scoring uses fast algorithms
- Mobile optimized components

## 🎉 You're All Set!

**Demo Mode**: Works immediately, no setup needed
**Real Services**: Add .env credentials for live SMS/Email
**Testing**: Use demo credentials provided
**Production**: Deploy with real service credentials

---

## 📞 Quick Support

**Q: System not working?**
A: Check console (F12) for errors, verify imports

**Q: Notifications in demo mode?**
A: Normal! Add .env for real services

**Q: Want to test real services?**
A: Sign up for Twilio & SendGrid (free tier available)

**Q: How to add more donors?**
A: Edit src/data/mockData.js donors array

**Q: Preferences not saving?**
A: Check browser localStorage enabled

---

## 🚀 Next Steps

1. ✅ Copy all implementation files
2. ✅ Test with demo credentials
3. ⬜ (Optional) Add .env for real services
4. ⬜ (Optional) Set up Twilio & SendGrid
5. ⬜ Monitor notification logs
6. ⬜ Deploy to production

---

**Status**: ✅ Ready to Use  
**Setup Time**: 5 minutes  
**Learning Curve**: Low  
**Support**: See documentation files  

**Happy blood saving! 🩸❤️**
