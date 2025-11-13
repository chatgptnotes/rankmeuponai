import type { Database } from './database';

// Entity Types
export type EntityType = 
  | 'brand' 
  | 'product' 
  | 'person' 
  | 'organization' 
  | 'service';

// Brand Types
export type Brand = Database['public']['Tables']['brands']['Row'];
export type BrandInsert = Database['public']['Tables']['brands']['Insert'];
export type BrandUpdate = Database['public']['Tables']['brands']['Update'];

// Profile Types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Prompt Types
export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
export type PromptUpdate = Database['public']['Tables']['prompts']['Update'];

// Tracking Session Types
export type TrackingSession = Database['public']['Tables']['tracking_sessions']['Row'];
export type TrackingSessionInsert = Database['public']['Tables']['tracking_sessions']['Insert'];
export type TrackingSessionUpdate = Database['public']['Tables']['tracking_sessions']['Update'];

// AI Engines
export type AIEngine = 'chatgpt' | 'perplexity' | 'gemini' | 'claude';

// Citation
export interface Citation {
  url: string;
  title: string;
  snippet?: string;
  position: number;
}

// Onboarding State
export interface OnboardingState {
  currentStep: number;
  entityType: EntityType | null;
  brandName: string;
  websiteUrl: string;
  industry: string | null;
  selectedTopics: string[];
  isComplete: boolean;
}

// Analytics
export interface VisibilityScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface AnalyticsData {
  totalPrompts: number;
  totalCitations: number;
  visibilityScore: VisibilityScore;
  topTopics: Array<{ topic: string; count: number }>;
}
