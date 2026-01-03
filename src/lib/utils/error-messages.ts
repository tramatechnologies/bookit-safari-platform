/**
 * Error message utility functions
 * Provides user-friendly error messages for common errors
 */

export interface ErrorContext {
  action?: string;
  resource?: string;
  code?: string | number;
  status?: number;
}

/**
 * Formats authentication errors into user-friendly messages
 */
export function formatAuthError(error: any, context: ErrorContext = {}): { title: string; description: string; action?: string } {
  const errorMessage = (error?.message || '').toLowerCase();
  const errorCode = error?.status || error?.code || context.status;

  // Account already exists (signup)
  if (
    error?.isExistingUser ||
    errorMessage.includes('already registered') ||
    errorMessage.includes('user already exists') ||
    errorMessage.includes('email address is already in use') ||
    errorMessage.includes('already exists') ||
    errorCode === 422
  ) {
    return {
      title: 'Account Already Exists',
      description: 'An account with this email already exists. Please sign in instead or reset your password if you\'ve forgotten it.',
      action: 'signin'
    };
  }

  // Account not found (signin)
  if (
    error?.isDeletedAccount ||
    errorMessage.includes('user not found') ||
    errorMessage.includes('user does not exist') ||
    errorMessage.includes('account not found') ||
    errorMessage.includes('user has been deleted') ||
    errorMessage.includes('account may have been deleted') ||
    errorCode === 404
  ) {
    return {
      title: 'Account Not Found',
      description: 'No account found with this email address. The account may have been deleted. Please sign up for a new account if you want to continue.',
      action: 'signup'
    };
  }

  // Invalid credentials
  if (
    errorMessage.includes('invalid login credentials') ||
    errorMessage.includes('invalid password') ||
    errorMessage.includes('wrong password') ||
    errorMessage.includes('incorrect password') ||
    errorCode === 400
  ) {
    return {
      title: 'Invalid Credentials',
      description: 'The email or password you entered is incorrect. Please try again or reset your password if you\'ve forgotten it.',
      action: 'reset'
    };
  }

  // Email not verified
  if (
    errorMessage.includes('email not confirmed') ||
    errorMessage.includes('email not verified') ||
    errorMessage.includes('verify your email')
  ) {
    return {
      title: 'Email Not Verified',
      description: 'Please verify your email address before signing in. Check your inbox for the verification link, or request a new one.',
      action: 'resend'
    };
  }

  // Weak password
  if (errorMessage.includes('password') && (errorMessage.includes('weak') || errorMessage.includes('too short'))) {
    return {
      title: 'Weak Password',
      description: 'Password is too weak. Please use a stronger password with at least 8 characters, including letters and numbers.',
    };
  }

  // Rate limiting
  if (
    errorMessage.includes('too many requests') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many attempts') ||
    errorCode === 429
  ) {
    return {
      title: 'Too Many Attempts',
      description: 'Too many login attempts. Please wait a few minutes before trying again to protect your account.',
    };
  }

  // Account disabled
  if (
    errorMessage.includes('user is disabled') ||
    errorMessage.includes('account disabled') ||
    errorMessage.includes('account suspended') ||
    errorMessage.includes('account banned')
  ) {
    return {
      title: 'Account Disabled',
      description: 'Your account has been disabled. Please contact support at support@bookitsafari.com for assistance.',
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to our servers. Please check your internet connection and try again.',
    };
  }

  // Invalid email format
  if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
    return {
      title: 'Invalid Email',
      description: 'Please enter a valid email address (e.g., yourname@example.com).',
    };
  }

  // Default
  return {
    title: 'Authentication Error',
    description: error?.message || 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Formats email verification errors
 */
export function formatVerificationError(error: any): { title: string; description: string; type: 'error' | 'expired' } {
  const errorMessage = (error?.message || '').toLowerCase();

  if (
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('token') ||
    errorMessage.includes('link')
  ) {
    return {
      title: 'Link Expired or Invalid',
      description: 'This verification link has expired or is invalid. Please request a new verification email.',
      type: 'expired'
    };
  }

  if (errorMessage.includes('server_error') || errorMessage.includes('unexpected_failure')) {
    return {
      title: 'Verification Error',
      description: 'We encountered an issue while verifying your email. This may be a temporary problem. Please try requesting a new verification email.',
      type: 'error'
    };
  }

  return {
    title: 'Verification Failed',
    description: error?.message || 'Failed to verify your email. Please try again or request a new verification link.',
    type: 'error'
  };
}

/**
 * Formats payment errors with actionable messages
 */
export function formatPaymentError(error: any): { title: string; description: string } {
  const errorMessage = (error?.message || '').toLowerCase();
  const fullMessage = error?.message || '';

  // Payment method not activated / unavailable
  if (
    errorMessage.includes('unavailable') ||
    errorMessage.includes('not available') ||
    errorMessage.includes('not activated') ||
    errorMessage.includes('no available') ||
    errorMessage.includes('payment method') ||
    errorMessage.includes('activate')
  ) {
    return {
      title: 'Payment Method Not Available',
      description: 'This payment method is not activated on your account. Please activate it in your mobile money app or try a different payment method.',
    };
  }

  // Invalid phone number
  if (
    (errorMessage.includes('invalid') && errorMessage.includes('phone')) ||
    errorMessage.includes('invalid order reference') ||
    errorMessage.includes('invalid phone number')
  ) {
    return {
      title: 'Invalid Phone Number',
      description: 'Please enter a valid Tanzanian mobile number with country code. Examples: +255712345678, 255712345678, or 0712345678.',
    };
  }

  // Insufficient funds
  if (
    errorMessage.includes('insufficient') ||
    errorMessage.includes('balance') ||
    errorMessage.includes('not enough')
  ) {
    return {
      title: 'Insufficient Funds',
      description: 'Your mobile money account does not have enough balance. Please add money to your account and try again.',
    };
  }

  // Network/connection errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('fetch') ||
    error?.status === 0
  ) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to the payment service. Please check your internet connection and try again.',
    };
  }

  // Authentication/credentials errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    error?.status === 401 ||
    error?.status === 403
  ) {
    return {
      title: 'Payment Service Configuration Error',
      description: 'There\'s an issue with the payment service configuration. Please contact support at support@bookitsafari.com.',
    };
  }

  // User cancelled payment
  if (
    errorMessage.includes('cancelled') ||
    errorMessage.includes('canceled') ||
    errorMessage.includes('user cancelled')
  ) {
    return {
      title: 'Payment Cancelled',
      description: 'You cancelled the payment. No money was charged. You can try again whenever you\'re ready.',
    };
  }

  // Rate limiting
  if (
    errorMessage.includes('too many') ||
    errorMessage.includes('rate limit') ||
    error?.status === 429
  ) {
    return {
      title: 'Too Many Attempts',
      description: 'You\'ve made too many payment attempts. Please wait a few minutes and try again.',
    };
  }

  // Wrong PIN
  if (errorMessage.includes('wrong pin') || errorMessage.includes('invalid pin')) {
    return {
      title: 'Wrong PIN',
      description: 'You entered an incorrect PIN. The payment was not completed. Please try again with the correct PIN.',
    };
  }

  // Blocked/suspicious transaction
  if (
    errorMessage.includes('blocked') ||
    errorMessage.includes('suspicious') ||
    errorMessage.includes('fraud')
  ) {
    return {
      title: 'Transaction Blocked',
      description: 'This transaction was blocked by your mobile money provider. Please try a smaller amount or contact your provider.',
    };
  }

  // Server error
  if (error?.status >= 500) {
    return {
      title: 'Service Temporarily Unavailable',
      description: 'Our payment service is temporarily unavailable. Please try again in a few moments.',
    };
  }

  // Checksum/validation error
  if (errorMessage.includes('checksum') || errorMessage.includes('validation')) {
    return {
      title: 'Payment Validation Error',
      description: 'There was an issue processing your payment. Please try again or contact support.',
    };
  }

  // Generic error with the actual message if available
  return {
    title: 'Payment Error',
    description: fullMessage || 'An error occurred while processing your payment. Please try again or contact support if the problem persists.',
  };
}

/**
 * Formats booking errors
 */
export function formatBookingError(error: any): { title: string; description: string } {
  const errorMessage = (error?.message || '').toLowerCase();

  if (errorMessage.includes('seat') && (errorMessage.includes('taken') || errorMessage.includes('unavailable'))) {
    return {
      title: 'Seat Unavailable',
      description: 'One or more selected seats are no longer available. Please select different seats and try again.',
    };
  }

  if (errorMessage.includes('schedule') && (errorMessage.includes('not found') || errorMessage.includes('invalid'))) {
    return {
      title: 'Invalid Schedule',
      description: 'The selected trip schedule is no longer available. Please search for a new trip.',
    };
  }

  if (errorMessage.includes('payment') || errorMessage.includes('transaction')) {
    return {
      title: 'Booking Error',
      description: 'An error occurred while creating your booking. Your payment was not processed. Please try again.',
    };
  }

  return {
    title: 'Booking Failed',
    description: error?.message || 'Failed to create your booking. Please try again or contact support if the problem persists.',
  };
}

/**
 * Formats profile update errors
 */
export function formatProfileError(error: any): { title: string; description: string } {
  const errorMessage = (error?.message || '').toLowerCase();

  if (errorMessage.includes('email') && errorMessage.includes('already')) {
    return {
      title: 'Email Already in Use',
      description: 'This email address is already associated with another account. Please use a different email.',
    };
  }

  if (errorMessage.includes('phone') && errorMessage.includes('invalid')) {
    return {
      title: 'Invalid Phone Number',
      description: 'Please enter a valid Tanzanian mobile number. Examples: +255712345678, 255712345678, or 0712345678.',
    };
  }

  return {
    title: 'Update Failed',
    description: error?.message || 'Failed to update your profile. Please try again.',
  };
}

/**
 * Formats generic API errors
 */
export function formatApiError(error: any, context: ErrorContext = {}): { title: string; description: string } {
  const errorMessage = (error?.message || '').toLowerCase();
  const status = error?.status || context.status;

  // 404 Not Found
  if (status === 404) {
    return {
      title: 'Not Found',
      description: 'The requested resource could not be found. It may have been removed or the link may be incorrect.',
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action. Please contact support if you believe this is an error.',
    };
  }

  // 401 Unauthorized
  if (status === 401) {
    return {
      title: 'Authentication Required',
      description: 'Please sign in to continue.',
    };
  }

  // 500 Server Error
  if (status === 500 || status === 502 || status === 503) {
    return {
      title: 'Server Error',
      description: 'Our servers are experiencing issues. Please try again in a few moments. If the problem persists, contact support.',
    };
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    !navigator.onLine
  ) {
    return {
      title: 'Connection Error',
      description: 'Unable to connect to our servers. Please check your internet connection and try again.',
    };
  }

  // Default
  return {
    title: 'Error',
    description: error?.message || 'An unexpected error occurred. Please try again.',
  };
}

