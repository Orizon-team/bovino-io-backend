import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS to allow frontend origin(s) and preflight requests
  const allowedOrigins = [
    process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    process.env.BACKEND_URL ?? `https://bovino-io-backend.onrender.com`,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // allow non-browser requests (like curl, server-to-server) when origin is undefined
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS policy: origin not allowed'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3008);
}

bootstrap();
