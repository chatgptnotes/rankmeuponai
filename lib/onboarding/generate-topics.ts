import { getOpenAIClient } from '@/lib/ai/openai-client';
import type { TopicCluster, TopicGenerationRequest, TopicGenerationResult } from '@/types/onboarding';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates topic clusters with prompts based on brand information
 * Uses GEO (Generative Engine Optimization) principles
 */
export async function generateTopicClusters(
  request: TopicGenerationRequest
): Promise<TopicGenerationResult> {
  const { brandName, industry, location, websiteUrl } = request;

  const locationContext = location && location !== 'global'
    ? `Location: ${location}`
    : 'Operating globally';

  const prompt = `Generate 5 topic clusters with prompts for AI search optimization (GEO).

Brand: ${brandName}
Industry: ${industry}
${locationContext}
${websiteUrl ? `Website: ${websiteUrl}` : ''}

For each topic cluster, create:
1. A descriptive cluster name (3-6 words)
2. Exactly 5 high-quality prompts that:
   - Are natural questions users would ask AI assistants (ChatGPT, Perplexity, Gemini, Claude)
   - Are specific to the ${industry} industry
   - Would naturally mention ${brandName} in responses
   - Cover different aspects: quality, expertise, services, comparisons, recommendations
   - Include location context if applicable
   - Follow GEO best practices (question format, specific intent)

Important GEO Guidelines:
- Questions should be conversational and natural
- Include "what", "which", "where", "who" question formats
- Be specific enough to trigger brand mentions
- Cover different search intents (informational, comparison, recommendation)
- Include industry-specific terminology

Return ONLY valid JSON in this exact format:
{
  "topics": [
    {
      "name": "Topic Cluster Name",
      "description": "Brief description of this cluster",
      "prompts": [
        "Prompt 1?",
        "Prompt 2?",
        "Prompt 3?",
        "Prompt 4?",
        "Prompt 5?"
      ]
    }
  ]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert in Generative Engine Optimization (GEO) and creating topic clusters for brand visibility in AI search results. You understand:
- How to craft prompts that trigger brand mentions in AI responses
- Industry-specific terminology and search patterns
- GEO ranking factors: authoritative tone, statistics, citations, technical terms
- How users query AI assistants for recommendations and information`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    // Validate and structure the result
    if (!result.topics || !Array.isArray(result.topics)) {
      throw new Error('Invalid topic generation result');
    }

    // Add IDs to topics and validate structure
    const topics: TopicCluster[] = result.topics.slice(0, 5).map((topic: TopicCluster) => ({
      id: uuidv4(),
      name: topic.name || 'Untitled Topic',
      description: topic.description || '',
      prompts: Array.isArray(topic.prompts) ? topic.prompts.slice(0, 5) : [],
    }));

    // Ensure each topic has exactly 5 prompts
    topics.forEach(topic => {
      while (topic.prompts.length < 5) {
        topic.prompts.push(`What makes ${brandName} unique in ${industry}?`);
      }
    });

    return {
      topics,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Topic generation error:', error);

    // Return fallback topics
    return {
      topics: generateFallbackTopics(brandName, industry, location),
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Generates fallback topic clusters if AI generation fails
 */
function generateFallbackTopics(
  brandName: string,
  industry: string,
  location?: string
): TopicCluster[] {
  const locationSuffix = location && location !== 'global' ? ` in ${location}` : '';

  return [
    {
      id: uuidv4(),
      name: `${industry} Services${locationSuffix}`,
      description: `General service inquiries for ${industry}`,
      prompts: [
        `What are the best ${industry.toLowerCase()} services${locationSuffix}?`,
        `Which companies offer quality ${industry.toLowerCase()} solutions${locationSuffix}?`,
        `Where can I find reliable ${industry.toLowerCase()} providers${locationSuffix}?`,
        `What ${industry.toLowerCase()} companies have the best reputation${locationSuffix}?`,
        `Who provides ${industry.toLowerCase()} services${locationSuffix}?`,
      ],
    },
    {
      id: uuidv4(),
      name: 'Expertise and Qualifications',
      description: 'Questions about expertise and credentials',
      prompts: [
        `Who are the top experts in ${industry.toLowerCase()}${locationSuffix}?`,
        `Which ${industry.toLowerCase()} professionals have the best credentials${locationSuffix}?`,
        `What companies have experienced ${industry.toLowerCase()} specialists${locationSuffix}?`,
        `Where can I find qualified ${industry.toLowerCase()} professionals${locationSuffix}?`,
        `Which ${industry.toLowerCase()} providers are most experienced${locationSuffix}?`,
      ],
    },
    {
      id: uuidv4(),
      name: 'Quality and Reputation',
      description: 'Questions about quality and customer satisfaction',
      prompts: [
        `What ${industry.toLowerCase()} companies have the best reviews${locationSuffix}?`,
        `Which ${industry.toLowerCase()} providers offer the highest quality${locationSuffix}?`,
        `Where can I find top-rated ${industry.toLowerCase()} services${locationSuffix}?`,
        `What ${industry.toLowerCase()} companies do customers recommend${locationSuffix}?`,
        `Which ${industry.toLowerCase()} businesses have the best reputation${locationSuffix}?`,
      ],
    },
    {
      id: uuidv4(),
      name: 'Specific Solutions',
      description: 'Industry-specific solution inquiries',
      prompts: [
        `What ${industry.toLowerCase()} solutions are available${locationSuffix}?`,
        `Which companies provide comprehensive ${industry.toLowerCase()} services${locationSuffix}?`,
        `Where can I get ${industry.toLowerCase()} assistance${locationSuffix}?`,
        `What ${industry.toLowerCase()} options should I consider${locationSuffix}?`,
        `Which ${industry.toLowerCase()} providers offer the best solutions${locationSuffix}?`,
      ],
    },
    {
      id: uuidv4(),
      name: 'Comparisons and Recommendations',
      description: 'Comparative and recommendation queries',
      prompts: [
        `How do I choose the best ${industry.toLowerCase()} provider${locationSuffix}?`,
        `What should I look for in a ${industry.toLowerCase()} company${locationSuffix}?`,
        `Which ${industry.toLowerCase()} service is recommended${locationSuffix}?`,
        `What are the differences between ${industry.toLowerCase()} providers${locationSuffix}?`,
        `Which ${industry.toLowerCase()} company should I use${locationSuffix}?`,
      ],
    },
  ];
}

/**
 * Refines existing prompts to better align with GEO principles
 */
export async function refinePrompts(prompts: string[], brandContext: string): Promise<string[]> {
  const prompt = `Refine these prompts to better align with GEO (Generative Engine Optimization) principles:

${prompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Context: ${brandContext}

Make them:
1. More natural and conversational
2. More likely to trigger brand mentions
3. More specific and intent-driven
4. Better aligned with how users query AI assistants

Return ONLY a JSON array of refined prompts: ["prompt1", "prompt2", ...]`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const refined = JSON.parse(content) as string[];

    return refined.slice(0, prompts.length);
  } catch (error) {
    console.error('Prompt refinement error:', error);
    return prompts;
  }
}
