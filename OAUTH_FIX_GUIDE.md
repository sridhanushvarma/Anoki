# 🔧 OAuth Authentication Fix Guide

## 🚨 **Current Issue**

The OAuth authentication errors you're seeing are caused by missing OAuth application configurations. The error messages indicate:

1. **Microsoft Error**: `AADSTS900144: The request body must contain the following parameter: 'client_id'`
2. **Google Error**: `Error 400: invalid_request - Missing required parameter: client_id`

## ✅ **Solution: Set Up OAuth Applications**

### **Step 1: Create OAuth Applications**

#### 🔵 **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3002/auth/callback/google`
7. Copy the Client ID and Client Secret

#### 🔵 **GitHub OAuth Setup**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Anoki Development"
   - Homepage URL: `http://localhost:3002`
   - Authorization callback URL: `http://localhost:3002/auth/callback/github`
4. Copy the Client ID and Client Secret

#### 🔵 **Microsoft OAuth Setup**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in:
   - Name: "Anoki Development"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: `http://localhost:3002/auth/callback/microsoft`
5. Copy the Application (client) ID
6. Go to "Certificates & secrets" → "New client secret"
7. Copy the secret value

### **Step 2: Configure Environment Variables**

Create a `.env.local` file in your project root with the OAuth credentials:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id_here"

# GitHub OAuth
GITHUB_CLIENT_ID="your_github_client_id_here"
GITHUB_CLIENT_SECRET="your_github_client_secret_here"
NEXT_PUBLIC_GITHUB_CLIENT_ID="your_github_client_id_here"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your_microsoft_client_id_here"
MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret_here"
NEXT_PUBLIC_MICROSOFT_CLIENT_ID="your_microsoft_client_id_here"
```

### **Step 3: Restart Development Server**

After adding the environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔧 **What I've Fixed**

### **1. Created Missing OAuth Handlers**
- ✅ Created `src/app/auth/callback/github/page.tsx`
- ✅ Created `src/app/auth/callback/microsoft/page.tsx`
- ✅ Created `src/app/api/auth/oauth/github/route.ts`
- ✅ Created `src/app/api/auth/oauth/microsoft/route.ts`

### **2. Improved Error Handling**
- ✅ Added client ID validation in OAuth components
- ✅ Created `OAuthErrorHandler` component for better error messages
- ✅ Updated OAuth login functions to handle missing configurations

### **3. Fixed Configuration Issues**
- ✅ Updated `NEXTAUTH_URL` from port 3000 to 3002
- ✅ Created `.env.local.example` template
- ✅ Added proper error messages for missing OAuth setup

### **4. Enhanced Security**
- ✅ Added state parameter validation for CSRF protection
- ✅ Implemented proper rate limiting for OAuth endpoints
- ✅ Added audit logging for OAuth authentication events

## 🚀 **Quick Test (Without OAuth Setup)**

If you want to test the authentication system without setting up OAuth:

1. **Use Email/Password Authentication**:
   - Go to `http://localhost:3002/auth`
   - Click "Sign Up" tab
   - Register with email and password
   - This will work immediately without OAuth setup

2. **OAuth Buttons Will Show Helpful Errors**:
   - OAuth buttons will display "OAuth not configured" messages
   - Users can still use email/password authentication
   - No crashes or broken functionality

## 🔒 **Security Notes**

- OAuth secrets should never be committed to version control
- Use different OAuth applications for development and production
- The current setup is secure with proper CSRF protection and rate limiting
- All OAuth flows include proper state validation

## 📞 **Next Steps**

1. **Immediate**: Set up at least one OAuth provider (Google is easiest)
2. **Testing**: Test the OAuth flow end-to-end
3. **Production**: Create separate OAuth apps for production deployment
4. **Monitoring**: Monitor OAuth usage in provider dashboards

## ✅ **Verification Checklist**

- [ ] Created OAuth applications in provider consoles
- [ ] Added client IDs and secrets to `.env.local`
- [ ] Restarted development server
- [ ] Tested OAuth login flow
- [ ] Verified callback URLs are correct
- [ ] Confirmed error handling works properly

Once you complete the OAuth setup, the authentication system will be fully functional with enterprise-grade security!
