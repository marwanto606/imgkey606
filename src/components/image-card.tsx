import { ExternalLink, User, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

interface ImageData {
  content_id: number
  title: string
  content_thumb_large_url: string
  author: string
  category: {
    id: number
    name: string
  }
}

interface ImageCardProps {
  image: ImageData
}

export function ImageCard({ image }: ImageCardProps) {
  const stockUrl = `/stock/${image.content_id}`;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:shadow-primary/10">
      <Link to={stockUrl}>
        <div className="relative overflow-hidden">
          <img
            src={image.content_thumb_large_url}
            alt={image.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          <Button
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
            size="sm"
            variant="secondary"
            asChild
          >
            <span>
              <ExternalLink className="h-4 w-4" />
            </span>
          </Button>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
          {image.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span className="truncate">{image.author}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {image.category.name}
          </Badge>
        </div>
        
        <Button 
          className="w-full"
          size="sm"
          asChild
        >
          <Link to={stockUrl}>
            View Image
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}