import { useEffect } from 'react'

interface SEOConfig {
  title: string
  description: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonical?: string
}

export const useSEO = (config: SEOConfig) => {
  useEffect(() => {
    // Set document title
    document.title = config.title

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description)
    }

    // Set meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta')
    if (config.keywords) {
      metaKeywords.setAttribute('name', 'keywords')
      metaKeywords.setAttribute('content', config.keywords)
      if (!document.querySelector('meta[name="keywords"]')) {
        document.head.appendChild(metaKeywords)
      }
    }

    // Set Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', config.ogTitle || config.title)
    }

    // Set Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', config.ogDescription || config.description)
    }

    // Set Open Graph image
    if (config.ogImage) {
      const ogImage = document.querySelector('meta[property="og:image"]')
      if (ogImage) {
        ogImage.setAttribute('content', config.ogImage)
      }
    }

    // Set canonical URL
    if (config.canonical) {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        document.head.appendChild(canonical)
      }
      canonical.setAttribute('href', config.canonical)
    }

    // Set Twitter meta tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta')
    twitterTitle.setAttribute('name', 'twitter:title')
    twitterTitle.setAttribute('content', config.ogTitle || config.title)
    if (!document.querySelector('meta[name="twitter:title"]')) {
      document.head.appendChild(twitterTitle)
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta')
    twitterDescription.setAttribute('name', 'twitter:description')
    twitterDescription.setAttribute('content', config.ogDescription || config.description)
    if (!document.querySelector('meta[name="twitter:description"]')) {
      document.head.appendChild(twitterDescription)
    }

    // Add structured data for better SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": config.title,
      "description": config.description,
      "url": config.canonical || window.location.href,
      "provider": {
        "@type": "Organization",
        "name": "ImgKey606",
        "url": "https://imgkey.lovable.app"
      }
    }

    let jsonLd = document.querySelector('script[type="application/ld+json"]')
    if (!jsonLd) {
      jsonLd = document.createElement('script')
      jsonLd.setAttribute('type', 'application/ld+json')
      document.head.appendChild(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(structuredData)

  }, [config])
}