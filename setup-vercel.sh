#!/bin/bash

echo "🚀 Setting up Anoki for Vercel deployment..."

# Generate random secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo "📝 Setting up environment variables..."

# Set essential environment variables
echo "Setting NEXTAUTH_SECRET..."
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

echo "Setting JWT_SECRET..."
echo "$JWT_SECRET" | vercel env add JWT_SECRET production

echo "Setting JWT_REFRESH_SECRET..."
echo "$JWT_REFRESH_SECRET" | vercel env add JWT_REFRESH_SECRET production

echo "Setting NEXTAUTH_URL..."
echo "https://$(vercel ls | grep anoki | awk '{print $2}').vercel.app" | vercel env add NEXTAUTH_URL production

echo "🗄️ Creating Vercel Postgres database..."
vercel storage create postgres

echo "📥 Pulling environment variables..."
vercel env pull .env.local

echo "🔧 Running database setup..."
npx prisma generate
npx prisma db push

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Setup complete! Your app should be deployed."
echo "🔗 Check your deployment at: https://vercel.com/dashboard"

echo ""
echo "📋 Next steps:"
echo "1. Set up OAuth applications (optional):"
echo "   - Google: https://console.cloud.google.com"
echo "   - GitHub: https://github.com/settings/developers"
echo "   - Microsoft: https://portal.azure.com"
echo ""
echo "2. Add OAuth environment variables if needed:"
echo "   vercel env add GOOGLE_CLIENT_ID"
echo "   vercel env add GOOGLE_CLIENT_SECRET"
echo "   vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID"
echo ""
echo "3. Configure SMTP for email (optional):"
echo "   vercel env add SMTP_HOST"
echo "   vercel env add SMTP_USER"
echo "   vercel env add SMTP_PASS"
echo ""
echo "🎉 Your Anoki app is ready for production!"
