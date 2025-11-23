import { IsOptional, IsString, IsBoolean, IsEmail, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
  SuperAdmin = 'superAdmin',
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Updated username for the user',
    example: 'john_updated',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Updated password for the user account',
    example: 'newSecurePassword123',
    minLength: 6,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    description: 'Updated email address of the user',
    example: 'john.updated@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Updated full name of the user',
    example: 'John Updated Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'Updated cell phone number of the user',
    required: false,
    example: '+1234567890'
  })
  @IsOptional()
  @IsString()
  cellPhone?: string;

  @ApiProperty({
    description: 'Whether the user has admin privileges',
    required: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  admin?: boolean;

  @ApiProperty({
    description: 'Whether the user is a super admin',
    required: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @ApiProperty({
    description: 'Whether the user must change their password on next login',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;
}