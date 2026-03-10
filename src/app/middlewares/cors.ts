import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const parseOrigins = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const configuredOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS);
const isProduction = process.env.NODE_ENV === 'production';
const productionOrigins = [
  'https://portal.space-vision.net',
  'https://www.portal.space-vision.net',
];
const devOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const allowedOrigins = isProduction
  ? Array.from(new Set([...productionOrigins, ...configuredOrigins]))
  : Array.from(new Set([...devOrigins, ...configuredOrigins]));

export const corsMiddleware = new Elysia().use(
  cors({
    // Never use wildcard/reflected origins with credentialed requests.
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Type', 'Content-Length'],
    credentials: true,
    maxAge: 86400,
  }),
);
