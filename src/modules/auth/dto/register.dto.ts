import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'User nickname (unique)',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  nickName: string;

  @ApiProperty({
    description: 'User bio (optional)',
    example: 'Software developer',
    required: false,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;
}

