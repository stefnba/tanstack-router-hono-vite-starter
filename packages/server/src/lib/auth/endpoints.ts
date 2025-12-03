import { Hono } from 'hono';

import { auth } from '.';

export const authEndopints = new Hono().on(['POST', 'GET'], '*', (c) => auth.handler(c.req.raw));
