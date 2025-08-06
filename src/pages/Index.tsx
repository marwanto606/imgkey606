import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Header } from "@/components/header"
import { ImageCard } from "@/components/image-card"
import { BackToTop } from "@/components/back-to-top"
import { Pagination } from "@/components/pagination"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Images } from "lucide-react"
import { useSEO } from "@/hooks/use-seo"

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

interface ApiResponse {
  total_items: number
  items: Record<string, ImageData>
  total: number
  num_pages: number
  search_page: number
}

const fetchImages = async (page: number): Promise<ApiResponse> => {
  const response = await fetch(`https://st-apis.gallery606.workers.dev/creator?search_page=${page}`)
  if (!response.ok) {
    throw new Error('Failed to fetch images')
  }
  return response.json()
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1)

  // SEO Configuration
  useSEO({
    title: "ImgKey606 - Discover Amazing Stock Images | High-Quality Photos",
    description: "Browse through thousands of high-quality stock photos from talented creators. Find the perfect image for your project with ImgKey606. Free stock images, royalty-free photography, and digital art.",
    keywords: "stock images, stock photos, royalty free, photography, graphics, digital art, free images, high quality photos, creative content, visual assets",
    canonical: "https://imgkey.lovable.app/"
  })

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['images', currentPage],
    queryFn: () => fetchImages(currentPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (query: string) => {
    // Search is handled by the Header component
    console.log('Search query:', query)
  }

  const images = data ? Object.values(data.items) : []

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              Discover Amazing Stock Images
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Browse through thousands of high-quality stock photos from talented creators
            </p>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-destructive/50 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load images. Please try again later.
              <button 
                onClick={() => refetch()} 
                className="ml-2 underline hover:no-underline"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Images Grid */}
        {!isLoading && !error && images.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <ImageCard key={image.content_id} image={image} />
              ))}
            </div>

            {/* Pagination */}
            {data && data.num_pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={data.num_pages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && images.length === 0 && (
          <div className="text-center py-12">
            <Images className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground">
              We couldn't find any images at the moment. Please try again later.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Images className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">ImgKey606</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ImgKey606. Discover amazing stock images from talented creators.
            </p>
          </div>
        </div>
      </footer>
      
      <BackToTop />
    </div>
  )
};

export default Index;
