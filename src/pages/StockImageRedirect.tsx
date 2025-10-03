import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSEO } from "@/hooks/use-seo";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  
  if (!id) {
    return <Navigate to="/" replace />;
  }

  const adobeUrl = `https://stock.adobe.com/uk/stock-photo/id/${id}`;

  const { data: imageData, isLoading, isError } = useQuery({
    queryKey: ['imageData', id],
    queryFn: () => fetchImageData(id),
    retry: 1,
  });

  // SEO with dynamic data or fallback
  useSEO({
    title: imageData 
      ? `${imageData.title} - ${imageData.author} | ImgKey606`
      : `Stock Image ${id} - ImgKey606`,
    description: imageData?.meta_description || `View high-quality stock image ${id} on Adobe Stock. Browse thousands of professional stock photos, images, and illustrations.`,
    keywords: imageData?.keywords.join(", ") || "stock image, adobe stock, professional photography, stock photos, image library",
    ogTitle: imageData 
      ? `${imageData.title} by ${imageData.author}`
      : `Stock Image ${id} - ImgKey606`,
    ogDescription: imageData?.meta_description || "Professional stock image available on Adobe Stock",
    ogImage: imageData?.content_thumb_large_url || "https://imgkey.lovable.app/og-image.jpg",
    canonical: `https://imgkey.lovable.app/stock/${id}`,
  });

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
    metaRefresh.content = `3;url=${adobeUrl}`;
    document.head.appendChild(metaRefresh);

    // Perform redirect after delay (only after data is loaded or error)
    if (!isLoading) {
      const timer = setTimeout(() => {
        setRedirecting(true);
        window.location.href = adobeUrl;
      }, 2500);

      return () => {
        clearTimeout(timer);
        document.head.removeChild(script);
        document.head.removeChild(metaRefresh);
      };
    }
  }, [id, adobeUrl, imageData, isLoading]);

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

              {/* Redirect Status */}
              <div className="space-y-3 pt-4">
                {redirecting ? (
                  <p className="text-primary font-medium">Redirecting now...</p>
                ) : (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Redirecting to Adobe Stock...
                    </p>
                  </>
                )}
                <a 
                  href={adobeUrl}
                  className="text-sm text-primary hover:underline block"
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
