import { AiClient } from '@/lib/services/ai/client'
import { MeasurementValidator } from '@/lib/services/ai/measurement-validator'
import { StyleRecommender } from '@/lib/services/ai/style-recommender'
import { ChatbotService } from '@/lib/services/ai/chatbot'
import { prisma } from '@/lib/prisma'
import { AppError } from '@/lib/utils/errors'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    aiLog: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/services/ai/client', () => ({
  AiClient: {
    executeWithLogging: jest.fn(),
  },
}))

describe('AI Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('MeasurementValidator', () => {
    it('should parse valid measurements', async () => {
      ;(AiClient.executeWithLogging as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                success: true,
                measurements: { chest: 40, waist: 34, hips: 42, length: 40, shoulders: 18 },
              }),
            },
          },
        ],
      })

      const result = await MeasurementValidator.validate('my chest is 40 and waist is 34...')
      expect(result).toEqual({ chest: 40, waist: 34, hips: 42, length: 40, shoulders: 18 })
      expect(AiClient.executeWithLogging).toHaveBeenCalled()
    })

    it('should throw AppError on invalid constraints', async () => {
      ;(AiClient.executeWithLogging as jest.Mock).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                error: 'Chest measurement is missing.',
              }),
            },
          },
        ],
      })

      await expect(MeasurementValidator.validate('waist 34')).rejects.toThrow(AppError)
    })
  })

  describe('StyleRecommender', () => {
    it('should return recommendations', async () => {
      ;(AiClient.executeWithLogging as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: '1. Style A\n2. Style B' } }],
      })

      const result = await StyleRecommender.recommend('summer wedding')
      expect(result).toBe('1. Style A\n2. Style B')
    })
  })

  describe('ChatbotService', () => {
    it('should return reply', async () => {
      ;(AiClient.executeWithLogging as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Please check the My Orders tab.' } }],
      })

      const result = await ChatbotService.handleIncomingMessage('user-1', 'where is my order')
      expect(result).toBe('Please check the My Orders tab.')
    })
  })
})
