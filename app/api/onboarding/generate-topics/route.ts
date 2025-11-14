import { NextRequest, NextResponse } from 'next/server';
import { generateTopicClusters } from '@/lib/onboarding/generate-topics';
import { createClient as createServerClient } from '@/lib/supabase/server';
import type { TopicGenerationRequest } from '@/types/onboarding';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brandName, industry, location, websiteUrl } = body as TopicGenerationRequest;

    if (!brandName || typeof brandName !== 'string') {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    if (!industry || typeof industry !== 'string') {
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 });
    }

    // Generate topic clusters
    const result = await generateTopicClusters({
      brandName,
      industry,
      location,
      websiteUrl,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Topic generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    );
  }
}
