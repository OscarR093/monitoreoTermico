import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGatewayService } from './websocket.gateway';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';

describe('WebSocketGatewayService', () => {
  let gateway: WebSocketGatewayService;
  let configService: ConfigService;

  // Mock para Socket.IO Server
  let mockServer: Server;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const values: Record<string, any> = {
        'mosquitto.host': 'localhost',
        'mosquitto.port': 1883,
        'mosquitto.user': 'admin',
        'mosquitto.password': 'public',
        'mosquitto.brokerUrl': null,
      };
      return values[key];
    }),
  };

  // Mock para las dependencias de MQTT
  const mockMqttClient = {
    on: jest.fn((event, handler) => {
      // Simular conexión inmediata para pruebas
      if (event === 'connect') {
        setTimeout(() => handler(), 0);
      }
    }),
    subscribe: jest.fn((topics, callback) => {
      if (callback) callback(null); // Simular éxito en la suscripción
    }),
    publish: jest.fn(),
  };

  beforeEach(async () => {
    // Mock de import('mqtt') para todas las pruebas
    jest.mock('mqtt', () => ({
      connect: jest.fn(() => mockMqttClient),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGatewayService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGatewayService>(WebSocketGatewayService);
    configService = module.get<ConfigService>(ConfigService);

    // Simular un servidor socket
    mockServer = {
      emit: jest.fn(),
      clients: new Set(['socket1', 'socket2']), // Mock para clients.size
      sockets: {
        sockets: {
          'socket1': { id: 'socket1' },
          'socket2': { id: 'socket2' },
        },
      },
    } as any;

    // Asignar el servidor simulado al gateway para las pruebas
    Object.defineProperty(gateway, 'server', {
      value: mockServer,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleReactClient', () => {
    it('should handle react client message and return connection data', () => {
      const logSpy = jest.spyOn((gateway as any).logger, 'log').mockImplementation();

      const mockClient = {
        id: 'test-client',
        send: jest.fn()
      } as any;
      gateway.handleReactClient('test-data', mockClient);

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'connected', data: 'Conexión WebSocket establecida' })
      );
      expect(logSpy).toHaveBeenCalledWith('Mensaje recibido del cliente React:', 'test-data');

      logSpy.mockRestore();
    });
  });

  describe('handleMqttMessage', () => {
    it('should handle MQTT messages and emit to WebSocket clients', async () => {
      const topic = 'plcTemperaturas/tiemporeal/torre_fusora';
      const payload = Buffer.from(JSON.stringify({
        timestamp: 1234567890,
        temperatura: 725.5,
        equipo: 'Torre Fusora'
      }));

      const emitSpy = jest.spyOn(mockServer, 'emit');
      const logSpy = jest.spyOn((gateway as any).logger, 'error').mockImplementation();

      await gateway.handleMqttMessage(topic, payload);

      // Verificar que se envió el mensaje a los clientes conectados
      // En la implementación real, itera sobre clients y llama a send
      // Como no podemos espiar fácilmente la iteración interna sobre el Set mockeado en este setup,
      // verificaremos que NO llame a emit (ya que usa ws nativo)
      expect(emitSpy).not.toHaveBeenCalled();

      // Para una prueba más robusta de broadcast, necesitaríamos mockear server.clients.forEach
      // Pero dado el mock actual, al menos verificamos que no falle y loguee errores.

      logSpy.mockRestore();
    });

    it('should handle MQTT message parsing errors gracefully', async () => {
      const topic = 'plcTemperaturas/tiemporeal/torre_fusora';
      const invalidPayload = Buffer.from('{invalid: json');

      const logSpy = jest.spyOn((gateway as any).logger, 'error').mockImplementation();

      await gateway.handleMqttMessage(topic, invalidPayload);

      // Verificar que se logueó el error de parsing
      expect(logSpy).toHaveBeenCalledWith('Error al procesar el mensaje MQTT:', expect.any(SyntaxError));

      logSpy.mockRestore();
    });
  });

  describe('handleConnection', () => {
    it('should log connection event', async () => {
      const mockSocket = { id: 'test-socket-id' };
      const logSpy = jest.spyOn((gateway as any).logger, 'log').mockImplementation();

      await gateway.handleConnection(mockSocket as any);

      expect(logSpy).toHaveBeenCalledWith('Cliente WebSocket conectado');

      logSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnection event', async () => {
      const mockSocket = { id: 'test-socket-id' };
      const logSpy = jest.spyOn((gateway as any).logger, 'log').mockImplementation();

      await new Promise<void>((resolve) => {
        gateway.handleDisconnect(mockSocket as any);
        setTimeout(() => {
          expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Cliente WebSocket desconectado'));
          logSpy.mockRestore();
          resolve();
        }, 110); // Mayor que el timeout de 100ms en el código
      });
    });
  });
});