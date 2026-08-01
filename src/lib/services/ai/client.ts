import Groq from 'groq-sdk'
import { prisma } from '../../prisma'
import { logger } from '../../utils/logger'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key_for_build',
})

interface AiCallContext {
  feature: string
  userId?: string
  orderId?: string
}

export class AiClient {
  /**
   * Executes a Groq chat completion with a strict timeout, cost tracking, and logging.
   */
  static async executeWithLogging(
    context: AiCallContext,
    options: Groq.Chat.Completions.CompletionCreateParamsNonStreaming,
    timeoutMs: number = 10000
  ): Promise<Groq.Chat.Completions.ChatCompletion> {
    const startTime = Date.now()
    
    try {
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)
      })

      // Race the actual API call against the timeout
      const response = await Promise.race([
        groq.chat.completions.create(options),
        timeoutPromise
      ])

      const latencyMs = Date.now() - startTime
      const inputTokens = response.usage?.prompt_tokens || 0
      const outputTokens = response.usage?.completion_tokens || 0
      
      // Calculate approximate cost (Groq is very cheap, setting a dummy logic for now)
      // E.g., Llama3 70B is approx $0.59 / 1M input tokens and $0.79 / 1M output tokens
      const costPerInput = 0.59 / 1_000_000
      const costPerOutput = 0.79 / 1_000_000
      const totalCostUsd = (inputTokens * costPerInput) + (outputTokens * costPerOutput)

      // Log success asynchronously
      this.logToDb({
        ...context,
        modelUsed: options.model,
        inputTokens,
        outputTokens,
        totalCostUsd,
        latencyMs,
        success: true
      })

      return response

    } catch (error: any) {
      const latencyMs = Date.now() - startTime
      
      // Log failure asynchronously
      this.logToDb({
        ...context,
        modelUsed: options.model,
        latencyMs,
        success: false,
        errorCode: error.code || 'UNKNOWN_ERROR',
        errorMessage: error.message
      })

      logger.error(`[AI ${context.feature}] Failed: ${error.message}`, error)
      throw error
    }
  }

  private static logToDb(logData: any) {
    prisma.aiLog.create({
      data: {
        userId: logData.userId,
        orderId: logData.orderId,
        feature: logData.feature,
        modelUsed: logData.modelUsed,
        inputTokens: logData.inputTokens,
        outputTokens: logData.outputTokens,
        totalCostUsd: logData.totalCostUsd,
        latencyMs: logData.latencyMs,
        success: logData.success,
        errorCode: logData.errorCode,
        errorMessage: logData.errorMessage,
      }
    }).catch(err => {
      logger.error('Failed to write AI log to DB', err)
    })
  }
}
