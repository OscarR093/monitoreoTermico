import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @Get('env')
  @ApiOperation({ summary: 'Get environment variables for frontend (compatible with original API)' })
  @ApiResponse({
    status: 200,
    description: 'Environment variables',
    schema: {
      type: 'object',
      example: {
        APP_ENV: 'development',
        WS_HOST: 'localhost:3000'
      }
    }
  })
  getEnv() {
    return {
      APP_ENV: process.env.NODE_ENV || 'development',
      WS_HOST: process.env.DOMAIN_URL || 'localhost:3000'
    };
  }
}
