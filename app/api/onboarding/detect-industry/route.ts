import { NextRequest, NextResponse } from 'next/server';
import { detectIndustry, suggestBrandVariations } from '@/lib/onboarding/ai-detection';
import { createClient as createServerClient } from '@/lib/supabase/server';

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
    const { brandName, websiteUrl } = body;

    if (!brandName || typeof brandName !== 'string') {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    // Detect industry
    const industryResult = await detectIndustry(brandName, websiteUrl);

    // Suggest brand variations
    const variations = await suggestBrandVariations(
      brandName,
      industryResult.industry
    );

    return NextResponse.json({
      industry: industryResult,
      suggestedVariations: variations,
    });
  } catch (error) {
    console.error('Industry detection API error:', error);
    return NextResponse.json(
      { error: 'Failed to detect industry' },
      { status: 500 }
    );
  }
}
