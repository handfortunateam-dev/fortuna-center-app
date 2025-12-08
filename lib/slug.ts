/**
 * Convert text to slug format
 * Example: "Personal Blog" -> "personal-blog"
 */
export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Convert slug back to readable text
 * Example: "personal-blog" -> "Personal Blog"
 */
export function slugToText(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
