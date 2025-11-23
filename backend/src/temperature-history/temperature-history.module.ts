import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemperatureHistory, TemperatureHistorySchema } from './schemas/temperature-history.schema';
import { TemperatureHistoryService } from './temperature-history.service';
import { LegacyTemperatureHistoryController } from './legacy-temperature-history.controller';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TemperatureHistory.name, schema: TemperatureHistorySchema }
    ]),
    AlertsModule,
  ],
  controllers: [LegacyTemperatureHistoryController],
  providers: [TemperatureHistoryService],
  exports: [TemperatureHistoryService],
})
export class TemperatureHistoryModule { }