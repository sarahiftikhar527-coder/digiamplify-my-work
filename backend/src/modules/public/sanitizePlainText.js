/**
 * Strip HTML and normalize whitespace for plain-text email bodies.
 */
export function sanitizePlainText(value) {
  const input = String(value ?? "");

  const withoutTags = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return withoutTags.replace(/\s+/g, " ").trim();
}
