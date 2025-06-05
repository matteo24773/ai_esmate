#!/bin/bash
# deploy.sh - Deployment script for Math Tutoring Backend

echo "🚀 Deploying Math Tutoring Backend to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   https://github.com/supabase/cli#install-the-cli"
    exit 1
fi

# Check if logged in
echo "📝 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "🔐 Please log in to Supabase:"
    supabase login
fi

# Link project (if not already linked)
echo "🔗 Linking to Supabase project..."
if [ ! -f .env ]; then
    echo "Please run: supabase link --project-ref <your-project-ref>"
    echo "Or initialize a new project: supabase init"
    exit 1
fi

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."
echo "   - Deploying new-problem function..."
supabase functions deploy new-problem

echo "   - Deploying validate-step function..."
supabase functions deploy validate-step

# Run migrations
echo "🗃️  Running database migrations..."
supabase db push

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your Supabase project URL and keys in src/supabaseClient.js"
echo "2. Test the application at http://localhost:3000/math-question.html"
echo "3. Remove development mode fallbacks from src/math-question.js"
echo ""
echo "🎉 Your math tutoring backend is now live!"
