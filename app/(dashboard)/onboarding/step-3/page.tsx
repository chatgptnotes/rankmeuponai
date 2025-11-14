'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { TopicCluster } from '@/types/onboarding';

export default function OnboardingStep3() {
  const router = useRouter();
  const { data, setTopicData, canProceedToStep3, setCurrentStep, reset } = useOnboardingStore();

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    new Set(data.selectedTopicIds || [])
  );
  const [topics, setTopics] = useState<TopicCluster[]>(data.topics || []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentStep(3);

    // Check if previous steps were completed
    if (!canProceedToStep3()) {
      toast.error('Please complete previous steps first');
      router.push('/onboarding/step-1');
      return;
    }

    // Generate topics on initial load if not already generated
    if (topics.length === 0) {
      handleGenerateTopics();
    }
  }, []);

  const handleGenerateTopics = async () => {
    if (!data.brandName || !data.detectedIndustry) {
      toast.error('Missing brand information. Please go back to step 1.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/onboarding/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: data.brandName,
          industry: data.detectedIndustry,
          location: data.location !== 'global' ? data.location : undefined,
          websiteUrl: data.websiteUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate topics');
      }

      const result = await response.json();
      setTopics(result.topics);
      toast.success('Topic clusters generated successfully!');
    } catch (error) {
      console.error('Topic generation error:', error);
      toast.error('Failed to generate topics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-2');
  };

  const toggleTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const removeTopic = (topicId: string) => {
    setTopics(topics.filter((t) => t.id !== topicId));
    const newSelected = new Set(selectedTopics);
    newSelected.delete(topicId);
    setSelectedTopics(newSelected);
  };

  const handleComplete = async () => {
    if (selectedTopics.size === 0) {
      toast.error('Please select at least one topic cluster');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedTopicData = topics.filter((t) => selectedTopics.has(t.id));

      const payload = {
        brandName: data.brandName,
        websiteUrl: data.websiteUrl,
        variations: data.variations || [],
        locationType: data.locationType,
        location: data.location,
        topics: selectedTopicData,
      };

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete onboarding');
      }

      // Save selected topics to store before clearing
      setTopicData({
        selectedTopicIds: Array.from(selectedTopics),
        topics: selectedTopicData,
      });

      toast.success('Brand created successfully!');

      // Reset the onboarding store
      reset();

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding');
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    // Save empty topic data
    setTopicData({
      selectedTopicIds: [],
      topics: [],
    });

    setIsSubmitting(true);

    try {
      const payload = {
        brandName: data.brandName,
        websiteUrl: data.websiteUrl,
        variations: data.variations || [],
        locationType: data.locationType,
        location: data.location,
        topics: [],
      };

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete onboarding');
      }

      toast.success('Brand created successfully!');

      // Reset the onboarding store
      reset();

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding');
      setIsSubmitting(false);
    }
  };

  const selectedTopicCount = selectedTopics.size;
  const selectedPromptCount = topics
    .filter((t) => selectedTopics.has(t.id))
    .reduce((acc, t) => acc + t.prompts.length, 0);

  if (isGenerating && topics.length === 0) {
    return (
      <OnboardingLayout
        currentStep={3}
        title="Generating Your Topic Clusters"
        subtitle="Our AI is creating personalized prompts for your brand..."
      >
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Creating topic clusters with AI</p>
              <p className="text-sm text-muted-foreground">
                This may take 10-15 seconds...
              </p>
            </div>
          </div>
        </Card>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={3}
      title="Choose your topic clusters"
      subtitle={
        <span className="flex items-center justify-center gap-2">
          Here&apos;s {topics.length} topic clusters with personalized prompts
          <Sparkles className="h-4 w-4" />
        </span>
      }
    >
      <div className="space-y-4">
        {/* Regenerate Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateTopics}
            disabled={isGenerating || isSubmitting}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
            Regenerate Topics
          </Button>
        </div>

        {/* Topic Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className={cn(
                'relative p-6 transition-all',
                selectedTopics.has(topic.id) && 'border-primary bg-primary/5'
              )}
            >
              <button
                onClick={() => removeTopic(topic.id)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold pr-8">{topic.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  Topic Cluster • {topic.prompts.length} prompts
                </Badge>
                {topic.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {topic.description}
                  </p>
                )}
              </div>

              <ul className="mb-4 space-y-2">
                {topic.prompts.map((prompt, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {prompt}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => toggleTopic(topic.id)}
                variant={selectedTopics.has(topic.id) ? 'default' : 'outline'}
                className="w-full"
                size="sm"
                disabled={isSubmitting}
              >
                {selectedTopics.has(topic.id) ? 'Selected' : 'Select topic'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Selection Summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Topics: <span className="font-semibold text-foreground">{selectedTopicCount}</span>
              {' • '}
              Prompts: <span className="font-semibold text-foreground">{selectedPromptCount}</span>
            </span>
            {selectedTopicCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {selectedTopicCount} selected
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
            ← Back
          </Button>
          <div className="text-sm text-muted-foreground">Step 3 / 3</div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
            Skip
          </Button>
          <Button
            onClick={handleComplete}
            size="lg"
            disabled={isSubmitting || selectedTopics.size === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Complete'
            )}
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
