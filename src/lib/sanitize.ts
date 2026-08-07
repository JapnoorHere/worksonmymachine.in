/**
 * Input hygiene for community submissions.
 *
 * The contribution system's one hard rule: a stranger's text is only ever
 * *content*, never code. It fills a template string, it is rendered as a React
 * text node (which escapes by construction), and it never touches
 * dangerouslySetInnerHTML, eval, a style attribute, or a URL. This module is
 * belt-and-braces on top of that — it strips anything that looks like markup or
 * a scheme before the value is ever stored, so even a future contributor who
 * renders these somewhere careless can't turn one into an injection.
 */

/** Characters that let text escape into markup or a JS context. */
const DANGEROUS = /[<>]/g;

/** C0 and C1 control characters. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;

/**
 * Zero-width joiners and bidi overrides. Invisible in the preview, so they'd
 * let someone smuggle a payload past a human reviewer, or reverse the visual
 * order of an approved line after the fact.
 */
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;

const SCHEMES = /\b(?:javascript|data|vbscript|file)\s*:/gi;

export const LIMITS = {
  text: { min: 3, max: 180 },
  author: { min: 1, max: 32 },
} as const;

/** Normalizes and de-fangs a free-text field. Returns plain, storable text. */
export function sanitizeText(raw: unknown, max: number = LIMITS.text.max): string {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFKC")
    .replace(CONTROL_CHARS, "")
    .replace(INVISIBLE, "")
    .replace(DANGEROUS, "")
    .replace(SCHEMES, "")
    // Collapse whitespace runs, including the newline spam that breaks layout.
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Handles are stricter: no spaces, no punctuation soup, no markup at all. */
export function sanitizeAuthor(raw: unknown): string {
  if (typeof raw !== "string") return "anonymous";
  const cleaned = raw
    .normalize("NFKC")
    .replace(CONTROL_CHARS, "")
    .replace(INVISIBLE, "")
    .replace(/^@+/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, LIMITS.author.max);

  return cleaned || "anonymous";
}

export interface ValidationResult<T> {
  ok: boolean;
  errors: string[];
  value: T;
}

export function validateSubmission(
  input: { type?: unknown; text?: unknown; trigger?: unknown; author?: unknown },
  allowedTypes: readonly string[],
  allowedTriggers: readonly string[],
): ValidationResult<{ type: string; text: string; trigger: string; author: string }> {
  const errors: string[] = [];

  const text = sanitizeText(input.text);
  const author = sanitizeAuthor(input.author);
  const type = typeof input.type === "string" ? input.type : "";
  const trigger = typeof input.trigger === "string" ? input.trigger : "";

  if (text.length < LIMITS.text.min) {
    errors.push(`Text must be at least ${LIMITS.text.min} characters.`);
  }
  // Allow-list, not deny-list: an unknown type can never reach the content pool.
  if (!allowedTypes.includes(type)) errors.push("Pick a valid type.");
  if (!allowedTriggers.includes(trigger)) errors.push("Pick a valid trigger.");

  return { ok: errors.length === 0, errors, value: { type, text, trigger, author } };
}
