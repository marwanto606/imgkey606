
const Sitemap = () => {
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://imgkey.lovable.app</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}T00:00:00Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  return (
    <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre' }}>
      {xmlContent}
    </pre>
  );
};

export default Sitemap;
