import { type OptionalExtraParams } from 'ksqldb-client';
import config from '../utils/configLoader';

// eslint-disable-next-line
const QUERY = 'CREATE STREAM ${STREAM_NAME} AS SELECT *, STRUCT(mac:=mac, rollover:=rollover) AS index FROM ${TOPIC_NAME};';
const options: OptionalExtraParams = {
    sessionVariables: {
        STREAM_NAME: config.ksql.query_output_names.raw_locations,
        KAFKA_TOPIC: config.kafka.topics.raw_locations.name
    }
};

export default { QUERY, options };
