import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import config from '@utils/appConfig';
import { log } from '@utils/logger';
import { Kafka, type RecordMetadata, type Producer } from 'kafkajs';

interface producer {
    producer: Producer
    schemaRegistry: SchemaRegistry
    topic: string
    valueSchemaId: number
    keySchemaId: number
}

const kafka = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers
});

const registry = new SchemaRegistry({ host: config.kafka.schemaRegistry });

export let whitelistProducer: producer;

export async function connectToKafka (): Promise<void> {
    await createWhitelistProducer();
}

async function createWhitelistProducer (): Promise<void> {
    const topic = config.kafka.whitelist.topic;

    const valueSchemaId = await registry.getRegistryId(topic + '-value', config.kafka.whitelist.valueSchemaVersion);
    const keySchemaId = await registry.getRegistryId(topic + '-key', config.kafka.whitelist.keySchemaVersion);

    whitelistProducer = {
        producer: kafka.producer(),
        schemaRegistry: registry,
        topic,
        valueSchemaId,
        keySchemaId
    };

    log('Loaded whitelist producer');
    await whitelistProducer.producer.connect();
    log('Connected to whitelist producer');
}

export async function encodeValue (value: any): Promise<Buffer> {
    return await whitelistProducer.schemaRegistry.encode(
        whitelistProducer.valueSchemaId,
        value
    );
}

export async function encodeKey (key: any): Promise<Buffer> {
    return await whitelistProducer.schemaRegistry.encode(
        whitelistProducer.keySchemaId,
        key
    );
}

export async function produce (producer: producer, key: string | Buffer, value: string | Buffer): Promise<boolean> {
    const result: RecordMetadata[] = await producer.producer.send({
        topic: producer.topic,
        messages: [
            { key, value }
        ]
    });

    if (result[0].errorCode !== 0) {
        log(`Failed to produce messages to kafka: ${result[0].errorCode}`);
        return false;
    }

    log(`Produced to partition ${result[0].partition} on topic ${result[0].topicName}`);
    return true;
}
