import { Injectable } from '@nestjs/common';
import { AlertsConfigLoader } from './config/alerts-config.loader';
import { TelegramService } from './telegram.service';

@Injectable()
export class AlertsService {
    constructor(
        private configLoader: AlertsConfigLoader,
        private telegramService: TelegramService,
    ) { }

    async checkAndNotify(equipmentName: string, temperature: number): Promise<void> {
        // Verificar si el sistema está habilitado
        if (!this.configLoader.isEnabled()) {
            return;
        }

        // Obtener configuración del equipo
        const config = this.configLoader.getEquipmentConfig(equipmentName);

        if (!config || !config.enabled) {
            return; // No hay config o está desactivada
        }

        const { minTemp, maxTemp } = config;

        // Verificar si está fuera de rango
        if (temperature < minTemp || temperature > maxTemp) {
            console.log(`[AlertsService] Temperature out of range for ${equipmentName}: ${temperature}°C (${minTemp}-${maxTemp})`);
            await this.telegramService.sendAlert(
                equipmentName,
                temperature,
                minTemp,
                maxTemp
            );
        }
    }
}
