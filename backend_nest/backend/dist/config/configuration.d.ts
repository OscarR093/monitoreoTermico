export interface EnvironmentConfig {
    domainUrl: string;
    letsencryptEmail: string;
    mongo: {
        user: string;
        password: string;
        dbName: string;
        port: number;
    };
    mosquitto: {
        user: string;
        password: string;
        brokerUrl?: string;
        host?: string;
        port?: number;
    };
    emqx: {
        nodeCookie: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    node: {
        env: string;
    };
    superUser: {
        username: string;
        password: string;
    };
    port: number;
}
declare const _default: () => EnvironmentConfig;
export default _default;
