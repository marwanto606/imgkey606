import { useState } from "react"
import { Sparkles, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ImageData {
  id: number
  image_url: string
  source: string
}

interface InspireImageCardProps {
  image: ImageData
  onInspireClick: (imageUrl: string) => void
}

export const InspireImageCard = ({ image, onInspireClick }: InspireImageCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Don't render card if image URL is empty or just whitespace
  if (!image.image_url || image.image_url.trim() === "") {
    return null
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleInspireClick = () => {
    if (!imageError && image.image_url.trim()) {
      onInspireClick(image.image_url)
    }
  }

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-muted/30 relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <ImageOff className="h-12 w-12 text-muted-foreground" />
          </div>
        ) : (
          <img
            src={image.image_url}
            alt={`Inspiration from ${image.source}`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={handleInspireClick}
          />
        )}
      </div>
      <CardContent className="p-4">
        <Button
          onClick={handleInspireClick}
          className="w-full"
          variant="default"
          disabled={imageError}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {imageError ? "Image Unavailable" : "Inspire"}
        </Button>
      </CardContent>
    </Card>
  )
}