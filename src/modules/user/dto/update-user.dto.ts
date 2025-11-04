import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    description: 'User nickname (unique)',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  nickName?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer and cat lover',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}

