/**
 * Email template loader and renderer
 * Loads HTML templates and renders them with variables
 */

import { renderTemplate } from './render-template.ts';

// Template cache
const templateCache: Map<string, string> = new Map();

async function loadTemplate(templateName: string): Promise<string> {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  try {
    const templatePath = `./email-templates/${templateName}.html`;
    const template = await Deno.readTextFile(templatePath);
    templateCache.set(templateName, template);
    return template;
  } catch (error) {
    console.error(`Failed to load template ${templateName}:`, error);
    throw new Error(`Template ${templateName} not found`);
  }
}

export async function renderEmailTemplate(
  templateName: string,
  variables: Record<string, string | number | boolean | null | undefined>
): Promise<string> {
  const template = await loadTemplate(templateName);
  return renderTemplate(template, variables);
}

// Available templates
export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: 'booking-confirmation',
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  BOOKING_CANCELLATION: 'booking-cancellation',
  TRIP_REMINDER: 'trip-reminder',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  MAGIC_LINK: 'magic-link',
  CHANGE_EMAIL: 'change-email',
} as const;

