import config from '../utils/configLoader';
import { log } from '../utils/logger';
import query from '../ksql-queries/indexRawThingyBeacon';
import createStream from '../ksql-queries/createRawThingyBeaconStreamFromTopic';
import { createTopic, executeKSQL, uploadSchemas } from '../helpers/topicCreationHelper';

export default async function createRawThingyBeaconTopic (): Promise<void> {
    await createTopic(config.kafka.topics.raw_beacons.name, config.kafka.topics.raw_beacons.partitions);
    await uploadSchemas(config.kafka.topics.raw_beacons.name);
    await executeKSQL(createStream.QUERY, createStream.options, 'Raw thingy beacon topic to stream');
    await executeKSQL(query.QUERY, query.options, 'Raw thingy beacon stream indexing');
    log('Raw thingy beacon topic created');
};
