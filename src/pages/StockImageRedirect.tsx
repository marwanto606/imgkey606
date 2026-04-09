import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, ShoppingCart } from "lucide-react";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface ImageCategory {
  id: number;
  name: string;
}

interface ImageKeyword {
  name: string;
}

interface ImageApiResponse {
  id: number;
  title: string;
  thumbnail_500_url: string;
  creator_name: string;
  creator_id: number;
  category: ImageCategory;
  keywords: ImageKeyword[];
}

const fetchImageData = async (id: string): Promise<ImageApiResponse> => {
  const response = await fetch(
    `https://st-apis.marwanto606.qzz.io/media?id=${id}`
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

  const keywordNames = imageData?.keywords?.map(k => k.name) ?? [];
  const metaDescription = imageData
    ? `${imageData.title}. High-quality stock ${imageData.category?.name ?? 'image'} by ${imageData.creator_name}. Download and license on Adobe Stock.`
    : `Professional stock image ${id} from Adobe Stock`;

  const structuredData = imageData ? {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": imageData.title,
    "description": metaDescription,
    "contentUrl": imageData.thumbnail_500_url,
    "url": `https://imgkey.lovable.app/stock/${id}`,
    "creator": {
      "@type": "Person",
      "name": imageData.creator_name
    },
    "creditText": imageData.creator_name,
    "copyrightNotice": `© ${imageData.creator_name} - Adobe Stock`,
    "acquireLicensePage": adobeUrl,
    "license": "https://stock.adobe.com/license-terms",
    ...(keywordNames.length > 0 && { "keywords": keywordNames.join(", ") }),
    "provider": {
      "@type": "Organization",
      "name": "Adobe Stock",
      "url": "https://stock.adobe.com"
    }
  } : null;

  return (
    <>
      <Helmet>
        <title>
          {imageData
            ? `${imageData.title} - ${imageData.creator_name} | ImgKey606`
            : `Stock Image ${id} | ImgKey606`}
        </title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content={keywordNames.length > 0 ? keywordNames.join(", ") : "stock images, photography, adobe stock"}
        />
        <meta name="author" content={imageData?.creator_name || "ImgKey606"} />

        <meta
          property="og:title"
          content={imageData ? `${imageData.title} by ${imageData.creator_name}` : `Stock Image ${id}`}
        />
        <meta property="og:description" content={metaDescription} />
        <meta
          property="og:image"
          content={imageData?.thumbnail_500_url || "https://lovable.dev/opengraph-image-p98pqg.png"}
        />
        <meta property="og:type" content="article" />
        {imageData?.creator_name && (
          <meta property="article:author" content={imageData.creator_name} />
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={imageData ? `${imageData.title} by ${imageData.creator_name}` : `Stock Image ${id}`}
        />
        <meta name="twitter:description" content={metaDescription} />
        <meta
          name="twitter:image"
          content={imageData?.thumbnail_500_url || "https://lovable.dev/opengraph-image-p98pqg.png"}
        />

        {structuredData && (
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        )}

        <link rel="canonical" href={`https://imgkey.lovable.app/stock/${id}`} />
      </Helmet>

      <Header onSearch={() => {}} />
      <div className="flex items-center justify-center bg-background px-4 py-8">
        <div className="max-w-2xl w-full space-y-6">
          {isLoading ? (
            <div className="text-center space-y-4" data-nosnippet>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg text-muted-foreground" aria-live="polite">Loading image details...</p>
            </div>
          ) : isError ? (
            <div className="text-center space-y-4" data-nosnippet>
              <p className="text-muted-foreground">Failed to load image data.</p>
              <a
                href={adobeUrl}
                className="text-sm text-primary hover:underline block"
                rel="nofollow noopener"
              >
                View on Adobe Stock instead
              </a>
            </div>
          ) : imageData ? (
            <div className="space-y-6 text-center">
              <div className="relative w-full aspect-video overflow-hidden rounded-lg border bg-muted">
                <img
                  src={imageData.thumbnail_500_url}
                  alt={imageData.title}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>

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

              <h2 className="text-3xl font-bold leading-tight">
                {imageData.title}
              </h2>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-muted-foreground">
                  by <span className="font-semibold text-foreground">{imageData.creator_name}</span>
                </span>
                <span className="text-muted-foreground">•</span>
                <Badge variant="secondary">{imageData.category?.name}</Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {metaDescription}
              </p>

              {keywordNames.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {keywordNames.slice(0, 10).map((keyword, index) => (
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
