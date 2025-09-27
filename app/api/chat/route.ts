import { type NextRequest, NextResponse } from "next/server"
import { MedicalValidator } from "@/lib/medicalValidation"

let lastAnalysis: string | null = null

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey } = await request.json()

    if (!apiKey || !prompt) {
      return NextResponse.json({ error: "API Key y prompt son requeridos" }, { status: 400 })
    }

    const validation = MedicalValidator.validateMedicalContent(prompt)

    if (!validation.isMedical) {
      // Only return restricted response for truly non-medical content
      if (validation.context === "greeting") {
        const greetingResponse = MedicalValidator.formatMedicalResponse("", validation)
        return NextResponse.json({ response: greetingResponse })
      } else if (validation.context === "non_medical") {
        const restrictedResponse = MedicalValidator.formatMedicalResponse("", validation)
        return NextResponse.json({ response: restrictedResponse })
      }
      // For low-confidence medical content, proceed with medical response
    }

    // Construir el contexto con el análisis previo si existe
    let contextualPrompt = prompt
    if (lastAnalysis) {
      contextualPrompt = `Contexto del análisis previo: ${lastAnalysis}\n\nPregunta del usuario: ${prompt}`
    }

    const medicalChatPrompt = `Eres un asistente médico especializado por IA con un enfoque empático y educativo. Tu objetivo es proporcionar información médica confiable mientras mantienes un tono humano y comprensivo.

INSTRUCCIONES PARA RESPUESTAS EMPÁTICAS:

1. **Para preguntas sobre automedicación** (como "¿puedo automedicarme?"):
   - Reconoce la preocupación del usuario con empatía
   - Explica de manera educativa por qué la automedicación puede ser riesgosa
   - Ofrece alternativas seguras y pasos a seguir
   - Usa un tono comprensivo, no regañón

2. **Para consultas médicas generales**:
   - Sé cálido y profesional
   - Proporciona información clara y útil
   - Reconoce las preocupaciones del usuario
   - Ofrece orientación práctica

3. **Estructura tu respuesta cuando sea aplicable**:



### 📚 Información Médica
- Proporciona información educativa clara y precisa
- Explica conceptos médicos de manera comprensible
- Usa ejemplos cuando sea útil

### ⚠️ Consideraciones Importantes
- Explica riesgos de manera educativa, no alarmante
- Menciona cuándo es crucial buscar atención médica
- Proporciona alternativas seguras

### 🎯 Recomendaciones Prácticas
- Ofrece pasos concretos que puede seguir
- Sugiere recursos o profesionales apropiados
- Proporciona orientación sobre cuándo actuar

**TONO REQUERIDO**: Empático, educativo, profesional pero humano. Evita ser extremadamente restrictivo o usar frases como "solo recibo preguntas de medicina". En su lugar, guía al usuario hacia información útil.

**RECORDATORIO**: Siempre menciona que eres una IA y que la información debe ser validada por un médico profesional, pero hazlo de manera natural dentro de la conversación.

Pregunta del usuario: ${contextualPrompt}

Responde en español usando encabezados markdown claros. Sé empático, educativo y útil.`

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
                  text: medicalChatPrompt,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)
      throw new Error(errorData.error?.message || "Error en la API de Google")
    }

    const data = await response.json()
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar la respuesta"

    const responseValidation = MedicalValidator.validateMedicalContent(responseText)
    responseText = MedicalValidator.formatMedicalResponse(responseText, responseValidation)

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Error en chat:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { analysis } = await request.json()
    lastAnalysis = analysis
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error al guardar análisis" }, { status: 500 })
  }
}
