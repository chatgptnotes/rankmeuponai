'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Play, Pause } from 'lucide-react';

interface Prompt {
  id: string;
  text: string;
  engines: string[];
  mentions: number;
  visibility: number;
  status: 'active' | 'paused';
  lastChecked: string;
}

const mockPrompts: Prompt[] = [
  {
    id: '1',
    text: 'Best hospitals in Nagpur for cardiac care',
    engines: ['ChatGPT', 'Perplexity'],
    mentions: 12,
    visibility: 85,
    status: 'active',
    lastChecked: '2 hours ago'
  },
  {
    id: '2',
    text: 'Top rated doctors in Nagpur',
    engines: ['ChatGPT', 'Gemini', 'Claude'],
    mentions: 9,
    visibility: 78,
    status: 'active',
    lastChecked: '4 hours ago'
  },
  {
    id: '3',
    text: 'Healthcare services with advanced technology',
    engines: ['Perplexity', 'Gemini'],
    mentions: 7,
    visibility: 65,
    status: 'active',
    lastChecked: '6 hours ago'
  },
  {
    id: '4',
    text: 'Medical specialists in Nagpur area',
    engines: ['ChatGPT'],
    mentions: 6,
    visibility: 72,
    status: 'paused',
    lastChecked: '1 day ago'
  },
  {
    id: '5',
    text: 'Best cardiology centers in central India',
    engines: ['ChatGPT', 'Perplexity', 'Gemini', 'Claude'],
    mentions: 15,
    visibility: 92,
    status: 'active',
    lastChecked: '1 hour ago'
  },
];

const getEngineColor = (engine: string) => {
  const colors: Record<string, string> = {
    'ChatGPT': 'bg-purple-500/10 text-purple-500',
    'Perplexity': 'bg-cyan-500/10 text-cyan-500',
    'Gemini': 'bg-purple-500/10 text-purple-500',
    'Claude': 'bg-orange-500/10 text-orange-500',
  };
  return colors[engine] || 'bg-gray-500/10 text-gray-500';
};

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [engineFilter, setEngineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [prompts, setPrompts] = useState<Prompt[]>(mockPrompts);

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = prompt.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEngine = engineFilter === 'all' || prompt.engines.includes(engineFilter);
    const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;
    return matchesSearch && matchesEngine && matchesStatus;
  });

  const togglePromptStatus = (promptId: string) => {
    setPrompts(prompts.map(p =>
      p.id === promptId
        ? { ...p, status: p.status === 'active' ? 'paused' : 'active' }
        : p
    ));
  };

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            Manage and track your AI search prompts
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={engineFilter} onValueChange={setEngineFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="AI Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engines</SelectItem>
                  <SelectItem value="ChatGPT">ChatGPT</SelectItem>
                  <SelectItem value="Perplexity">Perplexity</SelectItem>
                  <SelectItem value="Gemini">Gemini</SelectItem>
                  <SelectItem value="Claude">Claude</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prompt</TableHead>
                  <TableHead>AI Engines</TableHead>
                  <TableHead className="text-center">Mentions</TableHead>
                  <TableHead className="text-center">Visibility</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No prompts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="max-w-md">
                        <div className="font-medium">{prompt.text}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {prompt.engines.map((engine) => (
                            <Badge
                              key={engine}
                              variant="secondary"
                              className={getEngineColor(engine)}
                            >
                              {engine}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{prompt.mentions}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-semibold">{prompt.visibility}</span>
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePromptStatus(prompt.id)}
                          className="h-8 px-2"
                        >
                          {prompt.status === 'active' ? (
                            <>
                              <Play className="mr-1 h-3 w-3 fill-green-500 text-green-500" />
                              <span className="text-green-500">Active</span>
                            </>
                          ) : (
                            <>
                              <Pause className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Paused</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {prompt.lastChecked}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Showing {filteredPrompts.length} of {prompts.length} prompts
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
