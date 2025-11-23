import { Injectable } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { AlertsConfigLoader } from './config/alerts-config.loader';

@Injectable()
export class TelegramService {
    private bot: TelegramBot | null = null;
    private channelId: string;

    constructor(private configLoader: AlertsConfigLoader) {
        const config = this.configLoader.getConfig();
        const { botToken, channelId } = config.telegram;

        if (botToken && channelId) {
            this.bot = new TelegramBot(botToken, { polling: false });
            this.channelId = channelId;
            console.log('[TelegramService] Initialized successfully');
        } else {
            console.warn('[TelegramService] Not configured - alerts will not be sent');
        }
    }

    async sendAlert(
        equipmentName: string,
        temperature: number,
        min: number,
        max: number
    ): Promise<void> {
        if (!this.bot) {
            console.warn('[TelegramService] Bot not initialized, skipping alert');
            return;
        }

        const status = temperature < min ? '❄️ TEMPERATURA BAJA' : '🔥 TEMPERATURA ALTA';
        const emoji = temperature < min ? '⚠️' : '🚨';

        const message = `
${emoji} *ALERTA DE TEMPERATURA*

📍 *Equipo:* ${equipmentName}
🌡️ *Temperatura:* *${temperature}°C*
📊 *Rango permitido:* ${min}°C - ${max}°C
⚡ *Estado:* ${status}
    `.trim();

        try {
            await this.bot.sendMessage(this.channelId, message, {
                parse_mode: 'Markdown'
            });
            console.log(`[TelegramService] Alert sent for ${equipmentName}: ${temperature}°C`);
        } catch (error) {
            console.error('[TelegramService] Error sending alert:', error.message);
        }
    }
}
