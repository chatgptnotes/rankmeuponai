import { ReactNode } from 'react';
import { StepIndicator } from './StepIndicator';
import type { OnboardingStep } from '@/types/onboarding';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: OnboardingStep;
  title: ReactNode;
  subtitle?: ReactNode;
  showStepIndicator?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  title,
  subtitle,
  showStepIndicator = true,
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Step Indicator */}
      {showStepIndicator && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
