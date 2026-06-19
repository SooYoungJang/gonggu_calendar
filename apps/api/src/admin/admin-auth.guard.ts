import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type HeaderRequest = {
  header(name: string): string | undefined;
};

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const adminToken = this.configService.get<string>('ADMIN_TOKEN');

    if (!adminToken) {
      return true;
    }

    const request = context.switchToHttp().getRequest<HeaderRequest>();
    const providedToken = request.header('x-admin-token');

    if (providedToken === adminToken) {
      return true;
    }

    throw new UnauthorizedException('Invalid admin token');
  }
}
