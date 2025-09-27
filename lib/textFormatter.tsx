export class TextFormatter {
  static formatMedicalText(text: string): string {
    // Convertir markdown básico a HTML
    let formatted = text
      // Títulos
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // Listas
      .replace(/^\* (.+)$/gm, "• $1")
      .replace(/^- (.+)$/gm, "• $1")
      // Números de lista
      .replace(/^(\d+)\. (.+)$/gm, "$1. $2")
      // Saltos de línea
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")

    // Envolver en párrafos
    formatted = `<p>${formatted}</p>`

    // Limpiar párrafos vacíos
    formatted = formatted.replace(/<p><\/p>/g, "")

    return formatted
  }

  static createMedicalSections(text: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = []

    // Buscar secciones comunes en análisis médicos
    const sectionPatterns = [
      {
        pattern:
          /(?:descripción|observación|hallazgos?)[^:]*:?\s*([^]*?)(?=(?:diagnóstico|posible|recomendación|tratamiento|advertencia|importante|nota)|$)/i,
        title: "📋 Descripción de Hallazgos",
      },
      {
        pattern:
          /(?:diagnóstico|posible)[^:]*:?\s*([^]*?)(?=(?:recomendación|tratamiento|advertencia|importante|nota)|$)/i,
        title: "🔍 Posibles Diagnósticos",
      },
      {
        pattern: /(?:recomendación|tratamiento)[^:]*:?\s*([^]*?)(?=(?:advertencia|importante|nota)|$)/i,
        title: "💊 Recomendaciones de Tratamiento",
      },
      { pattern: /(?:advertencia|importante|nota)[^:]*:?\s*([^]*?)$/i, title: "⚠️ Advertencias Importantes" },
    ]

    for (const { pattern, title } of sectionPatterns) {
      const match = text.match(pattern)
      if (match && match[1].trim()) {
        sections.push({
          title,
          content: this.formatMedicalText(match[1].trim()),
        })
      }
    }

    // Si no se encontraron secciones, usar el texto completo
    if (sections.length === 0) {
      sections.push({
        title: "📋 Análisis Médico",
        content: this.formatMedicalText(text),
      })
    }

    return sections
  }
}
