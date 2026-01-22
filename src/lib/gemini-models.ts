export interface GeminiModel {
  value: string
  label: string
  description: string
}

export const GEMINI_MODELS: GeminiModel[] = [
  // Gemini 3 - Latest Preview
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview 🆕", description: "Model terbaru - preview version" },
  
  // Gemini 2.5
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash ⚡", description: "Balance optimal - cepat & akurat" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite 🚀 (Default)", description: "Tercepat & terhemat" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro 🎯", description: "Paling powerful untuk analisis kompleks" },
]

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite"
