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

export default (): EnvironmentConfig => ({
  domainUrl: process.env.DOMAIN_URL || 'localhost',
  letsencryptEmail: process.env.LETSENCRYPT_EMAIL || '',
  mongo: {
    user: process.env.MONGO_USER || 'admin',
    password: process.env.MONGO_PASS || 'password',
    dbName: process.env.MONGO_DB_NAME || 'monitoreoTermico',
    port: parseInt(process.env.MONGO_PORT || '27017', 10),
  },
  mosquitto: {
    user: process.env.MOSQUITTO_USER || 'fmex',
    password: process.env.MOSQUITTO_PASS || 'fmex456',
  },
  emqx: {
    nodeCookie: process.env.EMQX_NODE_COOKIE || 'defaultcookie',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fmex456ed_11032025_firstEd',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  node: {
    env: process.env.NODE_ENV || 'development',
  },
  superUser: {
    username: process.env.SUPER_USER_USERNAME || 'admin',
    password: process.env.SUPER_USER_PASSWORD || 'admin123',
  },
  port: parseInt(process.env.PORT || '3000', 10),
});