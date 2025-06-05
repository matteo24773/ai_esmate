@echo off
REM deploy.bat - Deployment script for Math Tutoring Backend (Windows)

echo 🚀 Deploying Math Tutoring Backend to Supabase...

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Supabase CLI not found. Please install it first:
    echo    https://github.com/supabase/cli#install-the-cli
    pause
    exit /b 1
)

REM Check if logged in
echo 📝 Checking Supabase authentication...
supabase projects list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 🔐 Please log in to Supabase:
    supabase login
)

REM Deploy Edge Functions
echo 📦 Deploying Edge Functions...
echo    - Deploying new-problem function...
supabase functions deploy new-problem

echo    - Deploying validate-step function...
supabase functions deploy validate-step

REM Run migrations
echo 🗃️  Running database migrations...
supabase db push

echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Update your Supabase project URL and keys in src/supabaseClient.js
echo 2. Test the application at http://localhost:3000/math-question.html
echo 3. Remove development mode fallbacks from src/math-question.js
echo.
echo 🎉 Your math tutoring backend is now live!
pause
