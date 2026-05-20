import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavouriteDto } from './dto/create.favourite.dto';

@Injectable()
export class FavouriteService {
  constructor(private prisma: PrismaService) {}

  // ── Add a book to favourites ────────────────────────────────────────
  async addFavourite(userId: number, dto: CreateFavouriteDto) {
    const { googleBookId, title, authors, thumbnail } = dto;

    // Check if already saved — @@unique handles DB level but we
    // want a clean error message at the service level too
    const existing = await this.prisma.favouriteBook.findUnique({
      where: {
        userId_googleBookId: { userId, googleBookId },
      },
    });

    if (existing) {
      throw new ConflictException('This book is already in your favourites.');
    }

    const favourite = await this.prisma.favouriteBook.create({
      data: { userId, googleBookId, title, authors, thumbnail },
    });

    return {
      message: 'Book added to favourites.',
      favourite,
    };
  }

  // ── Get all favourites for the logged-in user ───────────────────────
  async getFavourites(userId: number) {
    const favourites = await this.prisma.favouriteBook.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' }, // newest first
    });

    return {
      count: favourites.length,
      favourites,
    };
  }

  // ── Check if a specific book is favourited ──────────────────────────
  async isFavourited(userId: number, googleBookId: string) {
    const favourite = await this.prisma.favouriteBook.findUnique({
      where: {
        userId_googleBookId: { userId, googleBookId },
      },
    });

    return { isFavourited: !!favourite };
  }

  // ── Remove a book from favourites ───────────────────────────────────
  async removeFavourite(userId: number, googleBookId: string) {
    const existing = await this.prisma.favouriteBook.findUnique({
      where: {
        userId_googleBookId: { userId, googleBookId },
      },
    });

    if (!existing) {
      throw new NotFoundException('This book is not in your favourites.');
    }

    await this.prisma.favouriteBook.delete({
      where: {
        userId_googleBookId: { userId, googleBookId },
      },
    });

    return { message: 'Book removed from favourites.' };
  }
}