# AI Tracking System - Complete Guide

## Overview

The RankMeUpon.ai AI Tracking System is now **fully operational**! This system tracks your brand's visibility across ChatGPT and other AI search engines, extracting citations, analyzing sentiment, and calculating visibility scores.

---

## What's Been Built

### 1. Database Schema ✅

**New Tables:**
- `ai_engines` - Reference table for ChatGPT, Perplexity, Gemini, Claude
- `citations` - Structured citation data with sentiment and relevance scores
- `discovered_brands` - Competitor brands found in AI responses
- `visibility_scores` - Historical tracking data aggregated by date and engine

**Database Functions:**
- `calculate_visibility_score()` - Calculates brand visibility percentage
- `update_visibility_scores()` - Aggregates daily stats (can be run via cron)

**Migration File:** `supabase/migrations/003_citations_and_ai_engines.sql`

### 2. AI Integration ✅

**OpenAI Client** (`lib/ai/openai-client.ts`):
- Lazy initialization (won't fail builds if API key missing)
- Query ChatGPT with custom models and parameters
- Web search simulation for citation-rich responses
- Structured data extraction

**Citation Extractor** (`lib/ai/citation-extractor.ts`):
- Extracts URLs, domains, and brand mentions from responses
- Detects sentiment (positive/neutral/negative)
- Identifies competitor brands automatically
- Calculates relevance scores (0-1)
- Parses response into structured citations

### 3. Tracking Service ✅

**Main Service** (`lib/ai/tracking-service.ts`):
- `trackPrompt()` - Track a single prompt
- `trackBrandPrompts()` - Track multiple prompts for a brand
- `getBrandTrackingStats()` - Get visibility statistics
- Automatic rate limiting (2 second delays)
- Stores results in database

**Features:**
- Brand variation matching (checks all brand name variants)
- Position tracking (where brand appears in response)
- Citation storage with context
- Discovered brand tracking
- Error handling and failed session tracking

### 4. API Routes ✅

**POST /api/tracking/track**
```typescript
{
  brandId: string,
  promptIds?: string[],  // Optional, defaults to all active prompts
  aiEngines?: string[]   // Default: ['chatgpt']
}
```

**Response:**
```typescript
{
  success: true,
  results: TrackingResult[],
  summary: {
    total: number,
    completed: number,
    failed: number,
    mentioned: number,
    visibilityRate: number
  }
}
```

**GET /api/tracking/stats/[brandId]?days=7**
```typescript
{
  success: true,
  brandId: string,
  days: number,
  stats: {
    totalTracked: number,
    totalMentions: number,
    visibilityScore: number,
    avgPosition: number,
    byEngine: Record<string, EngineStats>
  }
}
```

### 5. UI Component ✅

**TrackingTrigger** (`components/tracking/TrackingTrigger.tsx`):
- One-click tracking button
- Real-time progress indicator
- Summary statistics display
- Detailed results view
- Error handling with toast notifications

---

## Setup Instructions

### 1. Database Migration

Run the new migration in your Supabase project:

```bash
# Option A: Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy contents from supabase/migrations/003_citations_and_ai_engines.sql
4. Run the SQL

# Option B: Via Supabase CLI (if you have it installed)
supabase db push
```

### 2. Environment Variables

Add to your `.env.local`:

```bash
# OpenAI API Key (REQUIRED for tracking)
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Update Vercel Environment Variables

If deploying to Vercel:
```bash
vercel env add OPENAI_API_KEY
# Enter your OpenAI API key when prompted
# Select Production, Preview, and Development environments
```

---

## How to Use

### Option 1: Via UI Component

Add the TrackingTrigger component to your brand page:

```tsx
import { TrackingTrigger } from '@/components/tracking/TrackingTrigger';

<TrackingTrigger
  brandId={brand.id}
  brandName={brand.name}
  totalPrompts={promptCount}
/>
```

### Option 2: Via API

```typescript
// Track all prompts for a brand
const response = await fetch('/api/tracking/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brandId: 'your-brand-uuid',
    aiEngines: ['chatgpt']
  })
});

const data = await response.json();
console.log(data.summary.visibilityRate); // e.g., 65.5%
```

### Option 3: Programmatically

```typescript
import { trackBrandPrompts } from '@/lib/ai/tracking-service';

const results = await trackBrandPrompts(
  brandId,
  undefined,  // Track all prompts
  ['chatgpt']
);

console.log(results);
```

---

## Features & Capabilities

### Brand Mention Detection
- Checks for exact brand name matches
- Supports brand variations/aliases
- Case-insensitive matching
- Tracks position in response (1st mention = position 1)

### Citation Extraction
- Extracts URLs and domains from responses
- Identifies source citations
- Captures context (surrounding text)
- Calculates relevance scores

### Sentiment Analysis
- Detects positive mentions ("excellent", "best", "leading")
- Detects negative mentions ("poor", "avoid", "disappointing")
- Neutral classification for objective mentions
- Applied to each citation

### Competitor Discovery
- Automatically identifies other brands mentioned
- Tracks their positions and mention counts
- Stores for competitive analysis

### Visibility Scoring
- Formula: (Mentions / Total Prompts) × 100
- Tracked per AI engine
- Historical data aggregation
- Average position tracking

---

## Data Flow

```
1. User triggers tracking
   ↓
2. System queries brand + prompts
   ↓
3. For each prompt:
   - Create tracking_session (status: 'running')
   - Query ChatGPT with prompt
   - Extract citations from response
   - Detect brand mentions
   - Analyze sentiment
   - Discover other brands
   ↓
4. Store results:
   - Update tracking_session (status: 'completed')
   - Insert citations
   - Insert discovered_brands
   - Update prompt last_tracked_at
   ↓
5. Calculate visibility score
   ↓
6. Return results to user
```

---

## Cost Estimates

### OpenAI API Costs (GPT-4o-mini)

- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens

**Per Prompt:**
- Average prompt: ~50 tokens input
- Average response: ~1000 tokens output
- Cost per prompt: ~$0.0006 ($0.60 per 1000 prompts)

**Example:**
- 100 prompts tracked daily
- Cost per day: ~$0.06
- Cost per month: ~$1.80

**Rate Limits:**
- 2 second delay between requests (built-in)
- Max ~30 prompts per minute
- Max ~1800 prompts per hour

---

## Troubleshooting

### Error: "Missing OPENAI_API_KEY"
**Solution:** Add `OPENAI_API_KEY` to your `.env.local` file

### Error: "Failed to create tracking session"
**Solution:** Run the database migration (003_citations_and_ai_engines.sql)

### No brand mentions found
**Possible causes:**
1. Brand name spelling doesn't match responses
2. Add brand variations to improve matching
3. Prompts may not trigger brand mentions (refine prompts)

### Tracking is slow
**Expected behavior:** 2-second delay between prompts for rate limiting
- 10 prompts = ~20 seconds
- 50 prompts = ~100 seconds (1.7 minutes)

---

## Next Steps

### Immediate (Ready to use):
1. ✅ Run database migration
2. ✅ Add OpenAI API key
3. ✅ Add TrackingTrigger component to dashboard
4. ✅ Test with 1-2 prompts first

### Short-term enhancements:
- [ ] Add Perplexity integration
- [ ] Add Gemini integration
- [ ] Add Claude integration
- [ ] Schedule automatic daily tracking (cron job)
- [ ] Email notifications for low visibility scores
- [ ] Trend charts showing visibility over time

### Long-term features:
- [ ] Competitor comparison dashboard
- [ ] AI-powered prompt suggestions
- [ ] Citation quality scoring
- [ ] Share of voice analysis
- [ ] Export tracking reports (PDF/CSV)

---

## API Reference

### TrackingResult
```typescript
interface TrackingResult {
  sessionId: string;
  status: 'completed' | 'failed';
  brandMentioned: boolean;
  position?: number;
  citationsCount: number;
  discoveredBrandsCount: number;
  error?: string;
}
```

### ExtractedCitation
```typescript
interface ExtractedCitation {
  sourceUrl?: string;
  sourceTitle?: string;
  sourceDomain?: string;
  citationText: string;
  position: number;
  context: string;
  isBrandMentioned: boolean;
  brandName?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevanceScore?: number;  // 0-1
}
```

### DiscoveredBrand
```typescript
interface DiscoveredBrand {
  brandName: string;
  brandDomain?: string;
  position: number;
  mentionCount: number;
}
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API error messages in console
3. Check Supabase logs for database errors
4. Verify OpenAI API key is valid

**Last Updated:** 2025-11-14
**Version:** 1.7.0 (AI Tracking MVP)
