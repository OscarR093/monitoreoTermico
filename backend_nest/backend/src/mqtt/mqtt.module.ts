import { Module } from '@nestjs/common';
import { MqttConsumerService } from './mqtt-consumer.service';
import { TemperatureHistoryModule } from '../temperature-history/temperature-history.module';

@Module({
  imports: [TemperatureHistoryModule],
  providers: [MqttConsumerService],
  exports: [MqttConsumerService],
})
export class MqttModule {}