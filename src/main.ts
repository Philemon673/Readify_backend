import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Required to read cookies from incoming requests
  app.use(cookieParser());

  // All routes are prefixed with /api  e.g. /api/auth/login
  app.setGlobalPrefix('api');

  // CORS — allows your frontend to send cookies cross-origin
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true, // required for cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(` Readify API running on http://localhost:${port}/api`);
}

bootstrap();