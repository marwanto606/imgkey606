import { useState, useRef } from "react"
import { Camera, Upload, Sparkles, ChevronDown, Copy, Check, Eye, EyeOff } from "lucide-react"
import { useSEO } from "@/hooks/use-seo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Header } from "@/components/header"

const GEMINI_MODELS = [
  // Gemini 2.5 - Latest & Recommended
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash ⚡ (Recommended)", description: "Balance optimal - cepat & akurat" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro 🎯", description: "Paling powerful untuk analisis kompleks" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite 🚀", description: "Tercepat & terhemat" },
  
  // Gemini 2.0
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)", description: "Fitur cutting-edge" },
]

interface AnalysisResult {
  title: string
  keywords: string[]
}

const ImageTitleKeyword = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // SEO Configuration
  useSEO({
    title: "Image Analysis AI - Generate SEO Titles & Keywords | ImgKey606",
    description: "Upload an image to generate SEO-optimized titles and 50 relevant keywords using AI. Perfect for stock photographers, content creators, and marketers. Powered by Google Gemini AI.",
    keywords: "image analysis, AI image analysis, SEO keywords generator, image title generator, stock photo keywords, AI content creation, image SEO, Google Gemini AI",
    canonical: "https://imgkey.lovable.app/image-title-keyword"
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini-api-key") || "")
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copiedTitle, setCopiedTitle] = useState(false)
  const [copiedKeywords, setCopiedKeywords] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem("gemini-api-key", value)
  }

  const copyToClipboard = async (text: string, type: 'title' | 'keywords') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'title') {
        setCopiedTitle(true)
        setTimeout(() => setCopiedTitle(false), 2000)
      } else {
        setCopiedKeywords(true)
        setTimeout(() => setCopiedKeywords(false), 2000)
      }
      toast.success(`${type === 'title' ? 'Title' : 'Keywords'} copied to clipboard!`)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    setSelectedImage(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data URL prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const generateTitleAndKeywords = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first")
      return
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key")
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const imageBase64 = await convertImageToBase64(selectedImage)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "You are a stock content analyst for a leading microstock platform. Analyze this image and generate:\n\n1. A descriptive, SEO-friendly title (10–15 words), written in natural language, optimized for search engines. Include subject, action, setting, and context if visible.\n2. Exactly 50 high-quality keywords or short phrases. Include:\n   - Subject identity (e.g., gender, profession, ethnicity if clear)\n   - Actions, poses, or expressions\n   - Visual style (photo realism, flat lay, vector, minimalistic, etc.)\n   - Mood or emotion\n   - Setting or environment\n   - Technical elements (e.g., close-up, aerial view, backlit)\n   - Commercial use case (e.g., advertisement, website banner, brochure, etc.)\n\nRespond only in the following JSON format:\n\n{\n  \"title\": \"Your SEO-optimized title here\",\n  \"keywords\": [\"keyword1\", \"keyword2\", ..., \"keyword50\"]\n}"
              },
              {
                inline_data: {
                  mime_type: selectedImage.type,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text
        
        try {
          // Try to parse as JSON first
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0])
            if (parsedResult.title && parsedResult.keywords) {
              setResult({
                title: parsedResult.title,
                keywords: parsedResult.keywords
              })
              toast.success("Title and keywords generated successfully!")
            } else {
              throw new Error("Invalid JSON structure")
            }
          } else {
            // Fallback to old parsing method
            const titleMatch = text.match(/Title:\s*(.+)/i)
            const keywordsMatch = text.match(/Keywords:\s*(.+)/i)
            
            if (titleMatch && keywordsMatch) {
              const title = titleMatch[1].trim()
              const keywords = keywordsMatch[1].split(',').map(k => k.trim()).filter(k => k.length > 0)
              
              setResult({ title, keywords })
              toast.success("Title and keywords generated successfully!")
            } else {
              throw new Error("Failed to parse API response")
            }
          }
        } catch (parseError) {
          console.error("Parse error:", parseError)
          throw new Error("Failed to parse API response")
        }
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (error) {
      console.error('Error generating title and keywords:', error)
      
      // Provide more specific error messages
      let errorMessage = "Failed to generate title and keywords. "
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage += "API key tidak valid. Pastikan API key Gemini Anda benar."
        } else if (error.message.includes('429')) {
          errorMessage += "Quota API tercapai. Tunggu beberapa saat atau periksa limit API Anda."
        } else if (error.message.includes('400')) {
          errorMessage += "Request tidak valid. Periksa format gambar atau ukuran file."
        } else if (error.message.includes('500') || error.message.includes('503')) {
          errorMessage += "Server Gemini mengalami masalah. Coba lagi nanti."
        } else if (error.message.includes('parse') || error.message.includes('Invalid JSON')) {
          errorMessage += "Format respons dari API tidak sesuai. Coba model lain."
        } else if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          errorMessage += "Koneksi internet bermasalah. Periksa koneksi Anda."
        } else {
          errorMessage += error.message
        }
      } else {
        errorMessage += "Terjadi kesalahan tidak terduga. Coba lagi."
      }
      
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="text-center py-8 mb-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-primary/80 bg-clip-text text-transparent">
                Image Analysis AI
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Upload an image to generate a title and 50 keywords using AI
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image Upload & API Key */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Image Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Drag and Drop Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    
                    <div className="text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                          />
                          <p className="text-sm text-muted-foreground">
                            {selectedImage?.name}
                          </p>
                          <Button variant="outline" size="sm">
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-lg font-medium">Drop your image here</p>
                            <p className="text-sm text-muted-foreground">or click to select</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateTitleAndKeywords}
                    disabled={!selectedImage || !apiKey.trim() || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Title & Keywords
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* API Key */}
              <Card>
                <CardHeader>
                  <CardTitle>Gemini API Key</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your Gemini API key"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-10 w-10"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Get your Gemini API key here
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Info */}
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored locally in your browser and never shared with our servers.
                </AlertDescription>
              </Alert>
            </div>

            {/* Right Column - Model Selection & Results */}
            <div className="space-y-6">
              {/* Model Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Gemini Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GEMINI_MODELS.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Results */}
              {result && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="generated-title">Generated Title</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.title, 'title')}
                          className="h-8 px-2"
                        >
                          {copiedTitle ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Input
                        id="generated-title"
                        value={result.title}
                        readOnly
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="generated-keywords">Generated Keywords ({result.keywords.length})</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.keywords.join(', '), 'keywords')}
                          className="h-8 px-2"
                        >
                          {copiedKeywords ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Textarea
                        id="generated-keywords"
                        value={result.keywords.join(', ')}
                        readOnly
                        className="mt-1 min-h-32"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ImageTitleKeyword
