import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Registrar la excepción global
    this.logger.error(
      `<<<<< UNCAUGHT EXCEPTION >>>>>\n` +
      `Caught exception: ${exception}\n` +
      `Exception origin: ${request.method} ${request.url}\n` +
      `Stack: ${(exception as Error).stack || 'No stack trace available'}`
    );

    // Determinar el código de estado y mensaje
    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else {
      status = 500;
      message = 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}