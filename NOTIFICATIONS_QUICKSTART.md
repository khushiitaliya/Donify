# 🚀 How to Get Working Notifications (Quick Start)

## The Problem You're Experiencing
✅ You updated phone/email  
❌ But notifications aren't arriving in SMS/Email  
🔧 System is in "Demo Mode" - needs real API credentials

---

## The Solution (3 Steps, 10 Minutes)

### Step 1: Setup EmailJS (Easy - Free - Recommended)
**Time: 5 minutes**

1. Open https://www.emailjs.com → Sign Up (free, no card)
2. Verify your email
3. Dashboard → Add Email Service → Choose Gmail/Outlook → Authorize
4. Templates → Create Template → Copy the template ID
5. Account → API Keys → Copy Public Key
6. Email Services → Copy Service ID

**You now have 3 IDs!**

### Step 2: Add Credentials to Project
**Time: 2 minutes**

1. Open your project folder (React/donify)
2. Create `.env` file (same folder as package.json)
3. Add these 3 lines:
```
REACT_APP_EMAILJS_SERVICE_ID=service_YOUR_ID_HERE
REACT_APP_EMAILJS_TEMPLATE_ID=template_YOUR_ID_HERE  
REACT_APP_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE
```

### Step 3: Restart App & Test
**Time: 3 minutes**

1. Stop React server (Ctrl+C in terminal)
2. Run: `npm start`
3. Login as John (john@example.com / donor123)
4. Scroll to "🧪 Test Notifications" section
5. Click "📨 Send Test Notification"
6. ✅ Check your email inbox!

---

## Detailed Walkthrough with Screenshots

### Create EmailJS Account

```
1. Go to https://www.emailjs.com
2. Click "Sign Up" (top right or big button)
3. Email: your-email@gmail.com
4. Password: something strong
5. Click confirm email in inbox
```

### Connect Your Email

```
Dashboard appears after login

Look for: "Email Services" in left menu
Click: "Add Email Service" 
Choose: Gmail (easiest)
Follow: Authorization popup
Done! ✅
```

### Create Email Template

```
Left Menu → Email Templates
Click: "Create New Template"

Template Name: "Donify Blood Request"

Subject: {{subject}}

Content (paste this):
Blood Request Alert

Hi {{to_email}},

You have an urgent blood request matching your type.

Hospital needs: Read in email

Please respond ASAP.

Regards,
Donify Team

Click: "Save Template"
Copy: Template ID (shown after save)
```

### Get Your 3 API IDs

**Service ID:**
- Email Services (left menu)
- Click your Gmail service
- Copy the "Service ID"

**Template ID:**
- Email Templates (left menu)
- Click "Donify Blood Request"
- Copy the "Template ID"

**Public Key:**
- Profile icon (top right)
- Account → API Keys
- Copy "Public Key"

### Add to .env File

Create `.env` file in your project root:
```
C:\Users\Win 11\Documents\react\donify\.env
```

Paste:
```
REACT_APP_EMAILJS_SERVICE_ID=service_a1b2c3d4e5f6g7h8i9j0
REACT_APP_EMAILJS_TEMPLATE_ID=template_x1y2z3a4b5c6d7e8f9g0  
REACT_APP_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQrStUvWx
```

(Replace with YOUR actual IDs from EmailJS)

### Restart & Test

```bash
# Terminal: Stop current server (Ctrl+C)

# Terminal: Restart
npm start

# Browser: http://localhost:3000
# Login: john@example.com / donor123

# Find: "🧪 Test Notifications" section
# Click: "📨 Send Test Notification" button

# Check: Your email inbox
# Should see: Blood request notification email!
```

---

## What Happens After Setup

### For Hospital Staff
1. Login (city@hospital.com / hosp123)
2. Click "Create Blood Request"
3. Fill blood group, quantity, location
4. Click Submit
5. ✅ System finds matching donors
6. ✅ Each donor gets **ONE email** with request details
7. Hospital sees notification status showing who got notified

### For Donors  
1. Login (john@example.com / donor123)
2. Wait for blood request notification
3. Check email inbox
4. Click "Accept" or "Decline" in app
5. If accept → Update availability status
6. ✅ Hospital contacts you for details

### For Both
1. "🧪 Test Notifications" tab
2. Send yourself test email
3. See it arrive in inbox
4. Verify all details are correct

---

## Without EmailJS (Demo Mode)

If you DON'T add credentials:
- ✅ Notifications show in browser console (F12)
- ✅ Everything test works locally
- ✅ But real SMS/Email NOT sent
- ✅ Fine for development/testing
- ❌ Not suitable for production

---

## Optional: Add SMS (Twilio)

**For Real SMS/WhatsApp Notifications:**

1. Sign up at https://www.twilio.com
2. Get phone number
3. Get Account SID and Auth Token
4. Add to .env:
```
REACT_APP_TWILIO_ACCOUNT_SID=ACxxx...
REACT_APP_TWILIO_AUTH_TOKEN=xxx...
REACT_APP_TWILIO_PHONE_NUMBER=+1555...
```

See `SMS_SETUP.md` for detailed Twilio setup.

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Email not received | Check .env has exact spelling, restart app |
| "Demo Mode" message still showing | Restart server (Ctrl+C then npm start) |
| Auth error | Make sure you copied PUBLIC Key (not Private) |
| Email blank | Check template has {{message}} variable |
| Still not working | Open F12 → Console → Send test → Copy error → Google it |

---

## Success Checklist ✅

- [ ] Created EmailJS account
- [ ] Connected Gmail/email service
- [ ] Created email template
- [ ] Got 3 IDs (Service, Template, Public Key)
- [ ] Created .env file with all 3 credentials
- [ ] Restarted npm server
- [ ] Logged in as donor
- [ ] Found "Test Notifications" section
- [ ] Clicked "Send Test Notification"
- [ ] Received email in inbox
- [ ] Email shows blood request details

**All checked? 🎉 Congratulations, notifications are working!**

---

## Try It Now!

1. **Read** [EMAILJS_SETUP.md](EMAILJS_SETUP.md) for detailed instructions
2. **Setup** EmailJS account (5 min)
3. **Create** .env file (2 min)  
4. **Restart** app (1 min)
5. **Test** notifications (1 min)

**Total time: ~10 minutes**

---

## Questions?

- Check your browser console (F12) for error messages
- Go to EmailJS dashboard to verify credentials
- Check that .env file is in correct location
- Make sure you restarted npm start after creating .env

**You got this! 🚀**
