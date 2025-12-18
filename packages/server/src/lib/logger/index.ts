import path from 'node:path';

import { env } from '@app/server/lib/env';

import { Logger } from './logger';
import { LoggerOptions } from './types';

export { Logger } from './logger';
export * from './types';

/**
 * Creates a logger instance with environment-specific configuration
 */
export function createLogger() {
    const { NODE_ENV } = env;
    const isTest = NODE_ENV === 'test';
    const isProd = NODE_ENV === 'production';

    const options: LoggerOptions = {
        minLevel: isProd ? 'INFO' : 'DEBUG',
        logToFile: isProd, // Only log to file in production
        logDir: path.join(process.cwd(), 'logs'),
        suppressConsole: isTest, // Suppress console output in test environment
    };

    return new Logger(options);
}

// Create and export singleton instance
export const logger = createLogger();
