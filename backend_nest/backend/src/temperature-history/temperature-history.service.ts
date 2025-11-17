import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { TemperatureHistory, TemperatureHistoryDocument } from './schemas/temperature-history.schema';
import { GetTemperatureHistoryDto } from './dto/get-temperature-history.dto';
import { FilterTemperatureHistoryDto } from './dto/filter-temperature-history.dto';

@Injectable()
export class TemperatureHistoryService {
  constructor(
    @InjectModel(TemperatureHistory.name) 
    private temperatureHistoryModel: Model<TemperatureHistoryDocument>,
  ) {}

  // Método para guardar un registro de temperatura (utilizado por el consumidor MQTT)
  async saveTemperatureReading(equipmentName: string, temperature: number, timestamp?: Date): Promise<TemperatureHistoryDocument> {
    return this.temperatureHistoryModel.create({
      timestamp: timestamp || new Date(),
      temperatura: temperature,
      equipo: equipmentName,
    });
  }

  // Método para encontrar historiales por equipo
  async findByEquipment(equipmentName: string, limit?: number): Promise<TemperatureHistoryDocument[]> {
    const query = { equipo: equipmentName };
    const options: any = { sort: { timestamp: -1 } }; // Ordenar por timestamp descendente
    
    if (limit) {
      options.limit = limit;
    }

    const result = await this.temperatureHistoryModel.find(query, null, options).exec();
    return result as unknown as TemperatureHistoryDocument[];
  }

  // Método para encontrar historiales con filtros
  async findByFilters(filterDto: FilterTemperatureHistoryDto): Promise<TemperatureHistoryDocument[]> {
    const { equipment, startDate, endDate, minTemperature, maxTemperature, limit } = filterDto;
    
    const query: FilterQuery<TemperatureHistoryDocument> = {};
    
    if (equipment) {
      query.equipo = equipment;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    if (minTemperature !== undefined) {
      query.temperatura = { ...query.temperatura, $gte: minTemperature };
    }
    
    if (maxTemperature !== undefined) {
      query.temperatura = { ...query.temperatura, $lte: maxTemperature };
    }

    const options: any = { sort: { timestamp: -1 } };
    if (limit) {
      options.limit = limit;
    }

    const result = await this.temperatureHistoryModel.find(query, null, options).exec();
    return result as unknown as TemperatureHistoryDocument[];
  }

  // Método para obtener historial con opciones de paginación y límite
  async getHistory(getHistoryDto: GetTemperatureHistoryDto): Promise<TemperatureHistoryDocument[]> {
    const { equipment, limit = 100, sort = -1 } = getHistoryDto;
    
    const query = equipment ? { equipo: equipment } : {};
    const options = { 
      sort: { timestamp: sort }, 
      limit: Math.min(limit, 1000) // Limitar a 1000 registros como máximo por seguridad
    };

    const result = await this.temperatureHistoryModel.find(query, null, options).exec();
    return result as unknown as TemperatureHistoryDocument[];
  }

  // Método para encontrar todos los registros
  async findAll(): Promise<TemperatureHistoryDocument[]> {
    const result = await this.temperatureHistoryModel.find().sort({ timestamp: -1 }).exec();
    return result as unknown as TemperatureHistoryDocument[];
  }

  // Método para eliminar registros antiguos (si es necesario hacerlo manualmente)
  async deleteOldRecords(ageInDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ageInDays);
    
    const result = await this.temperatureHistoryModel.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  }

  // Método para obtener la lista de equipos únicos
  async getUniqueEquipmentList(): Promise<string[]> {
    return this.temperatureHistoryModel.distinct('equipo');
  }

  // Método para obtener estadísticas básicas de un equipo
  async getEquipmentStats(equipment: string): Promise<{
    count: number;
    avgTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    lastReading: Date | null;
  }> {
    const stats = await this.temperatureHistoryModel
      .aggregate([
        { $match: { equipo: equipment } },
        {
          $group: {
            _id: '$equipo',
            count: { $sum: 1 },
            avgTemperature: { $avg: '$temperatura' },
            minTemperature: { $min: '$temperatura' },
            maxTemperature: { $max: '$temperatura' },
            lastReading: { $max: '$timestamp' }
          }
        }
      ])
      .exec();

    if (stats.length > 0) {
      return {
        count: stats[0].count,
        avgTemperature: Number(stats[0].avgTemperature.toFixed(2)),
        minTemperature: stats[0].minTemperature,
        maxTemperature: stats[0].maxTemperature,
        lastReading: stats[0].lastReading
      };
    }

    return {
      count: 0,
      avgTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0,
      lastReading: null
    };
  }
}