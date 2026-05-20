import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateFavouriteDto {
  @IsString()
  @IsNotEmpty({ message: 'Google Book ID is required.' })
  googleBookId: string; // ID from Google Books API e.g. "zyTCAlFPjgYC"

  @IsString()
  @IsNotEmpty({ message: 'Book title is required.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Author is required.' })
  authors: string;

  @IsOptional()
  @IsUrl({}, { message: 'Thumbnail must be a valid URL.' })
  thumbnail?: string;
}