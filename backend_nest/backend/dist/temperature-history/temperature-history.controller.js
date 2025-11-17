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
exports.TemperatureHistoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const temperature_history_service_1 = require("./temperature-history.service");
const get_temperature_history_dto_1 = require("./dto/get-temperature-history.dto");
const filter_temperature_history_dto_1 = require("./dto/filter-temperature-history.dto");
const temperature_history_schema_1 = require("./schemas/temperature-history.schema");
let TemperatureHistoryController = class TemperatureHistoryController {
    temperatureHistoryService;
    constructor(temperatureHistoryService) {
        this.temperatureHistoryService = temperatureHistoryService;
    }
    async getHistory(getHistoryDto) {
        return this.temperatureHistoryService.getHistory(getHistoryDto);
    }
    async getFilteredHistory(filterDto) {
        return this.temperatureHistoryService.findByFilters(filterDto);
    }
    async getHistoryByEquipment(equipmentName, limit) {
        let limitNum = undefined;
        if (limit !== undefined) {
            limitNum = parseInt(limit, 10);
            if (isNaN(limitNum) || limitNum <= 0) {
                throw new common_1.BadRequestException('Limit must be a positive number');
            }
        }
        const records = await this.temperatureHistoryService.findByEquipment(equipmentName, limitNum);
        if (records.length === 0) {
            throw new common_1.NotFoundException(`No temperature records found for equipment: ${equipmentName}`);
        }
        return records;
    }
    async getThermocoupleHistoryByEquipment(equipmentName, limit) {
        let limitNum = undefined;
        if (limit !== undefined) {
            limitNum = parseInt(limit, 10);
            if (isNaN(limitNum) || limitNum <= 0) {
                throw new common_1.BadRequestException('Limit must be a positive number');
            }
        }
        const records = await this.temperatureHistoryService.findByEquipment(equipmentName, limitNum);
        if (records.length === 0) {
            throw new common_1.NotFoundException(`No temperature records found for equipment: ${equipmentName}`);
        }
        return records;
    }
    async getEquipmentList() {
        return this.temperatureHistoryService.getUniqueEquipmentList();
    }
    async getEquipmentStats(equipmentName) {
        const stats = await this.temperatureHistoryService.getEquipmentStats(equipmentName);
        if (stats.count === 0) {
            throw new common_1.NotFoundException(`No temperature records found for equipment: ${equipmentName}`);
        }
        return stats;
    }
};
exports.TemperatureHistoryController = TemperatureHistoryController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get temperature history records with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'equipment', required: false, description: 'Filter by equipment name' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false, description: 'Sort order: 1 for ascending, -1 for descending' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of temperature history records',
        type: [temperature_history_schema_1.TemperatureHistory]
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_temperature_history_dto_1.GetTemperatureHistoryDto]),
    __metadata("design:returntype", Promise)
], TemperatureHistoryController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('filter'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get temperature history records with advanced filters' }),
    (0, swagger_1.ApiQuery)({ name: 'equipment', required: false, description: 'Filter by equipment name' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date for filtering (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date for filtering (ISO format)' }),
    (0, swagger_1.ApiQuery)({ name: 'minTemperature', required: false, description: 'Minimum temperature value' }),
    (0, swagger_1.ApiQuery)({ name: 'maxTemperature', required: false, description: 'Maximum temperature value' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of filtered temperature history records',
        type: [temperature_history_schema_1.TemperatureHistory]
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_temperature_history_dto_1.FilterTemperatureHistoryDto]),
    __metadata("design:returntype", Promise)
], TemperatureHistoryController.prototype, "getFilteredHistory", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentName'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get temperature history for a specific equipment' }),
    (0, swagger_1.ApiParam)({ name: 'equipmentName', description: 'Name of the equipment' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of temperature history records for the specified equipment',
        type: [temperature_history_schema_1.TemperatureHistory]
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No records found for the specified equipment'
    }),
    __param(0, (0, common_1.Param)('equipmentName')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemperatureHistoryController.prototype, "getHistoryByEquipment", null);
__decorate([
    (0, common_1.Get)('thermocouple-history/:equipmentName'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Get temperature history for a specific equipment (compatibility endpoint)',
        description: 'Este endpoint mantiene compatibilidad con el frontend existente'
    }),
    (0, swagger_1.ApiParam)({ name: 'equipmentName', description: 'Name of the equipment' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Limit number of records (max 1000)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of temperature history records for the specified equipment',
        type: [temperature_history_schema_1.TemperatureHistory]
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No records found for the specified equipment'
    }),
    __param(0, (0, common_1.Param)('equipmentName')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemperatureHistoryController.prototype, "getThermocoupleHistoryByEquipment", null);
__decorate([
    (0, common_1.Get)('equipment-list'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of all unique equipment names' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of all unique equipment names',
        schema: {
            type: 'array',
            example: ['Torre Fusora', 'Linea 1', 'Linea 2']
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemperatureHistoryController.prototype, "getEquipmentList", null);
__decorate([
    (0, common_1.Get)('equipment/:equipmentName/stats'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get statistics for a specific equipment' }),
    (0, swagger_1.ApiParam)({ name: 'equipmentName', description: 'Name of the equipment' }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'No records found for the specified equipment'
    }),
    __param(0, (0, common_1.Param)('equipmentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemperatureHistoryController.prototype, "getEquipmentStats", null);
exports.TemperatureHistoryController = TemperatureHistoryController = __decorate([
    (0, swagger_1.ApiTags)('temperature-history'),
    (0, common_1.Controller)('temperature-history'),
    __metadata("design:paramtypes", [temperature_history_service_1.TemperatureHistoryService])
], TemperatureHistoryController);
//# sourceMappingURL=temperature-history.controller.js.map