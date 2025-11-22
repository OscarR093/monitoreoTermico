import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class FrontendController {
    // Servir index.html para /login para que React Router maneje la ruta
    @Get('login')
    serveLogin(@Res() res: Response) {
        res.sendFile(join(process.cwd(), 'frontend_dist', 'index.html'));
    }
}
