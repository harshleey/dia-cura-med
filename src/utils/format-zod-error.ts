import { ZodError } from "zod";
// import { flattenZodError } from "zod-error";

/**
 * Formats Zod validation errors into a user-friendly object
 * @param err ZodError instance
 * @returns { field: message } object
 */
export function formatZodError(err: ZodError) {
  const flattened = err.flatten();
  const fieldErrors = flattened.fieldErrors as Record<string, string[]>;

  // Flatten to { field: message } for easy usage
  const formatted: Record<string, string> = {};

  Object.keys(fieldErrors).forEach((field) => {
    if (fieldErrors[field]?.length) {
      formatted[field] = fieldErrors[field][0]; // take first message
    }
  });

  return formatted;
}
