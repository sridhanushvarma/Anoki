# OAuth Setup Guide

This guide will help you set up OAuth applications for Google, GitHub, and Microsoft authentication.

## 🔧 Quick Setup

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback/google` (development)
   - `https://yourdomain.com/auth/callback/google` (production)
7. Copy Client ID and Client Secret

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Anoki"
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/auth/callback/github`
4. Copy Client ID and Client Secret

### 3. Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in:
   - Name: "Anoki"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:3000/auth/callback/microsoft`
5. Copy Application (client) ID
6. Go to "Certificates & secrets" → "New client secret"
7. Copy the secret value

## 🔑 Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
NEXT_PUBLIC_GITHUB_CLIENT_ID="your_github_client_id"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your_microsoft_client_id"
MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret"
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="your_microsoft_client_id"
```

## 🚀 Testing

1. Restart your development server after adding environment variables
2. Try logging in with each provider
3. Check the browser console for any errors

## 🔒 Security Notes

- Never commit OAuth secrets to version control
- Use different OAuth apps for development and production
- Regularly rotate client secrets
- Monitor OAuth usage in provider dashboards
