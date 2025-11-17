import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
export declare class WebSocketGatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly configService;
    server: Server;
    private logger;
    private mqttClient;
    private readonly TOPIC_REALTIME;
    private readonly TOPIC_CONTROL;
    constructor(configService: ConfigService);
    afterInit(server: Server): void;
    private initializeMqttConnection;
    handleMqttMessage(topic: string, payload: Buffer): Promise<void>;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleReactClient(data: any): {
        event: string;
        data: string;
    };
}
