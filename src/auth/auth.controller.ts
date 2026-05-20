import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { CurrentUserType } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(dto, res);
  }

  // POST /api/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK) // override default 201 → 200 for POST login
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res);
  }

  // POST /api/auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // GET /api/auth/me — protected, returns the logged-in user
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: CurrentUserType) {
    return { user };
  }
}