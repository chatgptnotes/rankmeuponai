'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  chatgpt: number;
  perplexity: number;
  gemini: number;
  claude: number;
}

const mockKeywords: Keyword[] = [
  {
    id: '1',
    keyword: 'best hospital',
    mentions: 24,
    trend: 'up',
    trendValue: 12,
    chatgpt: 45,
    perplexity: 38,
    gemini: 52,
    claude: 40
  },
  {
    id: '2',
    keyword: 'healthcare provider',
    mentions: 18,
    trend: 'stable',
    trendValue: 0,
    chatgpt: 32,
    perplexity: 28,
    gemini: 35,
    claude: 30
  },
  {
    id: '3',
    keyword: 'medical facility',
    mentions: 15,
    trend: 'down',
    trendValue: -8,
    chatgpt: 28,
    perplexity: 25,
    gemini: 30,
    claude: 26
  },
];

export default function KeywordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords] = useState<Keyword[]>(mockKeywords);

  const filteredKeywords = keywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          Keywords & Phrases
        </h1>
        <p className="text-lg text-muted-foreground">
          Track keyword mentions across AI engines
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Keyword
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left text-sm font-medium">Keyword</th>
                <th className="p-4 text-center text-sm font-medium">Mentions</th>
                <th className="p-4 text-center text-sm font-medium">Trend</th>
                <th className="p-4 text-center text-sm font-medium">ChatGPT</th>
                <th className="p-4 text-center text-sm font-medium">Perplexity</th>
                <th className="p-4 text-center text-sm font-medium">Gemini</th>
                <th className="p-4 text-center text-sm font-medium">Claude</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeywords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? 'No keywords found matching your search'
                        : 'No keywords tracked yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredKeywords.map((keyword) => (
                  <tr key={keyword.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-medium">{keyword.keyword}</div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="secondary">{keyword.mentions}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getTrendIcon(keyword.trend)}
                        {keyword.trendValue !== 0 && (
                          <span className={`text-sm ${
                            keyword.trend === 'up' ? 'text-green-500' :
                            keyword.trend === 'down' ? 'text-red-500' :
                            'text-muted-foreground'
                          }`}>
                            {keyword.trendValue > 0 ? '+' : ''}{keyword.trendValue}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm">{keyword.chatgpt}%</td>
                    <td className="p-4 text-center text-sm">{keyword.perplexity}%</td>
                    <td className="p-4 text-center text-sm">{keyword.gemini}%</td>
                    <td className="p-4 text-center text-sm">{keyword.claude}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground">
        Showing {filteredKeywords.length} of {keywords.length} keywords
      </div>
    </div>
  );
}
