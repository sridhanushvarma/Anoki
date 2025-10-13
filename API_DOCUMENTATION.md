# Anoki Authentication API Documentation

## 🔗 Base URL
```
Development: http://localhost:3000
Production: https://anoki.com
```

## 🔐 Authentication

All authenticated endpoints require a valid JWT access token in cookies or Authorization header.

### Headers
```http
Content-Type: application/json
Cookie: accessToken=<jwt_token>
# OR
Authorization: Bearer <jwt_token>
```

## 📋 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "EMAIL",
    "emailVerified": null,
    "twoFactorEnabled": false,
    "createdAt": "2024-12-13T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `409` - Email already exists
- `429` - Too many registration attempts

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "EMAIL",
    "image": null,
    "emailVerified": "2024-12-13T10:00:00.000Z",
    "twoFactorEnabled": false,
    "createdAt": "2024-12-13T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed
- `401` - Invalid credentials or account deactivated
- `429` - Too many login attempts

#### Logout User
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully"
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

### Two-Factor Authentication Endpoints

#### Setup 2FA
```http
POST /api/auth/2fa/setup
```

**Headers:** Requires authentication

**Response (200):**
```json
{
  "message": "2FA setup initiated",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP",
  "backupCodes": [
    "ABCD-1234",
    "EFGH-5678",
    "IJKL-9012",
    "MNOP-3456",
    "QRST-7890",
    "UVWX-1234",
    "YZAB-5678",
    "CDEF-9012",
    "GHIJ-3456",
    "KLMN-7890"
  ]
}
```

**Error Responses:**
- `400` - 2FA already enabled
- `401` - Authentication required

#### Verify 2FA Token
```http
POST /api/auth/2fa/verify
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "token": "123456",
  "isBackupCode": false
}
```

**Response (200):**
```json
{
  "message": "2FA has been successfully enabled for your account"
}
```

**Error Responses:**
- `400` - Invalid token or backup code
- `401` - Authentication required

#### Disable 2FA
```http
POST /api/auth/2fa/disable
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "password": "SecurePass123",
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "2FA has been disabled for your account"
}
```

**Error Responses:**
- `400` - Invalid password or token, or 2FA not enabled
- `401` - Authentication required

### User Management Endpoints

#### Get User Profile
```http
GET /api/user/profile
```

**Headers:** Requires authentication

**Response (200):**
```json
{
  "user": {
    "id": "clx1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "provider": "EMAIL",
    "image": null,
    "emailVerified": "2024-12-13T10:00:00.000Z",
    "twoFactorEnabled": true,
    "createdAt": "2024-12-13T10:00:00.000Z",
    "updatedAt": "2024-12-13T10:30:00.000Z"
  }
}
```

#### Update User Profile
```http
PUT /api/user/profile
```

**Headers:** Requires authentication

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clx1234567890",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "provider": "EMAIL",
    "image": null,
    "emailVerified": null,
    "twoFactorEnabled": true,
    "createdAt": "2024-12-13T10:00:00.000Z",
    "updatedAt": "2024-12-13T11:00:00.000Z"
  }
}
```

#### Get User Sessions
```http
GET /api/user/sessions
```

**Headers:** Requires authentication

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "clx0987654321",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "createdAt": "2024-12-13T10:00:00.000Z",
      "expiresAt": "2024-12-20T10:00:00.000Z",
      "isCurrent": true
    },
    {
      "id": "clx1111111111",
      "ipAddress": "192.168.1.101",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      "createdAt": "2024-12-12T15:30:00.000Z",
      "expiresAt": "2024-12-19T15:30:00.000Z",
      "isCurrent": false
    }
  ]
}
```

#### Revoke Session
```http
DELETE /api/user/sessions/[sessionId]
```

**Headers:** Requires authentication

**Response (200):**
```json
{
  "message": "Session revoked successfully"
}
```

**Error Responses:**
- `404` - Session not found
- `403` - Cannot revoke current session

## 🔒 Security Headers

All API responses include the following security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Content-Security-Policy: default-src 'self'
```

## 🚦 Rate Limiting

Rate limits are applied per IP address:

- **Login**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour
- **2FA Verification**: 10 attempts per 5 minutes
- **Password Reset**: 3 attempts per hour

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1702468800
```

**Rate Limit Response (429):**
```json
{
  "error": "Too many requests. Please try again later."
}
```

## ❌ Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "details": [
    {
      "code": "invalid_type",
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 🔧 Development

### Testing API Endpoints

Using curl:
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123"
  }'

# Login user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get profile (using saved cookies)
curl -X GET http://localhost:3000/api/user/profile \
  -b cookies.txt
```

### Environment Variables
Ensure these environment variables are set for API functionality:
- `JWT_SECRET` - Secret for signing access tokens
- `JWT_REFRESH_SECRET` - Secret for signing refresh tokens
- `DATABASE_URL` - Database connection string
- `SMTP_*` - Email configuration for verification emails

---

**Last Updated**: December 2024  
**Version**: 1.0.0
