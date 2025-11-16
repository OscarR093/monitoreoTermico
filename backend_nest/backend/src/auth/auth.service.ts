import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema';

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
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}

