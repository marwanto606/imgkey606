/**
 * Dynamic Sitemap Generator for ImgKey606
 * 
 * This script generates three sitemap files:
 * 1. sitemap.xml - Sitemap index (master file)
 * 2. sitemap-static.xml - Static pages
 * 3. sitemap-images.xml - Dynamic stock image pages (1077 URLs)
 * 
 * Usage: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import {
  getCurrentDate,
  generateSitemapIndex,
  generateUrlEntry,
  generateUrlset,
} from './utils.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://imgkey.lovable.app';
const API_BASE_URL = 'https://st-apis.marwanto606.qzz.io/creator';
const ITEMS_PER_PAGE = 100;


/**
 * Fetch all images from API (dynamic pagination based on nb_results)
 * @returns {Promise<Array>} Array of image objects
 */
async function fetchAllImages() {
  console.log('🔄 Fetching images from API...');
  const allImages = [];
  
  // Fetch first page to get nb_results
  const firstUrl = `${API_BASE_URL}?search_page=1`;
  console.log(`  ↳ Fetching page 1 to determine total pages...`);
  
  const firstResponse = await fetch(firstUrl);
  if (!firstResponse.ok) {
    console.error(`  ✗ Failed to fetch page 1: ${firstResponse.status}`);
    return allImages;
  }
  
  const firstData = await firstResponse.json();
  const totalItems = firstData.nb_results || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  console.log(`  ✓ Total items: ${totalItems}, Total pages: ${totalPages}`);
  
  // Process first page
  if (firstData.files && Array.isArray(firstData.files)) {
    allImages.push(...firstData.files);
    console.log(`  ✓ Page 1/${totalPages}: ${firstData.files.length} images fetched`);
  }
  
  // Fetch remaining pages
  for (let page = 2; page <= totalPages; page++) {
    try {
      const url = `${API_BASE_URL}?search_page=${page}`;
      console.log(`  ↳ Fetching page ${page}/${totalPages}...`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`  ✗ Failed to fetch page ${page}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (data.files && Array.isArray(data.files)) {
        allImages.push(...data.files);
        console.log(`  ✓ Page ${page}/${totalPages}: ${data.files.length} images fetched`);
      }
    } catch (error) {
      console.error(`  ✗ Error fetching page ${page}:`, error.message);
    }
  }
  
  console.log(`✓ Total images fetched: ${allImages.length}`);
  return allImages;
}

/**
 * Generate static sitemap
 * @returns {string} Static sitemap XML
 */
function generateStaticSitemap() {
  console.log('📄 Generating static sitemap...');
  const currentDate = getCurrentDate();
  
  const staticPages = [
    { loc: BASE_URL, priority: 1.0, changefreq: 'daily' },
    { loc: `${BASE_URL}/image-title-keyword`, priority: 0.8, changefreq: 'weekly' },
    { loc: `${BASE_URL}/image-prompt`, priority: 0.8, changefreq: 'weekly' },
    { loc: `${BASE_URL}/image-inspire`, priority: 0.8, changefreq: 'weekly' },
  ];
  
  const urlEntries = staticPages.map((page) =>
    generateUrlEntry(page.loc, currentDate, page.changefreq, page.priority)
  );
  
  console.log(`✓ Generated ${staticPages.length} static page entries`);
  return generateUrlset(urlEntries, false);
}

/**
 * Generate images sitemap
 * @param {Array} images - Array of image objects
 * @returns {string} Images sitemap XML
 */
function generateImagesSitemap(images) {
  console.log('🖼️  Generating images sitemap...');
  const currentDate = getCurrentDate();
  
  const urlEntries = images.map((image) => {
    const imageData = {
      thumbnailUrl: image.thumbnail_url || '',
      title: image.title || 'Stock Image',
      caption: image.author_name ? `by ${image.author_name}` : '',
    };
    
    return generateUrlEntry(
      `${BASE_URL}/stock/${image.content_id}`,
      currentDate,
      'weekly',
      0.7,
      imageData
    );
  });
  
  console.log(`✓ Generated ${urlEntries.length} image page entries`);
  return generateUrlset(urlEntries, true);
}

/**
 * Generate sitemap index
 * @returns {string} Sitemap index XML
 */
function generateMasterSitemap() {
  console.log('📑 Generating sitemap index...');
  const currentDate = getCurrentDate();
  
  const sitemaps = [
    {
      loc: `${BASE_URL}/sitemap-static.xml`,
      lastmod: currentDate,
    },
    {
      loc: `${BASE_URL}/sitemap-images.xml`,
      lastmod: currentDate,
    },
  ];
  
  console.log(`✓ Generated sitemap index with ${sitemaps.length} sitemaps`);
  return generateSitemapIndex(sitemaps);
}

/**
 * Write sitemap file to public directory
 * @param {string} filename - Name of the file
 * @param {string} content - XML content
 */
function writeSitemapFile(filename, content) {
  const filePath = path.join(PUBLIC_DIR, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  
  // Get file size
  const stats = fs.statSync(filePath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);
  
  console.log(`✓ Written: ${filename} (${fileSizeKB} KB)`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting sitemap generation...\n');
  const startTime = Date.now();
  
  try {
    // Ensure public directory exists
    if (!fs.existsSync(PUBLIC_DIR)) {
      fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    
    // Step 1: Fetch all images from API
    const images = await fetchAllImages();
    
    if (images.length === 0) {
      console.error('❌ No images found. Aborting sitemap generation.');
      process.exit(1);
    }
    
    console.log(''); // Empty line for readability
    
    // Step 2: Generate static sitemap
    const staticSitemap = generateStaticSitemap();
    writeSitemapFile('sitemap-static.xml', staticSitemap);
    
    console.log(''); // Empty line
    
    // Step 3: Generate images sitemap
    const imagesSitemap = generateImagesSitemap(images);
    writeSitemapFile('sitemap-images.xml', imagesSitemap);
    
    console.log(''); // Empty line
    
    // Step 4: Generate sitemap index
    const masterSitemap = generateMasterSitemap();
    writeSitemapFile('sitemap.xml', masterSitemap);
    
    console.log(''); // Empty line
    
    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('✅ Sitemap generation completed!\n');
    console.log('📊 Summary:');
    console.log(`  • Total images: ${images.length}`);
    console.log(`  • Static pages: 4`);
    console.log(`  • Total URLs: ${images.length + 4}`);
    console.log(`  • Generation time: ${duration}s`);
    console.log(`  • Files created:`);
    console.log(`    - public/sitemap.xml (index)`);
    console.log(`    - public/sitemap-static.xml`);
    console.log(`    - public/sitemap-images.xml`);
    console.log('');
    console.log('🌐 Sitemap URLs:');
    console.log(`  • ${BASE_URL}/sitemap.xml`);
    console.log(`  • ${BASE_URL}/sitemap-static.xml`);
    console.log(`  • ${BASE_URL}/sitemap-images.xml`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. Deploy your app to Lovable');
    console.log('  2. Validate sitemap: https://www.xml-sitemaps.com/validate-xml-sitemap.html');
    console.log('  3. Submit to Google Search Console');
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the script
main();
