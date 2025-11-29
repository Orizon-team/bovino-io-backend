import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS to allow frontend origin(s) and preflight requests
  const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

  const defaultOrigins = [
    process.env.FRONTEND_ORIGIN,
    process.env.BACKEND_URL,
    'http://localhost:5173',
    'https://6a4wrs-ip-209-178-128-69.tunnelmole.net',
  ].filter(isNonEmptyString);

  const extraOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(isNonEmptyString);

  const allowedOrigins = new Set<string>([...defaultOrigins, ...extraOrigins]);

  const allowAllOrigins = allowedOrigins.has('*');

  app.enableCors({
    origin: (origin, callback) => {
      // allow non-browser requests (like curl, server-to-server) when origin is undefined
      if (!origin || allowAllOrigins) return callback(null, true);

      for (const allowedOrigin of allowedOrigins) {
        if (allowedOrigin === origin) return callback(null, true);

        // allow regex-like patterns declared as /pattern/i style strings
        if (allowedOrigin.startsWith('/') && allowedOrigin.endsWith('/')) {
          const pattern = allowedOrigin.slice(1, -1);
          try {
            if (new RegExp(pattern).test(origin)) return callback(null, true);
          } catch (error) {
            // ignore invalid regex definitions and continue
          }
        }
      }

      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3008);
}

bootstrap();
