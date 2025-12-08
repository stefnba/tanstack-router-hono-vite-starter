import { ValidationTargets } from 'hono';
import z from 'zod';

export type TZodSchema = z.ZodSchema;

export type TValidationObject = { [K in keyof ValidationTargets]?: TZodSchema };
