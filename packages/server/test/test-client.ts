import { apiRoutes } from '@app/server';
import { testClient } from 'hono/testing';

export const createHonoTestClient = () => testClient(apiRoutes);
