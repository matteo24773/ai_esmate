# Production Deployment Guide

## 🎯 Quick Start - Switching to Production Mode

### Step 1: Deploy Backend Functions
Run the deployment script:
```powershell
# Windows
.\deploy.bat

# Or manually:
supabase functions deploy new-problem
supabase functions deploy validate-step
supabase db push
```

### Step 2: Switch to Production Mode
Edit `src/math-question.js` and change:
```javascript
const CONFIG = {
  // Set to false when backend is deployed and ready
  FORCE_DEVELOPMENT_MODE: false,  // <- Change this to false
  // ...
};
```

### Step 3: Update Supabase Configuration
Update `src/supabaseClient.js` with your production values:
```javascript
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-production-anon-key';
```

## 🔧 Configuration Options

### Development Mode Features
- ✅ Mock problem generation
- ✅ Basic step validation
- ✅ UI testing without backend
- ✅ Instant feedback simulation
- ✅ Development notices

### Production Mode Features  
- ✅ Real Supabase Edge Functions
- ✅ Advanced mathematical validation
- ✅ Session persistence in database
- ✅ Detailed step analysis
- ✅ User progress tracking

## 🧪 Testing Checklist

### Before Deployment
- [ ] Frontend loads without errors
- [ ] Development mode works correctly
- [ ] Mock validation responds properly
- [ ] UI states (loading, error, success) work
- [ ] Math keyboard functions properly

### After Deployment
- [ ] Switch `FORCE_DEVELOPMENT_MODE` to `false`
- [ ] Test backend API endpoints
- [ ] Verify database connections
- [ ] Test mathematical validation accuracy
- [ ] Check session persistence
- [ ] Validate user progress tracking

## 🚀 Performance Optimization

### Edge Function Cold Starts
- Functions may take 1-2 seconds on first call
- Subsequent calls are much faster
- Consider implementing loading states

### Database Optimization
- Indexes are already configured
- Row Level Security is enabled
- Automatic cleanup of old sessions

## 🔒 Security Notes

### API Keys
- Never expose service role keys in frontend
- Use anon key for client-side operations
- RLS policies protect user data

### Validation
- All math validation happens server-side
- Client input is sanitized
- Session-based access control

## 📊 Monitoring

Check Supabase dashboard for:
- Function execution logs
- Database query performance
- API usage statistics
- Error rates and debugging

---

**Current Status:** Development Mode (Ready for Production Deployment)
**Next Step:** Run `deploy.bat` and switch `FORCE_DEVELOPMENT_MODE` to `false`
