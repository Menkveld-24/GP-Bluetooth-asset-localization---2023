import { createTopic, uploadSchemas } from '../helpers/topicCreationHelper';
import { log } from '../utils/logger';
import config from '../utils/configLoader';

export default async function createPiMetricsTopic (): Promise<void> {
    await createTopic(config.kafka.topics.pi_metrics.name, config.kafka.topics.pi_metrics.partitions);
    await uploadSchemas(config.kafka.topics.pi_metrics.name);
    log('Pi metrics topic created');
}
