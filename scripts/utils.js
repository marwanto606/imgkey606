/**
 * Utility functions for sitemap generation
 */

/**
 * Get current date in ISO format for lastmod
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Escape XML special characters
 * @param {string} unsafe - String to escape
 * @returns {string} Escaped string
 */
export function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate XML header
 * @returns {string} XML declaration
 */
export function generateXmlHeader() {
  return '<?xml version="1.0" encoding="UTF-8"?>';
}

/**
 * Generate sitemap index XML
 * @param {Array} sitemaps - Array of sitemap objects with loc and lastmod
 * @returns {string} Sitemap index XML
 */
export function generateSitemapIndex(sitemaps) {
  const header = generateXmlHeader();
  const urls = sitemaps
    .map(
      (sitemap) => `  <sitemap>
    <loc>${escapeXml(sitemap.loc)}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `${header}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</sitemapindex>`;
}

/**
 * Generate URL entry for sitemap
 * @param {string} loc - URL location
 * @param {string} lastmod - Last modified date
 * @param {string} changefreq - Change frequency
 * @param {number} priority - Priority (0.0 - 1.0)
 * @param {Object} imageData - Optional image data
 * @returns {string} URL entry XML
 */
export function generateUrlEntry(loc, lastmod, changefreq, priority, imageData = null) {
  let entry = `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

  // Add image data if provided
  if (imageData) {
    entry += `
    <image:image>
      <image:loc>${escapeXml(imageData.thumbnailUrl)}</image:loc>
      <image:title>${escapeXml(imageData.title)}</image:title>`;
    
    if (imageData.caption) {
      entry += `
      <image:caption>${escapeXml(imageData.caption)}</image:caption>`;
    }
    
    entry += `
    </image:image>`;
  }

  entry += `
  </url>`;

  return entry;
}

/**
 * Generate complete urlset XML
 * @param {Array} urlEntries - Array of URL entry strings
 * @param {boolean} includeImageNamespace - Whether to include image namespace
 * @returns {string} Complete urlset XML
 */
export function generateUrlset(urlEntries, includeImageNamespace = false) {
  const header = generateXmlHeader();
  const namespace = includeImageNamespace
    ? 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  return `${header}
<urlset ${namespace}>
${urlEntries.join('\n')}
</urlset>`;
}
