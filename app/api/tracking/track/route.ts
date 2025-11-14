import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackBrandPrompts } from '@/lib/ai/tracking-service';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { brandId, promptIds, aiEngines } = body;

    // Validate required fields
    if (!brandId) {
      return NextResponse.json(
        { error: 'brandId is required' },
        { status: 400 }
      );
    }

    // Verify user owns the brand
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single();

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found or unauthorized' },
        { status: 404 }
      );
    }

    // Start tracking
    const results = await trackBrandPrompts(
      brandId,
      promptIds,
      aiEngines || ['chatgpt']
    );

    // Calculate summary stats
    const completed = results.filter((r) => r.status === 'completed').length;
    const failed = results.filter((r) => r.status === 'failed').length;
    const mentioned = results.filter((r) => r.brandMentioned).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        completed,
        failed,
        mentioned,
        visibilityRate: completed > 0 ? (mentioned / completed) * 100 : 0,
      },
    });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
