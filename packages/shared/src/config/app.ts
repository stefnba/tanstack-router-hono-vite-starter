/**
 * Non-sensitive application defaults.
 * Production values are set via environment variables.
 */

export const SERVER = {
    DEFAULT_PORT: 3080,
    API_BASE_PATH: '/api',
} as const;

export const CLIENT = {
    DEFAULT_PORT: 3000,
} as const;
