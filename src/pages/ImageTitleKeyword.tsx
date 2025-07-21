import { useState, useRef } from "react"
import { Camera, Upload, Sparkles, ChevronDown } from "lucide-react"
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
  { value: "gemini-1.5-flash-latest", label: "gemini-1.5-flash-latest" },
  { value: "gemini-2.0-flash", label: "gemini-2.0-flash" },
  { value: "gemini-2.5-flash", label: "gemini-2.5-flash" }
]

interface AnalysisResult {
  title: string
  keywords: string[]
}

const ImageTitleKeyword = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini-api-key") || "")
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (query: string) => {
    console.log('Search query:', query)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    localStorage.setItem("gemini-api-key", value)
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
                text: "Analyze this image and provide:\n1. A descriptive title (max 100 characters)\n2. Exactly 50 relevant keywords separated by commas\n\nFormat your response as:\nTitle: [your title here]\nKeywords: [keyword1, keyword2, keyword3, ...]"
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
        
        // Parse the response
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
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (error) {
      console.error('Error generating title and keywords:', error)
      toast.error("Failed to generate title and keywords. Please check your API key and try again.")
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Upload */}
            <div className="lg:col-span-2">
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

                  {/* Results */}
                  {result && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="generated-title">Generated Title</Label>
                        <Input
                          id="generated-title"
                          value={result.title}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="generated-keywords">Generated Keywords ({result.keywords.length})</Label>
                        <Textarea
                          id="generated-keywords"
                          value={result.keywords.join(', ')}
                          readOnly
                          className="mt-1 min-h-32"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-6">
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

              {/* Info */}
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Your API key is stored locally in your browser and never shared with our servers.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ImageTitleKeyword