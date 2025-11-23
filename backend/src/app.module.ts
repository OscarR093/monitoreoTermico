import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';
import { TemperatureHistoryModule } from './temperature-history/temperature-history.module';
import { MqttModule } from './mqtt/mqtt.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { FrontendModule } from './frontend/frontend.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

import { EnvController } from './config/env.controller';

@Module({
  imports: [
    ConfigAppModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Usar MONGODB_URI de variable de entorno (producción) o construir URI (desarrollo)
        uri: process.env.MONGODB_URI ||
          `mongodb://${configService.get('mongo.user')}:${configService.get('mongo.password')}@localhost:${configService.get('mongo.port')}/monitoreoTermico?authSource=admin`,
      }),
    }),
    UsersModule,
    AuthModule,
    TemperatureHistoryModule,
    MqttModule,
    WebSocketModule,
    FrontendModule, // IMPORTANTE: Debe ser el último para que el catch-all funcione
  ],
  controllers: [EnvController, AppController],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

