/**
 * Security utility functions for input sanitization
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize user input for display
 */
export function sanitizeInput(input: string): string {
  return escapeHtml(input.trim());
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
}

