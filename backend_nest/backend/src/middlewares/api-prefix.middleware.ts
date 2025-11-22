import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiPrefixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Si la URL original comienza con /api/, la redirigimos removiendo el prefijo
    if (req.url.startsWith('/api/')) {
      // Remover el prefijo '/api' de la URL
      const newUrl = req.url.substring(4); // Elimina los primeros 4 caracteres ('/api')
      
      // Actualizar el URL del request
      (req as any)._parsedUrl = null; // Limpiar cache interna
      req.url = newUrl;
      req.originalUrl = newUrl;
    }
    next();
  }
}