import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Res
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import type { Response } from 'express';
import { TemperatureHistoryService } from './temperature-history.service';
import { GetTemperatureHistoryDto } from './dto/get-temperature-history.dto';
import { FilterTemperatureHistoryDto } from './dto/filter-temperature-history.dto';
import { TemperatureHistory } from './schemas/temperature-history.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('temperature-history')
@Controller('temperature-history')
@UseGuards(JwtAuthGuard)
export class TemperatureHistoryController {
  constructor(private readonly temperatureHistoryService: TemperatureHistoryService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get temperature history records with optional filters' })
  @ApiQuery({ name: 'equipment', required: false, description: 'Filter by equipment name' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort order: 1 for ascending, -1 for descending' })
  @ApiResponse({
    status: 200,
    description: 'List of temperature history records',
    type: [TemperatureHistory]
  })
  async getHistory(@Query() getHistoryDto: GetTemperatureHistoryDto) {
    return this.temperatureHistoryService.getHistory(getHistoryDto);
  }

  @Get('filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get temperature history records with advanced filters' })
  @ApiQuery({ name: 'equipment', required: false, description: 'Filter by equipment name' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for filtering (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for filtering (ISO format)' })
  @ApiQuery({ name: 'minTemperature', required: false, description: 'Minimum temperature value' })
  @ApiQuery({ name: 'maxTemperature', required: false, description: 'Maximum temperature value' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' })
  @ApiResponse({
    status: 200,
    description: 'List of filtered temperature history records',
    type: [TemperatureHistory]
  })
  async getFilteredHistory(@Query() filterDto: FilterTemperatureHistoryDto) {
    return this.temperatureHistoryService.findByFilters(filterDto);
  }

  @Get('equipment/:equipmentName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get temperature history for a specific equipment' })
  @ApiParam({ name: 'equipmentName', description: 'Name of the equipment' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' })
  @ApiResponse({
    status: 200,
    description: 'List of temperature history records for the specified equipment',
    type: [TemperatureHistory]
  })
  @ApiResponse({
    status: 404,
    description: 'No records found for the specified equipment'
  })
  async getHistoryByEquipment(
    @Param('equipmentName') equipmentName: string,
    @Query('limit') limit?: string
  ) {
    let limitNum: number | undefined = undefined;
    if (limit !== undefined) {
      limitNum = parseInt(limit, 10);
      if (isNaN(limitNum) || limitNum <= 0) {
        throw new BadRequestException('Limit must be a positive number');
      }
    }

    const records = await this.temperatureHistoryService.findByEquipment(equipmentName, limitNum);

    if (records.length === 0) {
      throw new NotFoundException(`No temperature records found for equipment: ${equipmentName}`);
    }

    return records;
  }



  @Get('equipment-list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of all unique equipment names' })
  @ApiResponse({
    status: 200,
    description: 'List of all unique equipment names',
    schema: {
      type: 'array',
      example: ['Torre Fusora', 'Linea 1', 'Linea 2']
    }
  })
  async getEquipmentList() {
    return this.temperatureHistoryService.getUniqueEquipmentList();
  }

  @Get('equipment/:equipmentName/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get statistics for a specific equipment' })
  @ApiParam({ name: 'equipmentName', description: 'Name of the equipment' })
  @ApiResponse({
    status: 200,
    description: 'Statistics for the specified equipment',
    schema: {
      type: 'object',
      example: {
        count: 150,
        avgTemperature: 725.5,
        minTemperature: 700.2,
        maxTemperature: 750.8,
        lastReading: '2023-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'No records found for the specified equipment'
  })
  async getEquipmentStats(@Param('equipmentName') equipmentName: string) {
    const stats = await this.temperatureHistoryService.getEquipmentStats(equipmentName);

    if (stats.count === 0) {
      throw new NotFoundException(`No temperature records found for equipment: ${equipmentName}`);
    }

    return stats;
  }
}