import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Brand } from '@/types';

/**
 * GET /api/brands
 * List all brands for the authenticated user with optional stats
 */
export async function GET(request: NextRequest) {
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

    if (includeStats) {
      // Fetch brands with stats from brand_overview view
      const { data: brands, error } = await supabase
        .from('brand_overview')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brands with stats:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
      }

      return NextResponse.json({ brands });
    } else {
      // Fetch brands without stats (faster)
      const { data: brands, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
      }

      return NextResponse.json({ brands });
    }
  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/brands
 * Create a new brand for the authenticated user
 */
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    // Create brand - using any cast because insert data contains fields not in generated types yet
    const brandInsert = supabase.from('brands') as any;
    const { data: brand, error } = await brandInsert
      .insert([
        {
          user_id: user.id,
          name: body.name,
          website_url: body.website_url,
          description: body.description,
          industry: body.industry,
          entity_type: body.entity_type || 'organization',
          location_type: body.location_type,
          location_value: body.location_value,
          variations: body.variations || [],
          logo_url: body.logo_url,
          onboarding_completed: body.onboarding_completed ?? false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating brand:', error);
      return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
    }

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
