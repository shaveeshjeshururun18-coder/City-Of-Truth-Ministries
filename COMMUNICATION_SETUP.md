# Advanced Communication System - Configuration Guide

This guide provides detailed instructions for configuring the Advanced Communication System for City of Truth Ministries.

## Overview

The Advanced Communication System enables administrators to:
- Send SMS notifications to members and visitors
- Broadcast multi-channel announcements (SMS, Email, In-App)
- Manage external contact lists
- Track message delivery status
- Control communication permissions
- Audit all communication actions

## Prerequisites

Before configuring the communication system, ensure:
- [ ] You have admin access to the application
- [ ] You have access to Firebase console
- [ ] You have a Twilio account (for SMS)
- [ ] You have an EmailJS account (for email)
- [ ] Node.js and npm are installed
- [ ] Firebase CLI is installed

## Quick Start

### Step 1: Environment Configuration

1. Copy `.env` to `.env.local`:
   ```bash
   cp .env .env.local
   ```

2. Edit `.env.local` and fill in the required values (see sections below)

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 2: Twilio SMS Setup (Required for SMS features)

#### 2.1 Create Twilio Account

1. Visit https://www.twilio.com/try-twilio
2. Sign up for a free trial account (includes free credits)
3. Verify your email and phone number

#### 2.2 Get Twilio Credentials

1. Log in to https://console.twilio.com
2. From the dashboard, locate:
   - **Account SID** (starts with "AC...")
   - **Auth Token** (click to reveal)
3. Copy these values

#### 2.3 Get Twilio Phone Number

1. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click **Buy a Number** (or use your trial number)
3. Select a number with SMS capabilities
4. Copy the phone number (format: +1234567890)

#### 2.4 Configure Environment Variables

Add to `.env.local`:
```env
# Twilio SMS Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_32_character_auth_token
VITE_TWILIO_PHONE_NUMBER=+12345678901

# Enable SMS
VITE_ENABLE_SMS=true
```

#### 2.5 Twilio Trial Account Limitations

**Important**: Trial accounts have restrictions:
- Can only send to verified phone numbers
- Messages include "Sent from a Twilio trial account" prefix
- Limited free credits ($15 USD typically)

To verify a phone number:
1. Go to https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click **Add a new Caller ID**
3. Enter the phone number and verify via SMS/call

**Production**: Upgrade to a paid account to remove restrictions.

### Step 3: EmailJS Setup (Required for Email features)

#### 3.1 Create EmailJS Account

1. Visit https://www.emailjs.com/
2. Sign up for a free account (200 emails/month free tier)
3. Verify your email address

#### 3.2 Connect Email Service

1. Log in to https://dashboard.emailjs.com
2. Navigate to **Email Services** → **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection wizard:
   - For Gmail: Sign in with Google and grant permissions
   - For Outlook: Sign in with Microsoft account
   - For SMTP: Enter your SMTP server details
5. Note your **Service ID** (shown after connection)

#### 3.3 Create Email Template

1. Navigate to **Email Templates** → **Create New Template**
2. Name: "Ministry Announcement"
3. Template content:
   ```html
   Subject: {{subject}}
   
   From: City of Truth Ministries
   
   {{message}}
   
   ---
   This message was sent from City of Truth Ministries Communication System.
   ```
4. Template variables to include:
   - `{{subject}}` - Email subject
   - `{{message}}` - Email body content
   - `{{recipient_name}}` - Recipient name (optional)
5. Save and note your **Template ID**

#### 3.4 Get Public Key

1. Navigate to **Account** → **General**
2. Locate **Public Key** (or **User ID** in older versions)
3. Copy the key

#### 3.5 Configure Environment Variables

Add to `.env.local`:
```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Step 4: Configure Feature Flags

Customize communication system behavior in `.env.local`:

```env
# Communication Feature Flags
VITE_ENABLE_SMS=true              # Set to false to disable SMS features
VITE_SMS_RATE_LIMIT=5            # Messages per second (1-10 recommended)
VITE_MAX_SMS_RECIPIENTS=500      # Maximum recipients per send (max: 500)
```

#### Feature Flag Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENABLE_SMS` | `false` | Enable/disable SMS functionality |
| `VITE_SMS_RATE_LIMIT` | `5` | SMS sending rate (messages/second) |
| `VITE_MAX_SMS_RECIPIENTS` | `500` | Maximum SMS recipients per send |

**Rate Limiting Notes**:
- Twilio trial accounts: Use `VITE_SMS_RATE_LIMIT=1` to avoid rate limiting
- Twilio standard accounts: `5` is safe for most use cases
- Twilio high-volume accounts: Can increase up to `10`

### Step 5: Firestore Setup

#### 5.1 Deploy Firestore Indexes

The communication system requires specific indexes for efficient queries:

```bash
firebase deploy --only firestore:indexes
```

Required indexes are defined in `firestore.indexes.json` (created by task 1.2).

#### 5.2 Deploy Security Rules

Deploy security rules to protect communication data:

```bash
firebase deploy --only firestore:rules
```

Security rules enforce:
- Only admins can create announcements
- Users can only read their own notifications
- Delivery records are read-only (server-side writes only)
- Audit logs are admin-only

#### 5.3 Verify Firestore Collections

After first use, verify these collections exist:
- `announcements` - Stores announcements
- `contactLists` - Stores contact lists
- `contacts` - Stores individual contacts
- `deliveryRecords` - Tracks delivery status
- `communicationPermissions` - User permissions
- `communicationAuditLog` - Audit trail

### Step 6: Grant Communication Permissions

By default, only users with Admin role can access communication features.

#### 6.1 Grant Permissions to Non-Admin Users

1. Log in as Admin
2. Navigate to **Admin Dashboard** → **Communication** tab
3. Click **Permissions** section
4. Select a user
5. Toggle permissions:
   - **Create Announcements** - User can draft announcements
   - **Send Announcements** - User can send announcements
   - **Manage Contact Lists** - User can manage contact lists
6. Click **Save**

#### 6.2 Permission Levels

| Permission | Description | Allows |
|------------|-------------|---------|
| **Create Announcements** | Draft announcements | Create and edit draft announcements |
| **Send Announcements** | Send to recipients | Send announcements after creation |
| **Manage Contact Lists** | Contact management | Create, import, and manage contact lists |

**Best Practice**: Grant "Create Announcements" to content creators and reserve "Send Announcements" for authorized staff.

## Testing Your Configuration

### Test 1: SMS Delivery

1. Navigate to **Communication Dashboard** → **SMS** tab
2. Compose a test message: "Test SMS from City of Truth Ministries"
3. Select your verified phone number as recipient
4. Click **Send SMS**
5. Check your phone for the message
6. Verify delivery status shows "Delivered"

**Expected Result**: SMS received within 30 seconds

**Troubleshooting**:
- SMS not received → Check phone number format (+1234567890)
- "Unverified number" error → Verify number in Twilio console (trial accounts)
- "Authentication failed" → Check ACCOUNT_SID and AUTH_TOKEN

### Test 2: Email Delivery

1. Navigate to **Communication Dashboard** → **Announcements** tab
2. Click **New Announcement**
3. Fill in:
   - Title: "Test Announcement"
   - Content: "This is a test email from the communication system"
   - Channels: Check "Email" only
   - Recipients: Select your email address
4. Click **Preview** to verify formatting
5. Click **Send Announcement**
6. Check your email inbox (and spam folder)
7. Verify delivery status shows "Delivered"

**Expected Result**: Email received within 2 minutes

**Troubleshooting**:
- Email not received → Check spam/junk folder
- Email in spam → Add sending address to contacts
- "Service not found" → Check SERVICE_ID
- "Template not found" → Check TEMPLATE_ID

### Test 3: Multi-Channel Announcement

1. Create an announcement with all channels selected:
   - SMS
   - Email
   - In-App Notification
2. Send to yourself (if possible) or a test user
3. Verify all three channels deliver successfully
4. Check **Delivery Tracking** for status

**Expected Result**: All three channels show "Delivered"

### Test 4: Contact List Import

1. Create a CSV file with test contacts:
   ```csv
   name,email,phone
   John Doe,john@example.com,+12345678901
   Jane Smith,jane@example.com,+12345678902
   ```
2. Navigate to **Contact Lists** tab
3. Click **New List** → Name: "Test Contacts"
4. Click **Import CSV** and select your file
5. Verify import summary shows 2 imported, 0 failed

**Expected Result**: Contacts imported successfully

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured in production environment
- [ ] Twilio account upgraded from trial (if using SMS extensively)
- [ ] EmailJS account tier verified (free tier = 200 emails/month)
- [ ] Firestore indexes deployed
- [ ] Firestore security rules deployed
- [ ] Test announcements sent successfully
- [ ] Delivery tracking verified
- [ ] Audit logging confirmed working

### Production Environment Variables

Configure these in your hosting platform:

**Firebase Hosting**:
```bash
firebase functions:config:set twilio.account_sid="ACxxx" twilio.auth_token="xxx"
```

**Vercel**:
1. Project Settings → Environment Variables
2. Add each `VITE_*` variable
3. Redeploy application

**Netlify**:
1. Site Settings → Build & Deploy → Environment
2. Add each `VITE_*` variable
3. Trigger new deploy

### Security Best Practices

1. **Rotate Credentials Regularly**
   - Change Twilio Auth Token every 90 days
   - Regenerate EmailJS keys annually

2. **Monitor Usage**
   - Set up billing alerts in Twilio console
   - Monitor EmailJS usage dashboard
   - Review audit logs regularly

3. **Limit Permissions**
   - Only grant communication permissions to trusted users
   - Review permission grants quarterly
   - Revoke permissions when users leave

4. **Protect Environment Variables**
   - Never commit `.env.local` to git
   - Use separate credentials for dev/staging/production
   - Restrict access to production credentials

## Troubleshooting

### Common Issues

#### "Cannot read environment variables"

**Cause**: Environment variables not loaded

**Solution**:
1. Ensure `.env.local` exists in project root
2. Restart development server (`npm run dev`)
3. Check variable names have `VITE_` prefix

#### "Twilio authentication failed"

**Cause**: Invalid credentials or expired token

**Solution**:
1. Verify ACCOUNT_SID starts with "AC"
2. Verify AUTH_TOKEN is 32 characters
3. Re-copy credentials from Twilio console
4. Check for extra spaces in `.env.local`

#### "Phone number not verified" (Trial accounts)

**Cause**: Twilio trial restriction

**Solution**:
1. Verify recipient number in Twilio console
2. Or upgrade to paid account

#### "EmailJS service error"

**Cause**: Invalid service configuration

**Solution**:
1. Verify email service is connected in EmailJS dashboard
2. Check service status is "Active"
3. Verify SERVICE_ID and TEMPLATE_ID are correct
4. Test sending directly from EmailJS dashboard

#### "Rate limit exceeded"

**Cause**: Sending too many messages too quickly

**Solution**:
1. Reduce `VITE_SMS_RATE_LIMIT` in `.env.local`
2. Wait a few minutes before retrying
3. For bulk sends, split into smaller batches

### Getting Help

**Twilio Issues**:
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com
- Status: https://status.twilio.com

**EmailJS Issues**:
- Documentation: https://www.emailjs.com/docs
- Support: Contact via dashboard
- Status: Check dashboard for service status

**Firebase Issues**:
- Documentation: https://firebase.google.com/docs
- Console: https://console.firebase.google.com
- Status: https://status.firebase.google.com

## Configuration Reference

### Complete .env.local Template

```env
# OpenRouter API Key (for COT AI)
VITE_OPENROUTER_API_KEY=your-key-here

# Admin Dashboard Password
VITE_ADMIN_PASSWORD=your-secure-password

# Twilio SMS Configuration
VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_TWILIO_AUTH_TOKEN=your_32_character_auth_token
VITE_TWILIO_PHONE_NUMBER=+12345678901

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Communication Feature Flags
VITE_ENABLE_SMS=true
VITE_SMS_RATE_LIMIT=5
VITE_MAX_SMS_RECIPIENTS=500
```

### Environment Variable Validation

All configuration values are validated at runtime. Error messages will indicate:
- Missing required variables
- Invalid format (e.g., phone number)
- Invalid values (e.g., negative rate limit)

## Next Steps

After completing configuration:

1. **Review Requirements**: Read `requirements.md` in `.kiro/specs/advanced-communication/`
2. **Review Design**: Read `design.md` for architecture details
3. **Test Features**: Follow test procedures above
4. **Train Users**: Share user guide with administrators
5. **Monitor Usage**: Set up alerts and review logs regularly

## Support

For configuration issues or questions:
- Review this guide thoroughly
- Check application logs in browser console
- Review Firestore security rules
- Contact the development team

---

**Last Updated**: [Current Date]
**Version**: 1.0
**Maintained By**: City of Truth Ministries Development Team
