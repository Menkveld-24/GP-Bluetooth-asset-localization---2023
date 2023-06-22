import { type OptionalExtraParams } from 'ksqldb-client';
import config from '../utils/configLoader';

// eslint-disable-next-line
const QUERY = 'CREATE STREAM ${STREAM_NAME} AS SELECT *, STRUCT(mac:=mac, rollover:=rollover) AS index FROM ${SRC_STREAM};';
const options: OptionalExtraParams = {
    sessionVariables: {
        STREAM_NAME: config.ksql.query_output_names.raw_beacons,
        SRC_STREAM: `${config.kafka.topics.raw_beacons.name}_STREAM`
    }
};

export default { QUERY, options };
