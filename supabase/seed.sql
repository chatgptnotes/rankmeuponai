-- =========================================
-- SEED DATA for RankMeUpon.ai
-- =========================================
-- This script populates the database with sample data for development/testing
-- DO NOT RUN IN PRODUCTION

-- Note: This assumes auth.users already has at least one test user
-- You can create a test user through Supabase Auth UI or programmatically

-- =========================================
-- 1. AI Engines (already populated by migration 003)
-- =========================================
-- Verify AI engines exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.ai_engines WHERE slug = 'chatgpt') THEN
        INSERT INTO public.ai_engines (name, slug, api_provider, rate_limit_per_minute, cost_per_query) VALUES
            ('ChatGPT', 'chatgpt', 'openai', 60, 0.002),
            ('Perplexity', 'perplexity', 'perplexity', 20, 0.001),
            ('Google Gemini', 'gemini', 'google', 60, 0.001),
            ('Claude', 'claude', 'anthropic', 50, 0.003);
    END IF;
END $$;

-- =========================================
-- 2. Sample Brands (for demo/testing)
-- =========================================
-- Note: Replace with actual user_id from your auth.users table
-- This is a template - adjust user_id as needed

INSERT INTO public.brands (name, website_url, industry, entity_type, user_id, description, location_type, location_value, onboarding_completed)
SELECT
    'Hope Hospital',
    'https://hopehospital.com',
    'Healthcare',
    'organization',
    id,
    'Multi-specialty hospital providing comprehensive healthcare services',
    'location',
    'Nagpur, India',
    true
FROM public.profiles
LIMIT 1
ON CONFLICT DO NOTHING;

-- Get the brand_id we just created
DO $$
DECLARE
    v_brand_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    SELECT id INTO v_brand_id FROM public.brands WHERE name = 'Hope Hospital' LIMIT 1;

    IF v_brand_id IS NOT NULL THEN
        -- =========================================
        -- 3. Brand Variations
        -- =========================================
        INSERT INTO public.brand_variations (brand_id, variation_text, is_primary) VALUES
            (v_brand_id, 'Hope Hospital', true),
            (v_brand_id, 'Hope Medical Center', false),
            (v_brand_id, 'Dr. Murali BK Hospital', false)
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 4. Brand Targeting
        -- =========================================
        INSERT INTO public.brand_targeting (brand_id, location_type, location_value) VALUES
            (v_brand_id, 'location', 'Nagpur, India')
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 5. Topics
        -- =========================================
        INSERT INTO public.topics (brand_id, name, description, sort_order) VALUES
            (v_brand_id, 'Healthcare Services', 'General healthcare and medical services', 1),
            (v_brand_id, 'Medical Expertise', 'Doctor qualifications and specializations', 2),
            (v_brand_id, 'Patient Care Quality', 'Patient satisfaction and care standards', 3),
            (v_brand_id, 'Advanced Medical Technology', 'Modern equipment and diagnostic tools', 4),
            (v_brand_id, 'Specialized Treatments', 'Specialized medical procedures and treatments', 5)
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 6. Prompts
        -- =========================================
        INSERT INTO public.prompts (brand_id, topic_id, prompt_text, category, is_active, tracking_frequency) VALUES
            -- Healthcare Services
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Healthcare Services' LIMIT 1),
             'What are the best hospitals in Nagpur?', 'general', true, 'daily'),
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Healthcare Services' LIMIT 1),
             'Which medical facilities offer specialized care in Nagpur?', 'general', true, 'daily'),
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Healthcare Services' LIMIT 1),
             'Where can I find quality healthcare providers in Nagpur?', 'general', true, 'daily'),

            -- Medical Expertise
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Medical Expertise' LIMIT 1),
             'Who are the top doctors in Nagpur?', 'expertise', true, 'daily'),
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Medical Expertise' LIMIT 1),
             'Which medical professionals have the best credentials in Nagpur?', 'expertise', true, 'daily'),

            -- Patient Care Quality
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Patient Care Quality' LIMIT 1),
             'What hospitals offer the best patient experience in Nagpur?', 'quality', true, 'daily'),
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Patient Care Quality' LIMIT 1),
             'Which facilities have the highest patient satisfaction in Nagpur?', 'quality', true, 'daily'),

            -- Advanced Medical Technology
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Advanced Medical Technology' LIMIT 1),
             'Which hospitals use cutting-edge medical technology in Nagpur?', 'technology', true, 'daily'),
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Advanced Medical Technology' LIMIT 1),
             'Where can I find facilities with modern equipment in Nagpur?', 'technology', true, 'daily'),

            -- Specialized Treatments
            (v_brand_id, (SELECT id FROM public.topics WHERE brand_id = v_brand_id AND name = 'Specialized Treatments' LIMIT 1),
             'Which facilities specialize in complex procedures in Nagpur?', 'specialized', true, 'daily')
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 7. Keywords
        -- =========================================
        INSERT INTO public.keywords (brand_id, keyword, category, tracking_enabled) VALUES
            (v_brand_id, 'hospital nagpur', 'location', true),
            (v_brand_id, 'healthcare services', 'service', true),
            (v_brand_id, 'medical center', 'service', true),
            (v_brand_id, 'best doctors nagpur', 'expertise', true),
            (v_brand_id, 'advanced medical equipment', 'technology', true)
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 8. Competitors (sample)
        -- =========================================
        INSERT INTO public.competitors (brand_id, competitor_name, competitor_domain, tracking_enabled, notes) VALUES
            (v_brand_id, 'Apollo Hospital', 'apollohospitals.com', true, 'Major healthcare chain'),
            (v_brand_id, 'Fortis Hospital', 'fortishealthcare.com', true, 'Multi-specialty hospital network'),
            (v_brand_id, 'AIIMS Nagpur', 'aiimsnagpur.edu.in', true, 'Government medical institute')
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 9. Sample Tracking Sessions (for demo)
        -- =========================================
        -- Create a few sample tracking sessions to show data in UI
        INSERT INTO public.tracking_sessions (brand_id, prompt_id, ai_engine, status, mentioned, position, sentiment, response_text, created_at)
        SELECT
            v_brand_id,
            p.id,
            'chatgpt',
            'completed',
            true,
            2,
            'positive',
            'Hope Hospital is one of the leading healthcare facilities in Nagpur...',
            NOW() - INTERVAL '1 day'
        FROM public.prompts p
        WHERE p.brand_id = v_brand_id
        LIMIT 3
        ON CONFLICT DO NOTHING;

        INSERT INTO public.tracking_sessions (brand_id, prompt_id, ai_engine, status, mentioned, position, sentiment, response_text, created_at)
        SELECT
            v_brand_id,
            p.id,
            'perplexity',
            'completed',
            true,
            1,
            'positive',
            'Hope Hospital stands out as a premier medical facility...',
            NOW() - INTERVAL '12 hours'
        FROM public.prompts p
        WHERE p.brand_id = v_brand_id
        LIMIT 2
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 10. Sample Citations
        -- =========================================
        INSERT INTO public.citations (tracking_session_id, brand_id, source_domain, source_title, citation_text, position, is_brand_mentioned, sentiment, relevance_score)
        SELECT
            ts.id,
            v_brand_id,
            'healthcareindia.com',
            'Top Hospitals in Nagpur',
            'Hope Hospital is recognized for its excellence in patient care',
            1,
            true,
            'positive',
            0.95
        FROM public.tracking_sessions ts
        WHERE ts.brand_id = v_brand_id
        LIMIT 1
        ON CONFLICT DO NOTHING;

        -- =========================================
        -- 11. Calculate Initial Visibility Scores
        -- =========================================
        PERFORM public.update_visibility_scores(CURRENT_DATE);
        PERFORM public.update_visibility_scores(CURRENT_DATE - INTERVAL '1 day');

    END IF;
END $$;

-- =========================================
-- Verification Queries
-- =========================================
-- Uncomment to verify seed data

-- SELECT 'Brands:', COUNT(*) FROM public.brands;
-- SELECT 'Topics:', COUNT(*) FROM public.topics;
-- SELECT 'Prompts:', COUNT(*) FROM public.prompts;
-- SELECT 'Keywords:', COUNT(*) FROM public.keywords;
-- SELECT 'Competitors:', COUNT(*) FROM public.competitors;
-- SELECT 'Tracking Sessions:', COUNT(*) FROM public.tracking_sessions;
-- SELECT 'Citations:', COUNT(*) FROM public.citations;
-- SELECT 'Visibility Scores:', COUNT(*) FROM public.visibility_scores;
