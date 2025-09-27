export interface MedicalValidationResult {
  isMedical: boolean
  confidence: number
  warnings: string[]
  aiDisclaimer: string
  context?: "self_medication" | "general_health" | "symptoms" | "non_medical" | "greeting"
}

export class MedicalValidator {
  static validateMedicalContent(text: string): MedicalValidationResult {
    const lowerText = text.toLowerCase()

    const greetingKeywords = ["hola", "buenos días", "buenas tardes", "buenas noches", "saludos", "hello", "hi", "hey"]

    const selfMedicationKeywords = [
      "automedicarme",
      "automedico",
      "puedo tomar",
      "me tomo",
      "sin receta",
      "por mi cuenta",
      "sin médico",
      "me automedico",
      "tomar pastillas",
      "qué pastilla",
      "qué medicamento",
      "me doy",
      "me pongo",
    ]

    const generalHealthKeywords = [
      "síntomas",
      "dolor",
      "malestar",
      "enfermedad",
      "salud",
      "medicina",
      "tratamiento",
      "diagnóstico",
      "médico",
      "hospital",
      "clínica",
      "análisis",
      "analisis", // without accent
      "examen",
      "radiografía",
      "sangre",
      "presión",
      "resultados",
      "resultado",
      "imagen médica",
      "imagen medica",
      "estudio",
      "estudios",
      "informe",
      "reporte",
      "interpretación",
      "interpretacion",
      "explicame",
      "explica",
      "qué significa",
      "que significa",
      "qué indica",
      "que indica",
      "hallazgos",
      "hallazgo",
      "patología",
      "patologia",
      "anomalía",
      "anomalia",
      "normal",
      "anormal",
      "lesión",
      "lesion",
    ]

    const nonMedicalIndicators = [
      "no parece ser de naturaleza médica",
      "no es médica",
      "no es una imagen médica",
      "not a medical image",
      "not medical",
      "no medical content",
    ]

    const isSimpleGreeting = greetingKeywords.some((keyword) => {
      const words = lowerText.trim().split(/\s+/)
      return words.length <= 3 && words.some((word) => word.includes(keyword))
    })

    const hasNonMedicalIndicator = nonMedicalIndicators.some((indicator) => lowerText.includes(indicator))
    const hasSelfMedicationContext = selfMedicationKeywords.some((keyword) => lowerText.includes(keyword))
    const hasGeneralHealthContext = generalHealthKeywords.some((keyword) => lowerText.includes(keyword))

    const hasAnalysisContext = [
      "resultados del análisis",
      "resultados del analisis",
      "análisis médico",
      "analisis medico",
      "imagen que analizo",
      "imagen analizada",
      "estudio que hice",
      "examen que me hice",
      "interpretación de",
      "interpretacion de",
      "qué significa esto",
      "que significa esto",
      "explicame sobre",
      "explícame sobre",
    ].some((phrase) => lowerText.includes(phrase))

    if (isSimpleGreeting && !hasGeneralHealthContext && !hasSelfMedicationContext) {
      return {
        isMedical: false,
        confidence: 0.1,
        warnings: [],
        context: "greeting",
        aiDisclaimer: "",
      }
    }

    if (hasNonMedicalIndicator) {
      return {
        isMedical: false,
        confidence: 0.1,
        warnings: ["El contenido no parece ser de naturaleza médica"],
        context: "non_medical",
        aiDisclaimer: `🤖 IMPORTANTE: Este análisis fue generado por Inteligencia Artificial y NO sustituye el criterio médico profesional. Siempre consulte con un médico calificado para obtener un diagnóstico y tratamiento adecuados.`,
      }
    }

    let context: "self_medication" | "general_health" | "symptoms" | "non_medical" | "greeting" = "general_health"
    if (isSimpleGreeting) {
      context = "greeting"
    } else if (hasSelfMedicationContext) {
      context = "self_medication"
    } else if (hasGeneralHealthContext || hasAnalysisContext) {
      context = "general_health"
    }

    const isMedical = hasSelfMedicationContext || hasGeneralHealthContext || hasAnalysisContext
    const confidence = isMedical ? 0.8 : 0.2

    const warnings: string[] = []

    const aiDisclaimer = `🤖 IMPORTANTE: Este análisis fue generado por Inteligencia Artificial y NO sustituye el criterio médico profesional. Siempre consulte con un médico calificado para obtener un diagnóstico y tratamiento adecuados.`

    console.log("[v0] Medical validation debug:", {
      isMedical,
      confidence,
      context,
      hasNonMedicalIndicator,
      hasSelfMedicationContext,
      hasGeneralHealthContext,
      hasAnalysisContext,
    })

    return {
      isMedical,
      confidence,
      warnings,
      context,
      aiDisclaimer,
    }
  }

  static formatMedicalResponse(text: string, validation: MedicalValidationResult): string {
    if (validation.context === "greeting") {
      return `¡Hola! 👋 Soy tu asistente médico especializado por IA. 

Estoy aquí para ayudarte con consultas relacionadas con salud y medicina. Puedo asistirte con:

• 🩺 Información sobre síntomas y condiciones médicas
• 💊 Orientación sobre tratamientos (siempre consulta con tu médico)
• 🏥 Recomendaciones sobre cuándo buscar atención médica
• 📋 Explicaciones sobre análisis y estudios médicos
• ❓ Respuestas a dudas generales de salud

¿En qué puedo ayudarte hoy?`
    }

    if (!validation.isMedical && validation.confidence < 0.3) {
      if (validation.context === "non_medical") {
        return `Hola! Entiendo que tienes una consulta, pero parece que no está relacionada con medicina o salud. 

Soy un asistente especializado en temas médicos y mi objetivo es brindarte información confiable sobre salud. Si tienes alguna pregunta sobre síntomas, tratamientos, o cualquier tema de salud, estaré encantado de ayudarte.

¿Hay algo relacionado con tu salud en lo que pueda asistirte?

---

${validation.aiDisclaimer}`
      }
    }

    return `${text}\n\n---\n\n${validation.aiDisclaimer}`
  }
}
