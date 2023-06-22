import { Kafka } from 'kafkajs';
import config from '../utils/configLoader';
import { log } from '../utils/logger';

const admin = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers
}).admin();

export async function connectToKafka (): Promise<void> {
    log(`Connecting to Kafka... (${config.kafka.brokers.toString()})`);
    await admin.connect();
    log('Connected to Kafka!');
}

export default admin;
