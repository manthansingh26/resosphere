# 🚀 Quick Test Guide

## Before Testing

1. **Add credentials to `.env.local`:**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_GROQ_API_KEY=your_groq_key
   ```

2. **Run database schema:**
   - Open Supabase Dashboard → SQL Editor
   - Copy `supabase/schema.sql`
   - Execute

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

## Test Flow (5 minutes)

### 1. Homepage (/)
✅ See cosmic hero with 3D orb
✅ Click "Get Started" → Auth modal opens
✅ Sign up with email + password
✅ Modal closes, you're signed in

### 2. Log Vibe (/log-vibe)
✅ Adjust 5 sliders (Energy, Calm, Creative, Focus, Joy)
✅ Type: "Feeling cosmic and creative today!"
✅ Click "Submit Vibe"
✅ Watch particle explosion (3 seconds)
✅ See new orb with AI-generated color
✅ Read poetic insight + action
✅ See resonance score

### 3. My Aura (/my-aura)
✅ See main orb with particles
✅ View average stats (5 badges)
✅ Read latest insight
✅ See vibe in timeline
✅ Click orb to pulse

### 4. Resonance Map (/resonance-map)
✅ See 3D globe spinning
✅ Your vibe appears as glowing point
✅ Hover over point → tooltip
✅ Click point → details card
✅ See live counter

### 5. Matches (/matches)
✅ See top 6 resonance matches
✅ View similarity percentages
✅ See mini orbs with colors
✅ Click "Send Resonance"
✅ Toast notification

### 6. Profile (/profile)
✅ Change username
✅ Pick new aura color
✅ See live preview
✅ Click "Save Changes"
✅ Toast confirmation

## Test Realtime (2 windows)

1. Open app in two browser windows
2. Sign in to both (different accounts or same)
3. In Window 1: Log a vibe
4. In Window 2: Watch it appear on:
   - Resonance Map (instantly)
   - Matches page (if similar)
5. Check live counter increases

## Test AI Analyzer

Try different vibe combinations:

**High Energy + Joy:**
- Energy: 90%
- Joy: 85%
- Text: "Feeling amazing and energized!"
- Expected: Bright color (cyan/pink), high resonance

**High Calm + Focus:**
- Calm: 80%
- Focus: 85%
- Text: "Deep focus and peaceful flow"
- Expected: Deep color (indigo/purple), meditative insight

**High Creative:**
- Creative: 95%
- Text: "Ideas flowing like cosmic rivers"
- Expected: Purple/magenta, creative action

## Check Animations

✅ Particle explosion on submit
✅ Orb pulse on click
✅ Card hover effects
✅ Page transitions
✅ Loading spinners
✅ Toast notifications
✅ Globe rotation
✅ Smooth fades

## Verify Theme

✅ Dark cosmic background
✅ Purple/cyan/indigo colors
✅ Glassmorphism on cards
✅ Heavy glows everywhere
✅ Gradient text
✅ Backdrop blur

## Common Issues

**"Missing Supabase environment variables"**
- Check `.env.local` exists
- Verify variable names start with `VITE_`
- Restart dev server

**"Failed to log vibe"**
- Check Groq API key is valid
- Verify database schema is created
- Check browser console for errors

**"No matches found"**
- Log more vibes (need at least 2)
- Check vibes table has data
- Verify realtime is enabled

**Globe not loading**
- Check internet connection (loads textures from CDN)
- Wait a few seconds for textures
- Check browser console

## Success Indicators

✅ No console errors
✅ Auth works smoothly
✅ AI returns insights
✅ Vibes save to database
✅ Realtime updates work
✅ Globe renders
✅ Matches calculate
✅ Animations are smooth
✅ Theme looks cosmic

## Performance Check

- Page load: < 2 seconds
- AI response: 1-2 seconds
- Realtime update: Instant
- Globe render: 2-3 seconds
- Smooth 60fps animations

## Ready for Demo!

Once all tests pass, you have a fully functional cosmic vibe app! 🌌✨
