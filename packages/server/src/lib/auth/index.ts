import { auth } from './config';

// ================================
// Export
// ================================
export { auth };
export { getUser, getSession } from './validate';
export { authMiddleware } from './middleware';
export { authEndopints } from './endpoints';

// ================================
// Types
// ================================
export type { TAuthSession, TAuthUser, TAuthContext } from './types';
