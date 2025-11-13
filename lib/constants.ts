// Entity Types
export const ENTITY_TYPES = [
  { value: 'brand', label: 'Brand', description: 'A company or product brand' },
  { value: 'product', label: 'Product', description: 'A specific product or service' },
  { value: 'person', label: 'Person', description: 'An individual or influencer' },
  { value: 'organization', label: 'Organization', description: 'Non-profit or institution' },
  { value: 'service', label: 'Service', description: 'A service offering' },
] as const;

// AI Engines
export const AI_ENGINES = [
  { id: 'chatgpt', name: 'ChatGPT', icon: 'chat', color: '#10a37f' },
  { id: 'perplexity', name: 'Perplexity', icon: 'search', color: '#8b5cf6' },
  { id: 'gemini', name: 'Google Gemini', icon: 'stars', color: '#4285f4' },
  { id: 'claude', name: 'Claude', icon: 'psychology', color: '#d97757' },
] as const;

// Prompt Categories
export const PROMPT_CATEGORIES = [
  'General Information',
  'Comparison',
  'Best Practices',
  'How-to',
  'Recommendations',
  'Reviews',
  'Alternatives',
  'Pricing',
  'Features',
  'Use Cases',
] as const;

// Tracking Status
export const TRACKING_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Version
export const APP_VERSION = '1.0';
export const APP_NAME = 'RankMeUpon.ai';
export const REPOSITORY = 'rankmeuponai.com';
