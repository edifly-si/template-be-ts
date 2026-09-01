import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

export type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates the given request location against a Zod schema.
 * On success the validated (and parsed) value replaces the original payload so downstream
 * handlers receive strongly-typed, sanitized data.
 */
export const validate =
    <T>(schema: ZodSchema<T>, target: ValidationTarget = 'body') =>
        (req: Request, res: Response, next: NextFunction): void => {
            const result = schema.safeParse(req[target]);
            if (!result.success) {
                const issue = result.error as ZodError;
                const message = issue.issues
                    .map((i) => `${i.path.join('.') || target}: ${i.message}`)
                    .join('; ');
                res.json({
                    error: 500,
                    message: `Validation failed - ${message}`,
                    errorName: 'ZodError',
                    stack: { issues: issue.issues },
                });
                return;
            }
            // Replace the request payload with the parsed, typed value.
            (req as unknown as Record<ValidationTarget, unknown>)[target] = result.data;
            next();
        };

/**
 * Formats a ZodError into a serializable object suitable for the standard error response.
 */
export const formatZodError = (error: ZodError): { issues: ZodError['issues'] } => ({
    issues: error.issues,
});
