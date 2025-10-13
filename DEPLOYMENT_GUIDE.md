# Anoki Authentication System - Production Deployment Guide

## 🚀 Overview

This guide covers the complete deployment process for the Anoki authentication system to production environments, including security configurations, monitoring setup, and best practices.

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] HTTPS certificate configured and valid
- [ ] Environment variables secured and encrypted
- [ ] Database connections use SSL/TLS
- [ ] JWT secrets are cryptographically secure (32+ bytes)
- [ ] OAuth applications configured with production URLs
- [ ] SMTP service configured for email delivery
- [ ] Rate limiting rules configured
- [ ] Security headers implemented
- [ ] CORS policies configured
- [ ] Content Security Policy (CSP) configured

### ✅ Infrastructure Requirements
- [ ] Production database (PostgreSQL recommended)
- [ ] Redis instance for session storage (optional)
- [ ] Load balancer configured
- [ ] CDN for static assets
- [ ] Monitoring and logging services
- [ ] Backup and disaster recovery procedures
- [ ] SSL/TLS certificates

### ✅ Application Requirements
- [ ] All tests passing (92.4% coverage achieved)
- [ ] Database migrations tested
- [ ] Environment-specific configurations
- [ ] Error handling and logging
- [ ] Performance optimization
- [ ] Security audit completed

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-nextauth-secret

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://username:password@host:5432/anoki_prod?sslmode=require

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your-production-jwt-secret-32-chars-min
JWT_REFRESH_SECRET=your-production-refresh-secret-32-chars-min

# Email Configuration (Production SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com

# OAuth Providers (Production Apps)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret

MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret

# Security Configuration
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=5          # 5 attempts per window
SESSION_TIMEOUT=86400000  # 24 hours

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Redis (Optional - for session storage)
REDIS_URL=redis://username:password@host:6379
```

### Generating Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32

# Generate NextAuth secret
openssl rand -base64 32

# Generate random password
openssl rand -base64 24
```

## 🗄️ Database Setup

### PostgreSQL Production Setup

1. **Create Production Database:**
```sql
CREATE DATABASE anoki_prod;
CREATE USER anoki_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE anoki_prod TO anoki_user;
```

2. **Configure SSL Connection:**
```env
DATABASE_URL=postgresql://anoki_user:secure_password@host:5432/anoki_prod?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem
```

3. **Run Database Migrations:**
```bash
# Generate Prisma client
npx prisma generate

# Deploy database schema
npx prisma db push

# Seed initial data (if needed)
npx prisma db seed
```

### Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_session_token ON "Session"(token);
CREATE INDEX idx_session_user_id ON "Session"("userId");
CREATE INDEX idx_login_attempt_email ON "LoginAttempt"(email);
CREATE INDEX idx_audit_log_user_id ON "AuditLog"("userId");
CREATE INDEX idx_audit_log_created_at ON "AuditLog"("createdAt");
```

## 🌐 Deployment Platforms

### Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Configure vercel.json:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "JWT_REFRESH_SECRET": "@jwt-refresh-secret",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

3. **Deploy:**
```bash
# Set environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add JWT_REFRESH_SECRET production

# Deploy
vercel --prod
```

### Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: anoki_prod
      POSTGRES_USER: anoki_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

3. **Deploy with Docker:**
```bash
# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma db push
```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Obtain SSL Certificate:**
```bash
# Using Let's Encrypt with Certbot
sudo certbot --nginx -d your-domain.com
```

2. **Configure NGINX:**
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### OAuth Provider Configuration

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`

2. **GitHub OAuth:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL: `https://your-domain.com/api/auth/callback/github`

3. **Microsoft OAuth:**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Register new application
   - Add redirect URI: `https://your-domain.com/api/auth/callback/microsoft`

## 📊 Monitoring and Logging

### Application Monitoring

1. **Sentry Integration:**
```bash
npm install @sentry/nextjs
```

2. **Configure Sentry:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Health Checks

Create health check endpoint:
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    )
  }
}
```

### Log Management

Configure structured logging:
```typescript
// lib/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
})
```

## 🔄 Backup and Recovery

### Database Backup

1. **Automated Backups:**
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/anoki_backup_$DATE.sql
aws s3 cp backups/anoki_backup_$DATE.sql s3://your-backup-bucket/
```

2. **Backup Restoration:**
```bash
# Restore from backup
psql $DATABASE_URL < backups/anoki_backup_20241213_120000.sql
```

### Disaster Recovery Plan

1. **Recovery Time Objective (RTO)**: 4 hours
2. **Recovery Point Objective (RPO)**: 1 hour
3. **Backup frequency**: Every 6 hours
4. **Backup retention**: 30 days
5. **Cross-region replication**: Enabled

## 🚦 Performance Optimization

### Database Optimization
- Connection pooling (max 20 connections)
- Query optimization with proper indexes
- Regular VACUUM and ANALYZE operations

### Application Optimization
- Next.js static generation where possible
- Image optimization with Next.js Image component
- Bundle size optimization
- CDN for static assets

### Caching Strategy
- Redis for session storage
- Database query result caching
- Static asset caching with CDN
- API response caching for read-only endpoints

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Session storage in Redis
- Database read replicas
- Microservices architecture preparation

### Monitoring Metrics
- Response time < 200ms (95th percentile)
- Error rate < 0.1%
- Uptime > 99.9%
- Database connection pool utilization < 80%

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
