/**
 * Onboarding types for the multi-step brand setup flow
 */

export type LocationType = 'location' | 'global';

export type OnboardingStep = 1 | 2 | 3;

export interface TopicCluster {
  id: string;
  name: string;
  prompts: string[];
  description?: string;
}

export interface BrandFormData {
  brandName: string;
  websiteUrl: string;
  variations: string[];
}

export interface LocationFormData {
  locationType: LocationType;
  location: string;
}

export interface TopicFormData {
  selectedTopicIds: string[];
  topics: TopicCluster[];
}

export interface OnboardingData extends BrandFormData, LocationFormData, TopicFormData {
  currentStep: OnboardingStep;
  detectedIndustry?: string;
  isComplete: boolean;
}

export interface OnboardingState {
  data: Partial<OnboardingData>;
  isLoading: boolean;
  error: string | null;

  // Actions
  setBrandData: (data: BrandFormData) => void;
  setLocationData: (data: LocationFormData) => void;
  setTopicData: (data: TopicFormData) => void;
  setCurrentStep: (step: OnboardingStep) => void;
  setDetectedIndustry: (industry: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;

  // Computed
  canProceedToStep2: () => boolean;
  canProceedToStep3: () => boolean;
  canComplete: () => boolean;
}

export interface IndustryDetectionResult {
  industry: string;
  category: string;
  subcategory?: string;
  confidence: number;
  suggestedKeywords: string[];
}

export interface TopicGenerationRequest {
  brandName: string;
  industry: string;
  location?: string;
  websiteUrl?: string;
}

export interface TopicGenerationResult {
  topics: TopicCluster[];
  generatedAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface OnboardingProgress {
  userId: string;
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  updatedAt: string;
  createdAt: string;
}
