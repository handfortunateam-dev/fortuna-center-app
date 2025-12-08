/**
 * Adds IDs to heading elements (h1-h4) in HTML content
 * This allows table of contents links to work properly
 * Works on both server and client side
 */
export function addHeadingIds(htmlContent: string): string {
  let result = htmlContent;
  let headingCount = 0;

  // Pattern to match h1-h4 tags
  const headingPattern = /<(h[1-4])([^>]*)>(.*?)<\/\1>/gi;

  result = result.replace(headingPattern, (match, tagName, attributes, content) => {
    // Check if the heading already has an id
    if (attributes.includes("id=")) {
      return match; // Return unchanged if it already has an id
    }

    // Create a slug from the heading text (remove HTML tags first)
    const plainText = content
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single

    const id = plainText || `heading-${headingCount}`;
    headingCount++;

    return `<${tagName}${attributes} id="${id}">${content}</${tagName}>`;
  });

  return result;
}
