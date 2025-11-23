import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe'
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'securePassword123',
    minLength: 6
  })
  @IsString()
  password: string;
}

