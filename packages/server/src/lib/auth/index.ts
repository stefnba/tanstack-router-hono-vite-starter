import { auth } from './config';

// ================================
// Export
// ================================
export { auth };

// ================================
// Types
// ================================
export type TAuthSession = typeof auth.$Infer.Session.session;
export type TAuthUser = typeof auth.$Infer.Session.user;
