import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemperatureHistoryService } from '../temperature-history/temperature-history.service';
import { MqttClient, connect } from 'mqtt';

@Injectable()
export class MqttConsumerService implements OnModuleInit, OnModuleDestroy {
  private client: MqttClient;
  private readonly TOPIC_HISTORY = 'plcTemperaturas/historial/+';
  private readonly TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+';
  private readonly TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal';
  private readonly logger = new Logger(MqttConsumerService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly temperatureHistoryService: TemperatureHistoryService,
  ) { }

  async onModuleInit() {
    // Usar MQTT_BROKER_URL de variable de entorno (producción) o construir URL (desarrollo)
    const mqttBrokerUrl = process.env.MQTT_BROKER_URL || (() => {
      const host = this.configService.get<string>('mosquitto.host') || 'localhost';
      const port = this.configService.get<number>('mosquitto.port') || 1883;
      const user = this.configService.get<string>('mosquitto.user') || 'admin';
      const password = this.configService.get<string>('mosquitto.password') || 'public';
      return `mqtt://${user}:${password}@${host}:${port}`;
    })();

    this.logger.log(`Intentando conectar al broker MQTT en ${mqttBrokerUrl}...`);
    this.client = connect(mqttBrokerUrl);

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        this.logger.log('✅ Conectado al broker MQTT para consumir mensajes de temperatura');

        // Suscribirse a los tópicos relevantes
        this.client.subscribe([this.TOPIC_HISTORY, this.TOPIC_REALTIME], (err) => {
          if (err) {
            this.logger.error('❌ Error al suscribirse a los tópicos MQTT:', err);
            reject(err);
          } else {
            this.logger.log(`✅ Suscrito a los tópicos MQTT: ${this.TOPIC_HISTORY}, ${this.TOPIC_REALTIME}`);
            resolve();
          }
        });
      });

      this.client.on('error', (error) => {
        this.logger.error('❌ Error en la conexión MQTT:', error);
        reject(error);
      });

      // Manejar mensajes recibidos
      this.client.on('message', async (topic: string, payload: Buffer) => {
        await this.handleMessage(topic, payload).catch(err => {
          this.logger.error('Error al manejar mensaje MQTT:', err);
        });
      });
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log('MQTT client disconnected');
    }
  }

  private async handleMessage(topic: string, payload: Buffer) {
    try {
      const messageStr = payload.toString();
      const messageJson = JSON.parse(messageStr);

      if (topic.startsWith('plcTemperaturas/historial/')) {
        if (messageJson.temperatura !== null && !isNaN(messageJson.temperatura)) {
          const equipmentName = messageJson.equipo;
          this.logger.log(`HISTORIAL: Recibido dato de ${equipmentName} para guardar en DB.`);

          await this.temperatureHistoryService.saveTemperatureReading(
            equipmentName,
            messageJson.temperatura,
            new Date(messageJson.timestamp * 1000) // Convertir de timestamp Unix a Date
          );

          this.logger.log(`✅ Dato de ${equipmentName} guardado en la base de datos.`);
        } else {
          this.logger.log(`HISTORIAL: Dato de '${messageJson.equipo}' ignorado (temperatura inválida).`);
        }
      }
      // Nota: Los mensajes de tiempo real no se almacenan en historial,
      // pero podrían usarse para otras funcionalidades si es necesario
    } catch (error) {
      this.logger.error('Error al procesar el mensaje MQTT:', error);
    }
  }
}