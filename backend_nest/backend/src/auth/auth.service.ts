import { Injectable, UnauthorizedException, Response } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';
import { Response as ExpressResponse } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  // Validación de usuario
  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByUsername(username, { lean: true }); // lean devuelve POJO
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...rest } = user; // destructuración sin toObject()
      return rest;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    // Asegurarnos de que el ID esté disponible para el payload JWT
    const payload = {
      sub: (user as any)._id?.toString() || (user as any).id,
      username: user.username,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  setCookieToken(res: ExpressResponse, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      sameSite: 'strict',
    });
  }
}

