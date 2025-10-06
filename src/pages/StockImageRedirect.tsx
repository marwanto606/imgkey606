import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSEO } from "@/hooks/use-seo";
import { Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ImageApiResponse {
  keywords: string[];
  content_id: number;
  title: string;
  content_thumb_large_url: string;
  author: string;
  meta_description: string;
  media_type_label: string;
  category_hierarchy: string;
}

const fetchImageData = async (id: string): Promise<ImageApiResponse> => {
  const response = await fetch(
    `https://st-apis.gallery606.workers.dev/Ajax/MediaData/${id}?full=1`
  );
  if (!response.ok) throw new Error('Failed to fetch image data');
  return response.json();
};

export default function StockImageRedirect() {
  const { id } = useParams<{ id: string }>();
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(10);
  
  if (!id) {
    return <Navigate to="/" replace />;
  }

  const adobeUrl = `https://stock.adobe.com/uk/stock-photo/id/${id}`;

  const { data: imageData, isLoading, isError } = useQuery({
    queryKey: ['imageData', id],
    queryFn: () => fetchImageData(id),
    retry: 1,
  });

  // SEO - only set when data is loaded to prevent crawlers from indexing fallback
  if (imageData) {
    useSEO({
      title: `${imageData.title} - ${imageData.author} | ImgKey606`,
      description: imageData.meta_description,
      keywords: imageData.keywords.join(", "),
      ogTitle: `${imageData.title} by ${imageData.author}`,
      ogDescription: imageData.meta_description,
      ogImage: imageData.content_thumb_large_url,
      canonical: `https://imgkey.lovable.app/stock/${id}`,
    });
  }

  useEffect(() => {
    // Add author meta tags
    if (imageData) {
      const authorMeta = document.querySelector('meta[name="author"]') || document.createElement('meta');
      authorMeta.setAttribute('name', 'author');
      authorMeta.setAttribute('content', imageData.author);
      if (!document.querySelector('meta[name="author"]')) {
        document.head.appendChild(authorMeta);
      }

      const articleAuthorMeta = document.querySelector('meta[property="article:author"]') || document.createElement('meta');
      articleAuthorMeta.setAttribute('property', 'article:author');
      articleAuthorMeta.setAttribute('content', imageData.author);
      if (!document.querySelector('meta[property="article:author"]')) {
        document.head.appendChild(articleAuthorMeta);
      }

      const ogTypeMeta = document.querySelector('meta[property="og:type"]') || document.createElement('meta');
      ogTypeMeta.setAttribute('property', 'og:type');
      ogTypeMeta.setAttribute('content', 'article');
      if (!document.querySelector('meta[property="og:type"]')) {
        document.head.appendChild(ogTypeMeta);
      }
    }

    // Add structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "name": imageData?.title || `Stock Image ${id}`,
      "description": imageData?.meta_description || `Professional stock image ${id}`,
      "contentUrl": adobeUrl,
      "thumbnailUrl": imageData?.content_thumb_large_url,
      "url": `https://imgkey.lovable.app/stock/${id}`,
      "identifier": id,
      "keywords": imageData?.keywords.join(", "),
      "author": imageData ? {
        "@type": "Person",
        "name": imageData.author
      } : undefined,
      "provider": {
        "@type": "Organization",
        "name": "Adobe Stock",
        "url": "https://stock.adobe.com"
      },
      "category": imageData?.category_hierarchy,
      "encodingFormat": imageData?.media_type_label
    });
    document.head.appendChild(script);

    // Add meta refresh fallback
    const metaRefresh = document.createElement("meta");
    metaRefresh.httpEquiv = "refresh";
    metaRefresh.content = `11;url=${adobeUrl}`;
    document.head.appendChild(metaRefresh);

    // Perform redirect after delay (only after data is loaded or error)
    if (!isLoading) {
      const timer = setTimeout(() => {
        setRedirecting(true);
        window.location.href = adobeUrl;
      }, 10000);

      return () => {
        clearTimeout(timer);
        document.head.removeChild(script);
        document.head.removeChild(metaRefresh);
      };
    }
  }, [id, adobeUrl, imageData, isLoading]);

  // Countdown timer effect
  useEffect(() => {
    if (!isLoading && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoading, countdown]);

  return (
    <>
      <noscript>
        <meta httpEquiv="refresh" content={`0;url=${adobeUrl}`} />
        <p>Redirecting to <a href={adobeUrl}>Adobe Stock</a></p>
      </noscript>
      
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {isLoading ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg text-muted-foreground">Loading image details...</p>
            </div>
          ) : isError ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Redirecting to Adobe Stock...</p>
              <a 
                href={adobeUrl}
                className="text-sm text-primary hover:underline block"
                rel="nofollow noopener"
              >
                Click here if you are not redirected automatically
              </a>
            </div>
          ) : imageData ? (
            <div className="space-y-6 text-center">
              {/* Image Preview */}
              <div className="relative w-full aspect-video overflow-hidden rounded-lg border bg-muted">
                <img 
                  src={imageData.content_thumb_large_url} 
                  alt={imageData.title}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>

              {/* CTA Button */}
              <Button 
                onClick={() => window.location.href = adobeUrl}
                size="lg"
                className="w-full sm:w-auto"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Purchase on Adobe Stock
              </Button>

              {/* Title */}
              <h1 className="text-3xl font-bold leading-tight">
                {imageData.title}
              </h1>

              {/* Author and Category */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-muted-foreground">
                  by <span className="font-semibold text-foreground">{imageData.author}</span>
                </span>
                <span className="text-muted-foreground">•</span>
                <Badge variant="secondary">{imageData.category_hierarchy}</Badge>
                <Badge variant="outline">{imageData.media_type_label}</Badge>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {imageData.meta_description}
              </p>

              {/* Keywords */}
              {imageData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {imageData.keywords.slice(0, 10).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Redirect Status with Countdown */}
              <div className="space-y-3 pt-4">
                {redirecting ? (
                  <p className="text-primary font-medium">Redirecting now...</p>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-lg font-semibold text-foreground">
                        Redirecting in {countdown}s
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You'll be taken to Adobe Stock shortly
                    </p>
                  </>
                )}
                <a 
                  href={adobeUrl}
                  className="text-sm text-primary hover:underline block"
                  rel="nofollow noopener"
                >
                  Click here if you are not redirected automatically
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
