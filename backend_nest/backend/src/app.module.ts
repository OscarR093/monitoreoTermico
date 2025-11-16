import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        uri: `mongodb://${cs.get('MONGO_USER')}:${cs.get('MONGO_PASSWORD')}@localhost:27017/thermal_monitoring_db?authSource=admin`,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule { }

