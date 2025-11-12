/**
 * Sanitize HTML content to plain text
 * Safely strips all HTML tags and entities
 */
export function stripHtml(html: string): string {
  if (!html) return ""

  // Remove all HTML tags by replacing them iteratively until none remain
  let text = html
  let previousText = ""
  
  // Keep stripping until no more tags are found (handles nested tags)
  while (text !== previousText) {
    previousText = text
    text = text.replace(/<[^>]*>/g, "")
  }

  // Decode HTML entities in proper order to avoid double-escaping
  // First decode numeric entities
  text = text.replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(dec))
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
  
  // Then decode named entities (amp must be last to avoid double-decoding)
  text = text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&") // Must be last

  // Remove extra whitespace
  text = text.replace(/\s+/g, " ").trim()

  return text
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

/**
 * Extract plain text preview from HTML content
 */
export function getTextPreview(html: string, maxLength: number = 200): string {
  const plainText = stripHtml(html)
  return truncateText(plainText, maxLength)
}
