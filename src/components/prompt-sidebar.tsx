import { useState, useRef, useEffect } from "react"
import { Camera, Upload, Sparkles, Copy, Check, X, ChevronLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const GEMINI_MODELS = [
  // Gemini 2.5 - Latest & Recommended
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash ⚡ (Recommended)", description: "Balance optimal - cepat & akurat" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro 🎯", description: "Paling powerful untuk analisis kompleks" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite 🚀", description: "Tercepat & terhemat" },
  
  // Gemini 2.0
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)", description: "Fitur cutting-edge" },
  
  // Gemini 1.5 - Stable & Production Ready
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Stabil & cepat" },
  { value: "gemini-1.5-flash-8b", label: "Gemini 1.5 Flash-8B", description: "Ultra cepat" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Analisis mendalam" },
  { value: "gemini-1.5-pro-002", label: "Gemini 1.5 Pro-002", description: "Versi stabil terbaru" },
]

interface PromptSidebarProps {
  isOpen: boolean
  onClose: () => void
  imageUrl?: string
}

export const PromptSidebar = ({ isOpen, onClose, imageUrl }: PromptSidebarProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(imageUrl || null)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini-api-key") || "")
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash")
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update image when imageUrl prop changes
  useEffect(() => {
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
  }, [imageUrl])

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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">AI Prompt Generator</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Camera className="h-4 w-4" />
                Image
              </div>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
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
                    <div className="space-y-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-32 mx-auto rounded shadow-sm"
                      />
                      <Button variant="outline" size="sm" className="text-xs">
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Drop image here</p>
                        <p className="text-xs text-muted-foreground">or click to select</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateImagePrompt}
              disabled={!selectedImage || !apiKey.trim() || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Prompt
                </>
              )}
            </Button>

            {/* Generated Prompt */}
            {prompt && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="generated-prompt" className="text-sm font-medium">Generated Prompt</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(prompt)}
                    className="h-6 px-2"
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
                  className="min-h-32 text-xs"
                />
              </div>
            )}

            {/* Model Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gemini Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GEMINI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value} className="text-sm">
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* API Key */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gemini API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="text-sm pr-10"
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
              <p className="text-xs text-muted-foreground">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get your API key here
                </a>
              </p>
            </div>

            {/* Info */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Your API key is stored locally and never shared with our servers.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </>
  )
}