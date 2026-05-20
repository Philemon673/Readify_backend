import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Override to provide a cleaner error message
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException(
        'You must be logged in to access this resource.',
      );
    }
    return user;
  }
}