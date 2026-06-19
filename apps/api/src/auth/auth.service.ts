import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    // 관리자 계정 확인 (환경 변수에서 설정된 관리자 계정과 비교)
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH');

    if (!adminEmail || !adminPasswordHash) {
      throw new UnauthorizedException('Admin credentials not configured');
    }

    if (email !== adminEmail) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // JWT 토큰 생성
    const payload = { sub: 'admin', email: adminEmail, role: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: 'admin',
        email: adminEmail,
        role: 'admin',
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { userId: payload.sub, email: payload.email, role: payload.role };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
