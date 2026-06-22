import { Controller, Get, Param, NotFoundException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TemperatureHistoryService } from './temperature-history.service';

@ApiTags('realtime-temperature')
@Controller('api/realtime')
export class RealtimeTemperatureController {
    constructor(private readonly temperatureHistoryService: TemperatureHistoryService) { }

    @Get(':equipmentName')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener la última lectura de temperatura de un equipo',
        description: 'Devuelve la temperatura más reciente y su timestamp para el equipo especificado.'
    })
    @ApiParam({ name: 'equipmentName', description: 'Nombre del equipo (ej. Torre Fusora)' })
    @ApiResponse({
        status: 200,
        description: 'Última lectura encontrada',
        schema: {
            type: 'object',
            properties: {
                temperatura: { type: 'number', description: 'Temperatura en °C' },
                timestamp: { type: 'string', format: 'date-time', description: 'Momento de la lectura' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'No se encontraron registros para este equipo'
    })
    async getRealtimeReading(
        @Param('equipmentName') equipmentName: string
    ) {
        const record = await this.temperatureHistoryService.getLatestByEquipment(equipmentName);

        if (!record) {
            throw new NotFoundException(`No se encontraron registros para el equipo: ${equipmentName}`);
        }

        return {
            temperatura: record.temperatura,
            timestamp: record.timestamp,
        };
    }
}
