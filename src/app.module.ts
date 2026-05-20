import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FavouriteModule } from './favourites/favourite.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    // Loads .env and makes process.env available everywhere
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FavouriteModule,
    BooksModule],
  providers: [
    {
      // Apply DTO validation globally — no need to add ValidationPipe per route
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,           // strips any fields not in the DTO
        forbidNonWhitelisted: true, // throws error if unknown fields are sent
        transform: true,           // auto-transforms payloads to DTO class instances
      }),
    },
  ],
})
export class AppModule {}