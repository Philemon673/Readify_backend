import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchBooksDto {
  @IsString()
  @IsNotEmpty({ message: 'Search query is required.' })
  q: string; // search term e.g. "harry potter"

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  startIndex?: number = 0; // pagination offset

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(40) // Google Books API max is 40
  maxResults?: number = 12;

  @IsOptional()
  @IsString()
  filter?: string; // e.g. "free-ebooks", "paid-ebooks", "ebooks"

  @IsOptional()
  @IsString()
  orderBy?: 'relevance' | 'newest' = 'relevance';

  @IsOptional()
  @IsString()
  category?: string; // e.g. "fiction", "science"
}