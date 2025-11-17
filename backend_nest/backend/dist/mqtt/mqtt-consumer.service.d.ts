import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemperatureHistoryService } from '../temperature-history/temperature-history.service';
export declare class MqttConsumerService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly temperatureHistoryService;
    private client;
    private readonly TOPIC_HISTORY;
    private readonly TOPIC_REALTIME;
    private readonly TOPIC_CONTROL;
    private readonly logger;
    constructor(configService: ConfigService, temperatureHistoryService: TemperatureHistoryService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private handleMessage;
}
