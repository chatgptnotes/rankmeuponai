-- =========================================
-- ROLLBACK SCRIPTS for RankMeUpon.ai
-- =========================================
-- WARNING: These scripts will DELETE data and schema
-- Use with extreme caution, especially in production
-- Always backup your database before running rollback scripts

-- =========================================
-- Rollback Migration 004
-- =========================================
-- Run this to undo migration 004_enhancements_and_views.sql

BEGIN;

-- Drop views
DROP VIEW IF EXISTS public.recent_activity CASCADE;
DROP VIEW IF EXISTS public.competitor_mentions CASCADE;
DROP VIEW IF EXISTS public.topic_performance CASCADE;
DROP VIEW IF EXISTS public.ai_engine_performance CASCADE;
DROP VIEW IF EXISTS public.prompt_performance CASCADE;
DROP VIEW IF EXISTS public.brand_overview CASCADE;

-- Drop utility functions
DROP FUNCTION IF EXISTS public.get_brand_stats(UUID);
DROP FUNCTION IF EXISTS public.restore_brand(UUID);
DROP FUNCTION IF EXISTS public.soft_delete_brand(UUID);

-- Drop indexes
DROP INDEX IF EXISTS public.idx_prompts_brand_active;
DROP INDEX IF EXISTS public.idx_citations_brand_mentioned;
DROP INDEX IF EXISTS public.idx_tracking_sessions_brand_engine_date;
DROP INDEX IF EXISTS public.idx_competitors_deleted_at;
DROP INDEX IF EXISTS public.idx_competitors_tracking_enabled;
DROP INDEX IF EXISTS public.idx_competitors_brand_id;
DROP INDEX IF EXISTS public.idx_keywords_deleted_at;
DROP INDEX IF EXISTS public.idx_topics_deleted_at;
DROP INDEX IF EXISTS public.idx_prompts_deleted_at;
DROP INDEX IF EXISTS public.idx_brands_deleted_at;

-- Drop table
DROP TABLE IF EXISTS public.competitors CASCADE;

-- Remove soft delete columns
ALTER TABLE public.keywords
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;

ALTER TABLE public.topics
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;

ALTER TABLE public.prompts
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;

ALTER TABLE public.brands
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_by;

COMMIT;

-- =========================================
-- Rollback Migration 003
-- =========================================
-- Run this to undo migration 003_citations_and_ai_engines.sql

BEGIN;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_visibility_scores(DATE);
DROP FUNCTION IF EXISTS public.calculate_visibility_score(UUID, UUID, DATE);

-- Drop indexes
DROP INDEX IF EXISTS public.idx_visibility_scores_brand_engine;
DROP INDEX IF EXISTS public.idx_visibility_scores_date;
DROP INDEX IF EXISTS public.idx_visibility_scores_brand_id;
DROP INDEX IF EXISTS public.idx_discovered_brands_brand_name;
DROP INDEX IF EXISTS public.idx_discovered_brands_session_id;
DROP INDEX IF EXISTS public.idx_citations_is_brand_mentioned;
DROP INDEX IF EXISTS public.idx_citations_brand_id;
DROP INDEX IF EXISTS public.idx_citations_session_id;

-- Drop tables
DROP TABLE IF EXISTS public.visibility_scores CASCADE;
DROP TABLE IF EXISTS public.discovered_brands CASCADE;
DROP TABLE IF EXISTS public.citations CASCADE;
DROP TABLE IF EXISTS public.ai_engines CASCADE;

COMMIT;

-- =========================================
-- Rollback Migration 002
-- =========================================
-- Run this to undo migration 002_additional_tables.sql

BEGIN;

-- Remove columns from tracking_sessions
ALTER TABLE public.tracking_sessions
DROP COLUMN IF EXISTS ai_engines,
DROP COLUMN IF EXISTS last_tracked_at,
DROP COLUMN IF EXISTS tracking_frequency,
DROP COLUMN IF EXISTS citation_quality,
DROP COLUMN IF EXISTS sentiment,
DROP COLUMN IF EXISTS position,
DROP COLUMN IF EXISTS mentioned;

-- Remove columns from brands
ALTER TABLE public.brands
DROP COLUMN IF EXISTS last_tracked_at,
DROP COLUMN IF EXISTS onboarding_completed,
DROP COLUMN IF EXISTS variations,
DROP COLUMN IF EXISTS location_value,
DROP COLUMN IF EXISTS location_type;

-- Drop index
DROP INDEX IF EXISTS public.idx_prompts_topic_id;

-- Remove column from prompts
ALTER TABLE public.prompts
DROP COLUMN IF EXISTS topic_id;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_keyword_mentions_session_id;
DROP INDEX IF EXISTS public.idx_keyword_mentions_keyword_id;
DROP INDEX IF EXISTS public.idx_keywords_brand_id;
DROP INDEX IF EXISTS public.idx_topics_brand_id;
DROP INDEX IF EXISTS public.idx_brand_targeting_brand_id;
DROP INDEX IF EXISTS public.idx_brand_variations_brand_id;

-- Drop tables
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.keyword_mentions CASCADE;
DROP TABLE IF EXISTS public.keywords CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.brand_targeting CASCADE;
DROP TABLE IF EXISTS public.brand_variations CASCADE;

COMMIT;

-- =========================================
-- Rollback Migration 001
-- =========================================
-- Run this to undo migration 001_initial_schema.sql
-- WARNING: This will delete ALL data

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_prompts_updated_at ON public.prompts;
DROP TRIGGER IF EXISTS set_brands_updated_at ON public.brands;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS public.idx_tracking_sessions_created_at;
DROP INDEX IF EXISTS public.idx_tracking_sessions_prompt_id;
DROP INDEX IF EXISTS public.idx_tracking_sessions_brand_id;
DROP INDEX IF EXISTS public.idx_prompts_brand_id;
DROP INDEX IF EXISTS public.idx_brands_user_id;

-- Drop tables
DROP TABLE IF EXISTS public.tracking_sessions CASCADE;
DROP TABLE IF EXISTS public.prompts CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop extension
DROP EXTENSION IF EXISTS "uuid-ossp";

COMMIT;

-- =========================================
-- COMPLETE DATABASE RESET
-- =========================================
-- Run this to completely reset the database to a clean state
-- EXTREMELY DANGEROUS - Only use in development/testing

-- Uncomment the following to perform a complete reset:

/*
BEGIN;

-- Drop all custom schemas (if any)
-- DROP SCHEMA IF EXISTS custom CASCADE;

-- Drop all public tables
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all public views
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all public functions
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as argtypes
              FROM pg_proc INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
              WHERE pg_namespace.nspname = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Drop all public types
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all extensions
DROP EXTENSION IF EXISTS "uuid-ossp";

COMMIT;
*/

-- =========================================
-- Verification
-- =========================================
-- After rollback, verify what remains:

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- List all views
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public' ORDER BY table_name;

-- List all functions
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' ORDER BY routine_name;
