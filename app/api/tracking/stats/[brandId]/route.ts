import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBrandTrackingStats } from '@/lib/ai/tracking-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const supabase = await createClient();
    const { brandId } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get days parameter from query string
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    // Get tracking stats
    const stats = await getBrandTrackingStats(brandId, days);

    return NextResponse.json({
      success: true,
      brandId,
      days,
      stats,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
