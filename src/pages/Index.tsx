import { useState, useEffect, useRef, useCallback } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Header } from "@/components/header"
import { ImageCard } from "@/components/image-card"
import { BackToTop } from "@/components/back-to-top"
import { InfiniteScrollSkeleton } from "@/components/infinite-scroll-skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Images, Loader2 } from "lucide-react"
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
  const response = await fetch(`https://st-apis.marwanto606.qzz.io/creator?search_page=${page}`)
  if (!response.ok) {
    throw new Error('Failed to fetch images')
  }
  return response.json()
}

const Index = () => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // SEO Configuration
  useSEO({
    title: "ImgKey606 - Discover Amazing Stock Images | High-Quality Photos",
    description: "Browse through thousands of high-quality stock photos from talented creators. Find the perfect image for your project with ImgKey606. Free stock images, royalty-free photography, and digital art.",
    keywords: "stock images, stock photos, royalty free, photography, graphics, digital art, free images, high quality photos, creative content, visual assets",
    canonical: "https://imgkey.lovable.app/"
  })

  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['images-infinite'],
    queryFn: ({ pageParam = 1 }) => fetchImages(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length
      if (currentPage < lastPage.num_pages) {
        return currentPage + 1
      }
      return undefined
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return
      
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage) {
            fetchNextPage()
          }
        },
        { threshold: 0.1, rootMargin: '100px' }
      )
      
      if (node) {
        observerRef.current.observe(node)
      }
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  )

  const handleSearch = (_query: string) => {
    // Search handled by Header component
  }

  // Flatten all pages into single array
  const images = data?.pages.flatMap(page => Object.values(page.items)) ?? []

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12 mb-12">
          <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent leading-tight pb-3">
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
        {isLoading && <InfiniteScrollSkeleton />}

        {/* Images Grid */}
        {!isLoading && !error && images.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((image) => (
                <ImageCard key={image.content_id} image={image} />
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={lastElementRef} className="w-full py-8 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Loading more images...</span>
                </div>
              )}
              {!hasNextPage && images.length > 0 && (
                <p className="text-muted-foreground text-sm">
                  You've reached the end! 🎉
                </p>
              )}
            </div>
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
