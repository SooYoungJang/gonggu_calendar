import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

import { AuthService } from './auth.service';

class LoginDto {
  @ApiProperty({ example: 'admin@gonggu.app', description: '관리자 이메일' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'securePassword123', description: '비밀번호 (최소 8자)' })
  @IsString()
  @MinLength(8)
  password!: string;
}

class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT 액세스 토큰' })
  accessToken!: string;

  @ApiProperty({ example: { id: 'admin', email: 'admin@gonggu.app', role: 'admin' }, description: '사용자 정보' })
  user!: { id: string; email: string; role: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '관리자 로그인 (JWT 발급)' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
