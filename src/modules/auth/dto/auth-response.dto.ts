import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User nickname',
    example: 'johndoe',
  })
  nickName: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-11-02T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-11-02T10:00:00.000Z',
  })
  updatedAt: Date;
}

