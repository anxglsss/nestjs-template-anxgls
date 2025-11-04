import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithCookies } from '../types/request.types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithCookies>();
    return request.user.userId;
  },
);

