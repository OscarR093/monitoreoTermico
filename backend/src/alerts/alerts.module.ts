import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { TelegramService } from './telegram.service';
import { AlertsConfigLoader } from './config/alerts-config.loader';

@Module({
    providers: [AlertsService, TelegramService, AlertsConfigLoader],
    exports: [AlertsService],
})
export class AlertsModule { }
