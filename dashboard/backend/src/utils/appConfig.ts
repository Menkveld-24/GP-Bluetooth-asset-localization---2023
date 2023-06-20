import dotenv from 'dotenv';
dotenv.config();

interface appConfig {
    db: {
        host: string
        port: number
        user: string
        password: string
        database: string
    }
    http: {
        port: number
        session: {
            secret: string
            name: string
            duration: number
        }
        apiKey: string
    }
    questdb: {
        host: string
        port: number
    }
    redis: {
        host: string
        port: number
    }
    ksql: {
        host: string
        port: number
        whitelistTable: string
    }
    kafka: {
        clientId: string
        brokers: string[]
        schemaRegistry: string
        whitelist: {
            topic: string
            valueSchemaVersion: number
            keySchemaVersion: number
        }

    }
    cache: {
        enabled: boolean
        ttl: number
    }
    isProduction: boolean
    isDevelopment: boolean
}

const config: appConfig = {
    db: {
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: parseInt(process.env.DATABASE_PORT ?? '3306'),
        user: process.env.DATABASE_USER ?? 'root',
        password: process.env.DATABASE_PASSWORD ?? 'root',
        database: process.env.DATABASE_DB ?? 'gp'
    },
    http: {
        port: parseInt(process.env.HTTP_PORT ?? '3000'),
        session: {
            secret: process.env.SESSION_SECRET ?? 'notsosecret',
            name: process.env.SESSION_NAME ?? 'gp_session',
            duration: parseInt(process.env.SESSION_DURATION ?? '86400')
        },
        apiKey: process.env.API_KEY ?? Math.random().toString()
    },
    questdb: {
        host: process.env.QUESTDB_HOST ?? 'localhost',
        port: parseInt(process.env.QUESTDB_PORT ?? '9000')
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379')
    },
    ksql: {
        host: process.env.KSQL_HOST ?? 'http://localhost',
        port: parseInt(process.env.KSQL_PORT ?? '8088'),
        whitelistTable: process.env.KSQL_WHITELIST_TABLE ?? 'WHITELISTED_THINGIES'
    },
    kafka: {
        clientId: process.env.KAFKA_CLIENT_ID ?? 'node-backend',
        brokers: (process.env.KAFKA_BROKERS ?? '192.168.1.201:29091,192.168.1.201:29092,192.168.1.201:29093').split(','),
        schemaRegistry: process.env.KAFKA_SCHEMA_REGISTRY ?? 'http://192.168.1.201:8081/',
        whitelist: {
            topic: process.env.KAFKA_WHITELIST_TOPIC ?? 'whitelist_thingy_commands',
            valueSchemaVersion: parseInt(process.env.KAFKA_WHITELIST_VALUE_SCHEMA_VERSION ?? '1'),
            keySchemaVersion: parseInt(process.env.KAFKA_WHITELIST_KEY_SCHEMA_VERSION ?? '1')
        }
    },
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true' ?? true,
        ttl: parseInt(process.env.CACHE_TTL ?? '300')
    },
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
};

export default config;
