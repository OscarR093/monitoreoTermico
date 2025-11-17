import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class GetTemperatureHistoryDto {
  @ApiPropertyOptional({
    description: 'Filter by equipment name',
    example: 'Torre Fusora',
  })
  @IsOptional()
  @IsString()
  equipment?: string;

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
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Sort order: 1 for ascending, -1 for descending',
    example: -1,
  })
  @IsOptional()
  @IsNumber()
  sort?: number = -1;
}