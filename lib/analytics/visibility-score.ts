/**
 * Visibility Score Calculations
 * Based on GEO (Generative Engine Optimization) research from Princeton University
 *
 * Score Calculation Factors:
 * 1. Mention Frequency (40%) - How often brand is mentioned
 * 2. Ranking Position (30%) - Position in AI responses (1-3 = excellent, 4-5 = good, 6+ = poor)
 * 3. Sentiment (20%) - Positive/Neutral/Negative tone
 * 4. Citation Quality (10%) - Relevance and authority of sources
 */

export interface VisibilityMetrics {
  totalQueries: number;
  totalMentions: number;
  averagePosition: number | null;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  citationQuality: number; // 0-1 score
}

export interface ScoreBreakdown {
  overall: number;
  mentionFrequency: number;
  position: number;
  sentiment: number;
  citationQuality: number;
}

/**
 * Calculate mention frequency score (0-100)
 * Based on percentage of queries where brand was mentioned
 */
export function calculateMentionFrequencyScore(totalQueries: number, totalMentions: number): number {
  if (totalQueries === 0) return 0;

  const mentionRate = totalMentions / totalQueries;

  // Score calculation:
  // 90%+ mention rate = 100 score
  // 70-90% mention rate = 80-100 score
  // 50-70% mention rate = 60-80 score
  // 30-50% mention rate = 40-60 score
  // <30% mention rate = 0-40 score

  if (mentionRate >= 0.9) return 100;
  if (mentionRate >= 0.7) return 80 + (mentionRate - 0.7) * 100;
  if (mentionRate >= 0.5) return 60 + (mentionRate - 0.5) * 100;
  if (mentionRate >= 0.3) return 40 + (mentionRate - 0.3) * 100;
  return mentionRate * 133.33; // 0-30% maps to 0-40
}

/**
 * Calculate position score (0-100)
 * Based on average ranking position in AI responses
 */
export function calculatePositionScore(averagePosition: number | null): number {
  if (averagePosition === null) return 0;

  // Score calculation based on GEO research:
  // Position 1 = 100 score (best)
  // Position 2 = 90 score
  // Position 3 = 80 score
  // Position 4 = 65 score
  // Position 5 = 50 score
  // Position 6-10 = 20-40 score
  // Position 10+ = 0-20 score

  if (averagePosition <= 1) return 100;
  if (averagePosition <= 2) return 90;
  if (averagePosition <= 3) return 80;
  if (averagePosition <= 4) return 65;
  if (averagePosition <= 5) return 50;
  if (averagePosition <= 10) return Math.max(0, 40 - (averagePosition - 5) * 4);
  return Math.max(0, 20 - (averagePosition - 10) * 2);
}

/**
 * Calculate sentiment score (0-100)
 * Based on distribution of positive/neutral/negative mentions
 */
export function calculateSentimentScore(sentimentDistribution: {
  positive: number;
  neutral: number;
  negative: number;
}): number {
  const { positive, neutral, negative } = sentimentDistribution;
  const total = positive + neutral + negative;

  if (total === 0) return 0;

  // GEO research shows 98% of mentions should be neutral/positive
  // Score calculation:
  // Positive mentions = 100 points each
  // Neutral mentions = 70 points each
  // Negative mentions = -50 points each

  const positiveRate = positive / total;
  const neutralRate = neutral / total;
  const negativeRate = negative / total;

  const score = (positiveRate * 100) + (neutralRate * 70) - (negativeRate * 50);

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate citation quality score (0-100)
 * Based on average relevance scores of citations
 */
export function calculateCitationQualityScore(averageRelevance: number): number {
  // Relevance is already 0-1, so just multiply by 100
  return Math.max(0, Math.min(100, averageRelevance * 100));
}

/**
 * Calculate overall visibility score with weighted components
 */
export function calculateVisibilityScore(metrics: VisibilityMetrics): ScoreBreakdown {
  const mentionFrequency = calculateMentionFrequencyScore(
    metrics.totalQueries,
    metrics.totalMentions
  );

  const position = calculatePositionScore(metrics.averagePosition);

  const sentiment = calculateSentimentScore(metrics.sentimentDistribution);

  const citationQuality = calculateCitationQualityScore(metrics.citationQuality);

  // Weighted average based on GEO research importance
  const overall =
    mentionFrequency * 0.4 + // 40% weight - most important
    position * 0.3 +          // 30% weight - very important
    sentiment * 0.2 +         // 20% weight - important
    citationQuality * 0.1;    // 10% weight - moderately important

  return {
    overall: Math.round(overall * 10) / 10, // Round to 1 decimal
    mentionFrequency: Math.round(mentionFrequency * 10) / 10,
    position: Math.round(position * 10) / 10,
    sentiment: Math.round(sentiment * 10) / 10,
    citationQuality: Math.round(citationQuality * 10) / 10,
  };
}

/**
 * Get visibility score interpretation
 */
export function getScoreInterpretation(score: number): {
  label: string;
  description: string;
  color: 'green' | 'yellow' | 'red';
  recommendation: string;
} {
  if (score >= 70) {
    return {
      label: 'Excellent',
      description: 'Your brand has strong AI search visibility',
      color: 'green',
      recommendation: 'Maintain your current strategy and continue tracking performance.',
    };
  }

  if (score >= 50) {
    return {
      label: 'Good',
      description: 'Your brand is performing well in AI search',
      color: 'yellow',
      recommendation: 'Focus on improving ranking positions and increasing positive citations.',
    };
  }

  if (score >= 30) {
    return {
      label: 'Fair',
      description: 'Your brand has moderate AI search presence',
      color: 'yellow',
      recommendation: 'Optimize prompts, increase content quality, and build authoritative citations.',
    };
  }

  return {
    label: 'Needs Improvement',
    description: 'Your brand needs significant optimization',
    color: 'red',
    recommendation: 'Apply GEO techniques: add statistics, quotations, and authoritative sources to your content.',
  };
}

/**
 * Calculate trend between two scores
 */
export function calculateTrend(currentScore: number, previousScore: number): {
  value: number;
  isPositive: boolean;
  label: string;
} {
  const change = currentScore - previousScore;
  const percentChange = previousScore > 0 ? (change / previousScore) * 100 : 0;

  return {
    value: Math.round(percentChange * 10) / 10,
    isPositive: change > 0,
    label: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
  };
}

/**
 * Estimate time to reach target score based on current trend
 */
export function estimateTimeToTarget(
  currentScore: number,
  targetScore: number,
  recentTrend: number // score change per week
): {
  weeks: number;
  achievable: boolean;
  message: string;
} {
  if (currentScore >= targetScore) {
    return {
      weeks: 0,
      achievable: true,
      message: 'Target already achieved!',
    };
  }

  if (recentTrend <= 0) {
    return {
      weeks: Infinity,
      achievable: false,
      message: 'Score is not improving. Optimize your strategy to see progress.',
    };
  }

  const pointsNeeded = targetScore - currentScore;
  const weeks = Math.ceil(pointsNeeded / recentTrend);

  if (weeks > 26) {
    // More than 6 months
    return {
      weeks,
      achievable: false,
      message: `At current pace, it would take ${weeks} weeks. Consider more aggressive optimization.`,
    };
  }

  return {
    weeks,
    achievable: true,
    message: `At current pace, you could reach ${targetScore} in approximately ${weeks} weeks.`,
  };
}
