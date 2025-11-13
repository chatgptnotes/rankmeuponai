-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT
);

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    website_url TEXT,
    industry TEXT,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('brand', 'product', 'person', 'organization', 'service')),
    description TEXT,
    logo_url TEXT
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    prompt_text TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Create tracking_sessions table
CREATE TABLE IF NOT EXISTS public.tracking_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
    ai_engine TEXT NOT NULL CHECK (ai_engine IN ('chatgpt', 'perplexity', 'gemini', 'claude')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    response_text TEXT,
    citations JSONB,
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_brand_id ON public.prompts(brand_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_brand_id ON public.tracking_sessions(brand_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_prompt_id ON public.tracking_sessions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_tracking_sessions_created_at ON public.tracking_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create RLS policies for brands
CREATE POLICY "Users can view their own brands"
    ON public.brands FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brands"
    ON public.brands FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brands"
    ON public.brands FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brands"
    ON public.brands FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for prompts
CREATE POLICY "Users can view prompts for their brands"
    ON public.prompts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = prompts.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert prompts for their brands"
    ON public.prompts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = prompts.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can update prompts for their brands"
    ON public.prompts FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = prompts.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete prompts for their brands"
    ON public.prompts FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = prompts.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create RLS policies for tracking_sessions
CREATE POLICY "Users can view tracking sessions for their brands"
    ON public.tracking_sessions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = tracking_sessions.brand_id
        AND brands.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert tracking sessions for their brands"
    ON public.tracking_sessions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.brands
        WHERE brands.id = tracking_sessions.brand_id
        AND brands.user_id = auth.uid()
    ));

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
