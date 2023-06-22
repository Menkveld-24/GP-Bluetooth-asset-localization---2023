import { type OptionalExtraParams } from 'ksqldb-client';
import config from '../utils/configLoader';

// eslint-disable-next-line
const QUERY = 'CREATE SOURCE TABLE ${TABLE_NAME} WITH (KAFKA_TOPIC=\'${KAFKA_TOPIC}\', VALUE_FORMAT=\'AVRO\', KEY_FORMAT=\'AVRO\');';
const options: OptionalExtraParams = {
    sessionVariables: {
        TABLE_NAME: config.ksql.query_output_names.whitelist,
        KAFKA_TOPIC: config.kafka.topics.whitelist.name
    }
};

export default { QUERY, options };
