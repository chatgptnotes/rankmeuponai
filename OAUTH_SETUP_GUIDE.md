# OAuth Setup Guide - Google & GitHub Authentication

## Overview

This guide explains how to enable Google and GitHub OAuth authentication in your RankMeUpon.ai application using Supabase.

---

## Prerequisites

- Supabase project created
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)

---

## Part 1: Configure Google OAuth

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

### Step 2: Create OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Fill in the required fields:
   - App name: `RankMeUpon.ai`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `email`
   - `profile`
5. Save and continue

### Step 3: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: `RankMeUpon.ai Web Client`
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-domain.com
   ```

6. Authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

7. Click "Create"
8. **Copy your Client ID and Client Secret** (you'll need these)

### Step 4: Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click to expand
4. Toggle "Enable Sign in with Google" to ON
5. Paste your Google Client ID and Client Secret
6. Save changes

---

## Part 2: Configure GitHub OAuth

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" > "New OAuth App"
3. Fill in the details:
   - Application name: `RankMeUpon.ai`
   - Homepage URL: `https://your-domain.com` (or `http://localhost:3000` for development)
   - Authorization callback URL:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```

4. Click "Register application"
5. On the next page, click "Generate a new client secret"
6. **Copy your Client ID and Client Secret**

### Step 2: Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "GitHub" and click to expand
4. Toggle "Enable Sign in with GitHub" to ON
5. Paste your GitHub Client ID and Client Secret
6. Save changes

---

## Part 3: Update Your Application

### Step 1: Verify Environment Variables

Your `.env.local` should already have Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

No additional environment variables needed for OAuth!

### Step 2: Test Social Login

The social auth buttons are already added to your login and signup pages:

1. Run your app: `npm run dev`
2. Go to `/login` or `/signup`
3. Click "Continue with Google" or "Continue with GitHub"
4. You should be redirected to OAuth provider
5. After authorizing, you'll be redirected back to your app

---

## Part 4: Production Configuration

### For Vercel Deployment

1. **Update Google OAuth redirect URIs:**
   - Add: `https://your-vercel-domain.vercel.app/auth/callback`

2. **Update GitHub OAuth callback URL:**
   - Add: `https://your-vercel-domain.vercel.app` as Homepage URL

3. **No changes needed in Vercel** - Supabase handles everything!

### For Custom Domain

1. Update both Google and GitHub with your custom domain:
   - Google: Add authorized origin and redirect URI
   - GitHub: Update homepage URL and callback URL

2. In Supabase, add your custom domain to:
   - Authentication > URL Configuration > Site URL
   - Authentication > URL Configuration > Redirect URLs

---

## Part 5: Testing Checklist

### Google OAuth
- [ ] Can click "Continue with Google"
- [ ] Redirected to Google login
- [ ] Can select/sign in with Google account
- [ ] Redirected back to app
- [ ] User is logged in
- [ ] Profile created in database
- [ ] Can access dashboard

### GitHub OAuth
- [ ] Can click "Continue with GitHub"
- [ ] Redirected to GitHub authorization
- [ ] Can authorize the app
- [ ] Redirected back to app
- [ ] User is logged in
- [ ] Profile created in database
- [ ] Can access dashboard

### Both Providers
- [ ] Email address synced correctly
- [ ] Full name synced correctly
- [ ] Avatar URL synced (if available)
- [ ] User can log out
- [ ] User can log back in with same provider
- [ ] Subsequent logins work instantly

---

## Troubleshooting

### "OAuth provider not enabled"
**Solution:** Make sure you've enabled the provider in Supabase dashboard

### "Redirect URI mismatch"
**Solution:** Ensure your redirect URI in Google/GitHub exactly matches the Supabase callback URL

### "User already registered"
**Solution:** This is normal - if a user signs up with email first, they can't use OAuth with the same email

### "Profile not created"
**Solution:** Check that the `on_auth_user_created` trigger exists in your database (from 001_initial_schema.sql)

---

## Security Best Practices

### 1. Use Environment Variables
Never commit OAuth secrets to git:

```bash
# .gitignore (already configured)
.env.local
.env*.local
```

### 2. Restrict Redirect URIs
Only add trusted domains to your OAuth redirect URIs

### 3. Review Permissions
Only request necessary OAuth scopes (email and profile are usually sufficient)

### 4. Monitor Usage
Check Supabase dashboard > Authentication > Users for OAuth login patterns

### 5. Rate Limiting
Supabase automatically rate limits auth requests

---

## FAQ

**Q: Do I need to configure both Google and GitHub?**
A: No! You can enable just one, both, or neither. Email/password auth still works.

**Q: Can users use different OAuth providers for the same email?**
A: No - Supabase links accounts by email. First registration method "owns" the email.

**Q: How do I customize the OAuth consent screen?**
A: Edit in Google Cloud Console or GitHub OAuth app settings

**Q: Are there costs for OAuth?**
A: No! Google and GitHub OAuth are free for most use cases

**Q: Can I add more OAuth providers?**
A: Yes! Supabase supports: Azure, Bitbucket, Discord, Facebook, GitLab, LinkedIn, Notion, Slack, Spotify, Twitch, Twitter, and more

---

## Next Steps

After enabling OAuth:

1. Test thoroughly with both providers
2. Update your privacy policy (mention OAuth providers)
3. Update your terms of service
4. Consider adding more providers based on your audience
5. Monitor sign-up conversion rates by auth method

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

**Last Updated:** 2025-11-14
**Version:** 1.8 (Phase 2 Complete)
