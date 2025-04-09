#!/bin/bash

# Make the script executable with: chmod +x deploy-vercel.sh

echo "Preparing for Vercel deployment..."

# Ensure we're using the production environment file
cp .env.production .env.local

# Commit changes if needed
git add .env.production .vercelignore deploy-vercel.sh
git commit -m "Update deployment configuration" || true

# Push to GitHub
git push

# Deploy to Vercel production
echo "Deploying to Vercel production..."
vercel --prod

echo "Deployment complete!" 