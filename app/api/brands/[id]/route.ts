import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Brand } from '@/types';

/**
 * GET /api/brands/[id]
 * Get a specific brand with optional stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch the brand itself
    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single();

    if (error || !brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    if (includeStats) {
      // Fetch brand with stats using the get_brand_stats function
      // Using any cast for RPC since custom functions aren't in generated types
      const { data: statsResult, error: statsError } = await (supabase.rpc as any)(
        'get_brand_stats',
        { p_brand_id: params.id }
      );

      if (statsError) {
        console.error('Error fetching brand stats:', statsError);
      }

      return NextResponse.json({
        brand,
        stats: statsResult?.[0] || null,
      });
    } else {
      return NextResponse.json({ brand });
    }
  } catch (error) {
    console.error('Brand API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/brands/[id]
 * Update a brand
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.website_url !== undefined) updateData.website_url = body.website_url;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.entity_type !== undefined) updateData.entity_type = body.entity_type;
    if (body.location_type !== undefined) updateData.location_type = body.location_type;
    if (body.location_value !== undefined) updateData.location_value = body.location_value;
    if (body.variations !== undefined) updateData.variations = body.variations;
    if (body.logo_url !== undefined) updateData.logo_url = body.logo_url;
    if (body.onboarding_completed !== undefined)
      updateData.onboarding_completed = body.onboarding_completed;

    // Update brand - using any cast because updateData contains fields not in generated types yet
    const brandUpdate = supabase.from('brands') as any;
    const { data: brand, error } = await brandUpdate
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !brand) {
      console.error('Error updating brand:', error);
      return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
    }

    return NextResponse.json({ brand });
  } catch (error) {
    console.error('Brand API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/brands/[id]
 * Soft delete a brand
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the soft_delete_brand function
    // Using any cast for RPC since custom functions aren't in generated types
    const { data: result, error } = await (supabase.rpc as any)('soft_delete_brand', {
      p_brand_id: params.id,
    });

    if (error || !result) {
      console.error('Error deleting brand:', error);
      return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Brand API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
