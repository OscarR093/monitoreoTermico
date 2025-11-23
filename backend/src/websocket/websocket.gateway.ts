import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  path: '/', // Escuchar en la raíz, igual que antes
})
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebSocketGateway');
  private mqttClient: any;
  private readonly TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+';
  private readonly TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal';

  constructor(
    private readonly configService: ConfigService,
  ) { }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado (ws nativo)');

    // Importar mqtt dinámicamente y conectar
    this.initializeMqttConnection();
  }

  private async initializeMqttConnection() {
    const mqtt = await import('mqtt');

    // Usar MQTT_BROKER_URL de variable de entorno (producción) o construir URL (desarrollo)
    const mqttBrokerUrl = process.env.MQTT_BROKER_URL || (() => {
      const host = this.configService.get<string>('mosquitto.host') || 'localhost';
      const port = this.configService.get<number>('mosquitto.port') || 1883;
      const user = this.configService.get<string>('mosquitto.user') || 'admin';
      const password = this.configService.get<string>('mosquitto.password') || 'public';
      return `mqtt://${user}:${password}@${host}:${port}`;
    })();

    const user = this.configService.get<string>('mosquitto.user') || 'admin';
    const password = this.configService.get<string>('mosquitto.password') || 'public';

    this.logger.log(`Intentando conectar al broker MQTT para WebSocket en ${mqttBrokerUrl}...`);
    this.mqttClient = mqtt.connect(mqttBrokerUrl, {
      username: user,
      password: password,
    });

    // Configurar la conexión MQTT para este gateway
    this.mqttClient.on('connect', () => {
      this.logger.log('✅ WebSocket Gateway conectado al broker MQTT.');
      this.mqttClient.subscribe([this.TOPIC_REALTIME], (err) => {
        if (err) {
          this.logger.error('❌ Error al suscribirse al tópico MQTT:', err);
        } else {
          this.logger.log(`✅ WebSocket Gateway suscrito al tópico MQTT: ${this.TOPIC_REALTIME}`);
        }
      });
    });

    this.mqttClient.on('error', (error) => {
      this.logger.error('❌ Error en la conexión MQTT del WebSocket:', error);
    });

    // Manejar mensajes MQTT recibidos
    this.mqttClient.on('message', (topic: string, payload: Buffer) => {
      this.handleMqttMessage(topic, payload);
    });
  }

  async handleMqttMessage(topic: string, payload: Buffer) {
    try {
      const messageStr = payload.toString();
      // Validar que sea JSON válido antes de enviar
      JSON.parse(messageStr);

      // Transmitir el mensaje a todos los clientes websocket conectados
      // En 'ws', iteramos sobre this.server.clients
      this.server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    } catch (error) {
      this.logger.error('Error al procesar el mensaje MQTT:', error);
    }
  }

  async handleConnection(@ConnectedSocket() client: WebSocket) {
    this.logger.log(`Cliente WebSocket conectado`);

    // Enviar comando START al gateway cuando se conecta el primer cliente
    const clientsCount = this.server.clients.size;
    this.logger.log(`Total clientes conectados: ${clientsCount}`);

    if (clientsCount === 1) {
      this.logger.log('MQTT -> Enviando comando START al gateway...');
      if (this.mqttClient) {
        this.mqttClient.publish(this.TOPIC_CONTROL, 'START');
      }
    }
  }

  async handleDisconnect(@ConnectedSocket() client: WebSocket) {
    this.logger.log(`Cliente WebSocket desconectado`);

    // Esperar un momento para que se actualice la lista de sockets
    setTimeout(() => {
      const clientsCount = this.server.clients ? this.server.clients.size : 0;
      this.logger.log(`Clientes WebSocket restantes: ${clientsCount}`);

      // Enviar comando STOP al gateway cuando se desconectan todos los clientes
      if (clientsCount === 0) {
        this.logger.log('MQTT -> Enviando comando STOP al gateway...');
        if (this.mqttClient) {
          this.mqttClient.publish(this.TOPIC_CONTROL, 'STOP');
        }
      }
    }, 100);
  }

  @SubscribeMessage('react-client')
  handleReactClient(@MessageBody() data: any, @ConnectedSocket() client: WebSocket) {
    this.logger.log('Mensaje recibido del cliente React:', data);
    // Responder al cliente
    const response = JSON.stringify({ event: 'connected', data: 'Conexión WebSocket establecida' });
    client.send(response);
  }
}