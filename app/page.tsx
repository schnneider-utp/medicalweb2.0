"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { chatMetrics } from "@/lib/chatMetrics"
import AcceptanceMetrics from "./components/AcceptanceMetrics"
import MedicalTextRenderer from "@/components/MedicalTextRenderer"
import {
  Stethoscope,
  Settings,
  Upload,
  MessageCircle,
  FileImage,
  Search,
  Send,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Activity,
  Shield,
  Zap,
} from "lucide-react"

interface AnalysisResult {
  fileName: string
  analysis: string
  imagePreview: string
  imageQuality: any
}

export default function Home() {
  const [apiKey, setApiKey] = useState("")
  const [isApiKeySet, setIsApiKeySet] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setIsApiKeySet(true)
      localStorage.setItem("googleApiKey", apiKey)
    }
  }

  const handleResetApiKey = () => {
    setApiKey("")
    setIsApiKeySet(false)
    localStorage.removeItem("googleApiKey")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files])
    }
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setAnalysisResults((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAnalyzeImages = async () => {
    if (selectedImages.length === 0 || !isApiKeySet) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedImages = selectedImages.filter(img => img.size > maxSize)
    if (oversizedImages.length > 0) {
      setError(`${oversizedImages.length} imagen(es) exceden el límite de 10MB.`)
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("apiKey", apiKey)
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al analizar las imágenes")
      }

      // Crear resultados con previsualizaciones
      const newResults = await Promise.all(
        data.results.map(async (result: any, index: number) => {
          const preview = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.readAsDataURL(selectedImages[index])
          })

          return {
            fileName: result.fileName,
            analysis: result.analysis,
            imagePreview: preview,
            imageQuality: result.imageQuality,
          }
        })
      )

      setAnalysisResults(newResults)

      // Actualizar el contexto del chat con todos los análisis
      const analysisContext = newResults.map((result, index) => {
        return `Análisis de imagen ${index + 1} (${result.fileName}):\n${result.analysis}\n\nCalidad de imagen: ${result.imageQuality.quality}\n${
          result.imageQuality.issues.length > 0
            ? `Problemas detectados:\n${result.imageQuality.issues.join('\n')}`
            : 'No se detectaron problemas de calidad.'
        }\n---\n`
      }).join('\n')

      await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          analysis: analysisContext
        }),
      })

      // Agregar mensaje informativo al chat
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: `He analizado ${newResults.length} ${newResults.length === 1 ? 'imagen' : 'imágenes'} médica${newResults.length === 1 ? '' : 's'}. Puedes preguntarme sobre cualquier aspecto de los análisis realizados.`
        }
      ])

    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : "Error desconocido"
      
      // Manejo específico de errores de API key
      if (errorMessage === "API_KEY_EXPIRED") {
        errorMessage = "⚠️ Tu API key de Gemini ha expirado. Por favor, obtén una nueva API key y configúrala nuevamente."
        // Resetear la API key para forzar al usuario a configurar una nueva
        setIsApiKeySet(false)
        localStorage.removeItem("googleApiKey")
        setApiKey("")
      } else if (errorMessage === "API_KEY_INVALID") {
        errorMessage = "🔑 La API key proporcionada no es válida. Por favor, verifica que hayas copiado correctamente tu API key de Gemini."
        // Resetear la API key para forzar al usuario a configurar una nueva
        setIsApiKeySet(false)
        localStorage.removeItem("googleApiKey")
        setApiKey("")
      }
      
      setError(errorMessage)
      console.error("Error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !isApiKeySet) return

    setIsChatLoading(true)
    setError(null)

    const updatedHistory = [...chatHistory, { role: "user", content: chatInput }]
    setChatHistory(updatedHistory)

    chatMetrics.trackMessage(chatInput)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: chatInput,
          apiKey: apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error en el chat")
      }

      setChatHistory([...updatedHistory, { role: "assistant", content: data.response }])
      setChatInput("")

      chatMetrics.trackResponse(chatInput, true)
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : "Error desconocido"
      
      // Manejo específico de errores de API key
      if (errorMessage === "API_KEY_EXPIRED") {
        errorMessage = "⚠️ Tu API key de Gemini ha expirado. Por favor, obtén una nueva API key y configúrala nuevamente."
        // Resetear la API key para forzar al usuario a configurar una nueva
        setIsApiKeySet(false)
        localStorage.removeItem("googleApiKey")
        setApiKey("")
      } else if (errorMessage === "API_KEY_INVALID") {
        errorMessage = "🔑 La API key proporcionada no es válida. Por favor, verifica que hayas copiado correctamente tu API key de Gemini."
        // Resetear la API key para forzar al usuario a configurar una nueva
        setIsApiKeySet(false)
        localStorage.removeItem("googleApiKey")
        setApiKey("")
      }
      
      setError(errorMessage)
      console.error("Error:", err)
      chatMetrics.trackResponse(chatInput, false)
    } finally {
      setIsChatLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 medical-bg-dark">
      <h1 className="text-3xl font-bold mb-8 text-center medical-text-light flex items-center gap-3">
        <Stethoscope className="w-8 h-8" />
        Diagnóstico de Imágenes Médicas con IA
        <div className="flex gap-1 ml-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <Shield className="w-5 h-5 text-green-400" />
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
      </h1>

      <div className="w-full max-w-7xl mx-auto mb-8">
        <AcceptanceMetrics />
      </div>

      <div className="w-full max-w-7xl mx-auto mb-8 p-6 rounded-lg shadow-lg medical-bg-primary">
        <h2 className="text-xl font-semibold mb-4 medical-text-light flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración
        </h2>

        {!isApiKeySet ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu Google API Key (ej: AIzaSy...)"
                className="w-full p-3 border-0 rounded-lg shadow-inner focus:ring-2 focus:ring-opacity-50 transition-all duration-300 bg-white text-black"
              />
              {apiKey && apiKey.length < 30 && (
                <p className="mt-2 text-sm text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  La API key debe tener al menos 30 caracteres
                </p>
              )}
            </div>
            <button
              onClick={handleApiKeySubmit}
              disabled={!apiKey.trim() || apiKey.length < 30}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform ${
                apiKey.trim() && apiKey.length >= 30
                  ? "hover:scale-105 hover:shadow-lg medical-bg-secondary text-black"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              Guardar API Key
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-900/20">
            <span className="font-medium flex items-center gap-2 medical-text-light">
              <CheckCircle className="w-5 h-5 text-green-400" />
              API Key configurada correctamente
            </span>
            <button
              onClick={handleResetApiKey}
              className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-opacity-80 bg-gray-600 medical-text-light"
            >
              Cambiar API Key
            </button>
          </div>
        )}

        <p className="mt-4 mb-2 text-gray-300">
          Obtén tu API key desde{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline medical-text-light"
          >
            Google AI Studio
          </a>
        </p>
      </div>

      {isApiKeySet && (
        <div className="w-full max-w-7xl mx-auto mb-4">
          <div className="flex rounded-t-lg overflow-hidden medical-bg-primary">
            <button
              className={`px-6 py-3 font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "upload"
                  ? "medical-bg-secondary text-black"
                  : "medical-text-light opacity-70 hover:opacity-100"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              <Upload className="w-4 h-4" />
              Subir Imagen
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all duration-300 flex items-center gap-2 ${
                activeTab === "chat"
                  ? "medical-bg-secondary text-black"
                  : "medical-text-light opacity-70 hover:opacity-100"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageCircle className="w-4 h-4" />
              Chat Médico
            </button>
          </div>
        </div>
      )}

      {isApiKeySet && activeTab === "upload" && (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg shadow-lg md:col-span-1 medical-bg-primary">
            <h2 className="text-xl font-semibold mb-4 medical-text-light flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Subir Imágenes Médicas
            </h2>

            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg medical-bg-secondary text-black"
              >
                <FileImage className="w-4 h-4" />
                Seleccionar Imágenes
              </button>
            </div>

            <div className="space-y-4">
              {selectedImages.map((image, index) => (
                <div
                  key={image.name}
                  className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Vista previa ${image.name}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-sm truncate">
                    {image.name}
                  </div>
                  {analysisResults[index]?.imageQuality && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Calidad: {analysisResults[index].imageQuality.quality}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleAnalyzeImages}
              disabled={selectedImages.length === 0 || isAnalyzing}
              className={`mt-6 w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                selectedImages.length === 0 || isAnalyzing
                  ? "opacity-50 cursor-not-allowed bg-gray-600"
                  : "hover:shadow-lg transform hover:scale-105 bg-white text-black"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analizar Imágenes
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-lg shadow-lg md:col-span-3 medical-bg-primary">
            <h2 className="text-xl font-semibold mb-4 medical-text-light flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              Resultados del Análisis
              {analysisResults.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                  {analysisResults.length} {analysisResults.length === 1 ? 'Análisis' : 'Análisis'}
                </span>
              )}
            </h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-16 h-16 animate-spin text-white" />
                <p className="mt-6 text-lg medical-text-light">Analizando imágenes médicas con IA avanzada...</p>
                <p className="mt-2 text-sm text-gray-400">Procesando con algoritmos de última generación</p>
              </div>
            ) : analysisResults.length > 0 ? (
              <div className="space-y-8">
                {analysisResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Análisis de {result.fileName}
                    </h3>
                    <MedicalTextRenderer text={result.analysis} showSections={true} />
                    {result.imageQuality && (
                      <div className="mt-4 p-3 rounded-lg bg-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Calidad de Imagen: {result.imageQuality.quality}
                        </h4>
                        {result.imageQuality.issues.length > 0 && (
                          <div className="text-xs text-yellow-600">
                            {result.imageQuality.issues.map((issue: string, idx: number) => (
                              <div key={idx}>• {issue}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 rounded-lg bg-gray-800/20">
                <p className="medical-text-light">Los resultados del análisis aparecerán aquí</p>
                <p className="mt-2 text-sm text-gray-400">
                  Sube una o más imágenes médicas y haz clic en "Analizar Imágenes"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isApiKeySet && activeTab === "chat" && (
        <div className="w-full max-w-7xl mx-auto rounded-lg shadow-lg overflow-hidden medical-bg-primary">
          <div className="p-4 border-b border-gray-600">
            <h2 className="text-xl font-semibold medical-text-light flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat con Asistente Médico
            </h2>
            <p className="text-gray-300">Haz preguntas sobre los análisis de imágenes o consultas médicas generales</p>
          </div>

          <div className="h-[650px] overflow-y-auto p-4 bg-gray-900/20">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>Inicia una conversación con el asistente médico</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] shadow-md ${
                      msg.role === "user"
                        ? "medical-bg-secondary text-black rounded-tr-none"
                        : "bg-white text-black rounded-tl-none"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <MedicalTextRenderer text={msg.content} showSections={false} />
                    ) : (
                      <div className="break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br>") }} />
                    )}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start mb-4">
                <div className="p-3 rounded-lg rounded-tl-none shadow-md bg-gray-600">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-600">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <textarea
                  value={chatInput}
                  onChange={(e) => {
                    if (e.target.value.length <= 1200) {
                      setChatInput(e.target.value)
                      // Ajustar altura automáticamente
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (chatInput.trim() && !isChatLoading) {
                        handleChatSubmit(e as any);
                      }
                    }
                  }}
                  placeholder="Escribe tu pregunta aquí... (máximo 1200 caracteres)."
                  className="flex-1 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 transition-all duration-300 resize-none overflow-hidden min-h-[48px] max-h-[120px]"
                  disabled={isChatLoading}
                  maxLength={1200}
                  rows={1}
                  style={{ height: '48px' }}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center h-[48px] ${
                    !chatInput.trim() || isChatLoading
                      ? "opacity-50 cursor-not-allowed bg-gray-600"
                      : "hover:shadow-lg transform hover:scale-105 medical-bg-secondary text-black"
                  }`}
                >
                  {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-sm text-gray-400 flex justify-end">
                {chatInput.length}/1200 caracteres
              </div>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className={`w-full max-w-7xl mx-auto mt-4 p-4 rounded-lg border ${
          error.includes("API key") 
            ? "bg-amber-900/20 border-amber-500" 
            : "bg-red-900/20 border-red-500"
        }`}>
          <p className={`flex items-center gap-2 ${
            error.includes("API key") 
              ? "text-amber-300" 
              : "text-red-300"
          }`}>
            <AlertTriangle className="w-5 h-5" />
            {error}
          </p>
          {error.includes("API key") && (
            <div className="mt-3 p-3 bg-amber-800/20 rounded border border-amber-600">
              <p className="text-amber-200 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <strong>Solución:</strong> Obtén una nueva API key desde{" "}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-100"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      <footer className="mt-12 text-center text-sm">
        <p className="mb-2 medical-text-light flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          AVISO: Esta herramienta es solo para fines educativos e informativos. Todos los análisis deben ser revisados
          por profesionales de la salud calificados.
        </p>
        <p className="medical-text-light">No tome decisiones médicas basadas únicamente en este análisis.</p>
      </footer>
    </main>
  )
}
