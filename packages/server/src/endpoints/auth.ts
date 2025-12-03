import { Hono } from 'hono';
import { auth } from '../lib/auth';

export const endopints = new Hono().on(['POST', 'GET'], '*', (c) => auth.handler(c.req.raw));
