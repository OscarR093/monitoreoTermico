import { Controller, Get, Param, NotFoundException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TemperatureHistoryService } from './temperature-history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('temperature-history-legacy')
@Controller('api/thermocouple-history')
@UseGuards(JwtAuthGuard)
export class LegacyTemperatureHistoryController {
    constructor(private readonly temperatureHistoryService: TemperatureHistoryService) { }

    @Get(':equipmentName')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get temperature history for a specific equipment (legacy)',
        description: 'Endpoint compatible with original backend: GET /api/thermocouple-history/:nombre'
    })
    @ApiParam({ name: 'equipmentName', description: 'Name of the equipment' })
    @ApiResponse({
        status: 200,
        description: 'Temperature history retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    temperatura: { type: 'number', description: 'Temperature value' },
                    timestamp: { type: 'string', format: 'date-time', description: 'Timestamp of the reading' }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'No records found for this equipment in the last 24 hours'
    })
    async getThermocoupleHistoryByEquipment(
        @Param('equipmentName') equipmentName: string
    ) {
        const records = await this.temperatureHistoryService.findByEquipment(equipmentName);

        if (records.length === 0) {
            throw new NotFoundException(`No se encontraron registros para este equipo en las últimas 24 horas`);
        }

        return records;
    }
}
