"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MqttConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const temperature_history_service_1 = require("../temperature-history/temperature-history.service");
const mqtt_1 = require("mqtt");
let MqttConsumerService = MqttConsumerService_1 = class MqttConsumerService {
    configService;
    temperatureHistoryService;
    client;
    TOPIC_HISTORY = 'plcTemperaturas/historial/+';
    TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+';
    TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal';
    logger = new common_1.Logger(MqttConsumerService_1.name);
    constructor(configService, temperatureHistoryService) {
        this.configService = configService;
        this.temperatureHistoryService = temperatureHistoryService;
    }
    async onModuleInit() {
        const host = this.configService.get('mosquitto.host') || 'localhost';
        const port = this.configService.get('mosquitto.port') || 1883;
        const user = this.configService.get('mosquitto.user') || 'admin';
        const password = this.configService.get('mosquitto.password') || 'public';
        const mqttBrokerUrl = this.configService.get('mosquitto.brokerUrl') ||
            `mqtt://${user}:${password}@${host}:${port}`;
        this.logger.log(`Intentando conectar al broker MQTT en ${mqttBrokerUrl}...`);
        this.client = (0, mqtt_1.connect)(mqttBrokerUrl);
        return new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                this.logger.log('✅ Conectado al broker MQTT para consumir mensajes de temperatura');
                this.client.subscribe([this.TOPIC_HISTORY, this.TOPIC_REALTIME], (err) => {
                    if (err) {
                        this.logger.error('❌ Error al suscribirse a los tópicos MQTT:', err);
                        reject(err);
                    }
                    else {
                        this.logger.log(`✅ Suscrito a los tópicos MQTT: ${this.TOPIC_HISTORY}, ${this.TOPIC_REALTIME}`);
                        resolve();
                    }
                });
            });
            this.client.on('error', (error) => {
                this.logger.error('❌ Error en la conexión MQTT:', error);
                reject(error);
            });
            this.client.on('message', async (topic, payload) => {
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
    async handleMessage(topic, payload) {
        try {
            const messageStr = payload.toString();
            const messageJson = JSON.parse(messageStr);
            if (topic.startsWith('plcTemperaturas/historial/')) {
                if (messageJson.temperatura !== null && !isNaN(messageJson.temperatura)) {
                    const equipmentName = messageJson.equipo;
                    this.logger.log(`HISTORIAL: Recibido dato de ${equipmentName} para guardar en DB.`);
                    await this.temperatureHistoryService.saveTemperatureReading(equipmentName, messageJson.temperatura, new Date(messageJson.timestamp * 1000));
                    this.logger.log(`✅ Dato de ${equipmentName} guardado en la base de datos.`);
                }
                else {
                    this.logger.log(`HISTORIAL: Dato de '${messageJson.equipo}' ignorado (temperatura inválida).`);
                }
            }
        }
        catch (error) {
            this.logger.error('Error al procesar el mensaje MQTT:', error);
        }
    }
};
exports.MqttConsumerService = MqttConsumerService;
exports.MqttConsumerService = MqttConsumerService = MqttConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        temperature_history_service_1.TemperatureHistoryService])
], MqttConsumerService);
//# sourceMappingURL=mqtt-consumer.service.js.map