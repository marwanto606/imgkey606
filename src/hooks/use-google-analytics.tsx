import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Ensure GA is initialized only once (even in React Strict Mode)
let gaInitialized = false;

export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (gaInitialized) return;
    ReactGA.initialize('G-HBCWDDSXT7', {
      gtagOptions: { send_page_view: false },
    });
    gaInitialized = true;
  }, []);

  useEffect(() => {
    // Track page views on route changes (manual for SPA)
    const page_path = location.pathname + location.search + location.hash;
    const page_location = window.location.href;
    const page_title = document.title;

    // Wait a frame so title/meta from useSEO are applied
    requestAnimationFrame(() => {
      if (typeof (ReactGA as any).gtag === 'function') {
        (ReactGA as any).gtag('event', 'page_view', {
          page_title,
          page_location,
          page_path,
        });
      } else {
        // Fallback for older react-ga4 versions
        ReactGA.set({ page: page_path });
        ReactGA.send({ hitType: 'pageview', page: page_path, title: page_title });
      }
    });
  }, [location]);
};