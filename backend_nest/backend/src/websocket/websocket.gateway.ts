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
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: "*", // En producción, restringir a dominios específicos
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'], // Usar solo websocket, no polling
})
export class WebSocketGatewayService
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebSocketGateway');
  private mqttClient: any;
  private readonly TOPIC_REALTIME = 'plcTemperaturas/tiemporeal/+';
  private readonly TOPIC_CONTROL = 'gatewayTemperaturas/control/tiemporeal';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway inicializado');
    
    // Importar mqtt dinámicamente y conectar
    this.initializeMqttConnection();
  }

  private async initializeMqttConnection() {
    const mqtt = await import('mqtt');
    
    // Construir la URL del broker MQTT
    const host = this.configService.get<string>('mosquitto.host') || 'localhost';
    const port = this.configService.get<number>('mosquitto.port') || 1883;
    const user = this.configService.get<string>('mosquitto.user') || 'admin';
    const password = this.configService.get<string>('mosquitto.password') || 'public';
    
    const mqttBrokerUrl = this.configService.get<string>('mosquitto.brokerUrl') || 
                         `mqtt://${user}:${password}@${host}:${port}`;
    
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
      const messageJson = JSON.parse(messageStr);

      // Transmitir el mensaje a todos los clientes websocket conectados
      this.server.emit('plcData', messageJson);
    } catch (error) {
      this.logger.error('Error al procesar el mensaje MQTT:', error);
    }
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Cliente WebSocket conectado con ID: ${client.id}`);
    
    // Enviar comando START al gateway cuando se conecta el primer cliente
    // El tamaño de clients no se puede usar directamente en Socket.IO
    // Usaremos la propiedad de la server para contar conexiones
    const clientsCount = Object.keys(this.server.sockets.sockets).length;
    if (clientsCount === 1) {
      this.logger.log('MQTT -> Enviando comando START al gateway...');
      this.mqttClient.publish(this.TOPIC_CONTROL, 'START');
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Cliente WebSocket desconectado con ID: ${client.id}`);
    
    // Esperar un momento para que se actualice la lista de sockets
    setTimeout(() => {
      const clientsCount = Object.keys(this.server.sockets.sockets).length;
      this.logger.log(`Clientes WebSocket restantes: ${clientsCount}`);
      
      // Enviar comando STOP al gateway cuando se desconectan todos los clientes
      if (clientsCount === 0) {
        this.logger.log('MQTT -> Enviando comando STOP al gateway...');
        this.mqttClient.publish(this.TOPIC_CONTROL, 'STOP');
      }
    }, 100);
  }

  @SubscribeMessage('react-client')
  handleReactClient(@MessageBody() data: any) {
    this.logger.log('Mensaje recibido del cliente React:', data);
    // Podemos responder o procesar el mensaje según sea necesario
    return { event: 'connected', data: 'Conexión WebSocket establecida' };
  }
}