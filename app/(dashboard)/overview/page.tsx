'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, MessageSquare, Target, Award } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for charts
const visibilityData = [
  { date: 'Nov 7', visibility: 45 },
  { date: 'Nov 8', visibility: 52 },
  { date: 'Nov 9', visibility: 48 },
  { date: 'Nov 10', visibility: 61 },
  { date: 'Nov 11', visibility: 58 },
  { date: 'Nov 12', visibility: 65 },
  { date: 'Nov 13', visibility: 72 },
  { date: 'Nov 14', visibility: 68 },
];

const aiEngineData = [
  { engine: 'ChatGPT', prompts: 145, color: 'hsl(271, 91%, 65%)' },
  { engine: 'Perplexity', prompts: 98, color: 'hsl(189, 94%, 43%)' },
  { engine: 'Gemini', prompts: 67, color: 'hsl(271, 91%, 65%)' },
  { engine: 'Claude', prompts: 54, color: 'hsl(25, 95%, 53%)' },
];

const topPrompts = [
  {
    id: 1,
    prompt: 'Best hospitals in Nagpur for cardiac care',
    engine: 'ChatGPT',
    mentions: 12,
    visibility: 85,
    trend: 'up'
  },
  {
    id: 2,
    prompt: 'Top rated doctors in Nagpur',
    engine: 'Perplexity',
    mentions: 9,
    visibility: 78,
    trend: 'up'
  },
  {
    id: 3,
    prompt: 'Healthcare services with advanced technology',
    engine: 'Gemini',
    mentions: 7,
    visibility: 65,
    trend: 'down'
  },
  {
    id: 4,
    prompt: 'Medical specialists in Nagpur area',
    engine: 'ChatGPT',
    mentions: 6,
    visibility: 72,
    trend: 'up'
  },
];

export default function OverviewPage() {
  const [timePeriod, setTimePeriod] = useState('7');
  const [aiEngine, setAiEngine] = useState('all');

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Track your AI search visibility performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timePeriod === '1' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimePeriod('1')}
          >
            1D
          </Button>
          <Button
            variant={timePeriod === '7' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimePeriod('7')}
          >
            7D
          </Button>
          <Button
            variant={timePeriod === '30' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimePeriod('30')}
          >
            30D
          </Button>
        </div>
      </div>

      <Tabs value={aiEngine} onValueChange={setAiEngine} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Engines</TabsTrigger>
          <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
          <TabsTrigger value="perplexity">Perplexity</TabsTrigger>
          <TabsTrigger value="gemini">Gemini</TabsTrigger>
          <TabsTrigger value="claude">Claude</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prompts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">364</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+12%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Visibility
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+5%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Mentions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+18%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Ranking
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">
              Prompts in top 3 positions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visibility Trend</CardTitle>
            <CardDescription>Your AI visibility score over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visibilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="visibility"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prompts by AI Engine</CardTitle>
            <CardDescription>Distribution across different AI platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiEngineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="engine"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar
                  dataKey="prompts"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Prompts</CardTitle>
          <CardDescription>Your highest visibility prompts across all AI engines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-medium">{prompt.prompt}</span>
                    <Badge variant="secondary" className="text-xs">
                      {prompt.engine}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{prompt.mentions} mentions</span>
                    <span>"</span>
                    <span>{prompt.visibility}% visibility</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prompt.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
