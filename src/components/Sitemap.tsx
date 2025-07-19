
import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Set the correct content type for XML
    document.contentType = 'application/xml';
    
    // Replace the entire HTML content with XML
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://imgkey.lovable.app</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    // Replace the document content
    document.open();
    document.write(xmlContent);
    document.close();
  }, []);

  return null;
};

export default Sitemap;
