# Vercel Deployment Steps for fantasypointtracker.live

## Step 1: Install Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version
```

## Step 2: Login to Vercel
```bash
# Login to your Vercel account
vercel login

# Follow the prompts to connect your GitHub/GitLab/Bitbucket account
```

## Step 3: Initialize Project
```bash
# Navigate to your project directory
cd "c:/Users/kunal/OneDrive/Desktop/dream 11 final points"

# Initialize Vercel project
vercel

# Follow these prompts:
# - Set up and deploy? [Y/n] -> Y
# - Which scope? -> Choose your account
# - Link to existing project? -> N (create new)
# - Project name -> ipl-fantasy-tracker
# - In which directory is your code located? -> ./ (current directory)
# - Want to override settings? -> Y
```

## Step 4: Configure Project Settings
When prompted for configuration:
```
Override settings? [y/N] -> y

Which settings do you want to override? (space to select)
- Build Command -> (leave blank for static)
- Output Directory -> . (current directory)
- Install Command -> (leave blank)
- Development Command -> vercel dev
```

## Step 5: Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# You'll get a URL like: https://ipl-fantasy-tracker-xyz.vercel.app
```

## Step 6: Add Custom Domain
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: "ipl-fantasy-tracker"
3. Go to "Domains" tab
4. Add domain: fantasypointtracker.live
5. Follow DNS configuration instructions

## Step 7: DNS Configuration
Add these DNS records at your domain registrar:

### A Records (Recommended)
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 300

Type: A
Name: @  
Value: 76.76.21.21
TTL: 300
```

### CNAME Record (Alternative)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

## Step 8: Verify Deployment
```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Open deployed site
vercel --prod
```

## Step 9: Update Firebase Configuration
Update Firebase authDomain in your HTML:
```javascript
var firebaseConfig = {
  authDomain: "fantasypointtracker.live", // Update this
  // ... rest of config
};
```

## Step 10: Add Domain to Firebase Console
1. Go to Firebase Console
2. Authentication -> Settings
3. Add "fantasypointtracker.live" to authorized domains
4. Update OAuth consent screen

## Environment Variables (Optional)
Create `.env.local` for sensitive data:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
```

## Automatic Deployment Setup
For GitHub integration:
1. Push code to GitHub repository
2. Connect Vercel to GitHub
3. Enable automatic deployments on push to main branch

## Troubleshooting
- DNS propagation: 24-48 hours
- SSL certificate: Automatic via Vercel
- Firebase auth: Ensure domain is authorized
- Build errors: Check vercel.json configuration
