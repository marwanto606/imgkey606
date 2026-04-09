import { Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

interface ImageData {
  id: number
  title: string
  thumbnail_500_url: string
  creator_name: string
  creator_id: number
  category: {
    id: number
    name: string
  }
}

interface ImageCardProps {
  image: ImageData
}

export function ImageCard({ image }: ImageCardProps) {
  const stockUrl = `/stock/${image.id}`;

  return (
    <Link to={stockUrl} className="group block rounded-lg overflow-hidden relative">
      <img
        src={image.thumbnail_500_url}
        alt={image.title}
        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      {/* Overlay - always visible on mobile, hover on desktop */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-14
        opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight mb-1">
          {image.title}
        </h3>
        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-none backdrop-blur-sm">
          <Tag className="h-3 w-3 mr-1" />
          {image.category.name}
        </Badge>
      </div>
    </Link>
  )
}
