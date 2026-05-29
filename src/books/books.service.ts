import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { SearchBooksDto } from './dto/search-book.dto';

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1';

// Shape a raw Google Books volume into a clean object
function formatBook(item: any) {
  const info = item.volumeInfo ?? {};
  const access = item.accessInfo ?? {};
  const sale = item.saleInfo ?? {};

  return {
    id: item.id,
    title: info.title ?? 'Unknown Title',
    authors: info.authors ?? ['Unknown Author'],
    description: info.description ?? null,
    thumbnail:
      info.imageLinks?.extraLarge ??
      info.imageLinks?.large ??
      info.imageLinks?.medium ??
      info.imageLinks?.thumbnail ??
      null,
    publishedDate: info.publishedDate ?? null,
    publisher: info.publisher ?? null,
    pageCount: info.pageCount ?? null,
    categories: info.categories ?? [],
    language: info.language ?? null,
    averageRating: info.averageRating ?? null,
    ratingsCount: info.ratingsCount ?? null,
    previewLink: info.previewLink ?? null,
    infoLink: info.infoLink ?? null,
    // Reading access
    isReadable:
      access.viewability === 'ALL_PAGES' ||
      access.viewability === 'PARTIAL',
    viewability: access.viewability ?? 'NO_PAGES',
    embeddable: access.embeddable ?? false,
    webReaderLink: access.webReaderLink ?? null,
    // Sale info
    saleability: sale.saleability ?? null,
    price:
      sale.retailPrice
        ? { amount: sale.retailPrice.amount, currency: sale.retailPrice.currencyCode }
        : null,
  };
}

@Injectable()
export class BooksService {
  constructor(private httpService: HttpService) {}

  // ── Search books ──────────────────────────────────────────────────
  async searchBooks(dto: SearchBooksDto) {
    const { q, startIndex, maxResults, filter, orderBy, category } = dto;

    // Build query string — add category as subject if provided
    const query = category ? `${q}+subject:${category}` : q;

    const params: Record<string, any> = {
      q: query,
      startIndex,
      maxResults,
      orderBy,
      key: process.env.GOOGLE_BOOKS_API_KEY,
    };

    // Only add filter if provided — omitting it returns all books
    if (filter) params.filter = filter;

    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${GOOGLE_BOOKS_URL}/volumes`, { params }),
      );

      const data = response.data;

      return {
        totalItems: data.totalItems ?? 0,
        startIndex: startIndex ?? 0,
        maxResults: maxResults ?? 12,
        books: (data.items ?? []).map(formatBook),
      };
    } catch (error: any) {
      console.error('Google Books API Search Error:', error?.response?.data ?? error.message ?? error);
      throw new InternalServerErrorException(
        'Failed to fetch books from Google Books API.',
      );
    }
  }

  // ── Get a single book by Google Book ID ───────────────────────────
  async getBookById(googleBookId: string) {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(`${GOOGLE_BOOKS_URL}/volumes/${googleBookId}`, {
          params: { key: process.env.GOOGLE_BOOKS_API_KEY },
        }),
      );

      return formatBook(response.data);
    } catch (error: any) {
      console.error('Google Books API Details Error:', error?.response?.data ?? error.message ?? error);
      if (error?.response?.status === 404) {
        throw new NotFoundException(`Book with ID "${googleBookId}" not found.`);
      }
      throw new InternalServerErrorException(
        'Failed to fetch book details from Google Books API.',
      );
    }
  }

  // ── Get books by category ─────────────────────────────────────────
  async getBooksByCategory(category: string, maxResults = 12) {
    return this.searchBooks({ q: `subject:${category}`, maxResults });
  }

  // ── Get featured / trending books ────────────────────────────────
  async getFeaturedBooks() {
    const categories = ['fiction', 'mystery', 'science', 'fantasy', 'biography'];

    // Fetch one popular book per category in parallel
    const results = await Promise.all(
      categories.map((cat) =>
        this.searchBooks({ q: `subject:${cat}`, maxResults: 8, orderBy: 'relevance' }),
      ),
    );

    return categories.reduce(
      (acc, cat, i) => {
        acc[cat] = results[i].books;
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }

  // ── Get readable/free books ───────────────────────────────────────
  async getFreeBooks(query: string, maxResults = 12) {
    return this.searchBooks({
      q: query,
      maxResults,
      filter: 'free-ebooks',
    });
  }
}