#!/bin/bash

# Deployment Script for FantasyPointTracker.live

echo "Starting deployment to fantasypointtracker.live..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "Checking Firebase authentication..."
firebase login:ci

# Initialize Firebase Hosting (if not already initialized)
if [ ! -f "firebase.json" ]; then
    echo "Initializing Firebase Hosting..."
    firebase init hosting
fi

# Deploy to Firebase
echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "Deployment complete!"
echo "Your site should be live at: https://fantasypointtracker.live"
echo "Firebase console: https://console.firebase.google.com/project/ipl-fantasy-tracker-9baf1/hosting"
