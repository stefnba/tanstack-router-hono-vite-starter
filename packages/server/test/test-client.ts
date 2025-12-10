import { testClient } from 'hono/testing';

import { apiRoutes } from '@app/server';

export const createHonoTestClient = () => testClient(apiRoutes);
