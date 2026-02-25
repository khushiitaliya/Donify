# ✅ How to Enable Working Email Notifications (EmailJS Setup Guide)

## Why EmailJS?
- **FREE** - No credit card required
- **Easy** - 5 minutes setup
- **Reliable** - Real emails sent instantly
- **No Backend** - Works directly from React

---

## Step 1: Create EmailJS Account (2 minutes)

1. Go to **https://www.emailjs.com** 
2. Click **"Sign Up"**
3. Fill in your details (use Gmail or any email)
4. Verify your email
5. ✅ You're registered!

---

## Step 2: Connect Your Email (Gmail or Other Provider)

1. After login, go to **Dashboard**
2. Click **"Add Email Service"** 
3. Choose your provider:
   - **Gmail** (easiest) - Click authorize
   - Outlook/Yahoo/Custom SMTP - Also supported
4. Follow the authorization pop-up
5. ✅ Service connected!

---

## Step 3: Create an Email Template

1. Go to **Dashboard → Email Templates** (left menu)
2. Click **"Create New Template"**
3. Fill in:

   ```
   Template Name: Donify Blood Request (or any name)
   
   Subject: {{subject}}
   
   Content (text or HTML):
   {{message}}
   ```

4. Click **"Save Template"**
5. ✅ Template created!

---

## Step 4: Get Your API Credentials

### Find Service ID:
1. Go to **Email Services** (left menu)
2. Click on your service name
3. Copy the **Service ID** (looks like: `service_abc123xyz`)

### Find Template ID:
1. Go to **Email Templates** (left menu)
2. Click on "Donify Blood Request" template
3. Copy the **Template ID** (looks like: `template_abc123xyz`)

### Find Public Key:
1. Click your **Profile** (top right)
2. Go to **Account** tab
3. Click **API Keys**
4. Copy the **Public Key** (NOT Private Key!)

✅ **You now have all 3 IDs!**

---

## Step 5: Add Credentials to Your Project

1. Open your project folder
2. Create a file named `.env` (same level as `package.json`)
3. Add these lines:

```
REACT_APP_EMAILJS_SERVICE_ID=service_xxx...
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxx...
REACT_APP_EMAILJS_PUBLIC_KEY=yyy...
```

**Example (replace with your actual IDs):**
```
REACT_APP_EMAILJS_SERVICE_ID=service_a1b2c3d4e5f6g7h8
REACT_APP_EMAILJS_TEMPLATE_ID=template_x1y2z3a4b5c6d7e8
REACT_APP_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## Step 6: Restart Your App

1. Stop the React server (press `Ctrl+C` in terminal)
2. Run: `npm start`
3. Wait for app to load

---

## Step 7: Test It Works! 🎉

### Method 1: Send Test Notification
1. Login as Donor (john@example.com / donor123)
2. Scroll down to **"🧪 Test Notifications"** section
3. Click **"📨 Send Test Notification"**
4. Check your email inbox in 5-10 seconds
5. ✅ You should see the blood request notification email!

### Method 2: Create Actual Blood Request
1. Login as Hospital (city@hospital.com / hosp123)
2. Click **"Create Blood Request"**
3. Fill form and submit
4. ✅ All matching donors should receive email notifications instantly

---

## Troubleshooting

### ❌ "Email not received - Still getting demo message"

**Problem:** Still showing "Demo Mode" button
**Solution:**
- Check `.env` file has exact spelling: `REACT_APP_EMAILJS_SERVICE_ID`
- Restart server (Ctrl+C then npm start)
- Hard refresh browser (Ctrl+Shift+R)

### ❌ "Email received but content is blank"

**Problem:** Email arrives but message empty
**Solution:**
1. Go back to **EmailJS Dashboard**
2. Edit your template
3. Make sure it has `{{message}}` or `{{to_email}}`
4. Save and re-test

### ❌ "Authentication Error"

**Problem:** Console shows auth error
**Solution:**
1. Double-check Public Key (NOT Private Key!)
2. Go to emailjs.com → Account → API Keys
3. Copy ENTIRE key (no spaces before/after)
4. Replace in .env
5. Restart

### ❌ "Still not working?"

**Do this:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for messages starting with "📧" or "✅"
4. Try clicking "Send Test Notification" again
5. Look for error messages in console
6. Copy the error and google it (usually helps!)

---

## Free Credits & Limits

- **EmailJS Free Plan:**
  - 200 emails/month
  - No card required
  - Perfect for testing/small apps
  
- **Upgrade Options:**
  - Paid plans start at $25/month
  - Scaled for production use

---

## Security Notes ⚠️

1. **Never share your .env file** - It contains API credentials
2. **Add to .gitignore** - Prevent uploading to GitHub
   ```
   # .gitignore
   .env
   .env.local
   ```
3. **Public Key is safe** - EmailJS only allows sending emails (not stealing)
4. **Private Key is SECRET** - Never share or use in frontend

---

## Next Steps

Once emails are working:

1. ✅ Add an SMS service (optional)
   - Use Twilio for SMS/WhatsApp
   - Setup same way as EmailJS
   - Requires credit card (paid service)

2. ✅ Customize email templates
   - Add hospital logo
   - Add action buttons
   - Add donor incentives

3. ✅ Set up more email templates
   - Welcome email
   - Donation confirmation
   - Reminder emails

---

## Need Help?

- **EmailJS Docs:** https://www.emailjs.com/docs/
- **System Console Logs:** F12 → Console → Look for 📧 messages
- **Test Directly:** Login as donor and click "Send Test Notification"

---

**You're all set! Emails should now work perfectly.** 🎉

Need SMS too? See [SMS_SETUP.md](SMS_SETUP.md) for Twilio setup.
