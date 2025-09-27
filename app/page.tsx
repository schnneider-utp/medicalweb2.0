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

export default function Home() {
  const [apiKey, setApiKey] = useState("")
  const [isApiKeySet, setIsApiKeySet] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [error, setError] = useState<string | null>(null)
  const [imageQuality, setImageQuality] = useState<any>(null)

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
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setImageQuality(null)
    }
  }

  const handleAnalyzeImage = async () => {
    if (!selectedImage || !isApiKeySet) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (selectedImage.size > maxSize) {
      setError("La imagen es demasiado grande. Máximo 10MB.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("apiKey", apiKey)
      formData.append("image", selectedImage)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al analizar la imagen")
      }

      setAnalysis(data.analysis)
      setImageQuality(data.imageQuality)

      await fetch("/api/chat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysis: data.analysis }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
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
      setError(err instanceof Error ? err.message : "Error desconocido")
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
          <Zap className="w-5 h-5 text-yellow-400" title="Análisis Mejorado" />
          <Shield className="w-5 h-5 text-green-400" title="Validación Avanzada" />
          <Activity className="w-5 h-5 text-blue-400" title="Calidad Optimizada" />
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
                placeholder="Ingresa tu Google API Key"
                className="w-full p-3 border-0 rounded-lg shadow-inner focus:ring-2 focus:ring-opacity-50 transition-all duration-300 bg-white text-black"
              />
            </div>
            <button
              onClick={handleApiKeySubmit}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg medical-bg-secondary text-black"
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
              Subir Imagen Médica
            </h2>

            <div className="mb-6">
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg medical-bg-secondary text-black"
              >
                <FileImage className="w-4 h-4" />
                Seleccionar Imagen
              </button>
            </div>

            {imagePreview && (
              <div className="mt-4 relative aspect-square w-full overflow-hidden rounded-lg border-4 border-gray-400">
                <Image src={imagePreview || "/placeholder.svg"} alt="Vista previa" fill className="object-contain" />
              </div>
            )}

            {imageQuality && (
              <div className="mt-4 p-3 rounded-lg bg-gray-800/30">
                <h4 className="text-sm font-medium medical-text-light mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Calidad de Imagen: {imageQuality.quality.toUpperCase()}
                </h4>
                {imageQuality.issues.length > 0 && (
                  <div className="text-xs text-yellow-300">
                    {imageQuality.issues.map((issue: string, idx: number) => (
                      <div key={idx}>• {issue}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleAnalyzeImage}
              disabled={!selectedImage || isAnalyzing}
              className={`mt-6 w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                !selectedImage || isAnalyzing
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
                  Analizar Imagen
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-lg shadow-lg md:col-span-3 medical-bg-primary">
            <h2 className="text-xl font-semibold mb-4 medical-text-light flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              Resultados del Análisis
              {analysis && (
                <span className="ml-2 px-2 py-1 text-xs bg-green-600 text-white rounded-full">Análisis Mejorado</span>
              )}
            </h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-16 h-16 animate-spin text-white" />
                <p className="mt-6 text-lg medical-text-light">Analizando imagen médica con IA avanzada...</p>
                <p className="mt-2 text-sm text-gray-400">Procesando con algoritmos de última generación</p>
              </div>
            ) : analysis ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <MedicalTextRenderer text={analysis} showSections={true} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 rounded-lg bg-gray-800/20">
                <p className="medical-text-light">Los resultados del análisis aparecerán aquí</p>
                <p className="mt-2 text-sm text-gray-400">Sube una imagen médica y haz clic en "Analizar Imagen"</p>
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

          <div className="h-96 overflow-y-auto p-4 bg-gray-900/20">
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
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br>") }} />
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
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center ${
                  !chatInput.trim() || isChatLoading
                    ? "opacity-50 cursor-not-allowed bg-gray-600"
                    : "hover:shadow-lg transform hover:scale-105 medical-bg-secondary text-black"
                }`}
              >
                {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="w-full max-w-7xl mx-auto mt-4 p-4 rounded-lg bg-red-900/20 border border-red-500">
          <p className="flex items-center gap-2 text-red-300">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </p>
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
