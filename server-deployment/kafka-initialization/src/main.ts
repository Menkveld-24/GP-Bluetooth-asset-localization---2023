import { connectToKafka } from 'helpers/kafkaHelper';
import { connectToKsql } from 'helpers/ksqlHelper';
import { log } from 'utils/logger';
import createWhitelistTopic from 'topics/whitelistTopic';
import createRawThingyBeaconTopic from 'topics/rawThingyBeaconTopic';
import createRawThingyLocationTopic from 'topics/rawThingyLocationTopic';
import createJoinedBeaconLocationsTopic from 'topics/mergedLocationBeaconTopic';

log('Kafka initialization');

async function start (): Promise<void> {
    log('Starting app...');
    await connectToKafka();
    await connectToKsql();
    await createWhitelistTopic();
    await createRawThingyBeaconTopic();
    await createRawThingyLocationTopic();
    await createJoinedBeaconLocationsTopic();
}

start().catch((err) => {
    log('error starting', err);
});
