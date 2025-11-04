import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'My first post',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'This is the content of my first post',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Whether the post is public',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}