import { Model } from 'mongoose';
import { TemperatureHistoryDocument } from './schemas/temperature-history.schema';
import { GetTemperatureHistoryDto } from './dto/get-temperature-history.dto';
import { FilterTemperatureHistoryDto } from './dto/filter-temperature-history.dto';
export declare class TemperatureHistoryService {
    private temperatureHistoryModel;
    constructor(temperatureHistoryModel: Model<TemperatureHistoryDocument>);
    saveTemperatureReading(equipmentName: string, temperature: number, timestamp?: Date): Promise<TemperatureHistoryDocument>;
    findByEquipment(equipmentName: string, limit?: number): Promise<TemperatureHistoryDocument[]>;
    findByFilters(filterDto: FilterTemperatureHistoryDto): Promise<TemperatureHistoryDocument[]>;
    getHistory(getHistoryDto: GetTemperatureHistoryDto): Promise<TemperatureHistoryDocument[]>;
    findAll(): Promise<TemperatureHistoryDocument[]>;
    deleteOldRecords(ageInDays: number): Promise<number>;
    getUniqueEquipmentList(): Promise<string[]>;
    getEquipmentStats(equipment: string): Promise<{
        count: number;
        avgTemperature: number;
        minTemperature: number;
        maxTemperature: number;
        lastReading: Date | null;
    }>;
}
