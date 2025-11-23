import { Controller, Get, Res, Req, NotFoundException } from '@nestjs/common';
import type { Response, Request } from 'express';
import { join } from 'path';

@Controller()
export class FrontendController {
    // Catch-all para servir la SPA en cualquier ruta que no sea API
    @Get('*')
    serveSpa(@Req() req: Request, @Res() res: Response) {
        // Si la ruta empieza por /api y llegó aquí, es un 404 real de la API
        if (req.path.startsWith('/api')) {
            throw new NotFoundException(`Cannot GET ${req.path}`);
        }

        // Si la ruta parece un archivo estático (tiene extensión), devolver 404
        // Esto evita que se sirva index.html para imágenes o scripts faltantes (error MIME type)
        if (req.path.match(/\.[^/]+$/)) {
            throw new NotFoundException(`File not found: ${req.path}`);
        }

        // Para cualquier otra ruta (navegación SPA), servir index.html
        res.sendFile(join(process.cwd(), 'frontend_dist', 'index.html'));
    }
}
