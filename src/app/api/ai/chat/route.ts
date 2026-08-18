import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/utils/auth';
import { ChatbotService } from '@/lib/services/ai/chatbot';
import { validateBody } from '@/lib/utils/validation';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await validateBody(request, chatSchema);

    const reply = await ChatbotService.handleIncomingMessage(
      user.id,
      body.message
    );

    return apiSuccess({ reply });
  } catch (error) {
    return handleApiError(error);
  }
}
