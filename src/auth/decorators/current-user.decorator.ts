import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserType {
  id: number;
  username: string;
  email: string;
}

// Use @CurrentUser() in any controller to get the logged-in user
// instead of writing @Req() req: Request and req.user every time
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserType => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);