# Quick Email Setup for Password Reset

## OPTION 1: Gmail (RECOMMENDED - 5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Scroll to "How you sign in to Google"
3. Click "2-Step Verification" → Turn it ON
4. Follow the prompts to set it up

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
   - Or search "Google App Passwords" in Google
2. Click "Select app" → Choose "Mail"
3. Click "Select device" → Choose "Other (Custom name)"
4. Type "Job Portal" and click "Generate"
5. **COPY the 16-character password** (looks like: `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

### Step 3: Update Your .env File

**Option A: Use Your Gmail** (hempatel777@gmail.com if you have Gmail)
```env
# Comment out or remove Yahoo settings
# YAHOO_USER=...
# YAHOO_APP_PASSWORD=...

# Add Gmail settings
GMAIL_USER=het.sondagar.10a.29@gmail.com
GMAIL_APP_PASSWORD=buwpcmtdpyorfjnl
EMAIL_FROM=het.sondagar.10a.29@gmail.com
FROM_NAME=Job Portal
FRONTEND_URL=https://job-portal-nine-rouge.vercel.app
```

**Option B: Create New Gmail for Job Portal**
```env
GMAIL_USER=yourjobportal@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password-no-spaces
EMAIL_FROM=yourjobportal@gmail.com
FROM_NAME=Job Portal
FRONTEND_URL=https://job-portal-nine-rouge.vercel.app
```

### Step 4: Restart Server
```bash
# Stop the server (Ctrl+C)
npm start
```

### Step 5: Verify in Logs
You should see:
```
🔄 Trying Gmail...
✅ Gmail transporter initialized successfully
```

---

## OPTION 2: Fix Yahoo (If you prefer Yahoo)

Yahoo SMTP is tricky and often blocks connections. Here's how to set it up:

### Step 1: Generate Yahoo App Password
1. Go to: https://login.yahoo.com/account/security
2. Scroll to "Generate app password"
3. Click "Generate password"
4. Select "Other App" → Type "Job Portal"
5. Click "Generate"
6. **COPY the password** (no spaces)

### Step 2: Update .env File
```env
# Yahoo Configuration
YAHOO_USER=hempatel777@yahoo.com
YAHOO_APP_PASSWORD=your-yahoo-app-password-no-spaces
EMAIL_FROM=hempatel777@yahoo.com
FROM_NAME=Job Portal
FRONTEND_URL=https://job-portal-nine-rouge.vercel.app

# Alternative: Try port 465 with SSL
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hempatel777@yahoo.com
SMTP_PASS=your-yahoo-app-password
```

### Step 3: If Yahoo Still Times Out

Yahoo often blocks connections from cloud servers. If it fails:
1. **Switch to Gmail** (much more reliable)
2. Or use a paid SMTP service like SendGrid
3. Check if your server's IP is blacklisted

---

## TESTING

### Test 1: Check Server Logs
After restarting, you should see:
```
✅ Gmail transporter initialized successfully  ← Good!
```

NOT:
```
⚠️ Using mock transporter  ← Bad! Emails won't send
```

### Test 2: Test Password Reset

**For Job Seeker (wiwibaby2008@gmail.com):**
1. Go to: http://localhost:3000/forgot-password
2. Enter: `wiwibaby2008@gmail.com`
3. Click "Send Reset Link"
4. Check email inbox (and spam folder!)

**For Employer (studygenie108@gmail.com):**
1. Go to: http://localhost:3000/employer-forgot-password
2. Enter: `studygenie108@gmail.com`
3. Click "Send Reset Link"
4. Check email inbox (and spam folder!)

### Expected Results
- ✅ Email arrives in inbox (or spam)
- ✅ Reset link works when clicked
- ✅ Can set new password

---

## TROUBLESHOOTING

### Issue: Still showing "Mock transporter"

**Check your .env file has NO SPACES in passwords:**
```env
# WRONG - has spaces
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop

# CORRECT - no spaces
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Issue: Gmail says "Invalid credentials"

1. Make sure 2FA is enabled FIRST
2. Generate a NEW app password
3. Copy password WITHOUT spaces
4. Restart server

### Issue: Email goes to spam

Normal! Add these to "safe senders":
- Your Gmail address
- Check spam folder first time

### Issue: Connection timeout (like now)

Your current issue! Yahoo is blocking the connection.
**Solution**: Switch to Gmail - it's more reliable.

---

## QUICK FIX FOR YOU RIGHT NOW

Based on your logs showing `hempatel777@yahoo.com`, here's what to do:

### If you have hempatel777@gmail.com:

1. **Create `.env` file** in `server/` folder with:
```env
# Database (keep your existing DB settings)
DATABASE_URL=your-existing-database-url

# Gmail Setup (ADD THIS)
GMAIL_USER=hempatel777@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
EMAIL_FROM=hempatel777@gmail.com
FROM_NAME=Job Portal

# Frontend
FRONTEND_URL=https://job-portal-nine-rouge.vercel.app

# JWT (keep existing)
JWT_SECRET=your-jwt-secret
```

2. **Get Gmail App Password**:
   - https://myaccount.google.com/apppasswords
   - Generate password for "Job Portal"
   - Copy 16 characters (remove spaces)
   - Paste in GMAIL_APP_PASSWORD

3. **Restart server**

4. **Test forgot-password** on both dashboards

---

## FOR RENDER DEPLOYMENT

If deploying to Render.com:

1. Go to Render Dashboard → Your Service
2. Click "Environment" tab
3. Add these variables:
   ```
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your16charpassword
   EMAIL_FROM=your-gmail@gmail.com
   FROM_NAME=Job Portal
   FRONTEND_URL=https://job-portal-nine-rouge.vercel.app
   ```
4. Click "Save Changes"
5. Service will auto-restart

---

## Summary

Your current issue: **Yahoo SMTP is timing out**

**Best solution**: 
1. Switch to Gmail (5 minutes to set up)
2. Generate App Password
3. Update .env with Gmail credentials
4. Restart server
5. Test password reset

**Gmail is 10x more reliable than Yahoo for SMTP!** 🚀

