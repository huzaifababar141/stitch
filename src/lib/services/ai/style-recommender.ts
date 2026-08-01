import { AiClient } from './client'

export class StyleRecommender {
  private static DEFAULT_MODEL = 'mixtral-8x7b-32768'

  static async recommend(prompt: string, userId?: string) {
    const systemPrompt = `
You are an expert South Asian fashion consultant.
The user will describe an event, occasion, or preference.
Recommend 3 specific tailoring styles (e.g., Shalwar Kameez style, fabric type, collar type).
Keep the response brief, professional, and visually descriptive. Format as Markdown bullets.
`

    try {
      const response = await AiClient.executeWithLogging(
        { feature: 'style-recommender', userId },
        {
          model: this.DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }
      )

      return response.choices[0]?.message?.content || 'No recommendations generated.'
    } catch (error) {
      return 'Sorry, our AI stylist is currently taking a break. Please try again later.'
    }
  }
}
