import ksql from './ksqlHelper';
import path from 'path';
import { readFileSync } from 'fs';
import { type RegisteredSchema } from '@kafkajs/confluent-schema-registry/dist/SchemaRegistry';
import { registerAvroSchema } from './registryHelper';
import admin from './kafkaHelper';
import { log } from '../utils/logger';
import { type OptionalExtraParams } from 'ksqldb-client';

export async function executeKSQL (query: string, options: OptionalExtraParams, description: string): Promise<void> {
    log(`Executing ksql query for ${description}...`);
    log(query);
    const response = await ksql.executeStatement(query, options);
    console.log(response);
    if (response.status === 200) {
        log(`${description} created}`);
        return;
    } else if (response.status === 400) {
        log(`${description} already exists`);
        return;
    }

    log(`${description} creation failed (${response.status}): ${response?.error?.message ?? 'No message'}`);
    throw new Error(`${description} creation failed`);
}

export async function uploadSchemas (topic: string): Promise<void> {
    log(`Uploading schemas... (${topic})`);
    const keySchema = readFileSync(path.resolve(__dirname, `../schemas/${topic}/key.avsc`), 'utf8');
    const valueSchema = readFileSync(path.resolve(__dirname, `../schemas/${topic}/value.avsc`), 'utf8');

    if (keySchema === '' || valueSchema === '') {
        throw new Error('Schemas not found');
    }

    const registeredKeySchema: RegisteredSchema = await registerAvroSchema(keySchema, topic, true);
    const registeredValueSchema: RegisteredSchema = await registerAvroSchema(valueSchema, topic);

    log(`Registered schemas for ${topic} with ids: ${registeredKeySchema.id} (key) and ${registeredValueSchema.id}`);
}

export async function createTopic (topic: string, partitions: number): Promise<void> {
    log(`Creating topic ${topic}...`);

    const existingTopics = await admin.listTopics();
    if (existingTopics.includes(topic)) {
        log('Topic already exists');
        return;
    }

    const created = await admin.createTopics({
        topics: [{
            topic,
            numPartitions: partitions,
            replicationFactor: 1
        }]
    });

    log(`Created topic ${topic}: ${created ? 'success' : 'failure'}`);
}
