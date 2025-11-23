import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';

        this.logger.log(`[REQUEST] ${method} ${originalUrl} - User Agent: ${userAgent}`);

        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            this.logger.log(
                `[RESPONSE] ${method} ${originalUrl} ${statusCode} ${contentLength} - User Agent: ${userAgent}`,
            );
        });

        next();
    }
}
