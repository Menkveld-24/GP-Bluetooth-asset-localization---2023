import config from '../utils/configLoader';
import { log } from '../utils/logger';
import query from '../ksql-queries/indexRawThingyLocation';
import createStream from '../ksql-queries/createRawThingyLocationStreamFromTopic';
import { createTopic, executeKSQL, uploadSchemas } from '../helpers/topicCreationHelper';

export default async function createRawThingyLocationTopic (): Promise<void> {
    await createTopic(config.kafka.topics.raw_locations.name, config.kafka.topics.raw_locations.partitions);
    await uploadSchemas(config.kafka.topics.raw_locations.name);
    await executeKSQL(createStream.QUERY, createStream.options, 'Raw thingy location topic to stream');
    await executeKSQL(query.QUERY, query.options, 'Raw thingy location stream indexing');
    log('Raw thingy location topic created');
};
