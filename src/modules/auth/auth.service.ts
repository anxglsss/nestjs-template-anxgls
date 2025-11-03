import { PrismaService } from '@core/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { toAuthResponse } from '@shared/mappers';
import { JwtPayload } from '@shared/types/jwt.types';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: registerDto.email }, { nickName: registerDto.nickName }],
      },
    });

    if (existingUser) throw new ConflictException('User with this email or nickname already exists');
    
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        nickName: registerDto.nickName,
        bio: registerDto.bio,
      },
    });

    return toAuthResponse(user);
  }

  async login(loginDto: LoginDto, res: Response): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
  
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');
    
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } = this.generateTokens(payload);
    this.setCookies(res, accessToken, refreshToken);

    return toAuthResponse(user);
  }

  async refresh(
    req: Request & { cookies?: Record<string, string> },
    res: Response,
  ): Promise<AuthResponseDto> {
    const oldRefreshToken = req.cookies?.['refresh_token'];

    if (!oldRefreshToken) throw new UnauthorizedException('Refresh token not provided');

    try {
      const payload = this.jwtService.verify<JwtPayload>(oldRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) throw new UnauthorizedException('User not found');
      
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      const { accessToken, refreshToken } = this.generateTokens(newPayload);
      this.setCookies(res, accessToken, refreshToken);

      return toAuthResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout(res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  private generateTokens(payload: JwtPayload): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<number>('JWT_ACCESS_EXPIRES', 15 * 60),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES', 7 * 24 * 60 * 60),
    });

    return { accessToken, refreshToken };
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  async getCurrentUser(userId: string): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return toAuthResponse(user);
  }
}
