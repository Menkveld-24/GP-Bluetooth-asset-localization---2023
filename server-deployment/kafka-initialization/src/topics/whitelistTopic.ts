import config from '../utils/configLoader';
import { log } from '../utils/logger';
import QUERY from '../ksql-queries/currentlyWhitelistedTable';
import { createTopic, executeKSQL, uploadSchemas } from '../helpers/topicCreationHelper';

export default async function createWhitelistTopic (): Promise<void> {
    await createTopic(config.kafka.topics.whitelist.name, config.kafka.topics.whitelist.partitions);
    await uploadSchemas(config.kafka.topics.whitelist.name);
    await executeKSQL(QUERY, 'Whitelist topic');
    log('Whitelist topic created');
};
