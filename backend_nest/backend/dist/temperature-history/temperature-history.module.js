"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const temperature_history_schema_1 = require("./schemas/temperature-history.schema");
const temperature_history_service_1 = require("./temperature-history.service");
const temperature_history_controller_1 = require("./temperature-history.controller");
let TemperatureHistoryModule = class TemperatureHistoryModule {
};
exports.TemperatureHistoryModule = TemperatureHistoryModule;
exports.TemperatureHistoryModule = TemperatureHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: temperature_history_schema_1.TemperatureHistory.name,
                    schema: temperature_history_schema_1.TemperatureHistorySchema,
                }
            ]),
        ],
        providers: [temperature_history_service_1.TemperatureHistoryService],
        controllers: [temperature_history_controller_1.TemperatureHistoryController],
        exports: [temperature_history_service_1.TemperatureHistoryService],
    })
], TemperatureHistoryModule);
//# sourceMappingURL=temperature-history.module.js.map