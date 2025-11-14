import type { ValidationResult, BrandFormData, LocationFormData } from '@/types/onboarding';

/**
 * Validates a URL format
 */
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL to include https:// if missing
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

/**
 * Validates brand form data (Step 1)
 */
export function validateBrandData(data: Partial<BrandFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Brand name validation
  if (!data.brandName || data.brandName.trim().length === 0) {
    errors.brandName = 'Brand name is required';
  } else if (data.brandName.trim().length < 2) {
    errors.brandName = 'Brand name must be at least 2 characters';
  } else if (data.brandName.trim().length > 100) {
    errors.brandName = 'Brand name must be less than 100 characters';
  }

  // Website URL validation
  if (!data.websiteUrl || data.websiteUrl.trim().length === 0) {
    errors.websiteUrl = 'Website URL is required';
  } else {
    const normalizedUrl = normalizeUrl(data.websiteUrl);
    if (!validateUrl(normalizedUrl)) {
      errors.websiteUrl = 'Please enter a valid website URL';
    }
  }

  // Brand variations validation
  if (data.variations) {
    const validVariations = data.variations.filter(v => v.trim().length > 0);
    if (validVariations.length > 3) {
      errors.variations = 'Maximum 3 brand variations allowed';
    }

    // Check for duplicates
    const uniqueVariations = new Set(validVariations.map(v => v.toLowerCase().trim()));
    if (uniqueVariations.size !== validVariations.length) {
      errors.variations = 'Brand variations must be unique';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates location form data (Step 2)
 */
export function validateLocationData(data: Partial<LocationFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  // Location type validation
  if (!data.locationType) {
    errors.locationType = 'Location type is required';
  }

  // Location validation (only required for location-specific)
  if (data.locationType === 'location') {
    if (!data.location || data.location.trim().length === 0) {
      errors.location = 'Location is required when selecting location-specific';
    } else if (data.location.trim().length < 2) {
      errors.location = 'Location must be at least 2 characters';
    } else if (data.location.trim().length > 100) {
      errors.location = 'Location must be less than 100 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates the entire onboarding data
 */
export function validateOnboardingComplete(
  brandData: Partial<BrandFormData>,
  locationData: Partial<LocationFormData>
): ValidationResult {
  const brandValidation = validateBrandData(brandData);
  const locationValidation = validateLocationData(locationData);

  return {
    isValid: brandValidation.isValid && locationValidation.isValid,
    errors: {
      ...brandValidation.errors,
      ...locationValidation.errors,
    },
  };
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Validates brand name format (no special characters except spaces, hyphens, dots)
 */
export function isValidBrandName(name: string): boolean {
  const pattern = /^[a-zA-Z0-9\s.\-'&]+$/;
  return pattern.test(name);
}

/**
 * Sanitizes brand name
 */
export function sanitizeBrandName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitizes location
 */
export function sanitizeLocation(location: string): string {
  return location.trim().replace(/\s+/g, ' ');
}
