import { z } from 'zod';

export const bidSchema = z.object({
  productName: z.string().trim().min(2).max(120),
  url: z.string().trim().url().refine(u => ['http:', 'https:'].includes(new URL(u).protocol), 'URL must use http or https'),
  amount: z.coerce.number().finite().min(100),
  category: z.enum(['SaaS','E-commerce','Content','Other']).default('Other'),
});

export const adminLoginSchema = z.object({ password: z.string().min(1) });
