import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validate } from './validation';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Buscar .env en la raíz del proyecto (un nivel arriba de backend/)
      envFilePath: join(process.cwd(), '..', '.env'),
      load: [configuration],
      validate,
    }),
  ],
})
export class ConfigAppModule { }