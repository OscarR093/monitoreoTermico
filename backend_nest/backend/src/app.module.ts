import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';
import { TemperatureHistoryModule } from './temperature-history/temperature-history.module';
import { MqttModule } from './mqtt/mqtt.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigAppModule,
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
})
export class AppModule { }

