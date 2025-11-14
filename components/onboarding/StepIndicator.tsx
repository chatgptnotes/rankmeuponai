import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingStep } from '@/types/onboarding';

interface StepIndicatorProps {
  currentStep: OnboardingStep;
  totalSteps?: number;
  className?: string;
}

const steps = [
  { number: 1, label: 'Brand Info' },
  { number: 2, label: 'Location' },
  { number: 3, label: 'Topics' },
];

export function StepIndicator({ currentStep, totalSteps = 3, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.slice(0, totalSteps).map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                  currentStep > step.number
                    ? 'border-primary bg-primary text-primary-foreground'
                    : currentStep === step.number
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  currentStep >= step.number
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1 transition-all',
                  currentStep > step.number
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
