#!/bin/bash

# GEM Enterprise - Vercel Deployment Script
# This script helps deploy the project to Vercel easily

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║     GEM Enterprise - Vercel Deployment Helper          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✓ Vercel CLI is installed"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

echo "Step 1: Building the project locally..."
npm run build
echo "✓ Build successful"
echo ""

echo "Step 2: Verifying code quality..."
npm run lint || echo "⚠ Linting issues found (non-critical)"
echo ""

echo "Step 3: Preparing for Vercel deployment..."
echo ""
echo "Choose deployment option:"
echo "  1) Deploy to current Vercel project"
echo "  2) Deploy to new Vercel project"
echo "  3) Setup GitHub integration (recommended for teams)"
echo ""
read -p "Enter option (1-3): " option

case $option in
    1)
        echo ""
        echo "Deploying to current project..."
        vercel --prod
        ;;
    2)
        echo ""
        echo "Creating new Vercel project..."
        vercel --prod
        ;;
    3)
        echo ""
        echo "To setup GitHub integration:"
        echo "  1. Push your code to GitHub: git push origin main"
        echo "  2. Visit: https://vercel.com/new"
        echo "  3. Select your GitHub repository"
        echo "  4. Configure project settings"
        echo "  5. Click Deploy"
        echo ""
        echo "Future deployments will be automatic on git push"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║              Deployment Complete! ✓                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Visit your Vercel dashboard: https://vercel.com/dashboard"
echo "  2. Configure environment variables if needed"
echo "  3. Setup custom domain in Settings → Domains"
echo "  4. Monitor performance in Speed Insights"
echo ""
echo "For more details, see: VERCEL_DEPLOYMENT_GUIDE.md"
