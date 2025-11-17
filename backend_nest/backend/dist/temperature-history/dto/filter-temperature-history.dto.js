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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterTemperatureHistoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class FilterTemperatureHistoryDto {
    equipment;
    startDate;
    endDate;
    minTemperature;
    maxTemperature;
    limit;
}
exports.FilterTemperatureHistoryDto = FilterTemperatureHistoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by equipment name',
        example: 'Torre Fusora',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FilterTemperatureHistoryDto.prototype, "equipment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Start date for filtering (ISO format)',
        example: '2023-01-01T00:00:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FilterTemperatureHistoryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'End date for filtering (ISO format)',
        example: '2023-12-31T23:59:59.999Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FilterTemperatureHistoryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum temperature value',
        example: 700,
        minimum: -273.15,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-273.15),
    __metadata("design:type", Number)
], FilterTemperatureHistoryDto.prototype, "minTemperature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum temperature value',
        example: 800,
        maximum: 10000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Max)(10000),
    __metadata("design:type", Number)
], FilterTemperatureHistoryDto.prototype, "maxTemperature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Limit number of records to return',
        example: 100,
        minimum: 1,
        maximum: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], FilterTemperatureHistoryDto.prototype, "limit", void 0);
//# sourceMappingURL=filter-temperature-history.dto.js.map