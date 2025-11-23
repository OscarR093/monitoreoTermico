import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

@Injectable()
export class SpaFallbackMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('SpaFallbackMiddleware checking:', req.method, req.path);
        // Solo para peticiones GET que no son de API y que esperan HTML (navegación del navegador)
        if (
            req.method === 'GET' &&
            !req.path.startsWith('/api') &&
            req.headers.accept?.includes('text/html')
        ) {
            // Si es un archivo estático (tiene extensión), pasar al siguiente
            if (req.path.match(/\.\w+$/)) {
                return next();
            }

            // Para rutas de la aplicación, servir index.html
            const indexPath = join(process.cwd(), 'frontend_dist', 'index.html');
            return res.sendFile(indexPath);
        }

        next();
    }
}
