import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ── Register ────────────────────────────────────────────────────────
  async register(dto: RegisterDto, res: Response) {
    const { username, email, password, confirmPassword } = dto;

    // Confirm passwords match — confirmPassword is never stored
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    // Check email is not already taken
    const emailExists = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExists) {
      throw new ConflictException('Email is already in use.');
    }

    // Check username is not already taken
    const usernameExists = await this.prisma.user.findUnique({
      where: { username },
    });
    if (usernameExists) {
      throw new ConflictException('Username is already taken.');
    }

    // Hash password — never store plaintext
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user — select only safe fields to return
    const user = await this.prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    // Auto-login after register
    const token = this.signToken(user.id, user.username);
    this.setAuthCookie(res, token);

    return {
      message: 'Account created successfully.',
      user,
    };
  }

  // ── Login ───────────────────────────────────────────────────────────
  async login(dto: LoginDto, res: Response) {
    const { email, password } = dto;

    // Find user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Use the same error for wrong email AND wrong password
    // — never reveal which one failed (security best practice)
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Create session
    const token = this.signToken(user.id, user.username);
    this.setAuthCookie(res, token);

    return {
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  // ── Logout ──────────────────────────────────────────────────────────
  logout(res: Response) {
    res.clearCookie('readify_token');
    return { message: 'Logged out successfully.' };
  }

  // ── Private helpers ─────────────────────────────────────────────────
  private signToken(userId: number, username: string): string {
    return this.jwtService.sign({ sub: userId, username });
  }

  private setAuthCookie(res: Response, token: string): void {
    res.cookie('readify_token', token, {
      httpOnly: true, // JS cannot access — prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax', // CSRF protection
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds
      path: '/',
    });
  }
}