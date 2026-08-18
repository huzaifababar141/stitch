import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/utils/response';
import { handleApiError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/utils/auth';
import { StyleRecommender } from '@/lib/services/ai/style-recommender';
import { validateBody } from '@/lib/utils/validation';
import { z } from 'zod';

const inputSchema = z.object({
  prompt: z.string().min(5).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await validateBody(request, inputSchema);

    const recommendation = await StyleRecommender.recommend(
      body.prompt,
      user.id
    );

    return apiSuccess({ recommendation });
  } catch (error) {
    return handleApiError(error);
  }
}
