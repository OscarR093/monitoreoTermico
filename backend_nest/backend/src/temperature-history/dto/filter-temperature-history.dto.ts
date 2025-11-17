import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class FilterTemperatureHistoryDto {
  @ApiPropertyOptional({
    description: 'Filter by equipment name',
    example: 'Torre Fusora',
  })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Minimum temperature value',
    example: 700,
    minimum: -273.15,
  })
  @IsOptional()
  @IsNumber()
  @Min(-273.15)
  minTemperature?: number;

  @ApiPropertyOptional({
    description: 'Maximum temperature value',
    example: 800,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Max(10000)
  maxTemperature?: number;

  @ApiPropertyOptional({
    description: 'Limit number of records to return',
    example: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}