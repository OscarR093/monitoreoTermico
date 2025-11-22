import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Obtener el token de la cookie en lugar del header Authorization
    const token = request.cookies?.access_token;
    
    if (token) {
      // Colocar el token en el header para que Passport pueda leerlo
      request.headers.authorization = `Bearer ${token}`;
    }
    
    return super.canActivate(context);
  }
}