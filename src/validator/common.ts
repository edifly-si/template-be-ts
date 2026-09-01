import { z } from 'zod';

export const objectIdRegex = /^[a-fA-F0-9]{24}$/;

export const objectIdSchema = z
    .string()
    .regex(objectIdRegex, 'id must be a valid ObjectId');

export const idParamSchema = z.object({
    id: objectIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

export const idBodySchema = z.object({
    id: objectIdSchema,
});

export type IdBody = z.infer<typeof idBodySchema>;

export const paginationQuerySchema = z.object({
    search: z.string().optional(),
    search2: z.string().optional(),
    page: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 1))
        .refine((n) => Number.isFinite(n) && n > 0, {
            message: 'page must be a positive integer',
        }),
    perPage: z
        .string()
        .optional()
        .transform((v) => (v ? parseInt(v, 10) : 10))
        .refine((n) => Number.isFinite(n) && n > 0 && n <= 200, {
            message: 'perPage must be between 1 and 200',
        }),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
