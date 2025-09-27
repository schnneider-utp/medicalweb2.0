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
      const restrictedResponse = MedicalValidator.formatMedicalResponse("", validation)
      return NextResponse.json({ response: restrictedResponse })
    }

    // Construir el contexto con el análisis previo si existe
    let contextualPrompt = prompt
    if (lastAnalysis) {
      contextualPrompt = `Contexto del análisis previo: ${lastAnalysis}\n\nPregunta del usuario: ${prompt}`
    }

    const medicalChatPrompt = `Eres un asistente médico especializado por IA. SOLO responde preguntas relacionadas con medicina y salud.

INSTRUCCIONES ESTRICTAS:
1. Si la pregunta NO es médica, responde: "Solo puedo ayudar con consultas médicas y de salud. Por favor, haz una pregunta relacionada con medicina."

2. Si ES médica, estructura tu respuesta siguiendo este formato cuando sea aplicable:

### Información Médica
- Proporciona información educativa clara y precisa
- Usa terminología médica apropiada con explicaciones simples

### Explicación para el Paciente
- Traduce conceptos médicos complejos a lenguaje comprensible
- Usa analogías cuando sea útil
- Aborda preocupaciones comunes

### Consideraciones Importantes
- Lista factores relevantes a considerar
- Menciona cuándo buscar atención médica
- Nota cualquier señal de alarma

### Contexto Adicional
- Proporciona información de apoyo relevante
- Menciona recursos adicionales cuando sea apropiado

RECORDATORIO OBLIGATORIO: Siempre menciona que eres una IA y que la información debe ser validada por un médico profesional. NO proporciones diagnósticos definitivos, solo información educativa.

Pregunta del usuario: ${contextualPrompt}

Responde en español usando encabezados markdown claros y puntos de viñeta. Sé profesional, educativo y completo.`

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
