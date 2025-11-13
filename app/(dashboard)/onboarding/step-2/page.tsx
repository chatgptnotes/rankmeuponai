'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MapPin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingStep2() {
  const router = useRouter();
  const [locationType, setLocationType] = useState<'location' | 'global'>('location');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding');
    if (!saved) {
      router.push('/onboarding/step-1');
    }
  }, [router]);

  const handleBack = () => {
    router.push('/onboarding/step-1');
  };

  const handleComplete = async () => {
    const saved = sessionStorage.getItem('onboarding');
    if (!saved) return;

    const data = JSON.parse(saved);
    const finalData = {
      ...data,
      locationType,
      location: locationType === 'location' ? location : 'global'
    };

    sessionStorage.setItem('onboarding', JSON.stringify(finalData));
    router.push('/onboarding/step-3');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">
            Where does your brand operate? <span className="inline-block">🌍</span>
          </h1>
          <p className="text-muted-foreground">
            Please select if your brand is global or location specific
          </p>
        </div>

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
                </div>
              </button>

              <button
                onClick={() => setLocationType('global')}
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
                </div>
              </button>
            </div>

            {locationType === 'location' && (
              <div className="space-y-2 animate-in fade-in">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="location"
                  placeholder="nagpur"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-base"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <div className="text-sm text-muted-foreground">
                Step 2 / 2
              </div>
            </div>
            <Button
              onClick={handleComplete}
              disabled={locationType === 'location' && !location}
              size="lg"
            >
              Complete
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
