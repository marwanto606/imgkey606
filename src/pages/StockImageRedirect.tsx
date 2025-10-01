import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useSEO } from "@/hooks/use-seo";
import { Loader2 } from "lucide-react";

export default function StockImageRedirect() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/" replace />;
  }

  const adobeUrl = `https://stock.adobe.com/uk/stock-photo/id/${id}`;

  useSEO({
    title: `Stock Image ${id} - ImgKey606`,
    description: `View high-quality stock image ${id} on Adobe Stock. Browse thousands of professional stock photos, images, and illustrations.`,
    keywords: "stock image, adobe stock, professional photography, stock photos, image library",
    ogTitle: `Stock Image ${id} - ImgKey606`,
    ogDescription: `Professional stock image available on Adobe Stock`,
    ogImage: "https://imgkey.lovable.app/og-image.jpg",
    canonical: `https://imgkey.lovable.app/stock/${id}`,
  });

  useEffect(() => {
    // Add structured data for SEO
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "contentUrl": adobeUrl,
      "url": `https://imgkey.lovable.app/stock/${id}`,
      "identifier": id,
      "provider": {
        "@type": "Organization",
        "name": "Adobe Stock"
      }
    });
    document.head.appendChild(script);

    // Perform redirect after a short delay for crawler indexing
    const timer = setTimeout(() => {
      window.location.href = adobeUrl;
    }, 500);

    return () => {
      clearTimeout(timer);
      document.head.removeChild(script);
    };
  }, [id, adobeUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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
    </div>
  );
}
