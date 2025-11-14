import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

export interface ChatGPTResponse {
  content: string;
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

/**
 * Query ChatGPT with a prompt and get the response
 */
export async function queryChatGPT(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<ChatGPTResponse> {
  const {
    model = 'gpt-4o-mini', // Use cost-effective model by default
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error('No response from ChatGPT');
    }

    return {
      content: choice.message?.content || '',
      finishReason: choice.finish_reason,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      model: completion.model,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Query ChatGPT with web search enabled (using function calling to simulate)
 * This simulates how ChatGPT would respond with citations
 */
export async function queryChatGPTWithSearch(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<ChatGPTResponse> {
  // Add instruction to include sources and citations
  const enhancedPrompt = `${prompt}

Please provide a comprehensive answer with specific sources, citations, and references where applicable. Include URLs and website names when mentioning specific brands, products, or services.`;

  return queryChatGPT(enhancedPrompt, {
    ...options,
    maxTokens: 3000, // Allow more tokens for detailed responses with citations
  });
}

/**
 * Extract structured information from ChatGPT response
 */
export async function extractStructuredData<T>(
  prompt: string,
  schema: string
): Promise<T> {
  const structuredPrompt = `${prompt}

Please respond ONLY with valid JSON matching this schema:
${schema}

Do not include any markdown formatting or explanatory text, just the JSON object.`;

  const response = await queryChatGPT(structuredPrompt, {
    temperature: 0.3, // Lower temperature for more consistent structured output
  });

  try {
    return JSON.parse(response.content) as T;
  } catch (error) {
    throw new Error(`Failed to parse structured response: ${error}`);
  }
}
