import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Readify API')
    .setDescription('The API documentation for Readify backend application')
    .setVersion('1.0')
    .addCookieAuth('readify_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'readify_token',
      description: 'Session cookie for authenticating requests',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);


  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(` Readify API running on http://localhost:${port}/api`);
  console.log(` Swagger documentation available on http://localhost:${port}/api/docs`);
  console.log(` Swagger JSON file generated at project root: swagger.json`);
}

bootstrap();