import { z } from 'zod';

const productFields = {
  name: z.string().trim().min(1).max(10),
  description: z.string().trim().min(10).max(100),
  price: z.number().int().nonnegative(),
  tags: z.array(z.string().trim().min(1).max(5)).min(1),
};

export const productCreateSchema = z.object(productFields);

export const productUpdateSchema = z.object(productFields)
  .partial();