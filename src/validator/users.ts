import { z } from 'zod';
import {
    idBodySchema,
    idParamSchema,
    objectIdRegex,
    paginationQuerySchema,
} from './common';

/** Allowed permission levels. Stored as a string in the schema but conceptually numeric. */
const levelEnum = z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'number' ? v.toString() : v))
    .refine((v) => /^\d+$/.test(v), {
        message: 'level must be a numeric string',
    });

/** Username pattern kept consistent with the underlying mongoose schema constraints. */
const usernameRegex = /^[a-zA-Z0-9_.-]{3,32}$/;

/** List users — extends the generic pagination query schema. */
export const listUsersQuerySchema = paginationQuerySchema;

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

/** GET /detail/:id — single user lookup by id. */
export const getUserByIdParamsSchema = idParamSchema;

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;

export const createUserBodySchema = z.object({
    username: z
        .string()
        .regex(usernameRegex, 'username must be 3-32 chars (a-z, 0-9, _ . -)'),
    password: z.string().min(6, 'password must be at least 6 characters'),
    name: z.string().min(1).max(120),
    level: levelEnum,
    email: z.string().email('email must be a valid email').optional().or(z.literal('')),
    phone: z.string().max(40).optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

/** Body schema for `updateById`. All fields are optional; at least one must be supplied. */
export const updateUserBodySchema = z
    .object({
        username: z
            .string()
            .regex(usernameRegex, 'username must be 3-32 chars (a-z, 0-9, _ . -)')
            .optional(),
        password: z.string().min(6, 'password must be at least 6 characters').optional(),
        name: z.string().min(1).max(120).optional(),
        level: levelEnum.optional(),
        email: z.string().email('email must be a valid email').optional().or(z.literal('')),
        phone: z.string().max(40).optional(),
        block: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    });

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

/** Body schema for `deleteById`. POST so caller's intent is explicit; id lives in the body. */
export const deleteUserBodySchema = idBodySchema;

export type DeleteUserBody = z.infer<typeof deleteUserBodySchema>;

/** Re-export the ObjectId regex for raw mongoose queries (tests/seeders). */
export { objectIdRegex };
