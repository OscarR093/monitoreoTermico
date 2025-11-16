declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    DOMAIN_URL?: string;
    LETSENCRYPT_EMAIL?: string;
    MONGO_USER: string;
    MONGO_PASS: string;
    MONGO_DB_NAME: string;
    MONGO_PORT?: number;
    MOSQUITTO_USER?: string;
    MOSQUITTO_PASS?: string;
    EMQX_NODE_COOKIE?: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;
    BCRYPT_SALT_ROUNDS?: number;
    NODE_ENV?: Environment;
    SUPER_USER_USERNAME?: string;
    SUPER_USER_PASSWORD?: string;
    PORT?: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
