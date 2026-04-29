#!/bin/bash

echo "=== IPL Fantasy Tracker - Vercel Deployment ==="
echo "Deploying to fantasypointtracker.live"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "Please login to Vercel..."
vercel login

# Initialize project
echo "Initializing Vercel project..."
vercel

# Deploy to production
echo "Deploying to production..."
vercel --prod

echo ""
echo "=== Deployment Complete! ==="
echo "Your site is now live!"
echo ""
echo "Next steps:"
echo "1. Add domain: fantasypointtracker.live in Vercel dashboard"
echo "2. Configure DNS records"
echo "3. Add domain to Firebase console"
echo "4. Test the site"
echo ""
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo "Firebase Console: https://console.firebase.google.com"
