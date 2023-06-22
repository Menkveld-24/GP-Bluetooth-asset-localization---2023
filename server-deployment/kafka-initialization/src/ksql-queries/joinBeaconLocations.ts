import { type OptionalExtraParams } from 'ksqldb-client';
import config from '../utils/configLoader';

// eslint-disable-next-line
const QUERY = 'CREATE STREAM ${STREAM_NAME} WITH (PARTITIONS=${PARTITIONS}, VALUE_FORMAT=\'AVRO\') AS SELECT B.MAC mac, L.MAC mac2, B.HUMIDITY humidity, B.FWVERSION fwversion, B.RSSI rssi, B.TEMPERATURE temperature, B.CO2_PPM co2_ppm, B.BATTERY battery, B.ROLLOVER rollover, L.LATITUDE latitude, L.LONGITUDE longitude, COALESCE(B.ROWTIME, L.ROWTIME) beacon_timestamp FROM ${JOIN_BEACONS_STREAM} B INNER JOIN ${JOIN_LOCATIONS_STREAM} L WITHIN ${WITHIN_MIN} MINUTES GRACE PERIOD ${GRACE_PERIOD_MIN} MINUTES ON (B.INDEX = L.INDEX) PARTITION BY L.MAC EMIT CHANGES;';
const options: OptionalExtraParams = {
    sessionVariables: {
        STREAM_NAME: config.ksql.merged_location_beacons.name,
        PARTITIONS: config.ksql.merged_location_beacons.partitions.toString(),
        WITHIN_MIN: config.ksql.merged_location_beacons.within.toString(),
        GRACE_PERIOD_MIN: config.ksql.merged_location_beacons.grace_period.toString(),
        JOIN_BEACONS_STREAM: config.ksql.query_output_names.raw_beacons,
        JOIN_LOCATIONS_STREAM: config.ksql.query_output_names.raw_locations
    }
};

export default { QUERY, options };
