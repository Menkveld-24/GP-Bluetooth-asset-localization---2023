import dotenv from 'dotenv';
dotenv.config();

interface topic {
    name: string
    partitions: number
}

interface appConfig {
    questdb: {
        host: string
        port: number
        table_name: string
    }
    ksql: {
        host: string
        port: number
        query_output_names: {
            whitelist: string
            raw_beacons: string
            raw_locations: string
        }
        merged_location_beacons: {
            name: string
            partitions: number
            grace_period: number
            within: number
        }
    }
    kafka: {
        clientId: string
        brokers: string[]
        schemaRegistry: string
        topics: {
            whitelist: topic
            raw_beacons: topic
            raw_locations: topic
            pi_metrics: topic
        }
    }
    questdbSinkConnector: {
        host: string
        port: number
    }
}

const config: appConfig = {
    questdb: {
        host: process.env.QUESTDB_HOST ?? 'questdb',
        port: parseInt(process.env.QUESTDB_PORT ?? '9000'),
        table_name: process.env.QUESTDB_TABLE_NAME ?? 'THINGY_LOCATION_BEACONS_MERGED'
    },
    ksql: {
        host: process.env.KSQL_HOST ?? 'ksqldb-server',
        port: parseInt(process.env.KSQL_PORT ?? '8088'),
        query_output_names: {
            whitelist: process.env.KSQL_QUERY_OUTPUT_WHITELIST ?? 'WHITELISTED_THINGIES',
            raw_beacons: process.env.KSQL_QUERY_OUTPUT_RAW_BEACONS ?? 'INDEXED_THINGY_BEACONS',
            raw_locations: process.env.KSQL_QUERY_OUTPUT_RAW_LOCATIONS ?? 'INDEXED_THINGY_LOCATIONS'
        },
        merged_location_beacons: {
            name: process.env.KSQL_QUERY_OUTPUT_MERGED_LOCATION_BEACONS ?? 'MERGED_LOCATION_BEACONS',
            partitions: parseInt(process.env.KSQL_QUERY_OUTPUT_MERGED_LOCATION_BEACONS_PARTITIONS ?? '6'),
            grace_period: parseInt(process.env.KSQL_QUERY_OUTPUT_MERGED_LOCATION_BEACONS_GRACE_PERIOD ?? '5'),
            within: parseInt(process.env.KSQL_QUERY_OUTPUT_MERGED_LOCATION_BEACONS_WITHIN ?? '1')
        }
    },
    kafka: {
        clientId: process.env.KAFKA_CLIENT_ID ?? 'gp-kafka-setup',
        brokers: (process.env.KAFKA_BROKERS ?? 'kafka-1:9092,kafka-2:9092,kafka-3:9092').split(','),
        schemaRegistry: process.env.KAFKA_SCHEMA_REGISTRY ?? 'http://schema-registry:8081',
        topics: {
            whitelist: {
                name: process.env.KAFKA_TOPIC_WHITELIST ?? 'THINGY_WHITELIST_COMMANDS',
                partitions: parseInt(process.env.KAFKA_TOPIC_WHITELIST_PARTITIONS ?? '6')
            },
            raw_beacons: {
                name: process.env.KAFKA_TOPIC_RAW_BEACONS ?? 'RAW_THINGY_BEACONS',
                partitions: parseInt(process.env.KAFKA_TOPIC_RAW_BEACONS_PARTITIONS ?? '6')
            },
            raw_locations: {
                name: process.env.KAFKA_TOPIC_RAW_LOCATIONS ?? 'RAW_THINGY_LOCATIONS',
                partitions: parseInt(process.env.KAFKA_TOPIC_RAW_LOCATIONS_PARTITIONS ?? '6')
            },
            pi_metrics: {
                name: process.env.KAFKA_TOPIC_PI_METRICS ?? 'PI_METRICS',
                partitions: parseInt(process.env.KAFKA_TOPIC_PI_METRICS_PARTITIONS ?? '6')
            }
        }
    },
    questdbSinkConnector: {
        host: process.env.QUESTDB_SINK_CONNECTOR_HOST ?? 'http://connect',
        port: parseInt(process.env.QUESTDB_SINK_CONNECTOR_PORT ?? '8083')
    }
};

export default config;
