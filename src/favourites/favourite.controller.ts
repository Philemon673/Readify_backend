import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { CreateFavouriteDto } from './dto/create.favourite.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserType } from '../auth/decorators/current-user.decorator';

@Controller('favourites')
@UseGuards(JwtAuthGuard) // all routes in this controller require login
export class FavouriteController {
  constructor(private favouriteService: FavouriteService) {}

  // POST /api/favourites — add a book to favourites
  @Post()
  addFavourite(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: CreateFavouriteDto,
  ) {
    return this.favouriteService.addFavourite(user.id, dto);
  }

  // GET /api/favourites — get all favourites for logged-in user
  @Get()
  getFavourites(@CurrentUser() user: CurrentUserType) {
    return this.favouriteService.getFavourites(user.id);
  }

  // GET /api/favourites/check/:googleBookId — check if a book is favourited
  @Get('check/:googleBookId')
  isFavourited(
    @CurrentUser() user: CurrentUserType,
    @Param('googleBookId') googleBookId: string,
  ) {
    return this.favouriteService.isFavourited(user.id, googleBookId);
  }

  // DELETE /api/favourites/:googleBookId — remove a book from favourites
  @Delete(':googleBookId')
  @HttpCode(HttpStatus.OK)
  removeFavourite(
    @CurrentUser() user: CurrentUserType,
    @Param('googleBookId') googleBookId: string,
  ) {
    return this.favouriteService.removeFavourite(user.id, googleBookId);
  }
}