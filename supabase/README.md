# Database Setup

## Applying Migrations to Supabase

### Option 1: Using Supabase SQL Editor (Recommended for Quick Setup)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI (Recommended for Production)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

## Database Schema

The schema includes the following tables:

- **profiles**: User profiles linked to auth.users
- **brands**: Brand/entity tracking configuration
- **prompts**: Search prompts to track
- **tracking_sessions**: AI engine query results and citations

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## After Migration

After running the migration, you can:

1. Sign up for a new account at `/signup`
2. Verify your email
3. Log in at `/login`
4. Start creating brands and tracking prompts
