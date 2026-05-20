import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { SearchBooksDto } from './dto/search-books.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('books')
export class BooksController {
  constructor(private booksService: BooksService) {}

  // GET /api/books/search?q=harry+potter&maxResults=12&startIndex=0
  // Public — anyone can search
  @Get('search')
  searchBooks(@Query() dto: SearchBooksDto) {
    return this.booksService.searchBooks(dto);
  }

  // GET /api/books/featured
  // Public — home page featured books by category
  @Get('featured')
  getFeatured() {
    return this.booksService.getFeaturedBooks();
  }

  // GET /api/books/free?q=science&maxResults=12
  // Public — only free/readable books
  @Get('free')
  getFreeBooks(
    @Query('q') q: string = 'bestsellers',
    @Query('maxResults') maxResults: number = 12,
  ) {
    return this.booksService.getFreeBooks(q, maxResults);
  }

  // GET /api/books/category/:category
  // Public — books by category e.g. /api/books/category/fantasy
  @Get('category/:category')
  getByCategory(
    @Param('category') category: string,
    @Query('maxResults') maxResults: number = 12,
  ) {
    return this.booksService.getBooksByCategory(category, maxResults);
  }

  // GET /api/books/:id
  // Public — single book detail page
  @Get(':id')
  getBookById(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }
}