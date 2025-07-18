import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    document.title = 'sitemap.xml';
  }, []);

  const currentDate = new Date().toISOString();
  
  const sitemapContent = `<?xml version='1.0' encoding='UTF-8'?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://imgkey.lovable.app</loc><lastmod>${currentDate}</lastmod></url></urlset>`;

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0 }}>
      {sitemapContent}
    </pre>
  );
};

export default Sitemap;