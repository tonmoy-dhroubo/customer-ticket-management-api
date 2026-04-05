import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class CustomerJwtAuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activated = (await super.canActivate(context)) as boolean;
    if (!activated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<{ user?: { userType?: string } }>();
    if (request.user?.userType !== 'CUSTOMER') {
      throw new UnauthorizedException('Customer authentication required.');
    }

    return true;
  }
}
