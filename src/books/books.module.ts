import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,    // 10 seconds
      maxRedirects: 3,
    }),
  ],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService], // export so FavouriteService can use it if needed
})
export class BooksModule {}