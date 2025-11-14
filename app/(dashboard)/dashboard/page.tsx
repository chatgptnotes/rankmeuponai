import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Target, ArrowRight } from 'lucide-react';
import type { Brand, Profile } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single() as { data: Profile | null };

  // Fetch user's brands
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', user?.id || '')
    .order('created_at', { ascending: false }) as { data: Brand[] | null };

  const hasBrands = brands && brands.length > 0;

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'there';

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
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          Hey {userName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Here&apos;s how your brands are performing
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Brands</h2>
        <Button asChild>
          <Link href="/onboarding/step-1">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {brands?.map((brand) => (
          <Card key={brand.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                {brand.logo_url ? (
                  <Image
                    src={brand.logo_url}
                    alt={brand.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="mb-1">{brand.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {brand.website_url}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Total Prompts</div>
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">AI Visibility</div>
                  <div className="flex items-baseline gap-1">
                    <div className="text-2xl font-bold">-</div>
                    <div className="text-xs text-muted-foreground">%</div>
                  </div>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full group">
                <Link href={`/brands/${brand.id}`}>
                  View details
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
