-- Add brand_variations table
CREATE TABLE IF NOT EXISTS public.brand_variations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    variation_text TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false
);

-- Add brand_targeting table
CREATE TABLE IF NOT EXISTS public.brand_targeting (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    location_type TEXT CHECK (location_type IN ('global', 'location')) NOT NULL,
    location_value TEXT
);

-- Add topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0
);

-- Add keywords table
CREATE TABLE IF NOT EXISTS public.keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    keyword TEXT NOT NULL,
    category TEXT,
    tracking_enabled BOOLEAN DEFAULT true
);

-- Add keyword_mentions table
CREATE TABLE IF NOT EXISTS public.keyword_mentions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    keyword_id UUID REFERENCES public.keywords(id) ON DELETE CASCADE NOT NULL,
    tracking_session_id UUID REFERENCES public.tracking_sessions(id) ON DELETE CASCADE NOT NULL,
    mention_count INT DEFAULT 0,
    context_snippet TEXT
);

-- Add notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('alert', 'summary', 'update')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_brand_variations_brand_id ON public.brand_variations(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_targeting_brand_id ON public.brand_targeting(brand_id);
CREATE INDEX IF NOT EXISTS idx_topics_brand_id ON public.topics(brand_id);
CREATE INDEX IF NOT EXISTS idx_keywords_brand_id ON public.keywords(brand_id);
CREATE INDEX IF NOT EXISTS idx_keyword_mentions_keyword_id ON public.keyword_mentions(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keyword_mentions_session_id ON public.keyword_mentions(tracking_session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.brand_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_targeting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_variations
CREATE POLICY "Users can view variations for their brands"
    ON public.brand_variations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_variations.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert variations for their brands"
    ON public.brand_variations FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_variations.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can update variations for their brands"
    ON public.brand_variations FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_variations.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete variations for their brands"
    ON public.brand_variations FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_variations.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create RLS policies for brand_targeting
CREATE POLICY "Users can view targeting for their brands"
    ON public.brand_targeting FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_targeting.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert targeting for their brands"
    ON public.brand_targeting FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_targeting.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can update targeting for their brands"
    ON public.brand_targeting FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_targeting.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete targeting for their brands"
    ON public.brand_targeting FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = brand_targeting.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create RLS policies for topics
CREATE POLICY "Users can view topics for their brands"
    ON public.topics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = topics.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert topics for their brands"
    ON public.topics FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = topics.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can update topics for their brands"
    ON public.topics FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = topics.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete topics for their brands"
    ON public.topics FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = topics.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create RLS policies for keywords
CREATE POLICY "Users can view keywords for their brands"
    ON public.keywords FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = keywords.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert keywords for their brands"
    ON public.keywords FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = keywords.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can update keywords for their brands"
    ON public.keywords FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = keywords.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete keywords for their brands"
    ON public.keywords FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = keywords.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create RLS policies for keyword_mentions
CREATE POLICY "Users can view keyword mentions for their keywords"
    ON public.keyword_mentions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.keywords
        JOIN public.brands ON brands.id = keywords.brand_id
        WHERE keywords.id = keyword_mentions.keyword_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert keyword mentions"
    ON public.keyword_mentions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.keywords
        JOIN public.brands ON brands.id = keywords.brand_id
        WHERE keywords.id = keyword_mentions.keyword_id
        AND brands.user_id = auth.uid()
    ));

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER set_topics_updated_at
    BEFORE UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_keywords_updated_at
    BEFORE UPDATE ON public.keywords
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add topic_id column to prompts table
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL;

-- Create index for topic_id
CREATE INDEX IF NOT EXISTS idx_prompts_topic_id ON public.prompts(topic_id);

-- Add columns to tracking_sessions for enhanced tracking
ALTER TABLE public.tracking_sessions
ADD COLUMN IF NOT EXISTS mentioned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS position INT,
ADD COLUMN IF NOT EXISTS sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
ADD COLUMN IF NOT EXISTS citation_quality INT CHECK (citation_quality >= 1 AND citation_quality <= 10);

-- Add columns to brands for better management
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS location_type TEXT,
ADD COLUMN IF NOT EXISTS location_value TEXT,
ADD COLUMN IF NOT EXISTS variations TEXT[],
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMP WITH TIME ZONE;

-- Add columns to prompts for better tracking configuration
ALTER TABLE public.prompts
ADD COLUMN IF NOT EXISTS tracking_frequency TEXT CHECK (tracking_frequency IN ('hourly', 'daily', 'weekly')) DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS last_tracked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_engines TEXT[] DEFAULT '{chatgpt,perplexity,gemini,claude}';
