"use client"

import { useChatMetrics } from "@/hooks/useChatMetrics"
import { useState, useEffect } from "react"

export default function AcceptanceMetrics() {
  const metrics = useChatMetrics()
  const [formattedTime, setFormattedTime] = useState("")

  useEffect(() => {
    // Formatear la hora solo en el cliente
    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    }

    setFormattedTime(formatTime(metrics.lastUpdate))
  }, [metrics.lastUpdate])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 rounded-lg shadow-md medical-bg-primary">
        <h3 className="text-sm font-medium mb-2 text-gray-300">Mensajes Totales</h3>
        <p className="text-2xl font-bold medical-text-light">{metrics.totalMessages}</p>
      </div>

      <div className="p-4 rounded-lg shadow-md medical-bg-primary">
        <h3 className="text-sm font-medium mb-2 text-gray-300">Tiempo Promedio (ms)</h3>
        <p className="text-2xl font-bold medical-text-light">{metrics.averageResponseTime.toFixed(0)}</p>
      </div>

      <div className="p-4 rounded-lg shadow-md medical-bg-primary">
        <h3 className="text-sm font-medium mb-2 text-gray-300">Tasa de Éxito</h3>
        <p className="text-2xl font-bold medical-text-light">{metrics.successRate.toFixed(1)}%</p>
      </div>

      <div className="p-4 rounded-lg shadow-md medical-bg-primary">
        <h3 className="text-sm font-medium mb-2 text-gray-300">Última Actualización</h3>
        <p className="text-2xl font-bold medical-text-light">
          {formattedTime || "Cargando..."}
        </p>
      </div>
    </div>
  )
}
