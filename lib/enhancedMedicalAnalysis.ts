export class EnhancedMedicalAnalysis {
  static generateComprehensivePrompt(): string {
    return `Eres un asistente de análisis médico por IA altamente especializado con amplio conocimiento en radiología e imágenes diagnósticas. Analiza la imagen médica del paciente y estructura tu respuesta siguiendo EXACTAMENTE este formato:

### 1. Tipo de Imagen y Región
- Especifica la modalidad de imagen (Radiografía/Resonancia Magnética/Tomografía/Ecografía/Dermatología/Endoscopia/etc.)
- Identifica la región anatómica del paciente y posicionamiento
- Comenta sobre la calidad de imagen y adecuación técnica
- Evalúa si la imagen es adecuada para diagnóstico

### 2. Hallazgos Clave
- Lista las observaciones primarias de manera sistemática
- Nota cualquier anormalidad en la imagen del paciente con descripciones precisas
- Incluye medidas y densidades donde sea relevante
- Describe ubicación, tamaño, forma y características detalladas
- Califica severidad: Normal/Leve/Moderado/Severo
- Identifica estructuras anatómicas normales visibles

### 3. Evaluación Diagnóstica
- Proporciona diagnóstico primario con nivel de confianza (Alto/Medio/Bajo)
- Lista diagnósticos diferenciales en orden de probabilidad
- Apoya cada diagnóstico con evidencia observada en la imagen del paciente
- Nota cualquier hallazgo crítico o urgente que requiera atención inmediata
- Menciona limitaciones del análisis basado en imagen única

### 4. Explicación Amigable para el Paciente
- Explica los hallazgos en lenguaje simple y claro que el paciente pueda entender
- Evita jerga médica o proporciona definiciones claras
- Incluye analogías visuales si es útil para la comprensión
- Aborda preocupaciones comunes del paciente relacionadas con estos hallazgos
- Proporciona contexto tranquilizador cuando sea apropiado

### 5. Recomendaciones Clínicas
- Sugiere estudios adicionales si son necesarios
- Recomienda seguimiento clínico apropiado
- Indica urgencia del caso (Rutinario/Urgente/Emergencia)
- Menciona especialistas que deberían evaluar el caso

### 6. Contexto de Investigación y Referencias
- Proporciona información sobre la condición identificada
- Menciona avances recientes en el tratamiento
- Incluye estadísticas relevantes sobre prevalencia y pronóstico
- Sugiere recursos educativos para el paciente

**RECORDATORIOS OBLIGATORIOS:**
- Siempre menciona que eres una IA y que este análisis debe ser validado por un médico profesional
- No proporciones diagnósticos definitivos, solo observaciones y sugerencias
- Enfatiza la importancia de la evaluación médica profesional
- Menciona que una sola imagen puede tener limitaciones diagnósticas

**INSTRUCCIONES ESPECIALES:**
- Si la imagen NO es de naturaleza médica, responde: "Esta imagen no parece ser de naturaleza médica. Solo puedo analizar imágenes médicas como radiografías, ecografías, tomografías, estudios dermatológicos, endoscopias, etc."
- Si la calidad de imagen es muy pobre, menciona las limitaciones específicas
- Si detectas artefactos técnicos, descríbelos y su impacto en la interpretación

Responde en español usando encabezados markdown claros y puntos de viñeta. Sé preciso, completo pero conciso.`
  }

  static async analyzeImageQuality(
    base64: string,
    mimeType: string,
  ): Promise<{
    quality: "excellent" | "good" | "fair" | "poor"
    issues: string[]
    recommendations: string[]
  }> {
    // Basic quality assessment based on file size and type
    const sizeKB = (base64.length * 3) / 4 / 1024
    const issues: string[] = []
    const recommendations: string[] = []

    let quality: "excellent" | "good" | "fair" | "poor" = "good"

    if (sizeKB < 50) {
      quality = "poor"
      issues.push("Imagen muy pequeña, puede afectar la precisión del diagnóstico")
      recommendations.push("Usar imagen de mayor resolución si está disponible")
    } else if (sizeKB < 100) {
      quality = "fair"
      issues.push("Resolución limitada")
      recommendations.push("Considerar imagen de mayor calidad para mejor análisis")
    } else if (sizeKB > 2000) {
      quality = "excellent"
    }

    if (!mimeType.includes("image/")) {
      quality = "poor"
      issues.push("Formato de archivo no óptimo")
      recommendations.push("Usar formatos JPEG o PNG para mejores resultados")
    }

    return { quality, issues, recommendations }
  }

  static formatAnalysisWithQuality(analysis: string, qualityAssessment: any): string {
    let formattedAnalysis = analysis

    if (qualityAssessment.issues.length > 0) {
      const qualitySection = `
### ⚠️ Evaluación de Calidad de Imagen

**Calidad Detectada:** ${qualityAssessment.quality.toUpperCase()}

**Limitaciones Identificadas:**
${qualityAssessment.issues.map((issue: string) => `- ${issue}`).join("\n")}

**Recomendaciones:**
${qualityAssessment.recommendations.map((rec: string) => `- ${rec}`).join("\n")}

---

`
      formattedAnalysis = qualitySection + formattedAnalysis
    }

    return formattedAnalysis
  }
}
