import { z } from 'zod';

const articleFields = {
  title: z.string().trim().min(1).max(50),
  content: z.string().trim().min(1),
};

export const articleCreateSchema = z.object(articleFields);

export const articleUpdateSchema = z.object(articleFields)
  .partial();