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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketGatewayService = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WebSocketGatewayService = class WebSocketGatewayService {
    configService;
    server;
    logger = new common_1.Logger('WebSocketGateway');
    mqttClient;
    TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+';
    TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal';
    constructor(configService) {
        this.configService = configService;
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway inicializado');
        this.initializeMqttConnection();
    }
    async initializeMqttConnection() {
        const mqtt = await import('mqtt');
        const host = this.configService.get('mosquitto.host') || 'localhost';
        const port = this.configService.get('mosquitto.port') || 1883;
        const user = this.configService.get('mosquitto.user') || 'admin';
        const password = this.configService.get('mosquitto.password') || 'public';
        const mqttBrokerUrl = this.configService.get('mosquitto.brokerUrl') ||
            `mqtt://${user}:${password}@${host}:${port}`;
        this.logger.log(`Intentando conectar al broker MQTT para WebSocket en ${mqttBrokerUrl}...`);
        this.mqttClient = mqtt.connect(mqttBrokerUrl, {
            username: user,
            password: password,
        });
        this.mqttClient.on('connect', () => {
            this.logger.log('✅ WebSocket Gateway conectado al broker MQTT.');
            this.mqttClient.subscribe([this.TOPIC_REALTIME], (err) => {
                if (err) {
                    this.logger.error('❌ Error al suscribirse al tópico MQTT:', err);
                }
                else {
                    this.logger.log(`✅ WebSocket Gateway suscrito al tópico MQTT: ${this.TOPIC_REALTIME}`);
                }
            });
        });
        this.mqttClient.on('error', (error) => {
            this.logger.error('❌ Error en la conexión MQTT del WebSocket:', error);
        });
        this.mqttClient.on('message', (topic, payload) => {
            this.handleMqttMessage(topic, payload);
        });
    }
    async handleMqttMessage(topic, payload) {
        try {
            const messageStr = payload.toString();
            const messageJson = JSON.parse(messageStr);
            this.server.emit('plcData', messageJson);
        }
        catch (error) {
            this.logger.error('Error al procesar el mensaje MQTT:', error);
        }
    }
    async handleConnection(client) {
        this.logger.log(`Cliente WebSocket conectado con ID: ${client.id}`);
        const clientsCount = Object.keys(this.server.sockets.sockets).length;
        if (clientsCount === 1) {
            this.logger.log('MQTT -> Enviando comando START al gateway...');
            this.mqttClient.publish(this.TOPIC_CONTROL, 'START');
        }
    }
    async handleDisconnect(client) {
        this.logger.log(`Cliente WebSocket desconectado con ID: ${client.id}`);
        setTimeout(() => {
            const clientsCount = Object.keys(this.server.sockets.sockets).length;
            this.logger.log(`Clientes WebSocket restantes: ${clientsCount}`);
            if (clientsCount === 0) {
                this.logger.log('MQTT -> Enviando comando STOP al gateway...');
                this.mqttClient.publish(this.TOPIC_CONTROL, 'STOP');
            }
        }, 100);
    }
    handleReactClient(data) {
        this.logger.log('Mensaje recibido del cliente React:', data);
        return { event: 'connected', data: 'Conexión WebSocket establecida' };
    }
};
exports.WebSocketGatewayService = WebSocketGatewayService;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebSocketGatewayService.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WebSocketGatewayService.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], WebSocketGatewayService.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('react-client'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WebSocketGatewayService.prototype, "handleReactClient", null);
exports.WebSocketGatewayService = WebSocketGatewayService = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
        },
        transports: ['websocket'],
    }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebSocketGatewayService);
//# sourceMappingURL=websocket.gateway.js.map