import { getOpenAIClient } from '@/lib/ai/openai-client';
import type { IndustryDetectionResult } from '@/types/onboarding';

/**
 * Detects industry/vertical from brand name and website URL using AI
 */
export async function detectIndustry(
  brandName: string,
  websiteUrl?: string
): Promise<IndustryDetectionResult> {
  const prompt = `Analyze the following brand and determine its industry/vertical:

Brand Name: ${brandName}
${websiteUrl ? `Website: ${websiteUrl}` : ''}

Provide a detailed industry classification with the following information:
1. Primary industry (e.g., Healthcare, Technology, E-commerce, Education, etc.)
2. Specific category within that industry
3. Subcategory if applicable
4. Confidence level (0-1)
5. 5-8 relevant keywords for this industry

Format your response as JSON:
{
  "industry": "Primary industry",
  "category": "Specific category",
  "subcategory": "Optional subcategory",
  "confidence": 0.95,
  "suggestedKeywords": ["keyword1", "keyword2", ...]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at analyzing brands and determining their industry verticals. Provide accurate, specific industry classifications.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content) as IndustryDetectionResult;

    // Validate the result
    if (!result.industry || !result.category) {
      throw new Error('Invalid industry detection result');
    }

    // Ensure confidence is between 0 and 1
    result.confidence = Math.max(0, Math.min(1, result.confidence || 0.5));

    // Ensure we have keywords
    if (!result.suggestedKeywords || result.suggestedKeywords.length === 0) {
      result.suggestedKeywords = [brandName.toLowerCase()];
    }

    return result;
  } catch (error) {
    console.error('Industry detection error:', error);

    // Fallback result
    return {
      industry: 'General Business',
      category: 'Unspecified',
      confidence: 0.1,
      suggestedKeywords: [brandName.toLowerCase()],
    };
  }
}

/**
 * Generates industry-specific description
 */
export async function generateIndustryDescription(industryResult: IndustryDetectionResult): Promise<string> {
  const { industry, category, subcategory } = industryResult;

  const parts = [industry, category];
  if (subcategory) {
    parts.push(subcategory);
  }

  return parts.join(' > ');
}

/**
 * Suggests brand variations based on detected industry
 */
export async function suggestBrandVariations(
  brandName: string,
  industry: string
): Promise<string[]> {
  const prompt = `Given the brand name "${brandName}" in the ${industry} industry, suggest 2-3 common variations or alternative names that people might use to refer to this brand.

Examples:
- Include common abbreviations
- Include "Dr." or professional titles if applicable
- Include location-based variations if relevant

Return only the variations as a JSON array: ["variation1", "variation2", "variation3"]`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are helpful at suggesting brand name variations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const variations = JSON.parse(content) as string[];

    return variations.filter(v => v.toLowerCase() !== brandName.toLowerCase()).slice(0, 3);
  } catch (error) {
    console.error('Brand variation suggestion error:', error);
    return [];
  }
}
