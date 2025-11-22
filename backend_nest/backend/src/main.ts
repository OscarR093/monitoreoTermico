import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './exceptions/global-exception.filter';
import { UnhandledRejectionHandler } from './exceptions/unhandled-rejection.filter';
import { WsAdapter } from '@nestjs/platform-ws';
import { join } from 'path';

async function bootstrap() {
  // Iniciar el manejador de rechazos no manejados
  new UnhandledRejectionHandler();

  const app = await NestFactory.create(AppModule);

  // Configurar adaptador WebSocket nativo (compatible con el frontend)
  app.useWebSocketAdapter(new WsAdapter(app));

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: true, // En producción, cambiar esto por el dominio específico del frontend
    credentials: true,
  });

  // Configurar prefijo global /api para todas las rutas excepto las del frontend
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'login', method: RequestMethod.GET }, // Ruta del frontend
    ],
  });

  // Middleware para manejar cookies
  app.use(cookieParser());

  // Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Validación global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API de autenticación')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT || 3000);
  Logger.log(`Application is running on: http://localhost:${process.env.PORT || 3000}`);

  // DEBUG: Imprimir rutas registradas
  const server = app.getHttpAdapter().getInstance();
  const router = server._router;

  if (router && router.stack) {
    const availableRoutes = router.stack
      .map(layer => {
        if (layer.route) {
          return {
            path: layer.route?.path,
            method: layer.route?.stack[0].method,
          };
        }
      })
      .filter(item => item !== undefined);
    console.log('Rutas Registradas:', JSON.stringify(availableRoutes, null, 2));
  }
}
bootstrap();

