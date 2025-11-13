'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  promptCount: number;
  visibilityScore: number;
  lastUpdated: string;
}

const mockTopics: Topic[] = [
  {
    id: '1',
    name: 'Healthcare Services',
    promptCount: 5,
    visibilityScore: 72,
    lastUpdated: '2024-11-14'
  },
  {
    id: '2',
    name: 'Medical Expertise',
    promptCount: 5,
    visibilityScore: 68,
    lastUpdated: '2024-11-14'
  },
  {
    id: '3',
    name: 'Patient Care Quality',
    promptCount: 5,
    visibilityScore: 75,
    lastUpdated: '2024-11-14'
  },
];

export default function TopicsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [topics] = useState<Topic[]>(mockTopics);

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          Topic Clusters
        </h1>
        <p className="text-lg text-muted-foreground">
          Organize your prompts into topic clusters for better tracking
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Topic
        </Button>
      </div>

      {filteredTopics.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No topics found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first topic cluster'}
            </p>
            {!searchQuery && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Topic
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-1">{topic.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {topic.promptCount} prompts
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {topic.visibilityScore}% visibility
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Visibility Score</span>
                    <span>{topic.visibilityScore}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${topic.visibilityScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(topic.lastUpdated).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-muted-foreground">
        Showing {filteredTopics.length} of {topics.length} topics
      </div>
    </div>
  );
}
