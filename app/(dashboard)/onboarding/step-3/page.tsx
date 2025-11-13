'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCluster {
  id: string;
  name: string;
  prompts: string[];
}

const mockTopicClusters: TopicCluster[] = [
  {
    id: '1',
    name: 'Healthcare Services',
    prompts: [
      'What are the best hospitals in the area?',
      'Which medical facilities offer specialized care?',
      'Where can I find quality healthcare providers?',
      'What hospitals have the best patient reviews?',
      'Which healthcare center provides emergency services?'
    ]
  },
  {
    id: '2',
    name: 'Medical Expertise',
    prompts: [
      'Who are the top doctors in this specialty?',
      'Which medical professionals have the best credentials?',
      'Where can I find experienced specialists?',
      'What doctors are recommended for this condition?',
      'Which physicians have the highest success rates?'
    ]
  },
  {
    id: '3',
    name: 'Patient Care Quality',
    prompts: [
      'What hospitals offer the best patient experience?',
      'Which facilities have the highest patient satisfaction?',
      'Where can I find compassionate healthcare providers?',
      'What medical centers prioritize patient comfort?',
      'Which hospitals have the best nursing care?'
    ]
  },
  {
    id: '4',
    name: 'Advanced Medical Technology',
    prompts: [
      'Which hospitals use cutting-edge medical technology?',
      'Where can I find facilities with modern equipment?',
      'What medical centers offer advanced diagnostic tools?',
      'Which hospitals invest in latest medical innovations?',
      'Where are the most technologically advanced facilities?'
    ]
  },
  {
    id: '5',
    name: 'Specialized Treatments',
    prompts: [
      'Which facilities specialize in complex procedures?',
      'Where can I find treatment for rare conditions?',
      'What hospitals offer specialized care programs?',
      'Which centers have expertise in specific treatments?',
      'Where are the best facilities for specialized medicine?'
    ]
  }
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState<TopicCluster[]>(mockTopicClusters);

  useEffect(() => {
    const saved = sessionStorage.getItem('onboarding');
    if (!saved) {
      router.push('/onboarding/step-1');
    }
  }, [router]);

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
    setTopics(topics.filter(t => t.id !== topicId));
    const newSelected = new Set(selectedTopics);
    newSelected.delete(topicId);
    setSelectedTopics(newSelected);
  };

  const handleComplete = async () => {
    const saved = sessionStorage.getItem('onboarding');
    if (!saved) return;

    const data = JSON.parse(saved);
    const selectedTopicData = topics.filter(t => selectedTopics.has(t.id));

    const finalData = {
      ...data,
      topics: selectedTopicData,
      totalPrompts: selectedTopicData.reduce((acc, t) => acc + t.prompts.length, 0)
    };

    sessionStorage.setItem('onboarding', JSON.stringify(finalData));

    // TODO: Save to Supabase and redirect to dashboard
    router.push('/dashboard');
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const selectedTopicCount = selectedTopics.size;
  const selectedPromptCount = topics
    .filter(t => selectedTopics.has(t.id))
    .reduce((acc, t) => acc + t.prompts.length, 0);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">
            Choose your topic clusters
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            Here&apos;s 5 topic clusters with personalized prompts
            <Sparkles className="h-4 w-4" />
          </p>
        </div>

        <div className="space-y-4">
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
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-semibold">{topic.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Topic Cluster " {topic.prompts.length} prompts
                  </Badge>
                </div>

                <ul className="mb-4 space-y-2">
                  {topic.prompts.map((prompt, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      " {prompt}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => toggleTopic(topic.id)}
                  variant={selectedTopics.has(topic.id) ? 'default' : 'outline'}
                  className="w-full"
                  size="sm"
                >
                  {selectedTopics.has(topic.id) ? 'Selected' : 'Select topic'}
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Topics: <span className="font-semibold text-foreground">{selectedTopicCount}</span>
                {' " '}
                Prompts: <span className="font-semibold text-foreground">{selectedPromptCount}</span>
              </span>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
            >
              ê Back
            </Button>
            <div className="text-sm text-muted-foreground">
              Step 3 / 3
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              Skip
            </Button>
            <Button
              onClick={handleComplete}
              size="lg"
            >
              Complete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
