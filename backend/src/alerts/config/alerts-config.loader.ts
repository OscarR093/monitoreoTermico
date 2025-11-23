import { Injectable } from '@nestjs/common';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface EquipmentAlertConfig {
    name: string;
    minTemp: number;
    maxTemp: number;
    enabled: boolean;
    description?: string;
}

export interface AlertsConfig {
    enabled: boolean;
    telegram: {
        botToken: string;
        channelId: string;
    };
    equipments: EquipmentAlertConfig[];
}

@Injectable()
export class AlertsConfigLoader {
    private config: AlertsConfig;

    constructor() {
        this.loadConfig();
    }

    private loadConfig(): void {
        try {
            const configPath = path.join(process.cwd(), 'config', 'alerts.config.yaml');
            const fileContents = fs.readFileSync(configPath, 'utf8');

            // Reemplazar variables de entorno
            const processedContent = fileContents.replace(
                /\$\{(\w+)\}/g,
                (_, envVar) => process.env[envVar] || ''
            );

            const data = yaml.load(processedContent) as any;
            this.config = data.alerts;

            console.log(`[AlertsConfigLoader] Loaded config for ${this.config.equipments.length} equipment(s)`);
        } catch (error) {
            console.error('[AlertsConfigLoader] Error loading alerts config:', error.message);
            // Config por defecto si falla
            this.config = {
                enabled: false,
                telegram: { botToken: '', channelId: '' },
                equipments: []
            };
        }
    }

    getConfig(): AlertsConfig {
        return this.config;
    }

    getEquipmentConfig(equipmentName: string): EquipmentAlertConfig | undefined {
        return this.config.equipments.find(eq => eq.name === equipmentName);
    }

    isEnabled(): boolean {
        return this.config.enabled;
    }
}
