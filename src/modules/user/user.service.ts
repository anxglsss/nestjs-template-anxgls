import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { toAuthResponse } from '@shared/mappers';
import { PrismaService } from 'prisma/prisma.service';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    if (updateProfileDto.nickName && updateProfileDto.nickName !== user.nickName) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { nickName: updateProfileDto.nickName },
      });

      if (existingUser) throw new ConflictException('Nickname is already taken');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        firstName: updateProfileDto.firstName,
        lastName: updateProfileDto.lastName,
        nickName: updateProfileDto.nickName,
        bio: updateProfileDto.bio,
      },
    });

    return toAuthResponse(updatedUser);
  }

  async getProfile(userId: string): Promise<AuthResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    return toAuthResponse(user);
  }
}

