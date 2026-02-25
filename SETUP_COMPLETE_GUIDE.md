# 📬 Donify Notifications - Complete Setup & Testing Guide

## Current Status ✅

Your app now has:
- ✅ Contact information editor (phone + email)
- ✅ Contact preference selector (choose phone OR email)
- ✅ Real email support (via EmailJS - FREE)
- ✅ Test notification panel (send test emails)
- ✅ Notification logging (track all messages)
- ✅ Demo mode (when no credentials configured)

---

## The Problem You Reported

❌ **Updated phone/email but notifications not arriving**

### Root Cause
The system was in **Demo Mode** because API credentials weren't configured. Demo mode only logs to console, doesn't send real emails/SMS.

### The Solution
Configure **EmailJS** (free service) to send real emails.

---

## Quick Path to Working Notifications

### ⏱️ Time Required: **~10 minutes**

**Step 1:** Sign up at emailjs.com (2 min)  
**Step 2:** Get your 3 API credentials (3 min)  
**Step 3:** Add to .env file (2 min)  
**Step 4:** Restart app & test (3 min)  

---

## Full Setup Instructions

### Part 1: Create EmailJS Account

1. **Open** https://www.emailjs.com
2. **Click** "Sign Up" (free, no credit card)
3. **Enter** your email and password
4. **Verify** email confirmation link
5. **Login** to EmailJS

✅ **Account created!**

### Part 2: Connect Your Email Service

1. **Go** to EmailJS Dashboard
2. **Click** "Add Email Service" (left menu)
3. **Choose** Gmail or your email provider
4. **Click** "Connect Account"
5. **Authorize** the popup
6. **Confirm** service connected

✅ **Email service connected!**

### Part 3: Create Email Template

1. **Go** to Email Templates (left menu)
2. **Click** "Create New Template"
3. **Name it:** "Donify Blood Request"
4. **Subject:** `{{subject}}`
5. **Content:** `{{message}}`
6. **Click** "Save Template"
7. **Copy** the Template ID shown

✅ **Template created!**

### Part 4: Get Your 3 API Credentials

**Credential 1: Service ID**
- Email Services (left menu)
- Click your service
- Copy **Service ID**

**Credential 2: Template ID**
- Email Templates (left menu)
- Click "Donify Blood Request"
- Copy **Template ID**

**Credential 3: Public Key**
- Profile icon (top right)
- Account → API Keys
- Copy **Public Key** (NOT Private)

✅ **You have all 3 IDs!**

### Part 5: Add to .env File

1. **Create** new file: `.env`
   - Location: `C:\Users\Win 11\Documents\react\donify\.env`
   - Same folder as `package.json`

2. **Add these** 3 lines:
```
REACT_APP_EMAILJS_SERVICE_ID=service_YOUR_ID_HERE
REACT_APP_EMAILJS_TEMPLATE_ID=template_YOUR_ID_HERE
REACT_APP_EMAILJS_PUBLIC_KEY=YOUR_KEY_HERE
```

3. **Replace** `YOUR_ID_HERE` with your actual IDs from EmailJS

**Example:**
```
REACT_APP_EMAILJS_SERVICE_ID=service_a1b2c3d4e5f6g7h8
REACT_APP_EMAILJS_TEMPLATE_ID=template_x1y2z3a4b5c6d7e8
REACT_APP_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQrStUvW
```

✅ **.env file created with credentials!**

### Part 6: Restart App

1. **Terminal:** Stop server (press `Ctrl+C`)
2. **Terminal:** Run `npm start`
3. **Wait** for server to start
4. **Browser** should open http://localhost:3000

✅ **App restarted with credentials loaded!**

### Part 7: Test It Works!

**Method 1: Send Test Email**
1. **Login** as John: `john@example.com` / `donor123`
2. **Scroll down** to "🧪 Test Notifications" section
3. **Click** "📨 Send Test Notification"
4. **Check** your email inbox (5-10 seconds)
5. ✅ You should see the blood request notification!

**Method 2: Create Real Blood Request**
1. **Logout** and login as Hospital: `city@hospital.com` / `hosp123`
2. **Click** "Create Blood Request"
3. **Fill** form: A+, 2 units, Downtown, High
4. **Click** Submit
5. **Check** console (F12) to see donors were notified
6. ✅ Matching donors receive email notifications!

---

## Understanding the Flow

### How Blood Requests Work

```
Hospital creates request
    ↓
System finds matching donors (based on blood group)
    ↓
For each matching donor:
  - Check if they have contact preference set
  - Check if they have phone/email correspondingly
  - If donor hasn't been notified for THIS request:
    - Send ONE notification via their preferred method
    - Mark them as notified (prevent duplicates)
  - Save notification in donor's history
    ↓
Hospital dashboard shows:
  - Who was notified
  - Which contact method (SMS or Email)
  - Success/failure status
```

### How Contact Preferences Work

```
Donor updates profile:
  1. Add phone number and/or email
  2. Choose preference: "📱 Phone" or "📧 Email"
  3. Save preference
    ↓
When hospital creates request matching donor's blood:
  - If preference = "📱 Phone": Donor gets SMS
  - If preference = "📧 Email": Donor gets Email
  - Only their chosen method (not both)
  - Only ONCE per request (no duplicates)
```

---

## What Each Component Does

### 📧 Contact Info Editor
- **Where:** Donor Dashboard → "✏️ Edit Contact Info" button
- **What:** Update phone number and email
- **Why:** Required before can set contact preference

### 📱 Contact Preference Selector
- **Where:** Donor Dashboard → "How to Receive Blood Requests?" section
- **What:** Radio buttons to choose Phone OR Email
- **Why:** Controls HOW notifications are sent

### 🧪 Test Notification Panel
- **Where:** Bottom of Donor Dashboard
- **What:** Send yourself a test blood request email
- **Why:** Verify everything works before real requests

### 📋 Notification Logs
- **Where:** Inside Test Notification section
- **What:** Shows all test notifications sent
- **Why:** Debug and verify emails being sent

---

## File Structure

```
donify/
├── .env                          ← Create this with credentials
├── EMAILJS_SETUP.md             ← Step-by-step EmailJS guide
├── NOTIFICATIONS_QUICKSTART.md  ← This quick guide
├── src/
│   ├── services/
│   │   ├── NotificationService.js    ← Sends emails/SMS
│   │   └── bloodMatchingService.js   ← Finds matching donors
│   ├── components/
│   │   ├── ContactPreferenceSelector.js  ← Phone/Email choice
│   │   ├── TestNotificationPanel.js      ← Send test emails
│   │   └── Modal.js
│   ├── context/
│   │   └── AuthContext.js   ← Main orchestration
│   └── pages/
│       ├── hospital/
│       │   └── HospitalDashboard.js
│       └── donor/
│           └── DonorDashboard.js   ← Uses all above
```

---

## Testing Scenarios

### Scenario 1: Test Single Donor Email
1. Donor: john@example.com → Edit Contact → Add phone + email
2. Set preference → "📧 Email"
3. Scroll down → Test Notifications → Send Test
4. Check email inbox ✅

### Scenario 2: Create Real Request
1. Hospital: city@hospital.com → Create Blood Request
2. Choose A+ (John's blood type)
3. System automatically notifies John via email
4. View notification status in modal ✅

### Scenario 3: Prevent Duplicate Notifications
1. Create request for A+ → John gets notified
2. Create another A+ request → John shows "Already Notified"
3. Only gets ONE email total ✅

### Scenario 4: Test SMS (with Twilio)
1. Add Twilio credentials to .env
2. Donor sets preference → "📱 Phone"
3. Create request → SMS sent to phone number ✅

---

## Troubleshooting

### Problem: Still showing "Demo Mode"

**Cause:** .env file not in right location or credentials wrong

**Solution:**
1. Check .env is in: `C:\Users\Win 11\Documents\react\donify\.env`
2. Check exact spelling: `REACT_APP_EMAILJS_SERVICE_ID` (not EMAILID)
3. Make sure you restarted `npm start`
4. Hard refresh browser: Ctrl+Shift+R

### Problem: Email not received

**Cause:** Wrong credentials or email not authorized

**Solution:**
1. Go to EmailJS dashboard
2. Verify sender email is authorized
3. Double-check all 3 IDs are correct
4. Check spam folder
5. Wait 30 seconds (email takes time)

### Problem: Blank emails

**Cause:** Email template missing variables

**Solution:**
1. Go to EmailJS → Templates
2. Edit "Donify Blood Request" template
3. Make sure content has: `{{message}}` or `{{to_email}}`
4. Save and retry

### Problem: Get error: "Authentication failed"

**Cause:** Public Key vs Private Key confusion

**Solution:**
1. Go to EmailJS Account → API Keys
2. Make sure you copied **Public Key** (not Private!)
3. Private Key uses: `pk_xxx`
4. Public Key uses: just alphanumeric like: `AbCdEfGhIjKlMnOpQr`

### Problem: Notifications not showing in Hospital Dashboard

**Cause:** Notification status loads async

**Solution:**
1. Wait 2-3 seconds after creating request
2. Modal should appear showing who was notified
3. If modal doesn't show, check console (F12) for errors

---

## Optional: Add SMS Notifications (Twilio)

### When to Add SMS

- ✅ If you want phone notifications in addition to email
- ✅ For urgent blood requests (SMS faster than email)
- ✅ For donors without compatible email

### How to Add Twilio

1. Sign up at https://www.twilio.com
2. Get Account SID and Auth Token
3. Get a phone number
4. Add to .env:
```
REACT_APP_TWILIO_ACCOUNT_SID=ACxxx...
REACT_APP_TWILIO_AUTH_TOKEN=xxx...
REACT_APP_TWILIO_PHONE_NUMBER=+15550150
```

See [SMS_SETUP.md](SMS_SETUP.md) for detailed instructions.

---

## Production Deployment

### Before Going Live

- [ ] Test all 3 notification methods work
- [ ] Set up real domain (not localhost)
- [ ] Create production Twilio/SendGrid accounts
- [ ] Store credentials securely (not in code)
- [ ] Use environment-specific .env files
- [ ] Test spam filters (emails might be filtered)
- [ ] Set up monitoring/logging

### Recommended Credentials Storage

For production, DON'T put credentials in .env (too risky). Instead:
- Use environment variables in hosting platform
- Use secret management service
- Use CI/CD pipeline to inject at deploy time

---

## Demo vs Production

### Demo Mode (No Credentials)
- ✅ Notifications log to console
- ✅ Great for development
- ✅ No real emails sent
- ❌ Donors don't receive notifications

### Production Mode (With Credentials)
- ✅ Real emails sent instantly
- ✅ SMS notifications available
- ✅ Hospital gets feedback
- ✅ Fully functional app

---

## Success Indicators ✅

Your system is working correctly when:

1. ✅ Can update phone/email in Donor Dashboard
2. ✅ Can select phone OR email preference
3. ✅ "Send Test Notification" button is enabled
4. ✅ Clicking it sends test email
5. ✅ Email arrives in inbox within 30 seconds
6. ✅ Email contains blood request details with hospital name
7. ✅ Hospital creating request shows notification status modal
8. ✅ Modal shows which donors were notified and via which method
9. ✅ Donors don't receive duplicate notifications for same request
10. ✅ Browser console shows no errors (F12 → Console)

**All 10 items green? 🎉 You're production ready!**

---

## Quick Reference

| Feature | Status | How to Enable |
|---------|--------|---------------|
| Contact Info Editor | ✅ Built | Click "✏️ Edit Contact Info" |
| Contact Preference | ✅ Built | Set phone OR email preference |
| Email Notifications | ⚙️ Needs Config | Add EmailJS credentials to .env |
| Test Notifications | ✅ Built | Click "Send Test Notification" |
| SMS Notifications | ⚙️ Optional | Add Twilio credentials to .env |
| Notification Logs | ✅ Built | Click "Show Logs" in Test panel |

---

## Next Steps

1. **Now:** Follow [EMAILJS_SETUP.md](EMAILJS_SETUP.md) to get email working
2. **After Email Works:** Test blood request flow end-to-end
3. **Optional:** Add Twilio for SMS notifications
4. **Finally:** Deploy to production!

---

## Support Resources

- **EmailJS Help:** https://www.emailjs.com/docs/
- **Twilio Help:** https://www.twilio.com/docs/
- **Your Browser Console:** F12 → Console → Look for 📧 messages
- **Test Directly:** Login as donor → Test Notification → Send

---

**You've got all the tools! Time to enable those notifications! 🚀**
