import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Username must be a string.' })
  @MinLength(3, { message: 'Username must be at least 3 characters.' })
  @MaxLength(20, { message: 'Username must be at most 20 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  })
  username: string;

  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Password must contain at least one number.',
  })
  password: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string; // validated in service, never stored in DB
}