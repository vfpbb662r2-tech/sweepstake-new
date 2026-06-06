import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).optional(),
});

export const sortOrderSchema = z.enum(['asc', 'desc']);

export const filterSchema = z.object({
  search: z.string().min(1).max(100).optional(),
  sortBy: z.string().min(1).max(50).optional(),
  sortOrder: sortOrderSchema.optional(),
  filters: z.record(z.any()).optional(),
});

export const idSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format');

export const urlSchema = z.string().url();

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const dateRangeSchema = z
  .object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  })
  .refine((data) => new Date(data.end) > new Date(data.start), {
    message: 'End date must be after start date',
    path: ['end'],
  });

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const fileUploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().min(1).max(10 * 1024 * 1024), // 10MB max
  type: z.string().min(1),
});

export const imageUploadSchema = fileUploadSchema.extend({
  type: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/, 'Invalid image format'),
});

// Common validation utilities
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

export const validateUuid = (uuid: string): boolean => {
  return z.string().uuid().safeParse(uuid).success;
};

// Type inference
export type PaginationInput = z.infer<typeof paginationSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type ImageUploadInput = z.infer<typeof imageUploadSchema>;