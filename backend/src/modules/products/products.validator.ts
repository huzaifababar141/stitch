import { z } from 'zod';

export const parseProductLinkSchema = z.object({
  url: z.string().url('Must be a valid HTTPS URL string'),
});

export type ParseProductLinkInput = z.infer<typeof parseProductLinkSchema>;
