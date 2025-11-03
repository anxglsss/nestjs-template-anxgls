import { AuthResponseDto } from '@modules/auth/dto/auth-response.dto';
import { User } from '@prisma/client';

export function toAuthResponse(user: User): AuthResponseDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    nickName: user.nickName,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

