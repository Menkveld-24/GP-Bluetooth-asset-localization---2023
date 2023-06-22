import config from '../utils/configLoader';
import { log } from '../utils/logger';
import query from '../ksql-queries/indexRawThingyBeacon';
import { createTopic, executeKSQL, uploadSchemas } from '../helpers/topicCreationHelper';

export default async function createRawThingyBeaconTopic (): Promise<void> {
    await createTopic(config.kafka.topics.raw_beacons.name, config.kafka.topics.raw_beacons.partitions);
    await uploadSchemas(config.kafka.topics.raw_beacons.name);
    await executeKSQL(query.QUERY, query.options, 'Raw thingy beacon topic');
    log('Raw thingy beacon topic created');
};
