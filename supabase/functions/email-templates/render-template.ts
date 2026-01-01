/**
 * Template rendering utility for email templates
 * Replaces {{variable}} placeholders with actual values
 */

export function renderTemplate(template: string, variables: Record<string, string | number | boolean | null | undefined>): string {
  let rendered = template;

  // Replace simple variables {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const stringValue = value !== null && value !== undefined ? String(value) : '';
    rendered = rendered.replace(regex, stringValue);
  });

  // Handle conditional blocks {{#if variable}}...{{/if}}
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  rendered = rendered.replace(ifRegex, (match, variable, content) => {
    const value = variables[variable];
    if (value && value !== 'false' && value !== 'null' && value !== 'undefined') {
      return content;
    }
    return '';
  });

  return rendered;
}

