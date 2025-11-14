/**
 * Prompt Tracking Service
 * Orchestrates AI engine queries, citation extraction, and data storage
 */

import { queryChatGPTWithSearch } from './openai-client';
import { extractCitations, type CitationAnalysis } from './citation-extractor';
import { createClient } from '@/lib/supabase/server';
import type { Brand, Prompt } from '@/types';

export interface TrackingResult {
  sessionId: string;
  status: 'completed' | 'failed';
  brandMentioned: boolean;
  position?: number;
  citationsCount: number;
  discoveredBrandsCount: number;
  error?: string;
}

export interface TrackPromptOptions {
  brandId: string;
  promptId: string;
  promptText: string;
  brandNames: string[]; // Primary brand name + variations
  aiEngine?: 'chatgpt' | 'perplexity' | 'gemini' | 'claude';
}

/**
 * Track a single prompt across an AI engine
 */
export async function trackPrompt(
  options: TrackPromptOptions
): Promise<TrackingResult> {
  const {
    brandId,
    promptId,
    promptText,
    brandNames,
    aiEngine = 'chatgpt',
  } = options;

  const supabase = await createClient();

  try {
    // Create tracking session
    const { data: session, error: sessionError } = await supabase
      .from('tracking_sessions')
      .insert({
        brand_id: brandId,
        prompt_id: promptId,
        ai_engine: aiEngine,
        status: 'running',
      } as never)
      .select()
      .single() as { data: { id: string } | null; error: unknown };

    if (sessionError || !session) {
      throw new Error(`Failed to create tracking session: ${sessionError}`);
    }

    const sessionId = session.id;

    try {
      let responseText: string;
      let citationAnalysis: CitationAnalysis;

      // Query the appropriate AI engine
      switch (aiEngine) {
        case 'chatgpt': {
          const response = await queryChatGPTWithSearch(promptText);
          responseText = response.content;
          citationAnalysis = extractCitations(responseText, brandNames);
          break;
        }

        case 'perplexity':
        case 'gemini':
        case 'claude':
          // Placeholder for future implementations
          throw new Error(`${aiEngine} integration not yet implemented`);

        default:
          throw new Error(`Unknown AI engine: ${aiEngine}`);
      }

      // Update tracking session with results
      await supabase
        .from('tracking_sessions')
        .update({
          status: 'completed',
          response_text: responseText,
          mentioned: citationAnalysis.targetBrandMentioned,
          position: citationAnalysis.targetBrandPosition,
          metadata: {
            total_citations: citationAnalysis.citations.length,
            total_brands_discovered: citationAnalysis.totalBrandsFound,
            summary: citationAnalysis.summary,
          },
        } as never)
        .eq('id', sessionId);

      // Store citations
      if (citationAnalysis.citations.length > 0) {
        const citationsToInsert = citationAnalysis.citations.map((citation) => ({
          tracking_session_id: sessionId,
          brand_id: brandId,
          source_url: citation.sourceUrl,
          source_title: citation.sourceTitle,
          source_domain: citation.sourceDomain,
          citation_text: citation.citationText,
          position: citation.position,
          context: citation.context,
          is_brand_mentioned: citation.isBrandMentioned,
          sentiment: citation.sentiment,
          relevance_score: citation.relevanceScore,
        }));

        await supabase.from('citations').insert(citationsToInsert as never);
      }

      // Store discovered brands
      if (citationAnalysis.discoveredBrands.length > 0) {
        const brandsToInsert = citationAnalysis.discoveredBrands.map((brand) => ({
          tracking_session_id: sessionId,
          brand_name: brand.brandName,
          brand_domain: brand.brandDomain,
          mention_count: brand.mentionCount,
          first_position: brand.position,
        }));

        await supabase.from('discovered_brands').insert(brandsToInsert as never);
      }

      // Update prompt's last_tracked_at
      await supabase
        .from('prompts')
        .update({ last_tracked_at: new Date().toISOString() } as never)
        .eq('id', promptId);

      // Update brand's last_tracked_at
      await supabase
        .from('brands')
        .update({ last_tracked_at: new Date().toISOString() } as never)
        .eq('id', brandId);

      return {
        sessionId,
        status: 'completed',
        brandMentioned: citationAnalysis.targetBrandMentioned,
        position: citationAnalysis.targetBrandPosition,
        citationsCount: citationAnalysis.citations.length,
        discoveredBrandsCount: citationAnalysis.totalBrandsFound,
      };
    } catch (error) {
      // Update session as failed
      await supabase
        .from('tracking_sessions')
        .update({
          status: 'failed',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        } as never)
        .eq('id', sessionId);

      throw error;
    }
  } catch (error) {
    return {
      sessionId: '',
      status: 'failed',
      brandMentioned: false,
      citationsCount: 0,
      discoveredBrandsCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Track multiple prompts for a brand
 */
export async function trackBrandPrompts(
  brandId: string,
  promptIds?: string[], // If not provided, track all active prompts
  aiEngines: Array<'chatgpt' | 'perplexity' | 'gemini' | 'claude'> = ['chatgpt']
): Promise<TrackingResult[]> {
  const supabase = await createClient();

  // Get brand details
  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single() as { data: Brand | null };

  if (!brand) {
    throw new Error('Brand not found');
  }

  // Get brand variations for better matching
  const brandNames = [brand.name];
  const brandData = brand as Brand & { variations?: string[] };
  if (brandData.variations && Array.isArray(brandData.variations)) {
    brandNames.push(...brandData.variations);
  }

  // Get prompts to track
  let query = supabase
    .from('prompts')
    .select('*')
    .eq('brand_id', brandId)
    .eq('is_active', true);

  if (promptIds && promptIds.length > 0) {
    query = query.in('id', promptIds);
  }

  const { data: prompts } = await query as { data: Prompt[] | null };

  if (!prompts || prompts.length === 0) {
    return [];
  }

  // Track each prompt across each AI engine
  const results: TrackingResult[] = [];

  for (const prompt of prompts) {
    for (const aiEngine of aiEngines) {
      const result = await trackPrompt({
        brandId,
        promptId: prompt.id,
        promptText: prompt.prompt_text,
        brandNames,
        aiEngine,
      });

      results.push(result);

      // Add delay to respect rate limits (2 seconds between requests)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Get tracking statistics for a brand
 */
export async function getBrandTrackingStats(brandId: string, days: number = 7) {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: sessions } = await supabase
    .from('tracking_sessions')
    .select('*')
    .eq('brand_id', brandId)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString());

  if (!sessions || sessions.length === 0) {
    return {
      totalTracked: 0,
      totalMentions: 0,
      visibilityScore: 0,
      avgPosition: 0,
      byEngine: {},
    };
  }

  const totalTracked = sessions.length;
  const totalMentions = sessions.filter((s: { mentioned: boolean }) => s.mentioned).length;
  const visibilityScore = (totalMentions / totalTracked) * 100;

  const mentionedSessions = sessions.filter((s: { mentioned: boolean; position: number | null }) => s.mentioned && s.position);
  const avgPosition =
    mentionedSessions.length > 0
      ? mentionedSessions.reduce((sum: number, s: { position: number }) => sum + s.position, 0) / mentionedSessions.length
      : 0;

  // Group by AI engine
  const byEngine = sessions.reduce((acc: Record<string, { tracked: number; mentions: number; score: number }>, session: { ai_engine: string; mentioned: boolean }) => {
    const engine = session.ai_engine;
    if (!acc[engine]) {
      acc[engine] = { tracked: 0, mentions: 0, score: 0 };
    }
    acc[engine].tracked++;
    if (session.mentioned) {
      acc[engine].mentions++;
    }
    acc[engine].score = (acc[engine].mentions / acc[engine].tracked) * 100;
    return acc;
  }, {});

  return {
    totalTracked,
    totalMentions,
    visibilityScore: Math.round(visibilityScore * 100) / 100,
    avgPosition: Math.round(avgPosition * 100) / 100,
    byEngine,
  };
}
