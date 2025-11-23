import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemperatureHistory, TemperatureHistorySchema } from './schemas/temperature-history.schema';
import { TemperatureHistoryService } from './temperature-history.service';
import { LegacyTemperatureHistoryController } from './legacy-temperature-history.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TemperatureHistory.name,
        schema: TemperatureHistorySchema,
        // Opcional: especificar nombre de colección predeterminado
        // collection: 'temperature_history' 
      }
    ]),
  ],
  providers: [TemperatureHistoryService],
  controllers: [LegacyTemperatureHistoryController],
  exports: [TemperatureHistoryService], // Exportar el servicio para que pueda ser usado por otros módulos
})
export class TemperatureHistoryModule { }