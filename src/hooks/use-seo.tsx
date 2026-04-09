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
    const addedElements: Element[] = []

    // Set document title
    document.title = config.title

    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', config.description)
    }

    // Set meta keywords
    if (config.keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.setAttribute('name', 'keywords')
        document.head.appendChild(metaKeywords)
        addedElements.push(metaKeywords)
      }
      metaKeywords.setAttribute('content', config.keywords)
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
        addedElements.push(canonical)
      }
      canonical.setAttribute('href', config.canonical)
    }

    // Set Twitter meta tags
    let twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (!twitterTitle) {
      twitterTitle = document.createElement('meta')
      twitterTitle.setAttribute('name', 'twitter:title')
      document.head.appendChild(twitterTitle)
      addedElements.push(twitterTitle)
    }
    twitterTitle.setAttribute('content', config.ogTitle || config.title)

    let twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (!twitterDescription) {
      twitterDescription = document.createElement('meta')
      twitterDescription.setAttribute('name', 'twitter:description')
      document.head.appendChild(twitterDescription)
      addedElements.push(twitterDescription)
    }
    twitterDescription.setAttribute('content', config.ogDescription || config.description)

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
      addedElements.push(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(structuredData)

    // Cleanup: remove dynamically added elements when unmounting
    return () => {
      addedElements.forEach(el => el.remove())
    }
  }, [config])
}