# Anoki Authentication System - User Guide

## 🔐 Welcome to Anoki's Secure Authentication

This guide will help you understand and use all the security features available in the Anoki authentication system.

## 📝 Getting Started

### Creating Your Account

1. **Visit the Registration Page**
   - Navigate to `/auth/register`
   - Fill in your details:
     - **Full Name**: Your display name
     - **Email Address**: Must be valid for verification
     - **Password**: Minimum 8 characters with uppercase, lowercase, and numbers
     - **Confirm Password**: Must match your password

2. **Email Verification**
   - Check your email for a verification link
   - Click the link to activate your account
   - You can now log in with your credentials

### Logging In

1. **Standard Login**
   - Navigate to `/auth/login`
   - Enter your email and password
   - Click "Sign In"

2. **Social Login (OAuth)**
   - Choose from Google, GitHub, or Microsoft
   - Authorize the application
   - Your account will be created or linked automatically

## 🔒 Two-Factor Authentication (2FA)

### Why Use 2FA?
Two-factor authentication adds an extra layer of security to your account by requiring both your password and a time-based code from your phone.

### Setting Up 2FA

1. **Access Security Settings**
   - Log in to your account
   - Navigate to `/settings/security`
   - Click "Enable Two-Factor Authentication"

2. **Scan QR Code**
   - Install an authenticator app (Google Authenticator, Authy, etc.)
   - Scan the QR code displayed on screen
   - Or manually enter the setup key

3. **Verify Setup**
   - Enter the 6-digit code from your authenticator app
   - Click "Verify and Enable"

4. **Save Backup Codes**
   - **IMPORTANT**: Save your 10 backup codes in a secure location
   - These codes can be used if you lose access to your authenticator app
   - Each code can only be used once

### Using 2FA

1. **Login with 2FA**
   - Enter your email and password as usual
   - You'll be prompted for a 2FA code
   - Open your authenticator app
   - Enter the current 6-digit code
   - Click "Verify"

2. **Using Backup Codes**
   - If you can't access your authenticator app
   - Click "Use backup code instead"
   - Enter one of your saved backup codes
   - The code will be consumed and cannot be used again

### Managing 2FA

1. **Viewing Backup Codes**
   - Go to Security Settings
   - Click "View Backup Codes"
   - Enter your password to view remaining codes

2. **Regenerating Backup Codes**
   - In Security Settings, click "Generate New Backup Codes"
   - Enter your password and current 2FA code
   - Save the new codes securely
   - Old codes will no longer work

3. **Disabling 2FA**
   - Go to Security Settings
   - Click "Disable Two-Factor Authentication"
   - Enter your password and current 2FA code
   - Confirm the action

## 🖥️ Session Management

### Understanding Sessions
Sessions represent active logins on different devices or browsers. You can monitor and control all your active sessions.

### Viewing Active Sessions

1. **Access Session Manager**
   - Navigate to `/settings/security`
   - Scroll to "Active Sessions" section
   - View all your current sessions

2. **Session Information**
   - **Device/Browser**: Type of device and browser used
   - **IP Address**: Location of the session
   - **Last Activity**: When the session was last used
   - **Current Session**: Marked with a green indicator

### Managing Sessions

1. **Revoking Sessions**
   - Click "Revoke" next to any session
   - The session will be immediately terminated
   - The user will need to log in again on that device

2. **Revoking All Sessions**
   - Click "Revoke All Other Sessions"
   - All sessions except your current one will be terminated
   - Useful if you suspect unauthorized access

## 👤 Profile Management

### Updating Your Profile

1. **Personal Information**
   - Navigate to `/settings/profile`
   - Update your name or email address
   - Changes to email require re-verification

2. **Password Changes**
   - Go to Security Settings
   - Click "Change Password"
   - Enter your current password
   - Enter and confirm your new password
   - If 2FA is enabled, you'll need to provide a 2FA code

### Account Settings

1. **Email Preferences**
   - Choose which notifications to receive
   - Security alerts (recommended to keep enabled)
   - Account updates and changes

2. **Privacy Settings**
   - Control what information is visible
   - Manage data sharing preferences

## 🔗 OAuth Account Linking

### Linking Social Accounts

1. **Adding OAuth Accounts**
   - Go to Account Settings
   - Click "Link Account" next to your preferred provider
   - Authorize the connection
   - Your accounts are now linked

2. **Benefits of Linking**
   - Sign in with any linked account
   - Maintain single profile across providers
   - Enhanced security with multiple login options

### Managing Linked Accounts

1. **Viewing Linked Accounts**
   - See all connected OAuth providers
   - View connection dates and status

2. **Unlinking Accounts**
   - Click "Unlink" next to any provider
   - Confirm the action
   - You can still log in with other methods

## 🚨 Security Best Practices

### Password Security
- **Use a strong, unique password** for your Anoki account
- **Don't reuse passwords** from other websites
- **Consider using a password manager**
- **Change your password** if you suspect it's been compromised

### 2FA Security
- **Keep backup codes secure** - store them offline
- **Don't share your authenticator app** with others
- **Use a reputable authenticator app** (Google Authenticator, Authy)
- **Set up 2FA on your email account** as well

### Account Security
- **Log out from public computers** after use
- **Review active sessions regularly**
- **Enable security notifications**
- **Report suspicious activity** immediately

### Email Security
- **Verify email authenticity** - check sender addresses
- **Don't click suspicious links** in emails
- **Keep your email account secure** with 2FA
- **Report phishing attempts**

## 🆘 Troubleshooting

### Common Issues

1. **Forgot Password**
   - Click "Forgot Password" on login page
   - Enter your email address
   - Check your email for reset instructions
   - Follow the link to create a new password

2. **Lost Authenticator App**
   - Use one of your backup codes to log in
   - Go to Security Settings
   - Disable and re-enable 2FA with a new device
   - Generate new backup codes

3. **Can't Access Email**
   - Contact support with account verification details
   - Provide alternative contact information
   - Account recovery may take 24-48 hours

4. **Suspicious Activity**
   - Change your password immediately
   - Revoke all active sessions
   - Review recent account activity
   - Contact support if needed

### Error Messages

1. **"Too many login attempts"**
   - Wait 15 minutes before trying again
   - Ensure you're using the correct credentials
   - Check if Caps Lock is enabled

2. **"Invalid 2FA code"**
   - Ensure your device time is synchronized
   - Try the next code if the current one expires
   - Use a backup code if the issue persists

3. **"Session expired"**
   - Log in again to create a new session
   - Sessions expire after 24 hours of inactivity
   - This is normal security behavior

## 📞 Getting Help

### Support Channels
- **Help Center**: Visit our comprehensive FAQ
- **Email Support**: support@anoki.com
- **Security Issues**: security@anoki.com
- **Response Time**: 24 hours for general inquiries, 4 hours for security issues

### Before Contacting Support
- Check this user guide for solutions
- Try basic troubleshooting steps
- Have your account email ready
- Note any error messages you received

### What to Include in Support Requests
- Your account email address
- Description of the issue
- Steps you've already tried
- Screenshots (if applicable)
- Browser and device information

## 🔄 Account Recovery

### If You're Locked Out

1. **Password Reset**
   - Use the "Forgot Password" feature
   - Check your email for reset instructions
   - Create a new strong password

2. **2FA Recovery**
   - Use backup codes if available
   - Contact support for 2FA reset
   - Provide identity verification

3. **Email Access Issues**
   - Contact support with alternative verification
   - Provide account creation details
   - Recovery process may take longer

### Prevention Tips
- **Keep backup codes safe** and accessible
- **Maintain access to your email account**
- **Keep your contact information updated**
- **Document your account recovery information**

## 🎯 Advanced Features

### API Access
- Generate API keys for third-party integrations
- Manage API permissions and scopes
- Monitor API usage and activity

### Audit Logs
- View your account activity history
- Monitor login attempts and locations
- Track security-related changes

### Export Data
- Download your account data
- Export activity logs
- Backup your information

---

**Need more help?** Contact our support team at support@anoki.com

**Last Updated**: December 2024  
**Version**: 1.0.0
