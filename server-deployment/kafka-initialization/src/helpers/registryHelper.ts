import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { SchemaType } from '@kafkajs/confluent-schema-registry/dist/@types';
import { type RegisteredSchema } from '@kafkajs/confluent-schema-registry/dist/SchemaRegistry';
import config from '../utils/configLoader';

const registry = new SchemaRegistry({ host: config.kafka.schemaRegistry });

export async function registerAvroSchema (schema: string, topic: string, isKey = false): Promise<RegisteredSchema> {
    const type = isKey ? 'key' : 'value';
    const subject = `${topic}-${type}`;
    return await registry.register({ type: SchemaType.AVRO, schema }, {
        subject
    });
}

export default registry;
