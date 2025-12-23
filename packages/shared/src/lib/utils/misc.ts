import { createId } from '@paralleldrive/cuid2';
import { nanoid } from 'nanoid';

/**
 * Sleep for a given number of milliseconds
 * @param ms - The number of milliseconds to sleep
 * @returns A promise that resolves after the given number of milliseconds
 */
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a short, unique ID
 *
 * Uses nanoid for collision-resistant IDs suitable for production use.
 *
 * @returns A unique ID (10 characters)
 *
 * @example
 * ```typescript
 * const errorId = generateUniqueId();
 * // Result: "V1StGXR8_Z"
 * ```
 */
export function generateUniqueId(length: number = 10): string {
    return nanoid(length);
}

/**
 * Generates a UUID
 *
 * Uses createId for collision-resistant IDs suitable for production use.
 */
export function generateUuid(): string {
    return createId();
}
