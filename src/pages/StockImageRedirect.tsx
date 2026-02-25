import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Camera, ShoppingCart } from "lucide-react";
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
    `https://st-apis.marwanto606.qzz.io/Ajax/MediaData/${id}?full=1`
  );
  if (!response.ok) throw new Error('Failed to fetch image data');
  return response.json();
};

export default function StockImageRedirect() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" replace />;
  }

  const adobeUrl = `https://stock.adobe.com/uk/stock-photo/id/${id}`;

  const { data: imageData, isLoading, isError } = useQuery({
    queryKey: ['imageData', id],
    queryFn: () => fetchImageData(id),
    retry: 1,
  });


  // Prepare structured data for Helmet when imageData available
  const structuredData = imageData ? {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": imageData.title || `Stock Image ${id}`,
    "description": imageData.meta_description || `Professional stock image ${id}`,
    "contentUrl": imageData.content_thumb_large_url,
    "url": `https://imgkey.lovable.app/stock/${id}`,
    "creator": {
      "@type": "Person",
      "name": imageData.author
    },
    "creditText": imageData.author,
    "copyrightNotice": `© ${imageData.author} - Adobe Stock`,
    "acquireLicensePage": adobeUrl,
    "license": "https://stock.adobe.com/license-terms",
    ...(Array.isArray(imageData.keywords) && imageData.keywords.length > 0 && {
      "keywords": imageData.keywords.join(", ")
    }),
    "provider": {
      "@type": "Organization",
      "name": "Adobe Stock",
      "url": "https://stock.adobe.com"
    }
  } : null;

  return (
    <>
      {/* PERBAIKAN: Helmet selalu di-render dengan fallback values */}
      <Helmet>
        <title>
          {imageData 
            ? `${imageData.title} - ${imageData.author} | ImgKey606` 
            : `Stock Image ${id} | ImgKey606`}
        </title>
        <meta 
          name="description" 
          content={imageData?.meta_description || `Professional stock image ${id} from Adobe Stock`} 
        />
        <meta 
          name="keywords" 
          content={imageData?.keywords?.join(", ") || "stock images, photography, adobe stock"} 
        />
        <meta 
          name="author" 
          content={imageData?.author || "ImgKey606"} 
        />
        
        {/* Open Graph Tags */}
        <meta 
          property="og:title" 
          content={imageData 
            ? `${imageData.title} by ${imageData.author}` 
            : `Stock Image ${id}`} 
        />
        <meta 
          property="og:description" 
          content={imageData?.meta_description || `Professional stock image ${id} from Adobe Stock`} 
        />
        <meta 
          property="og:image" 
          content={imageData?.content_thumb_large_url || "https://lovable.dev/opengraph-image-p98pqg.png"} 
        />
        <meta property="og:type" content="article" />
        {imageData?.author && (
          <meta property="article:author" content={imageData.author} />
        )}
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={imageData 
            ? `${imageData.title} by ${imageData.author}` 
            : `Stock Image ${id}`} 
        />
        <meta 
          name="twitter:description" 
          content={imageData?.meta_description || `Professional stock image ${id} from Adobe Stock`} 
        />
        <meta 
          name="twitter:image" 
          content={imageData?.content_thumb_large_url || "https://lovable.dev/opengraph-image-p98pqg.png"} 
        />

        {/* Structured Data */}
        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}
        

        {/* Canonical URL */}
        <link rel="canonical" href={`https://imgkey.lovable.app/stock/${id}`} />
      </Helmet>

      
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {isLoading ? (
            <div className="text-center space-y-4" data-nosnippet>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg text-muted-foreground" aria-live="polite">Loading image details...</p>
            </div>
          ) : isError ? (
            <div className="text-center space-y-4" data-nosnippet>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground" aria-live="polite">Redirecting to Adobe Stock...</p>
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
              {/* Site Name Link */}
              <a 
                href="/"
                className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <Camera className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                  ImgKey606
                </h1>
              </a>

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
              <a
                href={adobeUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-8 py-5 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] w-full sm:w-auto"
              >
                <ShoppingCart className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span>Purchase on Adobe Stock</span>
                <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </a>

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
              {imageData.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {imageData.keywords.slice(0, 10).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}

            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
