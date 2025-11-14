'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Globe, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { validateLocationData } from '@/lib/onboarding/validation';
import { toast } from 'sonner';

export default function OnboardingStep2() {
  const router = useRouter();
  const { data, setLocationData, canProceedToStep2, canProceedToStep3, setCurrentStep } = useOnboardingStore();

  const [locationType, setLocationType] = useState<'location' | 'global'>(data.locationType || 'location');
  const [location, setLocation] = useState(data.location || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(2);

    // Check if step 1 was completed
    if (!canProceedToStep2()) {
      toast.error('Please complete step 1 first');
      router.push('/onboarding/step-1');
    }
  }, [canProceedToStep2, router, setCurrentStep]);

  const handleBack = () => {
    router.push('/onboarding/step-1');
  };

  const handleContinue = () => {
    // Validate data
    const validation = validateLocationData({
      locationType,
      location: locationType === 'location' ? location : 'global',
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors before continuing');
      return;
    }

    setErrors({});

    // Save to store
    setLocationData({
      locationType,
      location: locationType === 'location' ? location.trim() : 'global',
    });

    router.push('/onboarding/step-3');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      title={
        <>
          Where does your brand operate? <span className="inline-block">🌍</span>
        </>
      }
      subtitle="Please select if your brand is global or location specific"
    >
      <Card className="p-8">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setLocationType('location')}
              className={cn(
                'flex flex-col items-center gap-4 rounded-lg border-2 p-6 transition-all hover:border-primary',
                locationType === 'location'
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <MapPin className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <div className="font-semibold">Location Specific</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target a specific city or region
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setLocationType('global');
                setLocation('global');
              }}
              className={cn(
                'flex flex-col items-center gap-4 rounded-lg border-2 p-6 transition-all hover:border-primary',
                locationType === 'global'
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <Globe className="h-12 w-12 text-blue-500" />
              <div className="text-center">
                <div className="font-semibold">Global</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Serve customers worldwide
                </p>
              </div>
            </button>
          </div>

          {locationType === 'location' && (
            <div className="space-y-2 animate-in fade-in">
              <label htmlFor="location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </label>
              <Input
                id="location"
                placeholder="e.g., Nagpur, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-base"
              />
              {errors.location && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.location}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the primary city or region where your brand operates
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              ← Back
            </Button>
            <div className="text-sm text-muted-foreground">Step 2 / 3</div>
          </div>
          <Button
            onClick={handleContinue}
            disabled={locationType === 'location' && !location.trim()}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </Card>
    </OnboardingLayout>
  );
}
