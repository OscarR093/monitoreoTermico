import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        // Primero intentamos obtener el token del header Authorization
        let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        // Si no está en el header, intentamos obtenerlo de la cookie
        if (!token && req.cookies) {
          token = req.cookies.access_token;
        }

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret', 'defaultSecret'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Buscamos el usuario completo en la base de datos
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Retornamos el usuario completo (sin password) y aseguramos que 'id' esté presente
    // Al usar .toObject() con virtuals habilitados en el esquema, 'id' debería estar,
    // pero lo forzamos aquí para mayor seguridad si 'user' es un documento de Mongoose.
    const userObj = user['toObject'] ? user['toObject']() : user;
    return {
      ...userObj,
      id: userObj._id.toString(),
    };
  }
}

