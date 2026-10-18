import { z } from 'zod';

const commentFields = {
  content: z.string().trim().min(1),
};

export const commentCreateSchema = z.object(commentFields);

export const commentUpdateSchema = z.object(commentFields)
  .partial();