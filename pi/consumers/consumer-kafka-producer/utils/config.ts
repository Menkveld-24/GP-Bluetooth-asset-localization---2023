import config from 'config';


export interface SchemaConfig {
    key: {
        name: string;
        version: number;
    };
    value: {
        name: string;
        version: number;
    };
}


export interface ConsumerConfig {
    device: {
        identifier: string;
        process_id: string;
    };
    webserver: {
        url: string;
    };
    redis: {
        consumer: {
            group: string;
        };
        connection: {
            host: string;
            port: number;
        };
        packet_stream: string;
        autoclaim: {
            interval_ms: number;
            min_idle_time_ms: number;
        };
        read_interval_ms: number;
        claim_size: number;
        manager: {
            consumer_groups: Array<string>;
        };
    };
    kafka: {
        brokers: Array<string>;
        consumer_group: string;
        whitelist_topic: string;
        topic: string;
        schema_registry: string;
        topic_schema: SchemaConfig;
        whitelist_topic_schema: SchemaConfig;
    };
}

export function getConsumerConfig(): ConsumerConfig {
    const conf: ConsumerConfig = {
        device: {
            "identifier": config.get('device.identifier'),
            "process_id": config.get('device.process_id')
        },
        webserver: {
            "url": config.get('webserver.url')
        },
        redis: {
            "consumer": {
                "group": config.get('redis.consumer.group')
            },
            "connection": {
                "host": config.get('redis.connection.host'),
                "port": config.get('redis.connection.port')
            },
            "packet_stream": config.get('redis.packet_stream'),
            "autoclaim": {
                "interval_ms": config.get('redis.autoclaim.interval_ms'),
                "min_idle_time_ms": config.get('redis.autoclaim.min_idle_time_ms')
            },
            "read_interval_ms": config.get('redis.read_interval_ms'),
            "claim_size": config.get('redis.claim_size'),
            "manager": {
                "consumer_groups": config.get('redis.manager.consumer_groups')
            }
        },
        kafka: {
            "brokers": config.get('kafka.brokers'),
            "consumer_group": config.get('kafka.consumer_group'),
            "whitelist_topic": config.get('kafka.whitelist_topic'),
            "topic": config.get('kafka.topic'),
            "schema_registry": config.get('kafka.schema_registry'),
            "topic_schema": {
                "key": {
                    "name": config.get('kafka.topic_schema.key.name'),
                    "version": config.get('kafka.topic_schema.key.version')
                },
                "value": {
                    "name": config.get('kafka.topic_schema.value.name'),
                    "version": config.get('kafka.topic_schema.value.version')
                }
            },
            "whitelist_topic_schema": {
                "key": {
                    "name": config.get('kafka.whitelist_topic_schema.key.name'),
                    "version": config.get('kafka.whitelist_topic_schema.key.version')
                },
                "value": {
                    "name": config.get('kafka.whitelist_topic_schema.value.name'),
                    "version": config.get('kafka.whitelist_topic_schema.value.version')
                }
            }
        }
    };
    return conf;
}
