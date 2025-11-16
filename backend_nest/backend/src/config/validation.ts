import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsString()
  @IsOptional()
  DOMAIN_URL?: string;

  @IsString()
  @IsOptional()
  LETSENCRYPT_EMAIL?: string;

  @IsString()
  MONGO_USER: string;

  @IsString()
  MONGO_PASS: string;

  @IsString()
  MONGO_DB_NAME: string;

  @IsNumber()
  @IsOptional()
  MONGO_PORT?: number;

  @IsString()
  @IsOptional()
  MOSQUITTO_USER?: string;

  @IsString()
  @IsOptional()
  MOSQUITTO_PASS?: string;

  @IsString()
  @IsOptional()
  EMQX_NODE_COOKIE?: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;

  @IsNumber()
  @IsOptional()
  BCRYPT_SALT_ROUNDS?: number;

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  @IsString()
  @IsOptional()
  SUPER_USER_USERNAME?: string;

  @IsString()
  @IsOptional()
  SUPER_USER_PASSWORD?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,  // Permitir propiedades faltantes ya que tenemos valores por defecto
  });

  if (errors.length > 0) {
    const errorMessages = errors.map(error => {
      if (error.constraints) {
        return `${error.property}: ${Object.values(error.constraints).join(', ')}`;
      }
      return error.property;
    }).join('; ');
    throw new Error(`Environment validation failed: ${errorMessages}`);
  }
  return validatedConfig;
}