import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Fallback to default (URL hash) if no user implies public route
    if (!user) {
      return super.trackBy(context);
    }

    // Cache key specific to this user ID and original URL
    return `${user.id}-${request.url}`;
  }
}
