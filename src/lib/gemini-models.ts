export interface GeminiModel {
  value: string
  label: string
  description: string
}

export const GEMINI_MODELS: GeminiModel[] = [
  // Gemini 2.5 - Latest & Recommended
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash ⚡ (Recommended)", description: "Balance optimal - cepat & akurat" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro 🎯", description: "Paling powerful untuk analisis kompleks" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite 🚀", description: "Tercepat & terhemat" },
  
  // Gemini 2.0
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Model stabil generasi sebelumnya" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", description: "Versi ringan & hemat" },
]

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
