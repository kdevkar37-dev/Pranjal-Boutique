/**
 * Image URL Helper Utility
 * Constructs complete image URLs from database paths for browser display
 *
 * Handles all database formats:
 * 1. External URLs: "https://images.unsplash.com/..."
 * 2. Complete path: "uploads/images/{filename}"
 * 3. Just filename: "{uuid}.jpg" (legacy)
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/$/, "");

const API_HOST = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

/**
 * Convert image path from database to complete displayable URL
 * @param {string} imageUrl - Raw image path from database
 * @param {boolean} bust - Add cache-busting parameter
 * @returns {string} Complete URL ready for browser display
 *
 * @example
 * getImageUrl("uploads/images/uuid.jpg")
 * // → "http://localhost:8080/uploads/images/uuid.jpg"
 *
 * @example
 * getImageUrl("uuid.jpg")
 * // → "http://localhost:8080/uploads/images/uuid.jpg"
 */
export const getImageUrl = (imageUrl, bust = false) => {
  if (!imageUrl) return "";

  // Case 1: External URL - return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Case 2: Complete path - just prepend API_URL
  if (imageUrl.includes("uploads/images")) {
    const normalizedPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${API_HOST}${normalizedPath}`;
    return bust ? `${fullUrl}?t=${Date.now()}` : fullUrl;
  }

  // Case 3: Just filename (legacy) - add complete path
  // This handles old uploads stored as just "uuid.jpg"
  const normalizedFilename = imageUrl.startsWith("/")
    ? imageUrl.substring(1)
    : imageUrl;
  const fullUrl = `${API_HOST}/uploads/images/${normalizedFilename}`;
  return bust ? `${fullUrl}?t=${Date.now()}` : fullUrl;
};

export default getImageUrl;
