import { AiClient } from './client'
import { AppError } from '../../utils/errors'
import { logger } from '../../utils/logger'

export class MeasurementValidator {
  private static DEFAULT_MODEL = 'llama3-70b-8192'

  /**
   * Uses Groq to extract and validate natural language measurements.
   */
  static async validate(rawInput: string, userId?: string) {
    const systemPrompt = `
You are an expert tailor API. Parse the user's natural language measurement input into a strict JSON object.
Return ONLY valid JSON. No markdown formatting.
Required fields (all numbers in inches): chest, waist, hips, length, shoulders.
Constraints: Chest must be between 30 and 60. Length must be between 35 and 60.
If any constraint fails or a measurement is missing, return a JSON object with {"error": "Explanation of what is missing or invalid"}.
Otherwise, return {"success": true, "measurements": { "chest": 40, ... } }.
`

    try {
      const response = await AiClient.executeWithLogging(
        { feature: 'measurement-validator', userId },
        {
          model: this.DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rawInput }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }
      )

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('Empty response from Groq')

      const result = JSON.parse(content)

      if (result.error) {
        throw AppError.badRequest(result.error)
      }

      return result.measurements
    } catch (error: any) {
      if (error instanceof AppError) throw error
      
      logger.error('Failed to validate measurements via AI', error)
      // Fallback
      throw AppError.internal('Our AI assistant is temporarily unavailable. Please enter measurements manually.')
    }
  }
}
