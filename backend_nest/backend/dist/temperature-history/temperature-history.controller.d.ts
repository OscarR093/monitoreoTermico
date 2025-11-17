import { TemperatureHistoryService } from './temperature-history.service';
import { GetTemperatureHistoryDto } from './dto/get-temperature-history.dto';
import { FilterTemperatureHistoryDto } from './dto/filter-temperature-history.dto';
export declare class TemperatureHistoryController {
    private readonly temperatureHistoryService;
    constructor(temperatureHistoryService: TemperatureHistoryService);
    getHistory(getHistoryDto: GetTemperatureHistoryDto): Promise<import("./schemas/temperature-history.schema").TemperatureHistoryDocument[]>;
    getFilteredHistory(filterDto: FilterTemperatureHistoryDto): Promise<import("./schemas/temperature-history.schema").TemperatureHistoryDocument[]>;
    getHistoryByEquipment(equipmentName: string, limit?: string): Promise<import("./schemas/temperature-history.schema").TemperatureHistoryDocument[]>;
    getThermocoupleHistoryByEquipment(equipmentName: string, limit?: string): Promise<import("./schemas/temperature-history.schema").TemperatureHistoryDocument[]>;
    getEquipmentList(): Promise<string[]>;
    getEquipmentStats(equipmentName: string): Promise<{
        count: number;
        avgTemperature: number;
        minTemperature: number;
        maxTemperature: number;
        lastReading: Date | null;
    }>;
}
