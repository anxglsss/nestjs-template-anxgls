import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty({
    description: 'Post unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Post title',
    example: 'My first post',
  })
  title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is the content of my first post',
  })
  content: string;

  @ApiProperty({
    description: 'Whether the post is public',
    example: true,
  })
  isPublic: boolean;

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