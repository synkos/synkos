/**
 * Converts a string to kebab-case.
 * @example slugify("My App Name") → "my-app-name"
 * @example slugify("helloWorld") → "hello-world"
 */
export function slugify(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

/**
 * Capitalizes the first letter of a string.
 * @example capitalize("hello world") → "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to PascalCase.
 * @example toPascalCase("my-app-name") → "MyAppName"
 * @example toPascalCase("hello world") → "HelloWorld"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/**
 * Converts a string to camelCase.
 * @example toCamelCase("my-app-name") → "myAppName"
 * @example toCamelCase("Hello World") → "helloWorld"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Truncates a string to a maximum length, appending an ellipsis if needed.
 * @example truncate("Hello World", 8) → "Hello..."
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Checks if a string is empty or contains only whitespace.
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}
