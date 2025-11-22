import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';
import { TemperatureHistoryModule } from './temperature-history/temperature-history.module';
import { MqttModule } from './mqtt/mqtt.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { FrontendController } from './frontend.controller';
import { LoggerMiddleware } from './middlewares/logger.middleware';

import { EnvController } from './config/env.controller';

@Module({
  imports: [
    ConfigAppModule,
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(process.cwd(), 'frontend_dist'),
          serveRoot: '/',
          exclude: ['/api*'],
        },
      ],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('mongo.user')}:${configService.get('mongo.password')}@localhost:${configService.get('mongo.port')}/monitoreoTermico?authSource=admin`,
      }),
    }),
    UsersModule,
    AuthModule,
    TemperatureHistoryModule,
    MqttModule,
    WebSocketModule,
  ],
  controllers: [EnvController, AppController, FrontendController],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

