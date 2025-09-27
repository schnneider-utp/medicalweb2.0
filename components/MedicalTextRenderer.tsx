import { TextFormatter } from "@/lib/textFormatter"

interface MedicalTextRendererProps {
  text: string
  showSections?: boolean
  className?: string
}

export default function MedicalTextRenderer({ text, showSections = true, className = "" }: MedicalTextRendererProps) {
  if (showSections) {
    const sections = TextFormatter.createMedicalSections(text)

    return (
      <div className={`space-y-6 ${className}`}>
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">{section.title}</h3>
            <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={`text-gray-700 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: TextFormatter.formatMedicalText(text) }}
    />
  )
}
