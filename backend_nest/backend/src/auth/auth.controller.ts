import { Controller, Post, Body, UnauthorizedException, HttpCode, Get, UseGuards, Request, Res, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response } from 'express';

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
  @UseGuards(JwtAuthGuard)
  async register(@Body() dto: CreateUserDto, @Request() req) {
    // Verificar que el usuario sea administrador
    if (!req.user || !req.user.admin) {
      throw new ForbiddenException('Acceso denegado. Se requiere rol de administrador.');
    }

    // Si se intenta crear un admin, verificar que el solicitante sea SuperAdmin
    if (dto.admin && !req.user.isSuperAdmin) {
      throw new ForbiddenException('Acceso denegado. Solo un superusuario puede crear administradores.');
    }

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
  async login(@Body() dto: LoginDto, @Res() res) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const result = await this.authService.login(user);

    // Establecer cookie con el token
    this.authService.setCookieToken(res, result.access_token);

    // Devolver el usuario y el token en el cuerpo de la respuesta
    // El frontend espera response.user o response (si es el usuario directo)
    return res.json({
      access_token: result.access_token,
      user: result.user
    });
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check user session' })
  @ApiResponse({
    status: 200,
    description: 'Session is valid',
    schema: {
      type: 'object',
      example: {
        valid: true,
        user: {
          _id: '673b2a1c9d8e4f5a6b7c8d9e',
          username: 'john_doe',
          email: 'john@example.com',
          fullName: 'John Doe',
          admin: false,
          isSuperAdmin: false,
          cellPhone: '',
          createdAt: '2025-11-15T10:30:00.000Z',
          updatedAt: '2025-11-15T10:30:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Session is invalid or expired'
  })
  checkSession(@Request() req) {
    console.log('Check Session User:', req.user);
    return {
      valid: true,
      user: req.user
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user and clear session' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      example: {
        loggedOut: true
      }
    }
  })
  @UseGuards(JwtAuthGuard)
  logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({ loggedOut: true });
  }
}

// CONTROLADOR DE RUTAS LEGACY ALIAS - para compatibilidad con frontend
@Controller()
export class LegacyAuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  // Alias para login (frontend llama a /api/login, no /api/auth/login)
  @Post('login')
  @HttpCode(200)
  async loginAlias(@Body() dto: LoginDto, @Res() res) {
    const user = await this.authService.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const result = await this.authService.login(user);

    // Establecer cookie con el token
    this.authService.setCookieToken(res, result.access_token);

    // Devolver el usuario y el token en el cuerpo de la respuesta
    return res.json({
      access_token: result.access_token,
      user: result.user
    });
  }

  // Alias para check (frontend llama a /api/auth/check)
  @Get('auth/check')
  @UseGuards(JwtAuthGuard)
  checkSessionAlias(@Request() req) {
    return {
      valid: true,
      user: req.user
    };
  }

  // Alias para register
  @Post('register')
  @UseGuards(JwtAuthGuard)
  async registerAlias(@Body() dto: CreateUserDto, @Request() req) {
    // Verificar que el usuario sea administrador
    if (!req.user || !req.user.admin) {
      throw new ForbiddenException('Acceso denegado. Se requiere rol de administrador.');
    }

    // Si se intenta crear un admin, verificar que el solicitante sea SuperAdmin
    if (dto.admin && !req.user.isSuperAdmin) {
      throw new ForbiddenException('Acceso denegado. Solo un superusuario puede crear administradores.');
    }

    const user: HydratedDocument<User> = await this.usersService.create(dto);
    const { password, ...rest } = user.toObject();
    return rest;
  }

  // Alias para logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logoutAlias(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({ loggedOut: true });
  }
}