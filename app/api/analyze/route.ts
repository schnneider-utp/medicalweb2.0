import { type NextRequest, NextResponse } from "next/server"
import { MedicalValidator } from "@/lib/medicalValidation"
import { ImageCompressor } from "@/lib/imageCompression"
import { EnhancedMedicalAnalysis } from "@/lib/enhancedMedicalAnalysis"
import { MedicalWebSearch } from "@/lib/webSearch"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const apiKey = formData.get("apiKey") as string
    const images = formData.getAll("images") as File[]

    if (!apiKey || !images.length) {
      return NextResponse.json({ error: "API Key e imágenes son requeridos" }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB limit per image
    const oversizedImages = images.filter(img => img.size > maxSize)
    if (oversizedImages.length > 0) {
      return NextResponse.json({ 
        error: `${oversizedImages.length} imagen(es) exceden el límite de 10MB.`,
        oversizedImages: oversizedImages.map(img => img.name)
      }, { status: 400 })
    }

    console.log(`[v0] Processing ${images.length} images`)

    const processImage = async (image: File) => {
      console.log("[v0] Processing image:", image.name, "Size:", image.size, "Type:", image.type)
      
      let base64: string
      try {
        const bytes = await image.arrayBuffer()

        if (image.size > 400 * 1024) {
          console.log("[v0] Compressing image for optimal analysis...")
          try {
            base64 = await ImageCompressor.compressImageServer(bytes, image.type, 400)
            console.log("[v0] Image compressed successfully to 400KB target")
          } catch (error) {
            console.log("[v0] 400KB compression failed, trying 300KB...")
            try {
              base64 = await ImageCompressor.compressImageServer(bytes, image.type, 300)
              console.log("[v0] Image compressed successfully to 300KB target")
            } catch (error2) {
              console.log("[v0] 300KB compression failed, trying 200KB...")
              base64 = await ImageCompressor.compressImageServer(bytes, image.type, 200)
              console.log("[v0] Image compressed successfully to 200KB target")
            }
          }
        } else {
          base64 = Buffer.from(bytes).toString("base64")
          console.log("[v0] Image quality sufficient, using original")
        }

        const qualityAssessment = await EnhancedMedicalAnalysis.analyzeImageQuality(base64, image.type)
        console.log("[v0] Image quality assessment:", qualityAssessment)

        try {
          Buffer.from(base64, "base64")
          const sizeKB = (base64.length * 3) / 4 / 1024
          console.log(`[v0] Final image size: ${Math.round(sizeKB)}KB, Quality: ${qualityAssessment.quality}`)
        } catch (validationError) {
          console.error("[v0] Base64 validation failed:", validationError)
          throw new Error(`Imagen ${image.name} corrupta después de la compresión`)
        }

        console.log("[v0] Making request to Gemini API with enhanced prompt...")
        const medicalPrompt = EnhancedMedicalAnalysis.generateComprehensivePrompt()

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: medicalPrompt,
                    },
                    {
                      inline_data: {
                        mime_type: image.type,
                        data: base64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              },
            }),
          },
        )

        console.log("[v0] Gemini API response status:", response.status)
        const contentType = response.headers.get("content-type")
        console.log("[v0] Response content-type:", contentType)

        if (!response.ok) {
          let errorMessage = "Error en la API de Google"

          try {
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json()
              console.error("[v0] Gemini API JSON error:", errorData)
              errorMessage = errorData.error?.message || errorMessage

              // Manejo específico de errores de API key
              if (errorMessage.includes("API key expired") || errorMessage.includes("expired")) {
                errorMessage = "API_KEY_EXPIRED"
              } else if (errorMessage.includes("API key not valid") || errorMessage.includes("invalid") && errorMessage.includes("key")) {
                errorMessage = "API_KEY_INVALID"
              } else if (errorMessage.includes("Provided image is not valid") || errorMessage.includes("invalid")) {
                errorMessage = `La imagen ${image.name} no pudo ser procesada. Intenta con una imagen diferente o verifica que sea un archivo de imagen válido.`
              }
            } else {
              const errorText = await response.text()
              console.error("[v0] Gemini API non-JSON error:", errorText)

              if (response.status === 413) {
                errorMessage = `La imagen ${image.name} es demasiado grande para procesar`
              } else if (response.status === 400) {
                errorMessage = `Solicitud inválida. La imagen ${image.name} podría estar corrupta o ser demasiado grande`
              } else if (response.status === 403) {
                errorMessage = "API_KEY_INVALID"
              } else if (response.status === 429) {
                errorMessage = "Límite de solicitudes excedido. Intenta más tarde"
              } else {
                errorMessage = `Error del servidor (${response.status}): ${errorText.substring(0, 100)}`
              }
            }
          } catch (parseError) {
            console.error("[v0] Error parsing error response:", parseError)
            errorMessage = `Error del servidor (${response.status})`
          }

          throw new Error(errorMessage)
        }

        if (!contentType || !contentType.includes("application/json")) {
          const responseText = await response.text()
          console.error("[v0] Expected JSON but got:", contentType, "Response:", responseText.substring(0, 200))

          if (responseText.toLowerCase().includes("request entity too large")) {
            throw new Error(`La imagen ${image.name} es demasiado grande para procesar. Intenta con una imagen más pequeña.`)
          } else if (responseText.toLowerCase().includes("bad request")) {
            throw new Error("Solicitud inválida. Verifica tu API Key y que la imagen sea válida.")
          } else {
            throw new Error("La API de Google devolvió una respuesta inválida. Intenta nuevamente.")
          }
        }

        let data
        try {
          data = await response.json()
          console.log("[v0] Gemini API success response received")
        } catch (jsonError) {
          console.error("[v0] Error parsing success response as JSON:", jsonError)
          throw new Error("Respuesta inválida de la API de Google")
        }

        let analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar el análisis"
        analysis = EnhancedMedicalAnalysis.formatAnalysisWithQuality(analysis, qualityAssessment)

        try {
          const conditionMatches = analysis.match(/diagnóstico[^:]*:\s*([^.\n]+)/i)
          if (conditionMatches && conditionMatches[1]) {
            const condition = conditionMatches[1].trim()
            const researchContext = await MedicalWebSearch.getRecentMedicalAdvances(condition)
            analysis += "\n\n" + researchContext
          }
        } catch (searchError) {
          console.log("[v0] Could not add research context:", searchError)
        }

        const validation = MedicalValidator.validateMedicalContent(analysis)
        const formattedAnalysis = MedicalValidator.formatMedicalResponse(analysis, validation)

        console.log("[v0] Enhanced medical validation result:", validation)

        return {
          fileName: image.name,
          analysis: formattedAnalysis,
          validation: {
            isMedical: validation.isMedical,
            confidence: validation.confidence,
            warnings: validation.warnings,
          },
          imageQuality: qualityAssessment,
        }

      } catch (compressionError) {
        console.error(`[v0] Processing failed for image ${image.name}:`, compressionError)
        return {
          fileName: image.name,
          error: compressionError instanceof Error ? compressionError.message : "Error al procesar la imagen",
        }
      }
    }

    // Procesar todas las imágenes en paralelo
    const results = await Promise.all(images.map(processImage))

    return NextResponse.json({
      results: results,
      totalImages: images.length,
      successfulAnalyses: results.filter(r => !r.error).length,
    })

  } catch (error) {
    console.error("[v0] Error en análisis:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 },
    )
  }
}
