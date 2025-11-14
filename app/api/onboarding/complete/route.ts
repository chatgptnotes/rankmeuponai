import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { BrandInsert, PromptInsert } from '@/types';

// Interface for onboarding data
interface OnboardingData {
  brandName: string;
  websiteUrl: string;
  variations: string[];
  locationType: 'location' | 'global';
  location: string;
  topics: Array<{
    id: string;
    name: string;
    prompts: string[];
  }>;
}

// Simple entity type detection based on keywords
function detectEntityType(brandName: string, websiteUrl: string): string {
  const name = brandName.toLowerCase();
  const url = websiteUrl.toLowerCase();

  // Person detection
  if (name.includes('dr ') || name.includes('dr.') || name.match(/\b(ceo|founder|consultant|coach)\b/)) {
    return 'person';
  }

  // Organization detection
  if (name.match(/\b(hospital|clinic|university|college|institute|foundation|ngo)\b/) ||
      url.match(/\.(org|edu)\b/)) {
    return 'organization';
  }

  // Service detection
  if (name.match(/\b(services?|consulting|solutions|agency)\b/)) {
    return 'service';
  }

  // Product detection
  if (name.match(/\b(app|software|platform|tool|product)\b/) ||
      url.match(/\.(app|io)\b/)) {
    return 'product';
  }

  // Default to brand
  return 'brand';
}

// Simple industry classification
function detectIndustry(brandName: string, websiteUrl: string): string {
  const text = `${brandName} ${websiteUrl}`.toLowerCase();

  if (text.match(/\b(hospital|clinic|medical|health|doctor|patient|pharmacy)\b/)) {
    return 'Healthcare';
  }
  if (text.match(/\b(tech|software|saas|platform|app|digital)\b/)) {
    return 'Technology';
  }
  if (text.match(/\b(shop|store|ecommerce|retail|buy|sell)\b/)) {
    return 'E-commerce';
  }
  if (text.match(/\b(finance|bank|insurance|investment|trading)\b/)) {
    return 'Finance';
  }
  if (text.match(/\b(education|school|university|learning|course)\b/)) {
    return 'Education';
  }
  if (text.match(/\b(food|restaurant|cafe|dining|catering)\b/)) {
    return 'Food & Beverage';
  }

  return 'Other';
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: OnboardingData = await request.json();
    const { brandName, websiteUrl, variations, locationType, location, topics } = body;

    // Validate required fields
    if (!brandName || !websiteUrl) {
      return NextResponse.json(
        { error: 'Brand name and website URL are required' },
        { status: 400 }
      );
    }

    // Detect entity type and industry
    const entityType = detectEntityType(brandName, websiteUrl);
    const industry = detectIndustry(brandName, websiteUrl);

    // Create brand
    const brandData: BrandInsert = {
      user_id: user.id,
      name: brandName,
      website_url: websiteUrl,
      entity_type: entityType,
      industry: industry,
    };

    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .insert(brandData)
      .select()
      .single();

    if (brandError || !brand) {
      console.error('Brand creation error:', brandError);
      return NextResponse.json(
        { error: 'Failed to create brand' },
        { status: 500 }
      );
    }

    // Create prompts from selected topics
    if (topics && topics.length > 0) {
      const promptsToInsert: PromptInsert[] = topics.flatMap(topic =>
        topic.prompts.map(promptText => ({
          brand_id: brand.id,
          prompt_text: promptText,
          category: topic.name,
          is_active: true,
        }))
      );

      // @ts-expect-error - Supabase type inference issue
      const { error: promptsError } = await supabase
        .from('prompts')
        .insert(promptsToInsert);

      if (promptsError) {
        console.error('Prompts creation error:', promptsError);
        // Don't fail the whole request if prompts fail
      }
    }

    return NextResponse.json({
      success: true,
      brandId: brand.id,
      brand: {
        id: brand.id,
        name: brand.name,
        entityType: brand.entity_type,
        industry: brand.industry,
      },
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
