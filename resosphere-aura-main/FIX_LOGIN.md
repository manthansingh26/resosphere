# 🔧 Login/Sign Up Fix Guide

## ✅ What I Fixed

1. **Updated Supabase URL format** - Corrected to lowercase
2. **Added better error handling** - Clear error messages
3. **Added logging** - Console logs for debugging
4. **Password validation** - Minimum 6 characters
5. **Created quick setup SQL** - Easy database setup

## 🗄️ Database Setup (REQUIRED)

### Option 1: Quick Setup (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "New Query"
4. Copy contents of `supabase/quick-setup.sql`
5. Paste and click "Run"
6. Wait for "Database setup complete!" message

### Option 2: Full Setup
Use `supabase/schema.sql` instead (same steps)

## 🔑 Enable Email Auth in Supabase

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Make sure it's **Enabled**
4. **Disable** "Confirm email" for testing (optional)
5. Click **Save**

## 🧪 Test Login/Sign Up

### Test Sign Up:
1. Open http://localhost:8080/
2. Click "Get Started"
3. Enter email: `test@example.com`
4. Enter password: `password123` (min 6 chars)
5. Click "Sign Up"
6. Check browser console (F12) for logs

### Test Sign In:
1. Use same credentials
2. Click "Sign In"
3. Should redirect to homepage (authenticated)

## 🐛 Troubleshooting

### Error: "Invalid login credentials"
- **Cause**: Wrong email/password or user doesn't exist
- **Fix**: Try signing up first, or check credentials

### Error: "Email not confirmed"
- **Cause**: Email confirmation required
- **Fix**: 
  1. Check your email for confirmation link
  2. OR disable email confirmation in Supabase:
     - Auth → Providers → Email → Disable "Confirm email"

### Error: "User already registered"
- **Cause**: Email already exists
- **Fix**: Use "Sign In" instead of "Sign Up"

### Error: "Connection error"
- **Cause**: Can't reach Supabase
- **Fix**: 
  1. Check internet connection
  2. Verify Supabase URL is correct
  3. Check Supabase project is active

### No error but nothing happens
- **Cause**: Database tables not created
- **Fix**: Run the quick-setup.sql script

### Console shows "Supabase URL: https://placeholder..."
- **Cause**: Environment variables not loaded
- **Fix**: 
  1. Check `.env.local` exists
  2. Restart dev server
  3. Hard refresh browser (Ctrl+Shift+R)

## 📊 Check Browser Console

Press F12 and look for:
```
Supabase URL: https://ksic4o5k.supabase.co
Supabase Key configured: Yes
Attempting sign up for: test@example.com
Sign up successful: test@example.com
```

## ✅ Verification Checklist

- [ ] Database tables created (run SQL script)
- [ ] Email auth enabled in Supabase
- [ ] `.env.local` has correct credentials
- [ ] Dev server restarted after env changes
- [ ] Browser refreshed (hard refresh)
- [ ] Console shows correct Supabase URL
- [ ] No errors in browser console

## 🎯 Quick Test

```bash
# 1. Restart dev server
npm run dev

# 2. Open browser
http://localhost:8080/

# 3. Open console (F12)
# 4. Click "Get Started"
# 5. Try signing up
# 6. Check console for logs
```

## 📝 Current Configuration

Your `.env.local`:
```
VITE_SUPABASE_URL=https://ksic4o5k.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_GROQ_API_KEY=gsk_placeholder_for_demo
```

## 🆘 Still Not Working?

1. **Check Supabase Dashboard**:
   - Is project active?
   - Are tables created?
   - Is email auth enabled?

2. **Check Browser Console**:
   - Any red errors?
   - What does it say?

3. **Check Network Tab** (F12 → Network):
   - Are requests going to Supabase?
   - What's the response?

4. **Try Incognito Mode**:
   - Rules out cache issues

## ✨ Once Working

You should see:
- ✅ Sign up creates account
- ✅ Profile auto-created
- ✅ Sign in works
- ✅ Redirects to homepage
- ✅ Can access protected pages
- ✅ Can log vibes

## 🎊 Success!

When login works, you'll be able to:
- Log vibes with AI analysis
- See your aura evolve
- Find resonance matches
- Customize your profile
- Share to X

**Dev Server**: http://localhost:8080/
**Status**: Ready for testing!
