import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe'
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'securePassword123',
    minLength: 6
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe'
  })
  @IsString()
  fullName: string;

  @ApiProperty({ 
    description: 'Whether the user has admin privileges',
    required: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  admin?: boolean;

  @ApiProperty({ 
    description: 'Whether the user has super admin privileges',
    required: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;

  @ApiProperty({ 
    description: 'Cell phone number of the user',
    required: false,
    example: '+1234567890'
  })
  @IsOptional()
  @IsString()
  cellPhone?: string;
}

