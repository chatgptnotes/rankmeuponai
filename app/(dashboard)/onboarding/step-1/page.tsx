'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { validateBrandData, normalizeUrl } from '@/lib/onboarding/validation';
import { toast } from 'sonner';
import type { IndustryDetectionResult } from '@/types/onboarding';

export default function OnboardingStep1() {
  const router = useRouter();
  const { data, setBrandData, setDetectedIndustry, canProceedToStep2, setCurrentStep } = useOnboardingStore();

  const [brandName, setBrandNameLocal] = useState(data.brandName || '');
  const [websiteUrl, setWebsiteUrl] = useState(data.websiteUrl || '');
  const [variations, setVariations] = useState<string[]>(data.variations || ['']);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedIndustry, setDetectedIndustryLocal] = useState<IndustryDetectionResult | null>(null);
  const [suggestedVariations, setSuggestedVariations] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  // Auto-detect industry when both brand name and URL are provided
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (brandName.trim() && websiteUrl.trim() && !detectedIndustry && !isDetecting) {
        handleDetectIndustry();
      }
    }, 1500); // Debounce for 1.5 seconds

    return () => clearTimeout(timeoutId);
  }, [brandName, websiteUrl]);

  const handleDetectIndustry = async () => {
    if (!brandName.trim() || !websiteUrl.trim()) return;

    setIsDetecting(true);
    try {
      const response = await fetch('/api/onboarding/detect-industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          websiteUrl: normalizeUrl(websiteUrl),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect industry');
      }

      const result = await response.json();
      setDetectedIndustryLocal(result.industry);
      setDetectedIndustry(
        `${result.industry.industry} > ${result.industry.category}${
          result.industry.subcategory ? ` > ${result.industry.subcategory}` : ''
        }`
      );

      // Show suggested variations
      if (result.suggestedVariations && result.suggestedVariations.length > 0) {
        setSuggestedVariations(result.suggestedVariations);
      }

      toast.success('Industry detected successfully!');
    } catch (error) {
      console.error('Industry detection error:', error);
      toast.error('Failed to detect industry. You can still continue.');
    } finally {
      setIsDetecting(false);
    }
  };

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

  const addSuggestedVariation = (variation: string) => {
    if (variations.length < 3) {
      const emptyIndex = variations.findIndex(v => !v.trim());
      if (emptyIndex !== -1) {
        updateVariation(emptyIndex, variation);
      } else {
        setVariations([...variations, variation]);
      }
      setSuggestedVariations(suggestedVariations.filter(v => v !== variation));
      toast.success('Variation added!');
    } else {
      toast.error('Maximum 3 variations allowed');
    }
  };

  const handleContinue = () => {
    // Validate data
    const validation = validateBrandData({
      brandName,
      websiteUrl,
      variations: variations.filter(v => v.trim()),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors before continuing');
      return;
    }

    setErrors({});

    // Save to store
    setBrandData({
      brandName: brandName.trim(),
      websiteUrl: normalizeUrl(websiteUrl),
      variations: variations.filter(v => v.trim()),
    });

    router.push('/onboarding/step-2');
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title="Hey there!"
      subtitle="Let's optimize your brand for AI"
    >
      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="brandName" className="text-sm font-medium">
              Brand Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="brandName"
              placeholder="Hope Hospital"
              value={brandName}
              onChange={(e) => setBrandNameLocal(e.target.value)}
              className="text-base"
              disabled={isDetecting}
            />
            {errors.brandName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.brandName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="websiteUrl" className="text-sm font-medium">
              Website URL <span className="text-destructive">*</span>
            </label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://hopehospital.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="text-base"
              disabled={isDetecting}
            />
            {errors.websiteUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.websiteUrl}
              </p>
            )}
          </div>

          {/* Industry Detection Result */}
          {isDetecting && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">
                  Detecting industry with AI...
                </span>
              </div>
            </div>
          )}

          {detectedIndustry && !isDetecting && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Detected Industry:</span>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI-Powered
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">
                    {detectedIndustry.industry} → {detectedIndustry.category}
                    {detectedIndustry.subcategory && ` → ${detectedIndustry.subcategory}`}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Confidence:</span>
                    <span className={confidenceColor(detectedIndustry.confidence)}>
                      {Math.round(detectedIndustry.confidence * 100)}%
                    </span>
                  </div>
                  {detectedIndustry.suggestedKeywords && detectedIndustry.suggestedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {detectedIndustry.suggestedKeywords.slice(0, 5).map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Brand Variations */}
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
                    placeholder="e.g., Dr. Murali BK"
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
            {errors.variations && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.variations}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              For better results, add up to 2 more brand variations
            </p>

            {/* AI Suggested Variations */}
            {suggestedVariations.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedVariations.map((variation, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => addSuggestedVariation(variation)}
                      className="gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      {variation}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Step 1 / 3</div>
          <Button
            onClick={handleContinue}
            disabled={!brandName.trim() || !websiteUrl.trim() || isDetecting}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </Card>
    </OnboardingLayout>
  );
}
