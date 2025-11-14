/**
 * Authentication error handling utilities
 */

export interface AuthError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Parse Supabase auth errors into user-friendly messages
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // Supabase error object
  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; status?: number; code?: string };

    // Map common Supabase error messages to user-friendly ones
    const message = err.message?.toLowerCase() || '';

    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }

    if (message.includes('email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }

    if (message.includes('user already registered')) {
      return 'An account with this email already exists.';
    }

    if (message.includes('password should be at least')) {
      return 'Password must be at least 8 characters long.';
    }

    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }

    if (message.includes('rate limit')) {
      return 'Too many attempts. Please try again later.';
    }

    if (message.includes('network')) {
      return 'Network error. Please check your connection.';
    }

    if (message.includes('token')) {
      return 'Your session has expired. Please log in again.';
    }

    // Return the original message if we don't have a mapping
    if (err.message) {
      return err.message;
    }
  }

  // Error as string
  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Auth error codes enum
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_ALREADY_EXISTS = 'user_already_exists',
  WEAK_PASSWORD = 'weak_password',
  INVALID_EMAIL = 'invalid_email',
  RATE_LIMIT = 'rate_limit',
  NETWORK_ERROR = 'network_error',
  SESSION_EXPIRED = 'session_expired',
  UNKNOWN = 'unknown',
}

/**
 * Get error code from error message
 */
export function getAuthErrorCode(error: unknown): AuthErrorCode {
  const message = getAuthErrorMessage(error).toLowerCase();

  if (message.includes('invalid') && message.includes('credentials')) {
    return AuthErrorCode.INVALID_CREDENTIALS;
  }
  if (message.includes('email') && message.includes('confirm')) {
    return AuthErrorCode.EMAIL_NOT_CONFIRMED;
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return AuthErrorCode.USER_ALREADY_EXISTS;
  }
  if (message.includes('password')) {
    return AuthErrorCode.WEAK_PASSWORD;
  }
  if (message.includes('invalid email')) {
    return AuthErrorCode.INVALID_EMAIL;
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return AuthErrorCode.RATE_LIMIT;
  }
  if (message.includes('network')) {
    return AuthErrorCode.NETWORK_ERROR;
  }
  if (message.includes('session') || message.includes('token')) {
    return AuthErrorCode.SESSION_EXPIRED;
  }

  return AuthErrorCode.UNKNOWN;
}

/**
 * Format auth error for display
 */
export function formatAuthError(error: unknown): AuthError {
  return {
    message: getAuthErrorMessage(error),
    code: getAuthErrorCode(error),
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get password strength
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 12.5;
  if (/[^a-zA-Z0-9]/.test(password)) score += 12.5;

  let label = 'Weak';
  let color = 'red';

  if (score >= 75) {
    label = 'Strong';
    color = 'green';
  } else if (score >= 50) {
    label = 'Good';
    color = 'yellow';
  } else if (score >= 25) {
    label = 'Fair';
    color = 'orange';
  }

  return { score, label, color };
}
