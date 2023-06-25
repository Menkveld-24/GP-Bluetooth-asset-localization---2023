import { connectToKafka } from './helpers/kafkaHelper';
import { connectToKsql } from './helpers/ksqlHelper';
import { log } from './utils/logger';
import createWhitelistTopic from './topics/whitelistTopic';
import createRawThingyBeaconTopic from './topics/rawThingyBeaconTopic';
import createRawThingyLocationTopic from './topics/rawThingyLocationTopic';
import createJoinedBeaconLocationsTopic from './topics/mergedLocationBeaconTopic';
import { createMergedLocationBeaconsTable } from './helpers/questDbHelper';
import { uploadSinkConnectorConfig } from './helpers/questDbConnectorHelper';

log('Kafka initialization');

async function start (): Promise<void> {
    log('Starting app...');
    await connectToKafka();
    await connectToKsql();
    await createMergedLocationBeaconsTable();
    await createWhitelistTopic();
    await createRawThingyBeaconTopic();
    await createRawThingyLocationTopic();
    await createJoinedBeaconLocationsTopic();
    await uploadSinkConnectorConfig();
    process.exit(0);
}

start().catch((err) => {
    log('error starting', err);
});
