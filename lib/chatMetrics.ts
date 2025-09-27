import { EventEmitter } from "events"

export type ChatEvent = {
  type: "message" | "response" | "error"
  content: string
  timestamp: number
}

export type MetricsData = {
  totalMessages: number
  averageResponseTime: number
  successRate: number
  lastUpdate: number
}

interface ChatMetric {
  timestamp: number
  message: string
  responseTime?: number
  success?: boolean
}

class ChatMetrics extends EventEmitter {
  private static instance: ChatMetrics
  private metrics: ChatMetric[] = []
  private messageTimestamps: Map<string, number> = new Map()
  private errorCount = 0

  private constructor() {
    super()
  }

  public static getInstance(): ChatMetrics {
    if (!ChatMetrics.instance) {
      ChatMetrics.instance = new ChatMetrics()
    }
    return ChatMetrics.instance
  }

  trackMessage(message: string) {
    const timestamp = Date.now()
    this.messageTimestamps.set(message, timestamp)
    this.metrics.push({
      timestamp,
      message,
    })
    this.emit("metricsUpdate", this.getMetrics())
  }

  trackResponse(message: string, success: boolean, responseTime?: number) {
    const messageTimestamp = this.messageTimestamps.get(message)
    if (!messageTimestamp) return

    const actualResponseTime = responseTime || Date.now() - messageTimestamp
    this.messageTimestamps.delete(message)

    const metric = this.metrics.find((m) => m.message === message && m.success === undefined)
    if (metric) {
      metric.success = success
      metric.responseTime = actualResponseTime
    }

    if (!success) {
      this.errorCount++
    }

    this.emit("metricsUpdate", this.getMetrics())
  }

  getMetrics(): MetricsData {
    const totalMessages = this.metrics.length
    const successfulResponses = this.metrics.filter((m) => m.success === true).length
    const successRate = totalMessages > 0 ? (successfulResponses / totalMessages) * 100 : 100

    const responseTimes = this.metrics.filter((m) => m.responseTime !== undefined).map((m) => m.responseTime!)

    const averageResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0

    return {
      totalMessages,
      averageResponseTime,
      successRate,
      lastUpdate: Date.now(),
    }
  }

  clearMetrics() {
    this.metrics = []
    this.messageTimestamps.clear()
    this.errorCount = 0
    this.emit("metricsUpdate", this.getMetrics())
  }
}

export const chatMetrics = ChatMetrics.getInstance()
