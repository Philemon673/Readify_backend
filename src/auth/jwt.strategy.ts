import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      // Extract JWT from httpOnly cookie instead of Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.['readify_token'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  // Runs after the JWT is verified — return value is attached to req.user
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, username: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    return user; // → attached to req.user
  }
}