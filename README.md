# City of Truth Ministries Web Application

A comprehensive web application for City of Truth Ministries featuring member management, Hebrew calendar, communication tools, and more.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Advanced Communication Setup](#advanced-communication-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

This React-based application provides a full-featured platform for City of Truth Ministries, including:
- Member and visitor management
- Hebrew calendar and resources
- Multi-channel communication system
- AI-powered assistance
- Community profiles and ID cards
- Event management and announcements

## Features

### Core Features
- **User Management**: Member, visitor, and admin roles with authentication
- **Hebrew Calendar**: Interactive Hebrew calendar with holiday tracking
- **Hebrew Resources**: Learning tools, alphabet guides, and grammar resources
- **AI Assistant**: Integrated AI chat for user support

### Advanced Communication System
- **SMS Notifications**: Send text messages to members and visitors via Twilio
- **Email Announcements**: Bulk email delivery through EmailJS
- **In-App Notifications**: Integrated notification system
- **Contact Management**: Import and manage external contact lists
- **Delivery Tracking**: Monitor message delivery status across all channels
- **Permission Controls**: Granular permissions for communication features
- **Audit Logging**: Complete audit trail of all communication actions

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Firebase CLI** (for deployment)
- **Git** (for version control)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd City-Of-Truth-Ministries
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env .env.local
   ```
   Edit `.env.local` with your actual credentials (see [Configuration](#configuration) below)

4. **Start development server**
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

The application requires several environment variables to be configured in a `.env.local` file (do not commit this file to git).

#### AI Services

```env
# OpenRouter API Key (for COT AI Assistant)
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
```

Get your OpenRouter API key from: https://openrouter.ai/keys

#### Admin Access

```env
# Admin Dashboard Password
VITE_ADMIN_PASSWORD=your-secure-admin-password
```

#### Communication Services (Optional)

See [Advanced Communication Setup](#advanced-communication-setup) for detailed configuration.

## Advanced Communication Setup

The Advanced Communication system enables SMS, email, and in-app messaging capabilities. This section is **optional** and only required if you want to use these features.

### Twilio SMS Configuration

To enable SMS notifications:

1. **Create a Twilio Account**
   - Sign up at: https://www.twilio.com/try-twilio
   - Verify your account and phone number

2. **Get Twilio Credentials**
   - Navigate to: https://console.twilio.com
   - Find your **Account SID** and **Auth Token** on the dashboard
   - Purchase a phone number or use your trial number

3. **Configure Environment Variables**
   ```env
   # Twilio SMS Configuration
   VITE_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
   VITE_TWILIO_PHONE_NUMBER=+1234567890
   ```

4. **Enable SMS Feature**
   ```env
   VITE_ENABLE_SMS=true
   ```

### EmailJS Configuration

To enable email announcements:

1. **Create EmailJS Account**
   - Sign up at: https://www.emailjs.com/
   - Create a new email service (Gmail, Outlook, etc.)

2. **Create Email Template**
   - Navigate to: https://dashboard.emailjs.com/admin/templates
   - Create a template for ministry announcements
   - Note your **Template ID**

3. **Get API Keys**
   - Find your **Service ID** in the Email Services section
   - Find your **Public Key** in Account settings

4. **Configure Environment Variables**
   ```env
   # EmailJS Configuration
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

### Communication Feature Flags

Configure communication system behavior:

```env
# Feature Flags
VITE_ENABLE_SMS=true                # Enable/disable SMS functionality
VITE_SMS_RATE_LIMIT=5              # SMS messages per second (default: 5)
VITE_MAX_SMS_RECIPIENTS=500        # Maximum recipients per SMS send
```

### Firestore Setup for Communication

The communication system requires specific Firestore collections and indexes:

1. **Collections Required**:
   - `announcements` - Stores all announcements
   - `contactLists` - Manages external contact lists
   - `contacts` - Individual contacts in lists
   - `deliveryRecords` - Message delivery tracking
   - `communicationPermissions` - User permissions
   - `communicationAuditLog` - Audit trail

2. **Deploy Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Deploy Security Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Permission Management

To grant communication permissions to users:

1. **Admin Dashboard** → **Communication** tab
2. Navigate to **Permissions** section
3. Select user and toggle permissions:
   - **Create Announcements** - Create draft announcements
   - **Send Announcements** - Send announcements to recipients
   - **Manage Contact Lists** - Create and manage contact lists

### Testing External Services

After configuration, test your setup:

1. **Test SMS** (if enabled):
   - Send a test SMS to your verified phone number
   - Check Twilio console for delivery status

2. **Test Email**:
   - Send a test email to yourself
   - Check EmailJS dashboard for send logs

3. **Test In-App Notifications**:
   - Create and send an in-app announcement
   - Check User Dashboard for notification

### Troubleshooting Communication Features

**SMS Not Sending**:
- Verify Twilio credentials are correct
- Check phone numbers are in E.164 format (+1234567890)
- Ensure VITE_ENABLE_SMS is set to `true`
- Check Twilio console for error messages

**Emails Not Delivering**:
- Verify EmailJS service is active
- Check email template is correctly configured
- Ensure recipient emails are valid
- Check spam/junk folders

**Permission Errors**:
- Verify user has required communication permissions
- Check that permissions are correctly saved in Firestore
- Ensure user role is Admin or has specific permission granted

## Development

### Project Structure

```
City-Of-Truth-Ministries/
├── components/           # React components
│   ├── CommunicationDashboard.tsx
│   ├── AnnouncementComposer.tsx
│   ├── ContactListManager.tsx
│   └── ...
├── services/            # Business logic and API calls
│   ├── api.ts
│   ├── communicationService.ts
│   ├── smsService.ts
│   ├── emailService.ts
│   └── ...
├── public/              # Static assets
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `firebase deploy` - Deploy to Firebase

### Adding New Features

1. Define types in `types.ts`
2. Create service functions in `services/`
3. Build UI components in `components/`
4. Add Firestore security rules if needed
5. Update this README with configuration requirements

## Deployment

### Firebase Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Deploy specific services**
   ```bash
   firebase deploy --only hosting
   firebase deploy --only firestore
   ```

### Environment Variables in Production

For production deployment, configure environment variables in your hosting platform:

- **Firebase Hosting**: Use `.env.production` file
- **Vercel**: Configure in project settings → Environment Variables
- **Netlify**: Configure in site settings → Build & Deploy → Environment

**Important**: Never commit `.env.local` or `.env.production` files containing real credentials to git!

## Contributing

### Code Style

- Use TypeScript for type safety
- Follow existing component patterns
- Use Lucide React for icons
- Use Framer Motion for animations
- Add comments for complex logic

### Submitting Changes

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with clear description

## Security Notes

### Protecting Sensitive Data

- Never commit `.env.local` or actual API keys to git
- Use environment variables for all sensitive configuration
- Implement proper Firestore security rules
- Validate all user inputs on both client and server
- Use HTTPS for all external API calls

### Firestore Security

The application uses Firestore security rules to protect data:
- Users can only read their own data
- Admins have elevated permissions
- Communication features require specific permissions
- All writes are logged to audit trail

## Support

For issues, questions, or feature requests:
- Contact the development team
- Review existing documentation
- Check Firestore console for errors
- Review browser console for client-side errors

## License

© City of Truth Ministries. All rights reserved.
