/**
 * Citation Extraction Service
 * Analyzes AI responses to find brand mentions, citations, and rankings
 */

export interface ExtractedCitation {
  sourceUrl?: string;
  sourceTitle?: string;
  sourceDomain?: string;
  citationText: string;
  position: number;
  context: string;
  isBrandMentioned: boolean;
  brandName?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  relevanceScore?: number;
}

export interface DiscoveredBrand {
  brandName: string;
  brandDomain?: string;
  position: number;
  mentionCount: number;
}

export interface CitationAnalysis {
  citations: ExtractedCitation[];
  discoveredBrands: DiscoveredBrand[];
  targetBrandMentioned: boolean;
  targetBrandPosition?: number;
  totalBrandsFound: number;
  summary: string;
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map((url) => url.replace(/[.,;!?)]+$/, '')); // Remove trailing punctuation
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return undefined;
  }
}

/**
 * Detect brand mentions in text
 */
function detectBrandMentions(
  text: string,
  brandNames: string[]
): { found: boolean; matchedName?: string } {
  const lowerText = text.toLowerCase();
  for (const brandName of brandNames) {
    if (lowerText.includes(brandName.toLowerCase())) {
      return { found: true, matchedName: brandName };
    }
  }
  return { found: false };
}

/**
 * Analyze sentiment of text mentioning the brand
 */
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase();

  // Positive indicators
  const positiveWords = [
    'excellent',
    'great',
    'best',
    'top',
    'leading',
    'premier',
    'outstanding',
    'exceptional',
    'highly rated',
    'recommended',
    'trusted',
    'quality',
    'professional',
    'reliable',
  ];

  // Negative indicators
  const negativeWords = [
    'poor',
    'bad',
    'worst',
    'avoid',
    'disappointing',
    'inferior',
    'limited',
    'lacking',
    'unreliable',
    'problematic',
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++;
  }

  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++;
  }

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extract brand names from response (for discovering competitors)
 */
function extractBrandNames(text: string): string[] {
  const brands: string[] = [];

  // Pattern 1: Capitalized words (likely brand names)
  const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const matches = text.match(capitalizedPattern) || [];

  // Filter out common words
  const commonWords = [
    'The',
    'A',
    'An',
    'In',
    'For',
    'To',
    'This',
    'That',
    'These',
    'Those',
    'It',
    'Is',
    'Are',
    'Was',
    'Were',
    'Be',
    'Been',
    'Being',
    'Have',
    'Has',
    'Had',
    'Do',
    'Does',
    'Did',
    'Will',
    'Would',
    'Could',
    'Should',
    'May',
    'Might',
    'Must',
    'Can',
  ];

  for (const match of matches) {
    if (!commonWords.includes(match) && match.length > 2) {
      brands.push(match);
    }
  }

  return [...new Set(brands)]; // Remove duplicates
}

/**
 * Parse response into structured citations
 */
export function extractCitations(
  responseText: string,
  targetBrandNames: string[]
): CitationAnalysis {
  const citations: ExtractedCitation[] = [];
  const discoveredBrandsMap = new Map<string, DiscoveredBrand>();
  let targetBrandMentioned = false;
  let targetBrandPosition: number | undefined;

  // Split response into paragraphs/sections
  const sections = responseText
    .split('\n\n')
    .filter((section) => section.trim().length > 0);

  // Process each section
  sections.forEach((section, index) => {
    const position = index + 1;

    // Check if target brand is mentioned
    const brandMention = detectBrandMentions(section, targetBrandNames);

    if (brandMention.found) {
      targetBrandMentioned = true;
      if (targetBrandPosition === undefined) {
        targetBrandPosition = position;
      }

      // Create citation for target brand mention
      const sentiment = analyzeSentiment(section);

      citations.push({
        citationText: section.substring(0, 500), // Limit to 500 chars
        position,
        context: section,
        isBrandMentioned: true,
        brandName: brandMention.matchedName,
        sentiment,
        relevanceScore: 0.9, // High relevance for direct mentions
      });
    }

    // Extract discovered brands
    const brandsInSection = extractBrandNames(section);
    brandsInSection.forEach((brandName) => {
      if (!discoveredBrandsMap.has(brandName)) {
        discoveredBrandsMap.set(brandName, {
          brandName,
          position,
          mentionCount: 1,
        });
      } else {
        const existing = discoveredBrandsMap.get(brandName)!;
        existing.mentionCount++;
      }
    });

    // Extract URLs in this section
    const sectionUrls = extractUrls(section);
    sectionUrls.forEach((url) => {
      const domain = extractDomain(url);
      const isBrandUrl = brandMention.found;

      citations.push({
        sourceUrl: url,
        sourceDomain: domain,
        citationText: section.substring(0, 200),
        position,
        context: section,
        isBrandMentioned: isBrandUrl,
        brandName: isBrandUrl ? brandMention.matchedName : undefined,
        relevanceScore: isBrandUrl ? 0.95 : 0.5,
      });
    });
  });

  // If no structured citations found but brand was mentioned, create a generic one
  if (targetBrandMentioned && citations.length === 0) {
    citations.push({
      citationText: responseText.substring(0, 500),
      position: 1,
      context: responseText,
      isBrandMentioned: true,
      sentiment: analyzeSentiment(responseText),
      relevanceScore: 0.8,
    });
  }

  return {
    citations,
    discoveredBrands: Array.from(discoveredBrandsMap.values()),
    targetBrandMentioned,
    targetBrandPosition,
    totalBrandsFound: discoveredBrandsMap.size,
    summary: `Found ${citations.length} citations, ${
      targetBrandMentioned ? 'including' : 'not including'
    } target brand. Discovered ${discoveredBrandsMap.size} other brands.`,
  };
}

/**
 * Calculate relevance score for a brand mention
 */
export function calculateRelevanceScore(
  citation: ExtractedCitation,
  brandName: string
): number {
  let score = 0.5; // Base score

  // Boost for direct brand mention
  if (citation.isBrandMentioned) {
    score += 0.3;
  }

  // Boost for higher positions
  if (citation.position) {
    score += Math.max(0, 0.2 - citation.position * 0.02);
  }

  // Boost for positive sentiment
  if (citation.sentiment === 'positive') {
    score += 0.2;
  } else if (citation.sentiment === 'negative') {
    score -= 0.2;
  }

  // Boost for URLs from brand domain
  if (citation.sourceDomain) {
    const brandNameLower = brandName.toLowerCase();
    if (citation.sourceDomain.includes(brandNameLower)) {
      score += 0.3;
    }
  }

  return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
}
