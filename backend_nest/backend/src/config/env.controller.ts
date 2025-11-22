import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('config')
@Controller('env')
export class EnvController {
    constructor(private configService: ConfigService) { }

    @Get()
    @ApiOperation({ summary: 'Get public environment variables' })
    @ApiResponse({
        status: 200,
        description: 'Public environment variables',
        schema: {
            type: 'object',
            properties: {
                APP_ENV: { type: 'string', example: 'development' },
                WS_HOST: { type: 'string', example: 'localhost:3000' }
            }
        }
    })
    getEnv() {
        return {
            APP_ENV: this.configService.get<string>('NODE_ENV') || 'development',
            WS_HOST: this.configService.get<string>('DOMAIN_URL') || 'localhost:3000',
        };
    }
}
