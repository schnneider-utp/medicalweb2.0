export interface MedicalValidationResult {
  isMedical: boolean
  confidence: number
  warnings: string[]
  aiDisclaimer: string
}

export class MedicalValidator {
  static validateMedicalContent(text: string): MedicalValidationResult {
    const lowerText = text.toLowerCase()

    // Check if the response indicates it's not a medical image
    const nonMedicalIndicators = [
      "no parece ser de naturaleza médica",
      "no es médica",
      "no es una imagen médica",
      "not a medical image",
      "not medical",
      "no medical content",
    ]

    const hasNonMedicalIndicator = nonMedicalIndicators.some((indicator) => lowerText.includes(indicator))

    // If AI explicitly says it's not medical, respect that
    if (hasNonMedicalIndicator) {
      return {
        isMedical: false,
        confidence: 0.1,
        warnings: ["El contenido no parece ser de naturaleza médica"],
        aiDisclaimer: `🤖 IMPORTANTE: Este análisis fue generado por Inteligencia Artificial y NO sustituye el criterio médico profesional. Siempre consulte con un médico calificado para obtener un diagnóstico y tratamiento adecuados.`,
      }
    }

    // Otherwise, assume it's medical content since user uploaded to medical system
    const isMedical = true
    const confidence = 0.8

    const warnings: string[] = []

    // Disclaimer obligatorio de IA
    const aiDisclaimer = `🤖 IMPORTANTE: Este análisis fue generado por Inteligencia Artificial y NO sustituye el criterio médico profesional. Siempre consulte con un médico calificado para obtener un diagnóstico y tratamiento adecuados.`

    console.log("[v0] Medical validation debug:", {
      isMedical,
      confidence,
      hasNonMedicalIndicator,
    })

    return {
      isMedical,
      confidence,
      warnings,
      aiDisclaimer,
    }
  }

  static formatMedicalResponse(text: string, validation: MedicalValidationResult): string {
    if (!validation.isMedical && validation.confidence < 0.2) {
      return `❌ Lo siento, solo puedo ayudar con consultas médicas. Tu pregunta no parece estar relacionada con medicina o salud.\n\n${validation.aiDisclaimer}`
    }

    return `${text}\n\n---\n\n${validation.aiDisclaimer}`
  }
}
