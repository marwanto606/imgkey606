import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Header } from "@/components/header"
import { BackToTop } from "@/components/back-to-top"
import { PromptSidebar } from "@/components/prompt-sidebar"
import { SidebarToggle } from "@/components/sidebar-toggle"

interface ImageData {
  id: number
  image_url: string
  source: string
}

interface ApiResponse {
  items: ImageData[]
}

const fetchInspireImages = async (query: string, page: number): Promise<ApiResponse> => {
  const response = await fetch(`https://sch-apis.gallery606.workers.dev/?q=${encodeURIComponent(query)}&page=${page}`)
  if (!response.ok) {
    throw new Error('Failed to fetch images')
  }
  return response.json()
}

const ImageInspire = () => {
  const defaultSearchTerms = [
    "Business meeting", "teamwork", "startup", "innovation", "data", "cybersecurity", 
    "Nature", "landscape", "forest", "ocean", "mountains", "sunset", "beach", 
    "Happy family", "diverse people", "healthy lifestyle", "friends", "travel", "fitness", "education", 
    "Abstract background", "geometric patterns", "textures", "gradients", 
    "Success", "inspiration", "creativity", "connection", "happiness"
  ]
  
  const [searchQuery, setSearchQuery] = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Pick a random search term on first load
    const randomTerm = defaultSearchTerms[Math.floor(Math.random() * defaultSearchTerms.length)]
    setSubmittedQuery(randomTerm)
    setSearchQuery(randomTerm)
    setHasSubmitted(true)
  }, [])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['inspire-images', submittedQuery, currentPage],
    queryFn: () => fetchInspireImages(submittedQuery, currentPage),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    enabled: hasSubmitted && submittedQuery.trim() !== ""
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim())
      setCurrentPage(1)
      setHasSubmitted(true)
    }
  }

  const handleHeaderSearch = (query: string) => {
    console.log('Header search query:', query)
  }

  const handleInspireClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
    setIsSidebarOpen(true)
    toast.success("Image loaded in prompt generator!")
  }

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (data?.items && data.items.length > 0) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const images = data?.items || []

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleHeaderSearch} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-8 mb-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-primary/80 bg-clip-text text-transparent">
                Image Inspiration Gallery
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Search for inspiring images and generate AI prompts from them
              </p>
            </div>
          </section>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search for inspiration images... (e.g., robot, nature, art)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-lg h-12"
                  />
                </div>
                <Button type="submit" size="lg" className="md:w-auto w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search Images
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Alert className="mb-8 border-destructive/50 text-destructive">
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
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-8 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Images Grid */}
          {!isLoading && !error && images.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={`Inspiration from ${image.source}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onClick={() => handleInspireClick(image.image_url)}
                      />
                    </div>
                    <CardContent className="p-4">
                      <Button
                        onClick={() => handleInspireClick(image.image_url)}
                        className="w-full"
                        variant="default"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Inspire
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-center items-center gap-4">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  variant="outline"
                  size="lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNextPage}
                  disabled={!data?.items || data.items.length === 0}
                  variant="outline"
                  size="lg"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Empty State */}
          {!isLoading && !error && hasSubmitted && images.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No images found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords to find inspiring images.
              </p>
            </div>
          )}

          {/* Initial State */}
          {!hasSubmitted && !isLoading && (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
              <p className="text-muted-foreground">
                Enter a search term above to discover inspiring images for your AI prompts.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <BackToTop />
      <SidebarToggle isOpen={isSidebarOpen} onToggle={handleSidebarToggle} />
      <PromptSidebar 
        isOpen={isSidebarOpen} 
        onClose={handleSidebarClose} 
        imageUrl={selectedImageUrl || undefined}
      />
    </div>
  )
}

export default ImageInspire