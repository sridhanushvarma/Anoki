# Anoki Authentication System

This document describes the comprehensive authentication system implemented for the Anoki tools platform.

## Overview

The authentication system provides secure user registration, login, and session management while maintaining compatibility with GitHub Pages static export. It includes OAuth integration, download protection, and comprehensive legal pages.

## Features

### Authentication
- **Email/Password Authentication**: Traditional registration and login
- **OAuth Integration**: Google, GitHub, and Microsoft sign-in
- **Session Management**: Client-side session storage with localStorage
- **Form Validation**: Comprehensive validation using react-hook-form and zod
- **Responsive Design**: Mobile-friendly authentication forms

### Download Protection
- **Gated Downloads**: Requires authentication for file downloads
- **Seamless UX**: Non-authenticated users can upload and process files
- **Login Prompts**: Modal prompts for download attempts without authentication
- **Protected Routes**: Middleware-style protection for sensitive operations

### Legal Compliance
- **Privacy Policy**: GDPR-compliant privacy policy
- **Terms of Service**: Comprehensive terms covering tool usage
- **Contact Page**: Support form with FAQ section
- **SEO Optimized**: Proper metadata for all legal pages

## Architecture

### Components

#### AuthContext (`src/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides login, register, and logout functions
- Handles OAuth simulation for static export compatibility
- Stores user data in localStorage

#### AuthProvider
- Wraps the entire application
- Provides authentication context to all components
- Handles session persistence and restoration

#### DownloadProtection (`src/components/DownloadProtection.tsx`)
- Reusable component for protecting download functionality
- Shows login modal for unauthenticated users
- Seamlessly integrates with existing tool pages

### Pages

#### Authentication Page (`src/app/auth/page.tsx`)
- Combined login/registration form
- OAuth provider buttons
- Form validation and error handling
- Responsive design with animations

#### Legal Pages
- **Privacy Policy** (`src/app/privacy/page.tsx`)
- **Terms of Service** (`src/app/terms/page.tsx`)
- **Contact Page** (`src/app/contact/page.tsx`)

### Updated Components

#### Navbar (`src/components/Navbar.tsx`)
- Authentication status display
- User profile dropdown
- Login/signup buttons for unauthenticated users
- Mobile-responsive authentication UI

#### Tool Pages
- **Converters** (`src/app/converters/page.tsx`)
- **Editors** (`src/app/editors/page.tsx`)
- **Enhancers** (`src/app/enhancers/page.tsx`)

All tool pages now use the DownloadProtection component to gate file downloads behind authentication.

## Usage

### For Users

1. **Registration**: Visit `/auth` and create an account
2. **Login**: Sign in with email/password or OAuth providers
3. **Tool Usage**: Upload and process files without authentication
4. **Downloads**: Sign in required to download processed files
5. **Account Management**: Access profile and logout from navbar

### For Developers

#### Adding Download Protection

```tsx
import DownloadProtection from '@/components/DownloadProtection'

// Replace regular download buttons with:
<DownloadProtection
  onDownload={handleDownload}
  downloadText="Download File"
  className="custom-styles"
/>
```

#### Using Authentication Context

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>
  }
  
  return <button onClick={() => login(credentials)}>Sign In</button>
}
```

#### Checking Authentication Status

```tsx
const { isAuthenticated, user } = useAuth()

if (isAuthenticated) {
  // User is logged in
  console.log('User:', user)
} else {
  // User is not logged in
  // Show login prompt or redirect
}
```

## Static Export Compatibility

The authentication system is designed to work with Next.js static export for GitHub Pages:

### Client-Side Session Management
- Uses localStorage for session persistence
- No server-side session dependencies
- Compatible with static hosting

### OAuth Simulation
- Simulates OAuth flows for demo purposes
- In production, would integrate with actual OAuth providers
- Maintains consistent UX patterns

### Build Configuration
- All authentication pages are client components
- Proper metadata handling with layout files
- Static export compatible routing

## Security Considerations

### Current Implementation (Demo)
- Client-side only authentication
- localStorage for session storage
- Simulated OAuth flows
- No server-side validation

### Production Recommendations
- Implement server-side authentication
- Use secure session management (JWT, cookies)
- Integrate with real OAuth providers
- Add rate limiting and security headers
- Implement proper password hashing
- Add email verification
- Use HTTPS in production

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx          # Authentication page
│   │   └── layout.tsx        # Auth page metadata
│   ├── privacy/
│   │   ├── page.tsx          # Privacy policy
│   │   └── layout.tsx        # Privacy page metadata
│   ├── terms/
│   │   ├── page.tsx          # Terms of service
│   │   └── layout.tsx        # Terms page metadata
│   ├── contact/
│   │   ├── page.tsx          # Contact page
│   │   └── layout.tsx        # Contact page metadata
│   └── layout.tsx            # Root layout with AuthProvider
├── components/
│   ├── Navbar.tsx            # Updated with auth UI
│   └── DownloadProtection.tsx # Download protection component
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── types/
│   └── auth.ts               # Authentication types
└── constants.ts              # Auth constants
```

## Dependencies

### New Dependencies Added
- `react-hook-form`: Form handling and validation
- `@hookform/resolvers`: Form validation resolvers
- `zod`: Schema validation
- `bcryptjs`: Password hashing utilities
- `@types/bcryptjs`: TypeScript types for bcryptjs

### Existing Dependencies Used
- `framer-motion`: Animations and transitions
- `react-icons`: Icons for UI elements
- `next`: Next.js framework
- `react`: React library

## Testing

### Manual Testing Checklist

#### Authentication Flow
- [ ] Registration with email/password
- [ ] Login with email/password
- [ ] OAuth provider buttons (simulated)
- [ ] Form validation and error handling
- [ ] Session persistence across page reloads
- [ ] Logout functionality

#### Download Protection
- [ ] Unauthenticated users see login prompt
- [ ] Authenticated users can download files
- [ ] Modal closes properly
- [ ] Download buttons work after authentication

#### UI/UX
- [ ] Responsive design on mobile
- [ ] Dark mode compatibility
- [ ] Navbar updates based on auth status
- [ ] User dropdown menu functionality
- [ ] Click outside to close menus

#### Legal Pages
- [ ] Privacy policy loads correctly
- [ ] Terms of service displays properly
- [ ] Contact form validation works
- [ ] FAQ section is functional
- [ ] Footer links work correctly

## Future Enhancements

### Authentication
- Real OAuth provider integration
- Email verification system
- Password reset functionality
- Two-factor authentication
- Social login expansion

### User Experience
- User profile management
- Account settings page
- Usage analytics dashboard
- File history and management
- Subscription/premium features

### Security
- Server-side authentication
- Rate limiting
- CAPTCHA integration
- Security audit logging
- Compliance certifications

## Support

For questions about the authentication system:
- Check the FAQ in the contact page
- Review this documentation
- Contact the development team
- Submit issues through the contact form

## License

This authentication system is part of the Anoki project and follows the same licensing terms.
