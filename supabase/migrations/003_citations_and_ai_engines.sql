-- Create AI engines reference table
CREATE TABLE IF NOT EXISTS public.ai_engines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    api_provider TEXT,
    is_active BOOLEAN DEFAULT true,
    rate_limit_per_minute INT DEFAULT 60,
    cost_per_query DECIMAL(10, 6) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Insert default AI engines
INSERT INTO public.ai_engines (name, slug, api_provider, rate_limit_per_minute, cost_per_query) VALUES
    ('ChatGPT', 'chatgpt', 'openai', 60, 0.002),
    ('Perplexity', 'perplexity', 'perplexity', 20, 0.001),
    ('Google Gemini', 'gemini', 'google', 60, 0.001),
    ('Claude', 'claude', 'anthropic', 50, 0.003)
ON CONFLICT (slug) DO NOTHING;

-- Create citations table for structured citation data
CREATE TABLE IF NOT EXISTS public.citations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tracking_session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE CASCADE NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    source_url TEXT,
    source_title TEXT,
    source_domain TEXT,
    citation_text TEXT,
    position INT,
    context TEXT,
    is_brand_mentioned BOOLEAN DEFAULT false,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    relevance_score DECIMAL(3, 2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create discovered_brands table for competitor tracking
CREATE TABLE IF NOT EXISTS public.discovered_brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    tracking_session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE CASCADE NOT NULL,
    brand_name TEXT NOT NULL,
    brand_domain TEXT,
    mention_count INT DEFAULT 1,
    first_position INT,
    is_competitor BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create visibility_scores table for historical tracking
CREATE TABLE IF NOT EXISTS public.visibility_scores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    ai_engine_id UUID REFERENCES public.ai_engines(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    score DECIMAL(5, 2) CHECK (score >= 0 AND score <= 100),
    total_prompts_tracked INT DEFAULT 0,
    total_mentions INT DEFAULT 0,
    avg_position DECIMAL(4, 2),
    sentiment_breakdown JSONB DEFAULT '{"positive": 0, "neutral": 0, "negative": 0}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(brand_id, ai_engine_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_citations_session_id ON public.citations(tracking_session_id);
CREATE INDEX IF NOT EXISTS idx_citations_brand_id ON public.citations(brand_id);
CREATE INDEX IF NOT EXISTS idx_citations_is_brand_mentioned ON public.citations(is_brand_mentioned);
CREATE INDEX IF NOT EXISTS idx_discovered_brands_session_id ON public.discovered_brands(tracking_session_id);
CREATE INDEX IF NOT EXISTS idx_discovered_brands_brand_name ON public.discovered_brands(brand_name);
CREATE INDEX IF NOT EXISTS idx_visibility_scores_brand_id ON public.visibility_scores(brand_id);
CREATE INDEX IF NOT EXISTS idx_visibility_scores_date ON public.visibility_scores(date DESC);
CREATE INDEX IF NOT EXISTS idx_visibility_scores_brand_engine ON public.visibility_scores(brand_id, ai_engine_id);

-- Enable Row Level Security
ALTER TABLE public.ai_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovered_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_engines (public read)
CREATE POLICY "Anyone can view AI engines"
    ON public.ai_engines FOR SELECT
    TO authenticated
    USING (true);

-- RLS policies for citations
CREATE POLICY "Users can view citations for their brands"
    ON public.citations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = citations.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert citations for their brands"
    ON public.citations FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = citations.brand_id
        AND brands.user_id = auth.uid()
    ));

-- RLS policies for discovered_brands
CREATE POLICY "Users can view discovered brands from their tracking sessions"
    ON public.discovered_brands FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.tracking_sessions ts
        JOIN public.brands b ON b.id = ts.brand_id
        WHERE ts.id = discovered_brands.tracking_session_id
        AND b.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert discovered brands"
    ON public.discovered_brands FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.tracking_sessions ts
        JOIN public.brands b ON b.id = ts.brand_id
        WHERE ts.id = discovered_brands.tracking_session_id
        AND b.user_id = auth.uid()
    ));

-- RLS policies for visibility_scores
CREATE POLICY "Users can view visibility scores for their brands"
    ON public.visibility_scores FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = visibility_scores.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert visibility scores for their brands"
    ON public.visibility_scores FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = visibility_scores.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create function to calculate visibility score
CREATE OR REPLACE FUNCTION public.calculate_visibility_score(
    p_brand_id UUID,
    p_ai_engine_id UUID DEFAULT NULL,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL AS $$
DECLARE
    v_total_prompts INT;
    v_total_mentions INT;
    v_score DECIMAL(5,2);
BEGIN
    -- Count total prompts tracked
    SELECT COUNT(DISTINCT ts.prompt_id)
    INTO v_total_prompts
    FROM public.tracking_sessions ts
    WHERE ts.brand_id = p_brand_id
        AND DATE(ts.created_at) = p_date
        AND (p_ai_engine_id IS NULL OR ts.ai_engine = (SELECT slug FROM public.ai_engines WHERE id = p_ai_engine_id))
        AND ts.status = 'completed';

    -- Count mentions
    SELECT COUNT(*)
    INTO v_total_mentions
    FROM public.tracking_sessions ts
    WHERE ts.brand_id = p_brand_id
        AND DATE(ts.created_at) = p_date
        AND (p_ai_engine_id IS NULL OR ts.ai_engine = (SELECT slug FROM public.ai_engines WHERE id = p_ai_engine_id))
        AND ts.status = 'completed'
        AND ts.mentioned = true;

    -- Calculate score (mentions / total_prompts * 100)
    IF v_total_prompts > 0 THEN
        v_score := (v_total_mentions::DECIMAL / v_total_prompts::DECIMAL) * 100;
    ELSE
        v_score := 0;
    END IF;

    RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to update visibility scores (called by cron or manually)
CREATE OR REPLACE FUNCTION public.update_visibility_scores(p_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
    v_brand RECORD;
    v_engine RECORD;
    v_score DECIMAL(5,2);
    v_total_prompts INT;
    v_total_mentions INT;
    v_avg_position DECIMAL(4,2);
BEGIN
    -- Loop through all brands
    FOR v_brand IN SELECT id FROM public.brands LOOP
        -- Loop through all active AI engines
        FOR v_engine IN SELECT id, slug FROM public.ai_engines WHERE is_active = true LOOP
            -- Calculate metrics
            SELECT
                COUNT(DISTINCT ts.prompt_id),
                COUNT(*) FILTER (WHERE ts.mentioned = true),
                AVG(ts.position) FILTER (WHERE ts.mentioned = true AND ts.position IS NOT NULL)
            INTO v_total_prompts, v_total_mentions, v_avg_position
            FROM public.tracking_sessions ts
            WHERE ts.brand_id = v_brand.id
                AND ts.ai_engine = v_engine.slug
                AND DATE(ts.created_at) = p_date
                AND ts.status = 'completed';

            -- Calculate score
            IF v_total_prompts > 0 THEN
                v_score := (v_total_mentions::DECIMAL / v_total_prompts::DECIMAL) * 100;

                -- Insert or update visibility score
                INSERT INTO public.visibility_scores (
                    brand_id,
                    ai_engine_id,
                    date,
                    score,
                    total_prompts_tracked,
                    total_mentions,
                    avg_position
                ) VALUES (
                    v_brand.id,
                    v_engine.id,
                    p_date,
                    ROUND(v_score, 2),
                    v_total_prompts,
                    v_total_mentions,
                    ROUND(v_avg_position, 2)
                )
                ON CONFLICT (brand_id, ai_engine_id, date)
                DO UPDATE SET
                    score = ROUND(v_score, 2),
                    total_prompts_tracked = v_total_prompts,
                    total_mentions = v_total_mentions,
                    avg_position = ROUND(v_avg_position, 2);
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
