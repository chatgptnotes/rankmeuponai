import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  OnboardingState,
  BrandFormData,
  LocationFormData,
  TopicFormData,
  OnboardingStep,
} from '@/types/onboarding';

const initialData = {
  brandName: '',
  websiteUrl: '',
  variations: [],
  locationType: 'location' as const,
  location: '',
  selectedTopicIds: [],
  topics: [],
  currentStep: 1 as OnboardingStep,
  isComplete: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      data: initialData,
      isLoading: false,
      error: null,

      setBrandData: (brandData: BrandFormData) => {
        set((state) => ({
          data: {
            ...state.data,
            ...brandData,
          },
        }));
      },

      setLocationData: (locationData: LocationFormData) => {
        set((state) => ({
          data: {
            ...state.data,
            ...locationData,
          },
        }));
      },

      setTopicData: (topicData: TopicFormData) => {
        set((state) => ({
          data: {
            ...state.data,
            ...topicData,
          },
        }));
      },

      setCurrentStep: (step: OnboardingStep) => {
        set((state) => ({
          data: {
            ...state.data,
            currentStep: step,
          },
        }));
      },

      setDetectedIndustry: (industry: string) => {
        set((state) => ({
          data: {
            ...state.data,
            detectedIndustry: industry,
          },
        }));
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      reset: () => {
        set({
          data: initialData,
          isLoading: false,
          error: null,
        });
      },

      // Validation methods
      canProceedToStep2: () => {
        const { data } = get();
        return Boolean(
          data.brandName &&
          data.brandName.trim().length > 0 &&
          data.websiteUrl &&
          data.websiteUrl.trim().length > 0
        );
      },

      canProceedToStep3: () => {
        const { data } = get();
        return Boolean(
          data.locationType &&
          (data.locationType === 'global' || (data.location && data.location.trim().length > 0))
        );
      },

      canComplete: () => {
        const { data } = get();
        return get().canProceedToStep2() && get().canProceedToStep3();
      },
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        data: state.data,
      }),
    }
  )
);
