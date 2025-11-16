import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigAppModule } from './config/config.module';

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
  ],
})
export class AppModule { }

