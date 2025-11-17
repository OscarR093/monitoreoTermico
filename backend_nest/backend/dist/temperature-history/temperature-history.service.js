"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureHistoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const temperature_history_schema_1 = require("./schemas/temperature-history.schema");
let TemperatureHistoryService = class TemperatureHistoryService {
    temperatureHistoryModel;
    constructor(temperatureHistoryModel) {
        this.temperatureHistoryModel = temperatureHistoryModel;
    }
    async saveTemperatureReading(equipmentName, temperature, timestamp) {
        return this.temperatureHistoryModel.create({
            timestamp: timestamp || new Date(),
            temperatura: temperature,
            equipo: equipmentName,
        });
    }
    async findByEquipment(equipmentName, limit) {
        const query = { equipo: equipmentName };
        const options = { sort: { timestamp: -1 } };
        if (limit) {
            options.limit = limit;
        }
        const result = await this.temperatureHistoryModel.find(query, null, options).exec();
        return result;
    }
    async findByFilters(filterDto) {
        const { equipment, startDate, endDate, minTemperature, maxTemperature, limit } = filterDto;
        const query = {};
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
        const options = { sort: { timestamp: -1 } };
        if (limit) {
            options.limit = limit;
        }
        const result = await this.temperatureHistoryModel.find(query, null, options).exec();
        return result;
    }
    async getHistory(getHistoryDto) {
        const { equipment, limit = 100, sort = -1 } = getHistoryDto;
        const query = equipment ? { equipo: equipment } : {};
        const options = {
            sort: { timestamp: sort },
            limit: Math.min(limit, 1000)
        };
        const result = await this.temperatureHistoryModel.find(query, null, options).exec();
        return result;
    }
    async findAll() {
        const result = await this.temperatureHistoryModel.find().sort({ timestamp: -1 }).exec();
        return result;
    }
    async deleteOldRecords(ageInDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - ageInDays);
        const result = await this.temperatureHistoryModel.deleteMany({
            timestamp: { $lt: cutoffDate }
        });
        return result.deletedCount;
    }
    async getUniqueEquipmentList() {
        return this.temperatureHistoryModel.distinct('equipo');
    }
    async getEquipmentStats(equipment) {
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
};
exports.TemperatureHistoryService = TemperatureHistoryService;
exports.TemperatureHistoryService = TemperatureHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(temperature_history_schema_1.TemperatureHistory.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TemperatureHistoryService);
//# sourceMappingURL=temperature-history.service.js.map