import { AiClient } from './client'

export class ChatbotService {
  private static DEFAULT_MODEL = 'llama3-70b-8192'

  /**
   * Processes an incoming chat message, primarily used for WhatsApp
   */
  static async handleIncomingMessage(userId: string, message: string) {
    const systemPrompt = `
You are the customer support AI for TailorLink, a custom clothing platform.
Answer the user's question politely and concisely. 
If they ask about their order status, instruct them to check the "My Orders" tab on the web app.
Keep answers under 3 sentences for WhatsApp readability.
`

    try {
      const response = await AiClient.executeWithLogging(
        { feature: 'chatbot', userId },
        {
          model: this.DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.4,
        }
      )

      return response.choices[0]?.message?.content || 'I am sorry, I did not understand that.'
    } catch (error) {
      return 'I am currently experiencing technical difficulties. Please try again later.'
    }
  }
}
