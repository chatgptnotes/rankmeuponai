'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export default function OnboardingStep1() {
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [variations, setVariations] = useState<string[]>(['']);

  const addVariation = () => {
    if (variations.length < 3) {
      setVariations([...variations, '']);
    }
  };

  const removeVariation = (idx: number) => {
    setVariations(variations.filter((_, i) => i !== idx));
  };

  const updateVariation = (idx: number, value: string) => {
    const newVariations = [...variations];
    newVariations[idx] = value;
    setVariations(newVariations);
  };

  const handleContinue = () => {
    sessionStorage.setItem('onboarding', JSON.stringify({
      brandName,
      websiteUrl,
      variations: variations.filter(v => v.trim())
    }));
    router.push('/onboarding/step-2');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">
            Hey there! <span className="inline-block">=K</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Let&apos;s optimize your brand for AI
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Just a few quick details to get started. (
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="brandName" className="text-sm font-medium">
                Brand Name
              </label>
              <Input
                id="brandName"
                placeholder="Hope hospital"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="websiteUrl" className="text-sm font-medium">
                Website URL
              </label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://hopehospital.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Brand Variations</label>
                {variations.length < 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addVariation}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {variations.map((variation, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      placeholder="Dr Murali BK"
                      value={variation}
                      onChange={(e) => updateVariation(idx, e.target.value)}
                      className="text-base"
                    />
                    {variations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariation(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                For better results, add up-to 2 more brand variations
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Step 1 / 2
            </div>
            <Button
              onClick={handleContinue}
              disabled={!brandName || !websiteUrl}
              size="lg"
            >
              Continue ’
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
