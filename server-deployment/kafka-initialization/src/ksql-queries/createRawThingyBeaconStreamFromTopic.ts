import { type OptionalExtraParams } from 'ksqldb-client';
import config from '../utils/configLoader';

// eslint-disable-next-line
const QUERY = 'CREATE STREAM ${STREAM_NAME} WITH (KAFKA_TOPIC=\'${KAFKA_TOPIC}\', VALUE_FORMAT=\'AVRO\', KEY_FORMAT=\'AVRO\');';
const options: OptionalExtraParams = {
    sessionVariables: {
        STREAM_NAME: `${config.kafka.topics.raw_beacons.name}_STREAM`,
        KAFKA_TOPIC: config.kafka.topics.raw_beacons.name
    }
};

export default { QUERY, options };