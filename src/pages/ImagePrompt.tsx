import { useState, useRef, useEffect } from "react"
import { Camera, Upload, Sparkles, Copy, Check } from "lucide-react"
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
import { useLocation } from "react-router-dom"

const GEMINI_MODELS = [
  { value: "gemini-1.5-flash-latest", label: "gemini-1.5-flash-latest" },
  { value: "gemini-2.0-flash", label: "gemini-2.0-flash" },
  { value: "gemini-2.5-flash", label: "gemini-2.5-flash" }
]

const ImagePrompt = () => {
  const location = useLocation()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  // SEO Configuration
  useSEO({
    title: "Image to Prompt AI - Generate AI Art Prompts | ImgKey606",
    description: "Upload an image to generate detailed text-to-image prompts for AI art creation. Perfect for Midjourney, DALL-E, Stable Diffusion, and other AI image generators. Powered by Google Gemini AI.",
    keywords: "image to prompt, AI art prompts, text to image, AI image generation, Midjourney prompts, DALL-E prompts, Stable Diffusion, AI art creation, prompt engineering, Google Gemini AI",
    canonical: "https://imgkey.lovable.app/image-prompt"
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini-api-key") || "")
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash")
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image URL from location state (from Image Inspire page)
  useEffect(() => {
    const imageUrl = location.state?.imageUrl
    if (imageUrl) {
      setImagePreview(imageUrl)
      // Create a fake file object for the URL image
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'inspired-image.jpg', { type: 'image/jpeg' })
          setSelectedImage(file)
        })
        .catch(err => {
          console.error('Failed to load image from URL:', err)
          toast.error("Failed to load the inspired image")
        })
    }
  }, [location.state])

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem("gemini-api-key", value)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
      toast.success("Prompt copied to clipboard!")
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

  const generateImagePrompt = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first")
      return
    }

    if (!apiKey.trim()) {
      toast.error("Please enter your Gemini API key")
      return
    }

    setIsLoading(true)
    setPrompt(null)

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
                text: "You are an expert AI image prompt generator specializing in creating precise, technical descriptions for text-to-image AI models. Analyze this image and generate a highly detailed prompt that captures all visual elements necessary for accurate reproduction.\n\nFocus on these core elements in order of importance:\n1. Main subject and secondary subjects\n2. Visual style and artistic technique (photorealistic, digital art, painting, etc.)\n3. Materials, textures, and surface properties\n4. Lighting setup, direction, and quality (natural, studio, dramatic, soft, etc.)\n5. Color palette, saturation, and tone\n6. Composition, camera angle, and framing\n7. Background and environment details\n8. Technical quality indicators (sharp focus, depth of field, resolution)\n\nStructure your response as a single, cohesive prompt using comma-separated descriptive phrases. Use precise technical art vocabulary and avoid subjective interpretations or storytelling elements. Focus exclusively on reproducible visual characteristics.\n\nOutput format: Start directly with the visual description as a continuous prompt without any introductory text, explanations, or formatting."
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
        const generatedPrompt = data.candidates[0].content.parts[0].text.trim()
        setPrompt(generatedPrompt)
        toast.success("Image prompt generated successfully!")
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (error) {
      console.error('Error generating image prompt:', error)
      toast.error("Failed to generate image prompt. Please check your API key and try again.")
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
                Image to Prompt AI
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Upload an image to generate a detailed text-to-image prompt using AI
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
                    onClick={generateImagePrompt}
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
                        Generate Image Prompt
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
                  <div>
                    <Input
                      type="password"
                      placeholder="Enter your Gemini API key"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                    />
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
              {prompt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Image Prompt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="generated-prompt">AI Image Prompt</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(prompt)}
                          className="h-8 px-2"
                        >
                          {copiedPrompt ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Textarea
                        id="generated-prompt"
                        value={prompt}
                        readOnly
                        className="mt-1 min-h-40"
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

export default ImagePrompt