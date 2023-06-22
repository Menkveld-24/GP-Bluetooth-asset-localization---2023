import config from 'utils/configLoader';
import { log } from 'utils/logger';
import QUERY from 'ksql-queries/indexRawThingyLocation';
import { createTopic, executeKSQL, uploadSchemas } from 'helpers/topicCreationHelper';

export default async function createRawThingyLocationTopic (): Promise<void> {
    await createTopic(config.kafka.topics.raw_locations.name, config.kafka.topics.raw_locations.partitions);
    await uploadSchemas(config.kafka.topics.raw_locations.name);
    await executeKSQL(QUERY, 'Raw thingy location topic');
    log('Raw thingy location topic created');
};
