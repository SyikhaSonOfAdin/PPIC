#!/bin/bash

# PPIC Dashboard - Security Quick Fix Script
# Run this to install and configure basic security measures

set -e

echo "🔒 PPIC Dashboard Security Quick Fix"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from project root."
    exit 1
fi

echo "📦 Step 1: Installing security packages..."
npm install helmet csurf express-rate-limit express-validator --save

echo ""
echo "✅ Packages installed successfully!"
echo ""
echo "📝 Step 2: Manual configuration required:"
echo ""
echo "Add these lines to src/app.js after require statements:"
echo ""
cat << 'CODE'
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
});
app.use(limiter);

// Request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
CODE

echo ""
echo "📝 Step 3: Environment validation"
echo ""
echo "Add to the top of src/app.js:"
echo ""
cat << 'CODE'
// Validate critical environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 64) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters');
}

if (!process.env.ORIGIN) {
  throw new Error('ORIGIN must be configured');
}
CODE

echo ""
echo "📝 Step 4: Generate secure secrets"
echo ""
echo "Add these to .env:"
echo ""
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"

echo ""
echo "✅ Quick fix script completed!"
echo ""
echo "Next steps:"
echo "1. Apply manual code changes above"
echo "2. Update .env with new secrets"
echo "3. Restart server: pm2 restart ppic-backend"
echo "4. Review full SECURITY_AUDIT.md for complete fixes"
echo ""
