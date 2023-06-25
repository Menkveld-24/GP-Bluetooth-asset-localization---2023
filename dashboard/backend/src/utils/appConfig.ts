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
        thingyTableName: string
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
            valueSchemaVersion: number | string
            keySchemaVersion: number | string
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
        host: process.env.DATABASE_HOST ?? 'mysql',
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
        host: process.env.QUESTDB_HOST ?? 'questdb',
        port: parseInt(process.env.QUESTDB_PORT ?? '8812'),
        thingyTableName: process.env.QUESTDB_THINGY_TABLE ?? 'THINGY_LOCATION_BEACONS_MERGED'
    },
    redis: {
        host: process.env.REDIS_HOST ?? 'redis',
        port: parseInt(process.env.REDIS_PORT ?? '6379')
    },
    ksql: {
        host: process.env.KSQL_HOST ?? 'http://ksqlsdb-server',
        port: parseInt(process.env.KSQL_PORT ?? '8088'),
        whitelistTable: process.env.KSQL_WHITELIST_TABLE ?? 'WHITELISTED_THINGIES'
    },
    kafka: {
        clientId: process.env.KAFKA_CLIENT_ID ?? 'node-backend',
        brokers: (process.env.KAFKA_BROKERS ?? 'kafka-1:9092,kafka-2:9092,kafka-3:9092').split(','),
        schemaRegistry: process.env.KAFKA_SCHEMA_REGISTRY ?? 'http://schema-registry:8081/',
        whitelist: {
            topic: process.env.KAFKA_WHITELIST_TOPIC ?? 'THINGY_WHITELIST_COMMANDS',
            valueSchemaVersion: process.env.KAFKA_WHITELIST_VALUE_SCHEMA_VERSION ?? 'latest',
            keySchemaVersion: process.env.KAFKA_WHITELIST_KEY_SCHEMA_VERSION ?? 'latest'
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
