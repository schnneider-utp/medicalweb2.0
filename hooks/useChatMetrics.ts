"use client"

import { useState, useEffect } from "react"
import { chatMetrics, type MetricsData } from "@/lib/chatMetrics"

export const useChatMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>(chatMetrics.getMetrics())

  useEffect(() => {
    const handleMetricsUpdate = (newMetrics: MetricsData) => {
      setMetrics(newMetrics)
    }

    chatMetrics.on("metricsUpdate", handleMetricsUpdate)

    return () => {
      chatMetrics.off("metricsUpdate", handleMetricsUpdate)
    }
  }, [])

  return metrics
}
