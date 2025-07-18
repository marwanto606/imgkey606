import { useEffect } from 'react';

const Robots = () => {
  useEffect(() => {
    document.title = 'robots.txt';
  }, []);

  const robotsContent = `User-agent: Rogerbot
User-agent: Exabot
User-agent: MJ12bot
User-agent: Dotbot
User-agent: Gigabot
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: SemrushBot-SA
Disallow: /

User-agent: *
Allow: /`;

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0 }}>
      {robotsContent}
    </pre>
  );
};

export default Robots;