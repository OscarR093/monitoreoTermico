import { Controller, Post, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { User } from '../users/schemas/user.schema';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    schema: {
      type: 'object',
      example: {
        _id: '673b2a1c9d8e4f5a6b7c8d9e',
        username: 'john_doe',
        email: 'john.doe@example.com',
        fullName: 'John Doe',
        admin: false,
        isSuperAdmin: false,
        cellPhone: '+1234567890',
        mustChangePassword: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        __v: 0
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - User already exists' 
  })
  async register(@Body() dto: CreateUserDto) {
    const user: HydratedDocument<User> = await this.usersService.create(dto);
    const { password, ...rest } = user.toObject();
    return rest;
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT access token',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid credentials' 
  })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    return this.authService.login(user); // user ya es POJO sin password
  }
}

