import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, TrendingUp, Target, BarChart3 } from 'lucide-react';
import type { Brand } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user's brands
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false }) as { data: Brand[] | null };

  const hasBrands = brands && brands.length > 0;

  if (!hasBrands) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <Target className="mx-auto h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Welcome to RankMeUpon.ai
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Get started by creating your first brand to track its visibility
            across AI search engines.
          </p>
          <Button size="lg" asChild>
            <Link href="/onboarding">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Brand
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your AI search visibility across all brands
          </p>
        </div>
        <Button asChild>
          <Link href="/onboarding">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {brands?.map((brand) => (
          <Card key={brand.id}>
            <CardHeader>
              <CardTitle>{brand.name}</CardTitle>
              <CardDescription>
                {brand.entity_type} • {brand.industry || 'Uncategorized'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {brand.website_url || 'No website'}
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/brands/${brand.id}`}>View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Brands
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Actively tracking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Visibility Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              No data yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Prompts
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Across all brands
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
