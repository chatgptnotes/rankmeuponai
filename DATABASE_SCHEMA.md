# Database Schema Documentation - RankMeUpon.ai

## Overview

This document describes the complete database schema for RankMeUpon.ai, an AI search visibility tracking platform. The schema is designed for PostgreSQL with Supabase and includes Row Level Security (RLS) policies for multi-tenant data isolation.

## Table of Contents

1. [Core Tables](#core-tables)
2. [Supporting Tables](#supporting-tables)
3. [Analytics Tables](#analytics-tables)
4. [Database Views](#database-views)
5. [Functions](#functions)
6. [RLS Policies](#rls-policies)
7. [Indexes](#indexes)
8. [ER Diagram](#er-diagram)

---

## Core Tables

### `profiles`
User profile information synced with Supabase Auth.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References auth.users(id) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `email` | TEXT | User email address |
| `full_name` | TEXT | User's full name |
| `avatar_url` | TEXT | Profile avatar URL |
| `company` | TEXT | Company/organization name |

**Indexes:**
- Primary key on `id`

**RLS Policies:**
- Users can view and update their own profile only

---

### `brands`
Core table for brands/entities being tracked.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique brand identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `user_id` | UUID (FK) | Owner (references profiles.id) |
| `name` | TEXT | Brand name |
| `website_url` | TEXT | Brand website |
| `industry` | TEXT | Industry/vertical |
| `entity_type` | TEXT | Type: brand, product, person, organization, service |
| `description` | TEXT | Brand description |
| `logo_url` | TEXT | Brand logo URL |
| `location_type` | TEXT | 'global' or 'location' |
| `location_value` | TEXT | Geographic location if location-specific |
| `variations` | TEXT[] | Array of brand name variations |
| `onboarding_completed` | BOOLEAN | Whether onboarding is complete |
| `last_tracked_at` | TIMESTAMPTZ | Last tracking session timestamp |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp (NULL = active) |
| `deleted_by` | UUID (FK) | User who deleted (references profiles.id) |

**Indexes:**
- `idx_brands_user_id` on `user_id`
- `idx_brands_deleted_at` on `deleted_at` WHERE deleted_at IS NULL

**RLS Policies:**
- Users can view, insert, update, and delete their own brands only

---

### `prompts`
User-defined prompts to track across AI engines.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique prompt identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `brand_id` | UUID (FK) | Associated brand (references brands.id) |
| `topic_id` | UUID (FK) | Associated topic (references topics.id) |
| `prompt_text` | TEXT | The actual prompt text |
| `category` | TEXT | Prompt category |
| `is_active` | BOOLEAN | Whether tracking is active |
| `tracking_frequency` | TEXT | 'hourly', 'daily', or 'weekly' |
| `last_tracked_at` | TIMESTAMPTZ | Last tracking timestamp |
| `ai_engines` | TEXT[] | Array of AI engines to track |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `deleted_by` | UUID (FK) | User who deleted |

**Indexes:**
- `idx_prompts_brand_id` on `brand_id`
- `idx_prompts_topic_id` on `topic_id`
- `idx_prompts_brand_active` on `(brand_id, is_active)` WHERE deleted_at IS NULL
- `idx_prompts_deleted_at` on `deleted_at` WHERE deleted_at IS NULL

**RLS Policies:**
- Users can view, insert, update, and delete prompts for their brands only

---

### `tracking_sessions`
Individual tracking runs for prompts across AI engines.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique session identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `prompt_id` | UUID (FK) | Associated prompt |
| `ai_engine` | TEXT | AI engine: 'chatgpt', 'perplexity', 'gemini', 'claude' |
| `status` | TEXT | Status: 'pending', 'running', 'completed', 'failed' |
| `response_text` | TEXT | AI response text |
| `citations` | JSONB | Legacy citations (use citations table instead) |
| `metadata` | JSONB | Additional metadata |
| `mentioned` | BOOLEAN | Whether brand was mentioned |
| `position` | INT | Position of brand mention |
| `sentiment` | TEXT | 'positive', 'neutral', or 'negative' |
| `citation_quality` | INT | Quality score 1-10 |

**Indexes:**
- `idx_tracking_sessions_brand_id` on `brand_id`
- `idx_tracking_sessions_prompt_id` on `prompt_id`
- `idx_tracking_sessions_created_at` on `created_at DESC`
- `idx_tracking_sessions_brand_engine_date` on `(brand_id, ai_engine, created_at DESC)`

**RLS Policies:**
- Users can view and insert tracking sessions for their brands only

---

## Supporting Tables

### `brand_variations`
Alternative names/variations for brands.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique variation identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `variation_text` | TEXT | Variation text |
| `is_primary` | BOOLEAN | Whether this is the primary name |

**Indexes:**
- `idx_brand_variations_brand_id` on `brand_id`

---

### `brand_targeting`
Geographic targeting information for brands.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique targeting identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `location_type` | TEXT | 'global' or 'location' |
| `location_value` | TEXT | Location value if location-specific |

**Indexes:**
- `idx_brand_targeting_brand_id` on `brand_id`

---

### `topics`
Topic clusters for organizing prompts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique topic identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `name` | TEXT | Topic name |
| `description` | TEXT | Topic description |
| `sort_order` | INT | Display order |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `deleted_by` | UUID (FK) | User who deleted |

**Indexes:**
- `idx_topics_brand_id` on `brand_id`
- `idx_topics_deleted_at` on `deleted_at` WHERE deleted_at IS NULL

---

### `keywords`
Keywords to track for brand mentions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique keyword identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `keyword` | TEXT | Keyword text |
| `category` | TEXT | Keyword category |
| `tracking_enabled` | BOOLEAN | Whether tracking is enabled |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `deleted_by` | UUID (FK) | User who deleted |

**Indexes:**
- `idx_keywords_brand_id` on `brand_id`
- `idx_keywords_deleted_at` on `deleted_at` WHERE deleted_at IS NULL

---

### `keyword_mentions`
Tracks keyword mentions in tracking sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique mention identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `keyword_id` | UUID (FK) | Associated keyword |
| `tracking_session_id` | UUID (FK) | Associated tracking session |
| `mention_count` | INT | Number of mentions |
| `context_snippet` | TEXT | Context around mention |

**Indexes:**
- `idx_keyword_mentions_keyword_id` on `keyword_id`
- `idx_keyword_mentions_session_id` on `tracking_session_id`

---

### `competitors`
User-defined competitors to track.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique competitor identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `competitor_name` | TEXT | Competitor name |
| `competitor_domain` | TEXT | Competitor domain |
| `competitor_website` | TEXT | Competitor website |
| `tracking_enabled` | BOOLEAN | Whether tracking is enabled |
| `notes` | TEXT | Notes about competitor |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `deleted_by` | UUID (FK) | User who deleted |

**Unique Constraint:**
- `(brand_id, competitor_name)`

**Indexes:**
- `idx_competitors_brand_id` on `brand_id`
- `idx_competitors_tracking_enabled` on `tracking_enabled` WHERE tracking_enabled = true
- `idx_competitors_deleted_at` on `deleted_at` WHERE deleted_at IS NULL

---

### `notifications`
User notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique notification identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `user_id` | UUID (FK) | Associated user |
| `type` | TEXT | Type: 'alert', 'summary', 'update' |
| `title` | TEXT | Notification title |
| `message` | TEXT | Notification message |
| `is_read` | BOOLEAN | Whether notification has been read |

**Indexes:**
- `idx_notifications_user_id` on `user_id`
- `idx_notifications_created_at` on `created_at DESC`

---

## Analytics Tables

### `ai_engines`
Reference table for AI engines/platforms.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique engine identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `name` | TEXT | Engine name |
| `slug` | TEXT | URL-friendly slug (UNIQUE) |
| `api_provider` | TEXT | API provider |
| `is_active` | BOOLEAN | Whether engine is active |
| `rate_limit_per_minute` | INT | Rate limit |
| `cost_per_query` | DECIMAL(10,6) | Cost per query |
| `metadata` | JSONB | Additional metadata |

**Default Data:**
- ChatGPT (openai)
- Perplexity (perplexity)
- Google Gemini (google)
- Claude (anthropic)

---

### `citations`
Structured citation data from AI responses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique citation identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `tracking_session_id` | UUID (FK) | Associated tracking session |
| `brand_id` | UUID (FK) | Associated brand |
| `source_url` | TEXT | Citation source URL |
| `source_title` | TEXT | Citation source title |
| `source_domain` | TEXT | Citation domain |
| `citation_text` | TEXT | Citation text |
| `position` | INT | Position in response |
| `context` | TEXT | Context around citation |
| `is_brand_mentioned` | BOOLEAN | Whether brand is mentioned |
| `sentiment` | TEXT | Sentiment: 'positive', 'neutral', 'negative' |
| `relevance_score` | DECIMAL(3,2) | Relevance score 0.00-1.00 |
| `metadata` | JSONB | Additional metadata |

**Indexes:**
- `idx_citations_session_id` on `tracking_session_id`
- `idx_citations_brand_id` on `brand_id`
- `idx_citations_is_brand_mentioned` on `is_brand_mentioned`
- `idx_citations_brand_mentioned` on `(brand_id, is_brand_mentioned, created_at DESC)`

---

### `discovered_brands`
Auto-discovered competitor brands from AI responses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique discovery identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `tracking_session_id` | UUID (FK) | Associated tracking session |
| `brand_name` | TEXT | Discovered brand name |
| `brand_domain` | TEXT | Discovered brand domain |
| `mention_count` | INT | Mention count |
| `first_position` | INT | First mention position |
| `is_competitor` | BOOLEAN | Whether marked as competitor |
| `metadata` | JSONB | Additional metadata |

**Indexes:**
- `idx_discovered_brands_session_id` on `tracking_session_id`
- `idx_discovered_brands_brand_name` on `brand_name`

---

### `visibility_scores`
Historical visibility scores aggregated by date and engine.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique score identifier |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `brand_id` | UUID (FK) | Associated brand |
| `ai_engine_id` | UUID (FK) | Associated AI engine |
| `date` | DATE | Score date |
| `score` | DECIMAL(5,2) | Visibility score 0.00-100.00 |
| `total_prompts_tracked` | INT | Total prompts tracked |
| `total_mentions` | INT | Total brand mentions |
| `avg_position` | DECIMAL(4,2) | Average mention position |
| `sentiment_breakdown` | JSONB | Sentiment counts |
| `metadata` | JSONB | Additional metadata |

**Unique Constraint:**
- `(brand_id, ai_engine_id, date)`

**Indexes:**
- `idx_visibility_scores_brand_id` on `brand_id`
- `idx_visibility_scores_date` on `date DESC`
- `idx_visibility_scores_brand_engine` on `(brand_id, ai_engine_id)`

---

## Database Views

### `brand_overview`
Comprehensive brand statistics.

**Columns:**
- All brand columns
- `total_prompts` - Count of all prompts
- `active_prompts` - Count of active prompts
- `total_topics` - Count of topics
- `tracked_keywords` - Count of tracked keywords
- `total_tracking_sessions` - Count of completed sessions
- `total_mentions` - Count of brand mentions
- `visibility_percentage` - Overall visibility percentage

---

### `prompt_performance`
Performance metrics for each prompt.

**Columns:**
- Prompt details (id, text, category, topic)
- `times_tracked` - How many times tracked
- `times_mentioned` - How many times brand was mentioned
- `mention_rate` - Percentage of mentions
- `avg_position` - Average position when mentioned
- `last_tracked_at` - Last tracking timestamp

---

### `ai_engine_performance`
Performance breakdown by AI engine and brand.

**Columns:**
- Engine details (id, name, slug)
- Brand details (id, name)
- `total_queries` - Total queries to this engine
- `total_mentions` - Total mentions in this engine
- `visibility_score` - Visibility percentage
- `avg_position` - Average position
- `unique_prompts_tracked` - Unique prompts
- `last_tracked_at` - Last tracking timestamp

---

### `topic_performance`
Performance metrics for topic clusters.

**Columns:**
- Topic details (id, name, brand)
- `total_prompts` - Count of prompts in topic
- `active_prompts` - Count of active prompts
- `times_tracked` - Total tracking sessions
- `times_mentioned` - Total mentions
- `visibility_score` - Topic visibility percentage

---

### `competitor_mentions`
Competitor tracking and mentions.

**Columns:**
- Competitor details (id, name, brand)
- `discovery_count` - Times discovered
- `session_count` - Tracking sessions mentioning competitor
- `avg_first_position` - Average position
- `last_discovered_at` - Last discovery timestamp

---

### `recent_activity`
Recent tracking activity (last 30 days).

**Columns:**
- Activity details (id, created_at, type)
- Brand and prompt information
- `ai_engine` - Which engine
- `status` - Session status
- `mentioned` - Whether mentioned
- `sentiment` - Sentiment

---

## Functions

### `handle_updated_at()`
Trigger function to auto-update `updated_at` columns.

**Usage:**
```sql
CREATE TRIGGER set_table_updated_at
    BEFORE UPDATE ON public.table_name
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

---

### `handle_new_user()`
Trigger function to auto-create profile on user signup.

**Trigger:**
```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

### `calculate_visibility_score(p_brand_id UUID, p_ai_engine_id UUID, p_date DATE)`
Calculates visibility score for a brand.

**Returns:** DECIMAL (0-100)

**Formula:** `(total_mentions / total_prompts) * 100`

---

### `update_visibility_scores(p_date DATE)`
Updates visibility scores for all brands for a given date.

**Usage:**
```sql
SELECT public.update_visibility_scores(CURRENT_DATE);
```

**Recommendation:** Run daily via cron or scheduled job.

---

### `soft_delete_brand(p_brand_id UUID)`
Soft deletes a brand (sets deleted_at).

**Returns:** BOOLEAN (success)

**Usage:**
```sql
SELECT public.soft_delete_brand('brand-uuid');
```

---

### `restore_brand(p_brand_id UUID)`
Restores a soft-deleted brand.

**Returns:** BOOLEAN (success)

---

### `get_brand_stats(p_brand_id UUID)`
Returns comprehensive statistics for a brand.

**Returns:** Table with columns:
- `total_prompts`
- `active_prompts`
- `total_topics`
- `total_keywords`
- `visibility_score`
- `total_mentions`
- `last_tracked_at`

---

## RLS Policies

All tables have Row Level Security (RLS) enabled. Policies ensure:

1. **User Isolation:** Users can only access their own data
2. **Cascade Security:** Child tables check parent brand ownership
3. **Public Read:** Some tables (like `ai_engines`) are readable by all authenticated users

**Policy Pattern:**
```sql
CREATE POLICY "Users can view their own brands"
    ON public.brands FOR SELECT
    USING (auth.uid() = user_id);
```

---

## Indexes

### Performance Indexes
- Foreign key indexes on all FK columns
- Composite indexes for common query patterns
- Partial indexes for filtered queries (e.g., WHERE deleted_at IS NULL)

### Key Composite Indexes
- `(brand_id, ai_engine, created_at)` on tracking_sessions
- `(brand_id, is_brand_mentioned, created_at)` on citations
- `(brand_id, is_active)` on prompts

---

## ER Diagram

```
┌──────────────┐
│   profiles   │
└──────┬───────┘
       │ 1:N
       │
┌──────▼───────┐     1:N     ┌─────────────────┐
│    brands    │─────────────▶│     prompts     │
└──────┬───────┘              └────────┬────────┘
       │ 1:N                            │ 1:N
       │                                │
       ├────────┬───────────┬───────────┼────────┐
       │        │           │           │        │
    1:N│     1:N│        1:N│        1:N│        │
       │        │           │           │        │
┌──────▼───┐ ┌─▼────────┐ ┌▼──────┐ ┌─▼────────▼────────────┐
│  topics  │ │ keywords │ │compet │ │  tracking_sessions    │
└──────────┘ └──────────┘ │ itors │ └───────┬───────────────┘
                           └───────┘         │ 1:N
                                             │
                           ┌─────────────────┼────────────────┐
                           │                 │                │
                       1:N │             1:N │            1:N │
                           │                 │                │
                      ┌────▼─────┐    ┌─────▼──────┐  ┌──────▼──────────┐
                      │citations │    │ discovered │  │  visibility     │
                      │          │    │   brands   │  │    scores       │
                      └──────────┘    └────────────┘  └─────────────────┘
```

---

## Migration Strategy

1. **001_initial_schema.sql** - Core tables and base structure
2. **002_additional_tables.sql** - Supporting tables and enhancements
3. **003_citations_and_ai_engines.sql** - Analytics tables
4. **004_enhancements_and_views.sql** - Views, soft deletes, competitors

**Run migrations in order:**
```bash
psql -d your_database -f supabase/migrations/001_initial_schema.sql
psql -d your_database -f supabase/migrations/002_additional_tables.sql
psql -d your_database -f supabase/migrations/003_citations_and_ai_engines.sql
psql -d your_database -f supabase/migrations/004_enhancements_and_views.sql
```

---

## Maintenance

### Daily Tasks
- Run `update_visibility_scores(CURRENT_DATE)` to calculate daily scores
- Monitor tracking session success rates

### Weekly Tasks
- Review soft-deleted items for permanent deletion
- Analyze visibility trends

### Monthly Tasks
- Archive old tracking sessions (optional)
- Review and optimize slow queries

---

## Backup & Recovery

### Backup
```bash
pg_dump -d your_database > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -d your_database < backup_20231115.sql
```

### Point-in-Time Recovery
Supabase provides automated backups and PITR. Configure retention period in dashboard.

---

## Performance Considerations

1. **Indexes:** All foreign keys are indexed
2. **Composite Indexes:** Added for common query patterns
3. **Partial Indexes:** Used for filtered queries
4. **Views:** Materialized views can be created for expensive queries
5. **Archival:** Consider archiving old tracking_sessions data

---

## Security

1. **RLS:** Enforced on all user-facing tables
2. **SECURITY DEFINER:** Used for utility functions
3. **Soft Deletes:** Preserves data integrity
4. **Audit Trail:** `deleted_by` tracks who deleted data
5. **Cascading Deletes:** Configured for parent-child relationships

---

**Last Updated:** 2025-11-14
**Schema Version:** 1.4
**Database:** PostgreSQL (Supabase)
