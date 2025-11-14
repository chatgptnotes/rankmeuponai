-- =========================================
-- Migration 004: Schema Enhancements & Views
-- =========================================

-- Add soft delete support to core tables
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.topics
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.keywords
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id);

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_brands_deleted_at ON public.brands(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_prompts_deleted_at ON public.prompts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_topics_deleted_at ON public.topics(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_keywords_deleted_at ON public.keywords(deleted_at) WHERE deleted_at IS NULL;

-- Add competitors table (tracked competitors vs auto-discovered brands)
CREATE TABLE IF NOT EXISTS public.competitors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    competitor_name TEXT NOT NULL,
    competitor_domain TEXT,
    competitor_website TEXT,
    tracking_enabled BOOLEAN DEFAULT true,
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES public.profiles(id),
    UNIQUE(brand_id, competitor_name)
);

-- Create index for competitors
CREATE INDEX IF NOT EXISTS idx_competitors_brand_id ON public.competitors(brand_id);
CREATE INDEX IF NOT EXISTS idx_competitors_tracking_enabled ON public.competitors(tracking_enabled) WHERE tracking_enabled = true;
CREATE INDEX IF NOT EXISTS idx_competitors_deleted_at ON public.competitors(deleted_at) WHERE deleted_at IS NULL;

-- Enable RLS for competitors
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- RLS policies for competitors
CREATE POLICY "Users can view competitors for their brands"
    ON public.competitors FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = competitors.brand_id
        AND brands.user_id = auth.uid()
        AND competitors.deleted_at IS NULL
    ));

CREATE POLICY "Users can insert competitors for their brands"
    ON public.competitors FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = competitors.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can update competitors for their brands"
    ON public.competitors FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = competitors.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete competitors for their brands"
    ON public.competitors FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = competitors.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Add trigger for competitors updated_at
CREATE TRIGGER set_competitors_updated_at
    BEFORE UPDATE ON public.competitors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =========================================
-- ANALYTICS VIEWS
-- =========================================

-- View: Brand Overview with Statistics
CREATE OR REPLACE VIEW public.brand_overview AS
SELECT
    b.id,
    b.name,
    b.website_url,
    b.industry,
    b.entity_type,
    b.user_id,
    b.created_at,
    b.updated_at,
    b.last_tracked_at,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) as total_prompts,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true AND p.deleted_at IS NULL) as active_prompts,
    COUNT(DISTINCT t.id) FILTER (WHERE t.deleted_at IS NULL) as total_topics,
    COUNT(DISTINCT k.id) FILTER (WHERE k.deleted_at IS NULL AND k.tracking_enabled = true) as tracked_keywords,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') as total_tracking_sessions,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed' AND ts.mentioned = true) as total_mentions,
    CASE
        WHEN COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') > 0 THEN
            ROUND((COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true)::DECIMAL /
                   COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed')::DECIMAL) * 100, 2)
        ELSE 0
    END as visibility_percentage
FROM public.brands b
LEFT JOIN public.prompts p ON p.brand_id = b.id
LEFT JOIN public.topics t ON t.brand_id = b.id
LEFT JOIN public.keywords k ON k.brand_id = b.id
LEFT JOIN public.tracking_sessions ts ON ts.brand_id = b.id
WHERE b.deleted_at IS NULL
GROUP BY b.id;

-- View: Prompt Performance
CREATE OR REPLACE VIEW public.prompt_performance AS
SELECT
    p.id,
    p.prompt_text,
    p.brand_id,
    b.name as brand_name,
    p.category,
    p.is_active,
    t.name as topic_name,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') as times_tracked,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed' AND ts.mentioned = true) as times_mentioned,
    CASE
        WHEN COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') > 0 THEN
            ROUND((COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true)::DECIMAL /
                   COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed')::DECIMAL) * 100, 2)
        ELSE 0
    END as mention_rate,
    AVG(ts.position) FILTER (WHERE ts.mentioned = true AND ts.position IS NOT NULL) as avg_position,
    MAX(ts.created_at) FILTER (WHERE ts.status = 'completed') as last_tracked_at
FROM public.prompts p
JOIN public.brands b ON b.id = p.brand_id
LEFT JOIN public.topics t ON t.id = p.topic_id
LEFT JOIN public.tracking_sessions ts ON ts.prompt_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, b.name, t.name;

-- View: AI Engine Performance
CREATE OR REPLACE VIEW public.ai_engine_performance AS
SELECT
    ae.id as engine_id,
    ae.name as engine_name,
    ae.slug as engine_slug,
    b.id as brand_id,
    b.name as brand_name,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') as total_queries,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed' AND ts.mentioned = true) as total_mentions,
    CASE
        WHEN COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') > 0 THEN
            ROUND((COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true)::DECIMAL /
                   COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed')::DECIMAL) * 100, 2)
        ELSE 0
    END as visibility_score,
    AVG(ts.position) FILTER (WHERE ts.mentioned = true AND ts.position IS NOT NULL) as avg_position,
    COUNT(DISTINCT ts.prompt_id) as unique_prompts_tracked,
    MAX(ts.created_at) FILTER (WHERE ts.status = 'completed') as last_tracked_at
FROM public.ai_engines ae
CROSS JOIN public.brands b
LEFT JOIN public.tracking_sessions ts ON ts.ai_engine = ae.slug AND ts.brand_id = b.id
WHERE ae.is_active = true AND b.deleted_at IS NULL
GROUP BY ae.id, ae.name, ae.slug, b.id, b.name;

-- View: Topic Performance
CREATE OR REPLACE VIEW public.topic_performance AS
SELECT
    t.id,
    t.name as topic_name,
    t.brand_id,
    b.name as brand_name,
    COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL) as total_prompts,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true AND p.deleted_at IS NULL) as active_prompts,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') as times_tracked,
    COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true) as times_mentioned,
    CASE
        WHEN COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') > 0 THEN
            ROUND((COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true)::DECIMAL /
                   COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed')::DECIMAL) * 100, 2)
        ELSE 0
    END as visibility_score
FROM public.topics t
JOIN public.brands b ON b.id = t.brand_id
LEFT JOIN public.prompts p ON p.topic_id = t.id
LEFT JOIN public.tracking_sessions ts ON ts.prompt_id = p.id
WHERE t.deleted_at IS NULL AND b.deleted_at IS NULL
GROUP BY t.id, b.name;

-- View: Competitor Tracking
CREATE OR REPLACE VIEW public.competitor_mentions AS
SELECT
    c.id as competitor_id,
    c.competitor_name,
    c.brand_id,
    b.name as brand_name,
    COUNT(DISTINCT db.id) as discovery_count,
    COUNT(DISTINCT db.tracking_session_id) as session_count,
    AVG(db.first_position) as avg_first_position,
    MAX(db.created_at) as last_discovered_at
FROM public.competitors c
JOIN public.brands b ON b.id = c.brand_id
LEFT JOIN public.discovered_brands db ON LOWER(db.brand_name) = LOWER(c.competitor_name)
    AND EXISTS (
        SELECT 1 FROM public.tracking_sessions ts
        WHERE ts.id = db.tracking_session_id
        AND ts.brand_id = c.brand_id
    )
WHERE c.deleted_at IS NULL AND c.tracking_enabled = true AND b.deleted_at IS NULL
GROUP BY c.id, c.competitor_name, c.brand_id, b.name;

-- View: Recent Activity
CREATE OR REPLACE VIEW public.recent_activity AS
SELECT
    ts.id,
    ts.created_at,
    'tracking_session' as activity_type,
    b.name as brand_name,
    b.id as brand_id,
    p.prompt_text,
    ts.ai_engine,
    ts.status,
    ts.mentioned,
    ts.sentiment,
    b.user_id
FROM public.tracking_sessions ts
JOIN public.brands b ON b.id = ts.brand_id
JOIN public.prompts p ON p.id = ts.prompt_id
WHERE ts.created_at >= NOW() - INTERVAL '30 days'
    AND b.deleted_at IS NULL
ORDER BY ts.created_at DESC;

-- =========================================
-- UTILITY FUNCTIONS
-- =========================================

-- Function: Soft delete brand
CREATE OR REPLACE FUNCTION public.soft_delete_brand(p_brand_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.brands
    SET
        deleted_at = NOW(),
        deleted_by = auth.uid()
    WHERE id = p_brand_id
        AND user_id = auth.uid()
        AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Restore soft-deleted brand
CREATE OR REPLACE FUNCTION public.restore_brand(p_brand_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.brands
    SET
        deleted_at = NULL,
        deleted_by = NULL
    WHERE id = p_brand_id
        AND user_id = auth.uid()
        AND deleted_at IS NOT NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get brand statistics
CREATE OR REPLACE FUNCTION public.get_brand_stats(p_brand_id UUID)
RETURNS TABLE (
    total_prompts BIGINT,
    active_prompts BIGINT,
    total_topics BIGINT,
    total_keywords BIGINT,
    visibility_score DECIMAL,
    total_mentions BIGINT,
    last_tracked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT p.id) FILTER (WHERE p.deleted_at IS NULL),
        COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true AND p.deleted_at IS NULL),
        COUNT(DISTINCT t.id) FILTER (WHERE t.deleted_at IS NULL),
        COUNT(DISTINCT k.id) FILTER (WHERE k.deleted_at IS NULL AND k.tracking_enabled = true),
        CASE
            WHEN COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed') > 0 THEN
                ROUND((COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true)::DECIMAL /
                       COUNT(DISTINCT ts.id) FILTER (WHERE ts.status = 'completed')::DECIMAL) * 100, 2)
            ELSE 0::DECIMAL
        END,
        COUNT(DISTINCT ts.id) FILTER (WHERE ts.mentioned = true),
        MAX(ts.created_at)
    FROM public.brands b
    LEFT JOIN public.prompts p ON p.brand_id = b.id
    LEFT JOIN public.topics t ON t.brand_id = b.id
    LEFT JOIN public.keywords k ON k.brand_id = b.id
    LEFT JOIN public.tracking_sessions ts ON ts.brand_id = b.id
    WHERE b.id = p_brand_id
        AND b.user_id = auth.uid()
        AND b.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- COMMENTS & DOCUMENTATION
-- =========================================

COMMENT ON TABLE public.brands IS 'Core brands/entities being tracked for AI search visibility';
COMMENT ON TABLE public.prompts IS 'User-defined prompts to track across AI engines';
COMMENT ON TABLE public.topics IS 'Topic clusters for organizing prompts';
COMMENT ON TABLE public.tracking_sessions IS 'Individual tracking runs for prompts across AI engines';
COMMENT ON TABLE public.citations IS 'Extracted citations from AI responses';
COMMENT ON TABLE public.visibility_scores IS 'Historical visibility scores aggregated by date and engine';
COMMENT ON TABLE public.competitors IS 'User-defined competitors to track alongside brand';
COMMENT ON TABLE public.discovered_brands IS 'Auto-discovered brands mentioned in AI responses';

COMMENT ON COLUMN public.brands.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN public.brands.onboarding_completed IS 'Whether the brand has completed initial setup';
COMMENT ON COLUMN public.prompts.tracking_frequency IS 'How often this prompt should be tracked';
COMMENT ON COLUMN public.tracking_sessions.mentioned IS 'Whether the brand was mentioned in the response';
COMMENT ON COLUMN public.tracking_sessions.sentiment IS 'Sentiment of the brand mention (positive/neutral/negative)';
COMMENT ON COLUMN public.citations.relevance_score IS 'Relevance score from 0 to 1';
COMMENT ON COLUMN public.visibility_scores.score IS 'Visibility score from 0 to 100';

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_brand_engine_date
    ON public.tracking_sessions(brand_id, ai_engine, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_citations_brand_mentioned
    ON public.citations(brand_id, is_brand_mentioned, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prompts_brand_active
    ON public.prompts(brand_id, is_active)
    WHERE deleted_at IS NULL;
